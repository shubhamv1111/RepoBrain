"use client";

import { useEffect, useRef, useState } from "react";
import { Copy, Check, Maximize2, X } from "lucide-react";

interface MermaidDiagramProps {
  diagram: string | null;
}

async function renderMermaid(diagram: string, container: HTMLDivElement, id: string) {
  const mermaid = (await import("mermaid")).default;
  mermaid.initialize({
    startOnLoad: false,
    theme: "dark",
    themeVariables: {
      primaryColor: "#1e1e26",
      primaryBorderColor: "#3b82f6",
      primaryTextColor: "#f4f4f5",
      lineColor: "#3b82f6",
      fontFamily: "JetBrains Mono, monospace",
      fontSize: "13px",
    },
  });
  const { svg } = await mermaid.render(id, diagram);
  container.innerHTML = svg;
}

export default function MermaidDiagram({ diagram }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const [rendered, setRendered] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  // Render inline preview once on mount / diagram change
  useEffect(() => {
    if (!diagram || !containerRef.current) return;
    let cancelled = false;

    renderMermaid(diagram, containerRef.current, "mermaid-inline-" + Date.now())
      .then(() => { if (!cancelled) setRendered(true); })
      .catch(() => {
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML =
            '<p style="color:#6b7280;font-size:12px">Failed to render diagram</p>';
        }
      });

    return () => { cancelled = true; };
  }, [diagram]);

  // When fullscreen opens, copy the already-rendered SVG — no second Mermaid call needed
  useEffect(() => {
    if (fullscreen && fullscreenRef.current && containerRef.current) {
      fullscreenRef.current.innerHTML = containerRef.current.innerHTML;
    }
  }, [fullscreen]);

  const handleCopy = () => {
    if (diagram) {
      navigator.clipboard.writeText(diagram);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!diagram) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-[12px]" style={{ color: "var(--rb-text-muted)" }}>
          Architecture diagram unavailable
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Inline preview */}
      <div>
        <div ref={containerRef} className="overflow-auto" style={{ maxHeight: "200px" }} />
        {rendered && (
          <div className="flex items-center justify-between mt-2">
            <button
              onClick={() => setFullscreen(true)}
              className="flex items-center gap-1 text-[11px] cursor-pointer"
              style={{ color: "var(--rb-text-muted)" }}
            >
              <Maximize2 size={12} />
              Expand
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[11px] cursor-pointer"
              style={{ color: "var(--rb-text-muted)" }}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? "Copied" : "Copy Mermaid syntax"}
            </button>
          </div>
        )}
      </div>

      {/* Fullscreen modal */}
      {fullscreen && (
        <div
          className="fixed inset-0 z-50 flex flex-col"
          style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(4px)" }}
          onClick={() => setFullscreen(false)}
        >
          <div
            className="relative m-auto rounded-xl overflow-auto p-6"
            style={{
              background: "#09090b",
              border: "1px solid #1e1e26",
              maxWidth: "90vw",
              maxHeight: "90vh",
              width: "90vw",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-[13px]" style={{ color: "var(--rb-text-secondary)" }}>
                  Architecture
                </span>
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded"
                  style={{ background: "#1e1432", color: "var(--rb-purple)" }}
                >
                  AI
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[11px] cursor-pointer"
                  style={{ color: "var(--rb-text-muted)" }}
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? "Copied" : "Copy Mermaid syntax"}
                </button>
                <button
                  onClick={() => setFullscreen(false)}
                  className="cursor-pointer p-1 rounded"
                  style={{ color: "var(--rb-text-muted)" }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Full diagram */}
            <div
              ref={fullscreenRef}
              className="overflow-auto"
              style={{ maxHeight: "calc(90vh - 80px)" }}
            />
          </div>
        </div>
      )}
    </>
  );
}
