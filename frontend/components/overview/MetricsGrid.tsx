"use client";

import type { RepoMetrics } from "@/types";

interface MetricsGridProps {
  metrics: RepoMetrics;
}

const METRIC_ITEMS = [
  { key: "filesIndexed" as const, label: "Files Indexed" },
  { key: "functionsFound" as const, label: "Functions Found" },
  { key: "chunksStored" as const, label: "Chunks Stored" },
];

export default function MetricsGrid({ metrics }: MetricsGridProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {METRIC_ITEMS.map((item) => (
        <div
          key={item.key}
          className="p-4 rounded-lg"
          style={{
            background: "var(--rb-bg-card)",
            border: "1px solid var(--rb-border)",
          }}
        >
          <p
            className="text-[12px] mb-1"
            style={{ color: "var(--rb-text-muted)" }}
          >
            {item.label}
          </p>
          <p
            className="text-[22px] font-medium tabular-nums"
            style={{ color: "var(--rb-text-primary)" }}
          >
            {metrics[item.key]?.toLocaleString() ?? 0}
          </p>
        </div>
      ))}
    </div>
  );
}
