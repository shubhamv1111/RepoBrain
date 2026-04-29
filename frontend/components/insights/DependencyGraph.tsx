"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const controlsStyle = `
  .react-flow__controls {
    background: #1a1a24 !important;
    border: 1px solid #3b82f6 !important;
    border-radius: 8px !important;
    box-shadow: 0 0 12px rgba(59,130,246,0.25) !important;
    overflow: hidden;
  }
  .react-flow__controls-button {
    background: #1a1a24 !important;
    border-bottom: 1px solid #2a2a3a !important;
    color: #e2e8f0 !important;
    fill: #e2e8f0 !important;
    width: 28px !important;
    height: 28px !important;
    transition: background 0.15s, fill 0.15s;
  }
  .react-flow__controls-button:hover {
    background: #2d3a5a !important;
    fill: #60a5fa !important;
  }
  .react-flow__controls-button:last-child {
    border-bottom: none !important;
  }
  .react-flow__controls-button svg {
    fill: inherit !important;
  }
`;

import type { DependencyGraph as DependencyGraphType } from "@/types";

interface DependencyGraphProps {
  graph: DependencyGraphType;
}

export default function DependencyGraph({ graph }: DependencyGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [tooltip, setTooltip] = useState<{ label: string; summary: string; x: number; y: number } | null>(null);

  useEffect(() => {
    if (!graph.nodes.length) return;

    // Auto-layout: arrange nodes in a grid
    const cols = Math.ceil(Math.sqrt(graph.nodes.length));
    const layoutNodes: Node[] = graph.nodes.map((n, i) => ({
      id: n.id,
      data: { label: n.data.label, summary: n.data.summary },
      position: {
        x: (i % cols) * 200,
        y: Math.floor(i / cols) * 100,
      },
      style: {
        background: "#111116",
        border: "1px solid #2a2a35",
        borderRadius: "8px",
        color: "#f4f4f5",
        fontSize: "13px",
        fontFamily: "JetBrains Mono, monospace",
        padding: "8px 12px",
      },
    }));

    const layoutEdges: Edge[] = graph.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      style: { stroke: "#2a2a35", strokeWidth: 1 },
      animated: false,
    }));

    setNodes(layoutNodes);
    setEdges(layoutEdges);
  }, [graph, setNodes, setEdges]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setTooltip({
      label: node.data.label as string,
      summary: node.data.summary as string,
      x: node.position.x + 100,
      y: node.position.y - 20,
    });
  }, []);

  if (!graph.nodes.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-[12px]" style={{ color: "var(--rb-text-muted)" }}>
          No dependency connections found
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      <style>{controlsStyle}</style>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={() => setTooltip(null)}
        fitView
        proOptions={{ hideAttribution: true }}
        style={{ background: "#09090b" }}
      >
        <Background color="#1e1e26" gap={20} size={1} />
        <Controls showInteractive={false} />
      </ReactFlow>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute z-10 p-3 rounded-lg max-w-[200px]"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            background: "#111116",
            border: "1px solid #1e1e26",
          }}
        >
          <p className="text-[13px] font-medium mb-1" style={{ color: "#f4f4f5" }}>
            {tooltip.label}
          </p>
          <p className="text-[12px]" style={{ color: "#9ca3af" }}>
            {tooltip.summary}
          </p>
        </div>
      )}
    </div>
  );
}
