"use client";

import Link from "next/link";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import {
  BookOpen,
  Zap,
  MessageSquare,
  BarChart3,
  GitBranch,
  Key,
  ChevronRight,
} from "lucide-react";

const sections = [
  {
    icon: <Zap className="w-5 h-5" />,
    title: "Getting Started",
    color: "#3b82f6",
    items: [
      {
        heading: "Index a repository",
        body: "Paste any public GitHub URL into the home page and click Analyse. RepoBrain clones the repo, parses every file, embeds code chunks into a vector store, and generates an architecture diagram — all in under a minute.",
      },
      {
        heading: "Private repos",
        body: "Sign in with GitHub, then provide a personal access token (repo scope) when prompted. The token is used only during cloning and is never stored.",
      },
    ],
  },
  {
    icon: <MessageSquare className="w-5 h-5" />,
    title: "Chat",
    color: "#8b5cf6",
    items: [
      {
        heading: "Ask anything about the code",
        body: "The Chat tab uses retrieval-augmented generation (RAG). Your question is embedded, the most relevant code chunks are retrieved from ChromaDB, and an LLM synthesises an answer with file-level citations.",
      },
      {
        heading: "Sessions",
        body: "Every conversation is saved as a named session. Switch between sessions in the left panel or click + New chat to start fresh.",
      },
      {
        heading: "Suggested prompts",
        body: "When a session is empty, pre-built prompts appear. Click one to instantly explore architecture, authentication, API structure, or data models.",
      },
    ],
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    title: "Insights",
    color: "#10b981",
    items: [
      {
        heading: "Dependency graph",
        body: "A live ReactFlow graph shows import connections between files. Click a node to see a summary. Only files with at least one resolved import appear — if the graph is empty, the repo uses non-relative imports or a language not yet supported.",
      },
      {
        heading: "Architecture diagram",
        body: "An AI-generated Mermaid flowchart shows the high-level system design. Click Expand to view full screen.",
      },
      {
        heading: "Commit Q&A",
        body: "Ask natural-language questions about commit history. RepoBrain extracts up to 50 recent commits at index time and answers using the stored log. For repos indexed before this feature launched, answers fall back to code RAG.",
      },
      {
        heading: "Hotspots",
        body: "The Hotspots panel shows the largest files and the files with the most churn (frequent edits), helping you spot complexity early.",
      },
    ],
  },
  {
    icon: <GitBranch className="w-5 h-5" />,
    title: "Supported Languages",
    color: "#f59e0b",
    items: [
      {
        heading: "Full AST extraction",
        body: "Python, JavaScript, TypeScript — functions and classes are extracted individually, giving precise per-symbol citations.",
      },
      {
        heading: "Chunk-based indexing",
        body: "All other languages (Go, Rust, Java, Ruby, PHP, C/C++, C#, Swift, Kotlin, SQL, and more) are indexed in 60-line chunks.",
      },
    ],
  },
  {
    icon: <Key className="w-5 h-5" />,
    title: "API Keys & Models",
    color: "#ef4444",
    items: [
      {
        heading: "OpenAI (default)",
        body: "Set OPENAI_API_KEY in your backend .env. RepoBrain uses gpt-4o for answers and text-embedding-3-small for vector embeddings.",
      },
      {
        heading: "Groq (fallback / alternative)",
        body: "Set GROQ_API_KEY to use llama-3.1-8b-instant instead. Groq is free-tier friendly and significantly faster, at the cost of some reasoning depth. You can switch the active model from the Settings page.",
      },
    ],
  },
];

export default function DocsPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-background-dark">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header breadcrumb={[{ label: "Docs" }]} />
        <div className="flex-1 overflow-y-auto px-8 py-10 max-w-3xl mx-auto w-full">
          {/* Hero */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-3">
              <BookOpen className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold text-slate-100">Documentation</h1>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Everything you need to know about indexing repositories, chatting with code, and reading insights.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-10">
            {sections.map((section) => (
              <div key={section.title}>
                {/* Section header */}
                <div className="flex items-center gap-2.5 mb-4">
                  <span style={{ color: section.color }}>{section.icon}</span>
                  <h2 className="text-base font-semibold text-slate-100">{section.title}</h2>
                </div>

                {/* Items */}
                <div className="space-y-4 pl-1">
                  {section.items.map((item) => (
                    <div
                      key={item.heading}
                      className="rounded-xl p-5"
                      style={{
                        background: "#111116",
                        border: "1px solid #1e1e26",
                      }}
                    >
                      <div className="flex items-start gap-2 mb-1.5">
                        <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: section.color }} />
                        <p className="text-sm font-semibold text-slate-100">{item.heading}</p>
                      </div>
                      <p className="text-sm text-slate-400 leading-relaxed pl-6">{item.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer CTA */}
          <div
            className="mt-12 rounded-xl p-6 text-center"
            style={{ background: "#111116", border: "1px solid #1e1e26" }}
          >
            <p className="text-slate-400 text-sm mb-3">Ready to explore a codebase?</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: "var(--color-primary, #f97316)" }}
            >
              Index a repository <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
