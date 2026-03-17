"use client";

import type { Source } from "@/types";

interface SourcesPanelProps {
  sources: Source[];
  onViewFile?: (filePath: string) => void;
}

export default function SourcesPanel({ sources, onViewFile }: SourcesPanelProps) {
  if (sources.length === 0) {
    return (
      <div>
        <p
          className="text-[10px] uppercase tracking-widest mb-3"
          style={{ color: "var(--rb-text-dim)" }}
        >
          Sources
        </p>
        <div className="flex flex-col items-center justify-center py-8 gap-2">
          <div className="w-6 h-6 rounded-full" style={{ background: "var(--rb-border)" }} />
          <p className="text-[12px]" style={{ color: "var(--rb-text-muted)" }}>
            Sources appear after each answer
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p
        className="text-[10px] uppercase tracking-widest mb-3"
        style={{ color: "var(--rb-text-dim)" }}
      >
        Sources
      </p>
      <div className="space-y-3">
        {sources.map((source, i) => (
          <div
            key={i}
            className="rounded-lg p-3"
            style={{
              background: "#0f0f12",
              border: "1px solid var(--rb-border)",
            }}
          >
            {/* File path */}
            <div
              className="text-[10px] font-mono px-2 py-0.5 rounded mb-2 inline-block"
              style={{
                background: "var(--rb-bg-card)",
                border: "1px solid var(--rb-border)",
                color: "var(--rb-text-secondary)",
              }}
            >
              {source.filePath}
            </div>

            {/* Code snippet */}
            <pre
              className="text-[12px] font-mono p-2 rounded overflow-x-auto"
              style={{
                background: "#0a0a0d",
                color: "var(--rb-text-secondary)",
                maxHeight: "80px",
                lineHeight: "1.5",
              }}
            >
              {source.snippet.slice(0, 200)}
            </pre>

            {/* View link */}
            <button
              onClick={() => onViewFile?.(source.filePath)}
              className="mt-2 text-[11px] cursor-pointer"
              style={{ color: "var(--rb-blue)" }}
            >
              View →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
