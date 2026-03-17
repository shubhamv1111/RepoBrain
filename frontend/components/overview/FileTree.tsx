"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import type { FileTreeNode } from "@/types";

interface FileTreeProps {
  tree: FileTreeNode;
  onSelectFile: (path: string) => void;
  selectedPath?: string;
}

function TreeNode({
  node,
  depth,
  onSelectFile,
  selectedPath,
}: {
  node: FileTreeNode;
  depth: number;
  onSelectFile: (path: string) => void;
  selectedPath?: string;
}) {
  const [expanded, setExpanded] = useState(depth < 2);
  const isDir = node.type === "directory";
  const isSelected = node.path === selectedPath;

  const handleClick = () => {
    if (isDir) {
      setExpanded(!expanded);
    } else {
      onSelectFile(node.path);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className="w-full flex items-center gap-1.5 py-1 px-2 rounded text-left cursor-pointer transition-colors"
        style={{
          paddingLeft: `${depth * 12 + 8}px`,
          background: isSelected ? "var(--rb-bg-hover)" : "transparent",
          color: isSelected ? "var(--rb-text-primary)" : "var(--rb-text-secondary)",
          borderLeft: isSelected ? "2px solid var(--rb-blue)" : "2px solid transparent",
          fontSize: "13px",
          fontFamily: "var(--rb-font-mono)",
        }}
        onMouseEnter={(e) => {
          if (!isSelected) e.currentTarget.style.background = "var(--rb-bg-nav-hover)";
        }}
        onMouseLeave={(e) => {
          if (!isSelected) e.currentTarget.style.background = "transparent";
        }}
      >
        {isDir ? (
          expanded ? (
            <ChevronDown size={14} style={{ color: "var(--rb-text-muted)", flexShrink: 0 }} />
          ) : (
            <ChevronRight size={14} style={{ color: "var(--rb-text-muted)", flexShrink: 0 }} />
          )
        ) : (
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: "var(--rb-text-muted)" }}
          />
        )}
        <span className="truncate">{node.name}</span>
      </button>

      {isDir && expanded && node.children && (
        <div>
          {node.children
            .sort((a, b) => {
              if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
              return a.name.localeCompare(b.name);
            })
            .map((child) => (
              <TreeNode
                key={child.path}
                node={child}
                depth={depth + 1}
                onSelectFile={onSelectFile}
                selectedPath={selectedPath}
              />
            ))}
        </div>
      )}
    </div>
  );
}

export default function FileTree({ tree, onSelectFile, selectedPath }: FileTreeProps) {
  return (
    <div>
      <p
        className="text-[10px] uppercase tracking-widest px-3 mb-2"
        style={{ color: "var(--rb-text-muted)" }}
      >
        Explorer
      </p>
      <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 160px)" }}>
        {tree.children?.map((child) => (
          <TreeNode
            key={child.path}
            node={child}
            depth={0}
            onSelectFile={onSelectFile}
            selectedPath={selectedPath}
          />
        ))}
      </div>
    </div>
  );
}
