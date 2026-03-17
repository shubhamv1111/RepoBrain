"use client";

import type { DetectedIssue } from "@/types";

interface IssuesPanelProps {
  issues: DetectedIssue[];
}

const SEVERITY_COLORS: Record<string, string> = {
  HIGH: "var(--rb-red)",
  MEDIUM: "var(--rb-amber)",
  LOW: "var(--rb-text-muted)",
};

export default function IssuesPanel({ issues }: IssuesPanelProps) {
  const highCount = issues.filter((i) => i.severity === "HIGH").length;

  return (
    <div
      className="p-5 rounded-lg"
      style={{ background: "var(--rb-bg-card)", border: "1px solid var(--rb-border)" }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[12px]" style={{ color: "var(--rb-text-secondary)" }}>
          Detected Issues
        </span>
        {issues.length > 0 && (
          <span
            className="text-[11px] px-1.5 py-0.5 rounded"
            style={{
              background: highCount > 0 ? "#2d0a0a" : "var(--rb-border)",
              color: highCount > 0 ? "var(--rb-red)" : "var(--rb-text-secondary)",
            }}
          >
            {issues.length}
          </span>
        )}
      </div>

      {issues.length === 0 ? (
        <p className="text-[12px]" style={{ color: "var(--rb-text-muted)" }}>
          No issues detected
        </p>
      ) : (
        <div className="space-y-0">
          {issues.slice(0, 15).map((issue, i) => (
            <div
              key={issue.id}
              className="flex items-center gap-2 py-2"
              style={{
                borderBottom: i < issues.length - 1 ? "1px solid var(--rb-border-divider)" : "none",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: SEVERITY_COLORS[issue.severity] }}
              />
              <span className="text-[13px] flex-1" style={{ color: "#d1d5db" }}>
                {issue.message}
              </span>
              <span className="text-[11px] font-mono flex-shrink-0" style={{ color: "var(--rb-blue)" }}>
                {issue.filePath.split("/").pop()}:{issue.line}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
