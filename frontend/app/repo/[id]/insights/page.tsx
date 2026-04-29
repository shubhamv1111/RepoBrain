"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { getRepoInsights } from "@/lib/api";
import IssuesPanel from "@/components/insights/IssuesPanel";
import CommitQA from "@/components/insights/CommitQA";
import HotspotsPanel from "@/components/insights/HotspotsPanel";
import MermaidDiagram from "@/components/insights/MermaidDiagram";
import type { InsightsData } from "@/types";

const DependencyGraph = dynamic(
  () => import("@/components/insights/DependencyGraph"),
  { ssr: false, loading: () => <div className="skeleton h-[380px]" /> }
);

export default function InsightsPage() {
  const params = useParams();
  const repoId = params.id as string;

  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRepoInsights(repoId)
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [repoId]);

  if (loading) {
    return (
      <div className="p-7 space-y-4">
        <div className="skeleton h-[380px]" />
        <div className="grid grid-cols-2 gap-4">
          <div className="skeleton h-[200px]" />
          <div className="skeleton h-[200px]" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p style={{ color: "var(--rb-text-muted)" }}>No insights data available</p>
      </div>
    );
  }

  return (
    <div className="p-7">
      <div className="flex gap-4" style={{ minHeight: "calc(100vh - 200px)" }}>
        {/* LEFT — 55% */}
        <div className="space-y-4" style={{ flex: "0 0 55%" }}>
          {/* Architecture Diagram */}
          <div
            className="p-5 rounded-lg"
            style={{
              background: "var(--rb-bg-card)",
              border: "1px solid var(--rb-border)",
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[12px]" style={{ color: "var(--rb-text-secondary)" }}>
                Architecture
              </span>
              <span
                className="text-[10px] px-1.5 py-0.5 rounded"
                style={{ background: "#1e1432", color: "var(--rb-purple)" }}
              >
                AI
              </span>
            </div>
            <MermaidDiagram diagram={data.mermaidDiagram} />
          </div>

          {/* Dependency Graph */}
          <div
            className="rounded-lg overflow-hidden"
            style={{
              background: "var(--rb-bg-card)",
              border: "1px solid var(--rb-border)",
              height: "380px",
            }}
          >
            <div className="flex items-center gap-2 px-5 pt-4 pb-2">
              <span className="text-[12px]" style={{ color: "var(--rb-text-secondary)" }}>
                Dependency Graph
              </span>
            </div>
            <div style={{ height: "calc(100% - 40px)" }}>
              <DependencyGraph graph={data.dependencyGraph} />
            </div>
          </div>
        </div>

        {/* RIGHT — 45% */}
        <div className="space-y-4" style={{ flex: "0 0 calc(45% - 16px)" }}>
          {/* Issues */}
          <IssuesPanel issues={data.issues} />

          {/* Commit Q&A */}
          <CommitQA repoId={repoId} />

          {/* Hotspots */}
          <HotspotsPanel
            largestFiles={data.hotspots.largestFiles}
            highestChurn={data.hotspots.highestChurn}
          />
        </div>
      </div>
    </div>
  );
}
