"use client";

import { useEffect, useRef, useState } from "react";
import { Copy, Check } from "lucide-react";

interface ArchitectureDiagramProps {
  mermaidDiagram: string | null;
}

export default function ArchitectureDiagram({ mermaidDiagram }: ArchitectureDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rendered, setRendered] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!mermaidDiagram || !containerRef.current) return;

    let cancelled = false;

    const renderDiagram = async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          themeVariables: {
            primaryColor: "#1e1e26",
            primaryBorderColor: "#3b82f6",
            primaryTextColor: "#f4f4f5",
            lineColor: "#3b82f6",
            secondaryColor: "#111116",
            tertiaryColor: "#0f0f12",
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "12px",
          },
        });

        const { svg } = await mermaid.render("arch-diagram-" + Date.now(), mermaidDiagram);

        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
          setRendered(true);
        }
      } catch (e) {
        console.error("Mermaid render failed:", e);
        if (!cancelled) setError(true);
      }
    };

    renderDiagram();
    return () => { cancelled = true; };
  }, [mermaidDiagram]);

  const handleCopy = () => {
    if (mermaidDiagram) {
      navigator.clipboard.writeText(mermaidDiagram);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!mermaidDiagram) {
    return (
      <div
        className="p-5 rounded-lg"
        style={{ background: "var(--rb-bg-card)", border: "1px solid var(--rb-border)" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[12px]" style={{ color: "var(--rb-text-secondary)" }}>
            Architecture
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "#1e1432", color: "var(--rb-purple)" }}>
            AI
          </span>
        </div>
        <p className="text-[12px]" style={{ color: "var(--rb-text-muted)" }}>
          Architecture diagram unavailable
        </p>
      </div>
    );
  }

  return (
    <div
      className="p-5 rounded-lg"
      style={{ background: "var(--rb-bg-card)", border: "1px solid var(--rb-border)" }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[12px]" style={{ color: "var(--rb-text-secondary)" }}>
          Architecture
        </span>
        <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "#1e1432", color: "var(--rb-purple)" }}>
          AI
        </span>
      </div>

      {/* Loading skeleton */}
      {!rendered && !error && (
        <div className="space-y-3">
          <div className="skeleton h-8 w-24 mx-auto" />
          <div className="skeleton h-px w-16 mx-auto" />
          <div className="flex justify-center gap-4">
            <div className="skeleton h-8 w-20" />
            <div className="skeleton h-8 w-20" />
          </div>
        </div>
      )}

      {/* Error fallback */}
      {error && (
        <p className="text-[12px]" style={{ color: "var(--rb-text-muted)" }}>
          Failed to render diagram
        </p>
      )}

      {/* SVG container */}
      <div
        ref={containerRef}
        className="overflow-auto"
        style={{ maxHeight: "220px" }}
      />

      {/* Copy button */}
      {rendered && (
        <div className="flex justify-end mt-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-[11px] cursor-pointer"
            style={{ color: "var(--rb-text-muted)" }}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? "Copied" : "Copy Mermaid"}
          </button>
        </div>
      )}
    </div>
  );
}
