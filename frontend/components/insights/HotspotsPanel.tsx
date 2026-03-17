"use client";

import type { HotspotEntry } from "@/types";

interface HotspotsPanelProps {
  largestFiles: HotspotEntry[];
  highestChurn: HotspotEntry[];
}

function HotspotColumn({ title, entries, maxValue }: { title: string; entries: HotspotEntry[]; maxValue: number }) {
  return (
    <div className="flex-1">
      <p className="text-[12px] mb-2" style={{ color: "var(--rb-text-secondary)" }}>
        {title}
      </p>
      <div className="space-y-2">
        {entries.slice(0, 8).map((entry) => {
          const fileName = entry.filePath.split("/").pop() || entry.filePath;
          const barWidth = Math.max((entry.value / Math.max(maxValue, 1)) * 100, 5);
          return (
            <div key={entry.filePath} className="flex items-center gap-2">
              <span
                className="text-[12px] font-mono truncate"
                style={{ color: "var(--rb-text-secondary)", minWidth: "80px", maxWidth: "120px" }}
              >
                {fileName}
              </span>
              <div className="flex-1 h-1 rounded-full" style={{ background: "var(--rb-border)" }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${barWidth}%`, background: "var(--rb-blue)" }}
                />
              </div>
              <span className="text-[12px] tabular-nums" style={{ color: "var(--rb-text-primary)", minWidth: "36px", textAlign: "right" }}>
                {entry.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function HotspotsPanel({ largestFiles, highestChurn }: HotspotsPanelProps) {
  const maxLines = Math.max(...largestFiles.map((f) => f.value), 1);
  const maxChurn = Math.max(...highestChurn.map((f) => f.value), 1);

  return (
    <div
      className="p-5 rounded-lg"
      style={{ background: "var(--rb-bg-card)", border: "1px solid var(--rb-border)" }}
    >
      <p className="text-[12px] mb-3" style={{ color: "var(--rb-text-secondary)" }}>
        Hotspots
      </p>
      <div className="flex gap-6">
        <HotspotColumn title="Largest Files" entries={largestFiles} maxValue={maxLines} />
        <HotspotColumn title="Highest Churn" entries={highestChurn} maxValue={maxChurn} />
      </div>
    </div>
  );
}
