"use client";

import type { RepoLanguage } from "@/types";

interface LanguageBreakdownProps {
  languages: RepoLanguage[];
}

export default function LanguageBreakdown({ languages }: LanguageBreakdownProps) {
  const LANG_COLORS: Record<string, string> = {
    typescript: "#3178c6",
    javascript: "#f1e05a",
    python: "#3572A5",
    java: "#b07219",
    go: "#00ADD8",
    rust: "#dea584",
    ruby: "#701516",
    php: "#4F5D95",
    c: "#555555",
    cpp: "#f34b7d",
    csharp: "#178600",
    html: "#e34c26",
    css: "#563d7c",
    scss: "#c6538c",
    markdown: "#083fa1",
    json: "#292929",
    yaml: "#cb171e",
    text: "#6b7280",
  };

  return (
    <div
      className="p-5 rounded-lg"
      style={{
        background: "var(--rb-bg-card)",
        border: "1px solid var(--rb-border)",
      }}
    >
      <p className="text-[12px] mb-3" style={{ color: "var(--rb-text-secondary)" }}>
        Tech Stack
      </p>

      {/* Language bar */}
      <div className="flex h-2 rounded-full overflow-hidden mb-3 gap-0.5">
        {languages.slice(0, 8).map((lang) => (
          <div
            key={lang.name}
            style={{
              width: `${Math.max(lang.percent, 2)}%`,
              background: LANG_COLORS[lang.name] || "#6b7280",
            }}
          />
        ))}
      </div>

      {/* Language list */}
      <div className="space-y-1.5">
        {languages.slice(0, 6).map((lang) => (
          <div key={lang.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: LANG_COLORS[lang.name] || "#6b7280" }}
              />
              <span className="text-[13px]" style={{ color: "var(--rb-text-primary)" }}>
                {lang.name}
              </span>
            </div>
            <span className="text-[12px] tabular-nums" style={{ color: "var(--rb-text-muted)" }}>
              {lang.percent.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
