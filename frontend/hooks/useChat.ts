"use client";

import { useState, useCallback } from "react";
import { queryRepo, submitFeedback } from "@/lib/api";
import type { Message, Source } from "@/types";

export function useChat(repoId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const sendMessage = useCallback(
    async (query: string) => {
      if (!query.trim() || loading) return;

      setLoading(true);

      // Add user message optimistically
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
        const res = await queryRepo(repoId, query, sessionId || undefined);
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
      } catch {
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
    },
    [repoId, sessionId, loading]
  );

  const handleFeedback = useCallback(
    async (queryId: string, liked: boolean) => {
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
    },
    [sessionId]
  );

  const resetChat = useCallback(() => {
    setSessionId(null);
    setMessages([]);
    setSources([]);
  }, []);

  return {
    messages,
    sources,
    sessionId,
    loading,
    sendMessage,
    handleFeedback,
    resetChat,
    setMessages,
    setSessionId,
    setSources,
  };
}
