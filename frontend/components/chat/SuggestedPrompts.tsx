"use client";

interface SuggestedPromptsProps {
  repoName: string;
  onSelect: (prompt: string) => void;
}

const SUGGESTIONS = [
  "Summarise this repo",
  "How does auth work?",
  "Find potential bugs",
  "What does main.ts do?",
  "Last 10 commit changes",
  "Generate a README",
];

export default function SuggestedPrompts({ repoName, onSelect }: SuggestedPromptsProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      {/* Icon */}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ background: "var(--rb-border)" }}
      >
        <span style={{ color: "var(--rb-text-dim)", fontSize: "16px" }}>💬</span>
      </div>

      {/* Title */}
      <p className="text-[15px]" style={{ color: "var(--rb-text-secondary)" }}>
        Ask anything about{" "}
        <span style={{ color: "var(--rb-text-primary)" }}>{repoName}</span>
      </p>

      {/* Chips */}
      <div className="grid grid-cols-3 gap-2 max-w-md">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onSelect(s)}
            className="px-3 py-2 rounded-md text-[11px] cursor-pointer transition-colors text-center"
            style={{
              background: "var(--rb-bg-card)",
              border: "1px solid var(--rb-border)",
              color: "var(--rb-text-secondary)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--rb-blue)";
              e.currentTarget.style.color = "var(--rb-text-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--rb-border)";
              e.currentTarget.style.color = "var(--rb-text-secondary)";
            }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
