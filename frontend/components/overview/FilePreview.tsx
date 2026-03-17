"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { getFileContent } from "@/lib/api";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center">
      <div className="skeleton w-full h-full" />
    </div>
  ),
});

interface FilePreviewProps {
  repoId: string;
  filePath: string;
}

const LANG_MAP: Record<string, string> = {
  python: "python",
  javascript: "javascript",
  typescript: "typescript",
  java: "java",
  go: "go",
  rust: "rust",
  ruby: "ruby",
  php: "php",
  c: "c",
  cpp: "cpp",
  csharp: "csharp",
  html: "html",
  css: "css",
  scss: "scss",
  json: "json",
  yaml: "yaml",
  xml: "xml",
  markdown: "markdown",
  sql: "sql",
  bash: "shell",
  text: "plaintext",
};

export default function FilePreview({ repoId, filePath }: FilePreviewProps) {
  const [content, setContent] = useState("");
  const [language, setLanguage] = useState("plaintext");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getFileContent(repoId, filePath)
      .then((res) => {
        setContent(res.data.content);
        setLanguage(LANG_MAP[res.data.language] || "plaintext");
      })
      .catch(() => {
        setContent("// Failed to load file content");
        setLanguage("plaintext");
      })
      .finally(() => setLoading(false));
  }, [repoId, filePath]);

  if (loading) {
    return (
      <div className="p-4 space-y-2">
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-5/6" />
        <div className="skeleton h-4 w-2/3" />
      </div>
    );
  }

  return (
    <div className="h-full">
      {/* File path header */}
      <div
        className="px-4 py-2 text-[12px] font-mono"
        style={{
          color: "var(--rb-text-muted)",
          borderBottom: "1px solid var(--rb-border)",
        }}
      >
        {filePath}
      </div>

      {/* Monaco editor */}
      <MonacoEditor
        height="calc(100% - 36px)"
        language={language}
        value={content}
        theme="vs-dark"
        options={{
          readOnly: true,
          minimap: { enabled: false },
          fontSize: 13,
          fontFamily: "var(--rb-font-mono)",
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          wordWrap: "on",
          padding: { top: 12 },
          renderLineHighlight: "none",
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          scrollbar: {
            verticalScrollbarSize: 6,
            horizontalScrollbarSize: 6,
          },
        }}
      />
    </div>
  );
}
