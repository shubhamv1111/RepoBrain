"use client";

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
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function SessionSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
}: SessionSidebarProps) {
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
