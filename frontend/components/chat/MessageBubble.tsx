"use client";

import { ThumbsUp, ThumbsDown } from "lucide-react";
import CitationChip from "./CitationChip";
import type { Message } from "@/types";

interface MessageBubbleProps {
  message: Message;
  onFeedback?: (liked: boolean) => void;
  onCitationClick?: (filePath: string, lineStart: number) => void;
}

export default function MessageBubble({ message, onFeedback, onCitationClick }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className="rounded-lg px-4 py-3"
        style={{
          maxWidth: isUser ? "70%" : "85%",
          background: isUser ? "#172554" : "var(--rb-bg-card)",
          border: isUser ? "none" : "1px solid var(--rb-border)",
          color: isUser ? "#bfdbfe" : "#d1d5db",
          borderRadius: isUser ? "8px 8px 2px 8px" : "8px",
        }}
      >
        {/* Message content */}
        <div
          className="text-sm leading-relaxed whitespace-pre-wrap"
          dangerouslySetInnerHTML={{
            __html: formatMessageContent(message.content),
          }}
        />

        {/* Citations */}
        {!isUser && message.citations.length > 0 && (
          <div className="flex items-center gap-1.5 mt-3 flex-wrap">
            <span className="text-[11px]" style={{ color: "var(--rb-text-muted)" }}>
              from
            </span>
            {message.citations.map((c, i) => (
              <CitationChip
                key={i}
                filePath={c.filePath}
                lineStart={c.lineStart}
                lineEnd={c.lineEnd}
                onClick={() => onCitationClick?.(c.filePath, c.lineStart)}
              />
            ))}
          </div>
        )}

        {/* Feedback */}
        {!isUser && (
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => onFeedback?.(true)}
              className="cursor-pointer p-1 rounded transition-colors"
              style={{ color: message.feedback === "up" ? "var(--rb-text-primary)" : "var(--rb-text-dim)" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--rb-text-primary)"; }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = message.feedback === "up" ? "var(--rb-text-primary)" : "var(--rb-text-dim)";
              }}
            >
              <ThumbsUp size={14} />
            </button>
            <button
              onClick={() => onFeedback?.(false)}
              className="cursor-pointer p-1 rounded transition-colors"
              style={{ color: message.feedback === "down" ? "var(--rb-text-primary)" : "var(--rb-text-dim)" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--rb-text-primary)"; }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = message.feedback === "down" ? "var(--rb-text-primary)" : "var(--rb-text-dim)";
              }}
            >
              <ThumbsDown size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function formatMessageContent(content: string): string {
  // Simple markdown-like formatting for code blocks
  return content
    .replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) =>
      `<pre style="background:#0a0a0d;border:1px solid #1e1e26;border-radius:8px;padding:12px;margin:8px 0;font-size:12px;font-family:var(--rb-font-mono);color:#9ca3af;overflow-x:auto">${lang ? `<span style="font-size:10px;color:#4b5563">${lang}</span>\n` : ""}${escapeHtml(code.trim())}</pre>`
    )
    .replace(/`([^`]+)`/g, '<code style="background:#0a0a0d;padding:1px 4px;border-radius:3px;font-size:12px;font-family:var(--rb-font-mono);color:#9ca3af">$1</code>')
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br/>");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
