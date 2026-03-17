"use client";

interface CitationChipProps {
  filePath: string;
  lineStart: number;
  lineEnd: number;
  onClick?: () => void;
}

export default function CitationChip({ filePath, lineStart, lineEnd, onClick }: CitationChipProps) {
  const fileName = filePath.split("/").pop() || filePath;
  const label = `${fileName}:${lineStart}${lineEnd !== lineStart ? `-${lineEnd}` : ""}`;

  return (
    <button
      onClick={onClick}
      className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono cursor-pointer transition-colors"
      style={{
        background: "#0f0f12",
        border: "1px solid var(--rb-blue)",
        color: "#60a5fa",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--rb-bg-hover)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "#0f0f12";
      }}
    >
      {label}
    </button>
  );
}
