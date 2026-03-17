"use client";

interface AISummaryCardProps {
  summary: string;
  keyModules: string[];
}

export default function AISummaryCard({ summary, keyModules }: AISummaryCardProps) {
  return (
    <div
      className="p-5 rounded-lg"
      style={{
        background: "var(--rb-bg-card)",
        border: "1px solid var(--rb-border)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[12px]" style={{ color: "var(--rb-text-secondary)" }}>
          Overview
        </span>
        <span
          className="text-[10px] px-1.5 py-0.5 rounded"
          style={{
            background: "#1e1432",
            color: "var(--rb-purple)",
          }}
        >
          AI
        </span>
      </div>

      {/* Summary text */}
      <p
        className="text-sm leading-relaxed mb-4"
        style={{ color: "#d1d5db" }}
      >
        {summary || "No summary available yet."}
      </p>

      {/* Key modules */}
      {keyModules.length > 0 && (
        <div className="space-y-1.5">
          {keyModules.map((mod) => (
            <div key={mod} className="flex items-center gap-2">
              <span
                className="w-1 h-1 rounded-full"
                style={{ background: "var(--rb-text-muted)" }}
              />
              <span
                className="text-[13px]"
                style={{ color: "var(--rb-text-primary)" }}
              >
                {mod}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
