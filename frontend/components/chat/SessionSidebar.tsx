"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

interface SessionItem {
  id: string;
  title: string;
  updatedAt: string;
}

interface SessionSidebarProps {
  sessions: SessionItem[];
  activeSessionId?: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
}

function timeAgo(dateStr: string): string {
  if (!dateStr) return "";
  // Ensure the string is treated as UTC: append 'Z' only if no tz offset is present
  const normalized =
    dateStr.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(dateStr)
      ? dateStr
      : dateStr + "Z";
  const ms = Date.now() - new Date(normalized).getTime();
  if (ms < 0) return "just now";
  const secs = Math.floor(ms / 1_000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

/** Ticks every 30 seconds so relative timestamps stay fresh while the page is open. */
function useClock() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);
}

export default function SessionSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
}: SessionSidebarProps) {
  useClock();

  return (
    <div className="h-full flex flex-col">
      <p
        className="text-[10px] uppercase tracking-widest px-3 pt-3 mb-2"
        style={{ color: "var(--rb-text-dim)" }}
      >
        Conversations
      </p>

      <div className="flex-1 overflow-y-auto space-y-0.5 px-1">
        {sessions.map((session) => {
          const isActive = session.id === activeSessionId;
          return (
            <button
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-md text-left cursor-pointer transition-colors"
              style={{
                background: isActive ? "var(--rb-bg-hover)" : "transparent",
                borderLeft: isActive ? "2px solid var(--rb-blue)" : "2px solid transparent",
                color: isActive ? "var(--rb-text-primary)" : "var(--rb-text-secondary)",
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = "var(--rb-bg-nav-hover)";
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = "transparent";
              }}
            >
              <span className="text-[13px] truncate">{session.title}</span>
              <span className="text-[11px] flex-shrink-0 ml-2" style={{ color: "var(--rb-text-muted)" }}>
                {timeAgo(session.updatedAt)}
              </span>
            </button>
          );
        })}
      </div>

      {/* New chat button */}
      <div className="px-3 py-3" style={{ borderTop: "1px solid var(--rb-border-divider)" }}>
        <button
          onClick={onNewChat}
          className="flex items-center gap-1.5 text-[12px] cursor-pointer"
          style={{ color: "var(--rb-text-muted)" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "var(--rb-text-primary)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--rb-text-muted)"; }}
        >
          <Plus size={14} /> New chat
        </button>
      </div>
    </div>
  );
}
