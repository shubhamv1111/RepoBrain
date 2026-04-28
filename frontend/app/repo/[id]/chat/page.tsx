"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Send } from "lucide-react";
import { queryRepo, submitFeedback, getRepoSessions, getSession } from "@/lib/api";
import { useAppStore, initModelPreference } from "@/lib/store";
import MessageBubble from "@/components/chat/MessageBubble";
import SourcesPanel from "@/components/chat/SourcesPanel";
import SessionSidebar from "@/components/chat/SessionSidebar";
import SuggestedPrompts from "@/components/chat/SuggestedPrompts";
import type { Message, Source } from "@/types";

export default function ChatPage() {
  const params = useParams();
  const repoId = params.id as string;
  const currentRepo = useAppStore((s) => s.currentRepo);
  const preferredModel = useAppStore((s) => s.preferredModel);
  const repoName = currentRepo?.name || "repository";

  // Hydrate model preference from localStorage on first render
  useEffect(() => { initModelPreference(); }, []);

  const [messages, setMessages] = useState<Message[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<{ id: string; title: string; updatedAt: string }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load sessions
  useEffect(() => {
    getRepoSessions(repoId)
      .then((res) => setSessions(res.data.sessions || []))
      .catch(() => {});
  }, [repoId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const query = text || input.trim();
    if (!query || loading) return;

    setInput("");
    setLoading(true);

    // Add user message
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: query,
      citations: [],
      sources: [],
      feedback: null,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await queryRepo(repoId, query, sessionId || undefined, 5, preferredModel);
      const data = res.data;

      setSessionId(data.sessionId);

      const aiMsg: Message = {
        id: data.queryId,
        role: "assistant",
        content: data.answer,
        citations: data.citations || [],
        sources: data.sources || [],
        feedback: null,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setSources(data.sources || []);

      // Refresh sessions list
      getRepoSessions(repoId)
        .then((r) => setSessions(r.data.sessions || []))
        .catch(() => {});
    } catch (err) {
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Sorry, an error occurred while processing your question.",
        citations: [],
        sources: [],
        feedback: null,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (queryId: string, liked: boolean) => {
    if (!sessionId) return;
    try {
      await submitFeedback(queryId, sessionId, liked);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === queryId ? { ...m, feedback: liked ? "up" : "down" } : m
        )
      );
    } catch {
      // Ignore feedback errors
    }
  };

  const handleLoadSession = async (sid: string) => {
    try {
      const res = await getSession(sid);
      setSessionId(sid);
      setMessages(res.data.messages || []);
      const lastAiMsg = [...(res.data.messages || [])].reverse().find((m: Message) => m.role === "assistant");
      if (lastAiMsg) setSources(lastAiMsg.sources || []);
    } catch {
      // Ignore
    }
  };

  const handleNewChat = () => {
    setSessionId(null);
    setMessages([]);
    setSources([]);
    setInput("");
  };

  return (
    <div className="flex h-full">
      {/* LEFT — Sessions */}
      <div
        className="flex-shrink-0"
        style={{ width: "220px", borderRight: "1px solid var(--rb-border)" }}
      >
        <SessionSidebar
          sessions={sessions}
          activeSessionId={sessionId || undefined}
          onSelectSession={handleLoadSession}
          onNewChat={handleNewChat}
        />
      </div>

      {/* CENTER — Chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Repo pill */}
        <div className="flex justify-center py-3">
          <div
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[12px]"
            style={{
              background: "var(--rb-bg-card)",
              border: "1px solid var(--rb-border)",
              color: "var(--rb-text-primary)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--rb-green)" }} />
            {repoName}
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          {messages.length === 0 ? (
            <SuggestedPrompts repoName={repoName} onSelect={handleSend} />
          ) : (
            <>
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  onFeedback={(liked) => handleFeedback(msg.id, liked)}
                />
              ))}
              {loading && (
                <div className="flex justify-start mb-4">
                  <div
                    className="px-4 py-3 rounded-lg streaming-cursor text-sm"
                    style={{
                      background: "var(--rb-bg-card)",
                      border: "1px solid var(--rb-border)",
                      color: "#d1d5db",
                    }}
                  >
                    Thinking
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Bottom input */}
        <div
          className="flex items-center gap-3 px-4"
          style={{
            height: "56px",
            background: "#0f0f12",
            borderTop: "1px solid var(--rb-border)",
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={`Ask anything about ${repoName}...`}
            disabled={loading}
            className="flex-1 bg-transparent text-[13px] outline-none"
            style={{
              color: "var(--rb-text-primary)",
            }}
          />
          {input.trim() && (
            <button
              onClick={() => handleSend()}
              className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
              style={{ background: "var(--rb-blue)" }}
            >
              <Send size={14} color="#fff" />
            </button>
          )}
        </div>
      </div>

      {/* RIGHT — Sources */}
      <div
        className="flex-shrink-0 p-4 overflow-y-auto"
        style={{ width: "260px", borderLeft: "1px solid var(--rb-border)" }}
      >
        <SourcesPanel sources={sources} />
      </div>
    </div>
  );
}
