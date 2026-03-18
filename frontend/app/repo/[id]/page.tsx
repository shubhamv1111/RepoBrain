"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ExternalLink, MessageSquare, BarChart3, RefreshCw } from "lucide-react";
import { getRepoOverview } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import MetricsGrid from "@/components/overview/MetricsGrid";
import AISummaryCard from "@/components/overview/AISummaryCard";
import LanguageBreakdown from "@/components/overview/LanguageBreakdown";
import FileTree from "@/components/overview/FileTree";
import FilePreview from "@/components/overview/FilePreview";
import ArchitectureDiagram from "@/components/overview/ArchitectureDiagram";
import type { OverviewData } from "@/types";

export default function RepoOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const repoId = params.id as string;

  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const setCurrentRepo = useAppStore((s) => s.setCurrentRepo);
  const addRecentRepo = useAppStore((s) => s.addRecentRepo);

  useEffect(() => {
    getRepoOverview(repoId)
      .then((res) => {
        setData(res.data);
        if (res.data.repo) {
          const repo = {
            _id: res.data.repo.id,
            repoUrl: res.data.repo.repoUrl,
            owner: res.data.repo.owner,
            name: res.data.repo.name,
            status: res.data.repo.status as OverviewData["repo"]["status"],
            isPublic: true,
            ownerId: null,
            metrics: res.data.metrics,
            languages: res.data.languages,
            summary: res.data.summary,
            keyModules: res.data.keyModules,
            mermaidDiagram: res.data.mermaidDiagram,
            chromaCollectionId: "",
            error: null,
            indexedAt: "",
            createdAt: "",
          };
          setCurrentRepo(repo);
          addRecentRepo(repo);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [repoId, setCurrentRepo, addRecentRepo]);

  if (loading) {
    return (
      <div className="p-7 space-y-4">
        <div className="skeleton h-8 w-48" />
        <div className="grid grid-cols-3 gap-3">
          <div className="skeleton h-20" />
          <div className="skeleton h-20" />
          <div className="skeleton h-20" />
        </div>
        <div className="skeleton h-40" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p style={{ color: "var(--rb-text-muted)" }}>Repository not found</p>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* LEFT — File Explorer */}
      <div
        className="flex-shrink-0 overflow-y-auto py-3"
        style={{
          width: "220px",
          borderRight: "1px solid var(--rb-border)",
        }}
      >
        <FileTree
          tree={data.fileTree}
          onSelectFile={setSelectedFile}
          selectedPath={selectedFile ?? undefined}
        />
      </div>

      {/* CENTER — Main content */}
      <div className="flex-1 overflow-y-auto p-7 space-y-3">
        {/* Repo header */}
        <div className="flex items-center gap-3 mb-2">
          <h1
            className="text-[18px] font-medium"
            style={{ color: "var(--rb-text-primary)" }}
          >
            {data.repo.name}
          </h1>
          {data.languages[0] && (
            <span
              className="text-[12px] px-2 py-0.5 rounded"
              style={{
                background: "#1a2744",
                color: "#60a5fa",
              }}
            >
              {data.languages[0].name}
            </span>
          )}
          <a
            href={data.repo.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto"
          >
            <ExternalLink size={16} style={{ color: "var(--rb-text-muted)" }} />
          </a>
        </div>

        {/* Action row */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => router.push(`/repo/${repoId}/chat`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] cursor-pointer"
            style={{ background: "var(--rb-blue)", color: "#fff" }}
          >
            <MessageSquare size={14} /> Chat with Repo
          </button>
          <button
            onClick={() => router.push(`/repo/${repoId}/insights`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] cursor-pointer"
            style={{ border: "1px solid var(--rb-border)", color: "var(--rb-text-secondary)", background: "transparent" }}
          >
            <BarChart3 size={14} /> View Insights
          </button>
          <button
            className="flex items-center gap-1.5 px-2 py-1.5 text-[13px] cursor-pointer ml-2"
            style={{ color: "var(--rb-text-muted)", background: "transparent", border: "none" }}
          >
            <RefreshCw size={14} /> Re-index
          </button>
        </div>

        {/* Metrics */}
        <MetricsGrid metrics={data.metrics} />

        {/* AI Summary */}
        <AISummaryCard summary={data.summary} keyModules={data.keyModules} />

        {/* File Preview or Language Breakdown */}
        {selectedFile ? (
          <div
            className="rounded-lg overflow-hidden"
            style={{
              background: "var(--rb-bg-card)",
              border: "1px solid var(--rb-border)",
              height: "400px",
            }}
          >
            <FilePreview repoId={repoId} filePath={selectedFile} />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <LanguageBreakdown languages={data.languages} />
            <div
              className="p-5 rounded-lg"
              style={{ background: "var(--rb-bg-card)", border: "1px solid var(--rb-border)" }}
            >
              <p className="text-[12px] mb-3" style={{ color: "var(--rb-text-secondary)" }}>
                Key Metrics
              </p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[13px]" style={{ color: "var(--rb-text-muted)" }}>Total Files</span>
                  <span className="text-[13px]" style={{ color: "var(--rb-text-primary)" }}>{data.metrics.filesIndexed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[13px]" style={{ color: "var(--rb-text-muted)" }}>Functions</span>
                  <span className="text-[13px]" style={{ color: "var(--rb-text-primary)" }}>{data.metrics.functionsFound}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[13px]" style={{ color: "var(--rb-text-muted)" }}>Chunks</span>
                  <span className="text-[13px]" style={{ color: "var(--rb-text-primary)" }}>{data.metrics.chunksStored}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT — Architecture */}
      <div
        className="flex-shrink-0 overflow-y-auto p-4 space-y-3"
        style={{
          width: "260px",
          borderLeft: "1px solid var(--rb-border)",
        }}
      >
        <ArchitectureDiagram mermaidDiagram={data.mermaidDiagram} />
      </div>
    </div>
  );
}
