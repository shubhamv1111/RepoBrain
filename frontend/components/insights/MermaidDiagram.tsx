"use client";

import { useEffect, useRef, useState } from "react";
import { Copy, Check } from "lucide-react";

interface MermaidDiagramProps {
  diagram: string | null;
}

export default function MermaidDiagram({ diagram }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rendered, setRendered] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!diagram || !containerRef.current) return;

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
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "12px",
          },
        });

        const { svg } = await mermaid.render("mermaid-insights-" + Date.now(), diagram);
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
          setRendered(true);
        }
      } catch {
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = '<p style="color:#6b7280;font-size:12px">Failed to render diagram</p>';
        }
      }
    };

    renderDiagram();
    return () => { cancelled = true; };
  }, [diagram]);

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
    <div>
      <div ref={containerRef} className="overflow-auto" style={{ maxHeight: "200px" }} />
      {rendered && (
        <div className="flex justify-end mt-2">
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
  );
}
