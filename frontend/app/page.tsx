"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import RepoInput from "@/components/ingest/RepoInput";
import ProgressStepper from "@/components/ingest/ProgressStepper";

const EXAMPLE_REPOS = [
  {
    name: "vercel/next.js",
    language: "TypeScript",
    langColor: "#3178c6",
    stars: "120k",
    url: "https://github.com/vercel/next.js",
  },
  {
    name: "langchain-ai/langchain",
    language: "Python",
    langColor: "#3572A5",
    stars: "92k",
    url: "https://github.com/langchain-ai/langchain",
  },
  {
    name: "facebook/react",
    language: "JavaScript",
    langColor: "#f1e05a",
    stars: "228k",
    url: "https://github.com/facebook/react",
  },
];

export default function Home() {
  const [activeRepoId, setActiveRepoId] = useState<string | null>(null);
  const router = useRouter();

  const handleIngestComplete = () => {
    if (activeRepoId) {
      router.push(`/repo/${activeRepoId}`);
    }
  };

  return (
    <div
      className="flex items-center justify-center"
      style={{ minHeight: "calc(100vh - var(--rb-navbar-height))" }}
    >
      <div className="w-full max-w-[520px] text-center px-4">
        {/* Eyebrow */}
        <p
          className="text-[11px] uppercase tracking-[0.1em] mb-3"
          style={{ color: "var(--rb-text-muted)" }}
        >
          GitHub Repository Analyser
        </p>

        {/* Heading */}
        <h1
          className="text-[22px] font-medium mb-3"
          style={{
            color: "var(--rb-text-primary)",
            letterSpacing: "-0.02em",
          }}
        >
          Ask anything about any codebase
        </h1>

        {/* Subtitle */}
        <p
          className="text-sm leading-relaxed mb-5"
          style={{ color: "var(--rb-text-muted)" }}
        >
          Paste a GitHub URL. RepoBrain indexes every function, class, and file
          — then lets you chat with it.
        </p>

        {/* Repo Input */}
        <RepoInput onSubmit={(repoId) => setActiveRepoId(repoId)} />

        {/* Progress Stepper */}
        {activeRepoId && (
          <ProgressStepper
            repoId={activeRepoId}
            onComplete={handleIngestComplete}
          />
        )}

        {/* Quick examples */}
        {!activeRepoId && (
          <div className="mt-8">
            <p
              className="text-[12px] mb-3"
              style={{ color: "var(--rb-text-muted)" }}
            >
              Or start with a popular repo —
            </p>
            <div className="flex gap-3 justify-center">
              {EXAMPLE_REPOS.map((repo) => (
                <button
                  key={repo.name}
                  onClick={() => {
                    const input = document.querySelector(
                      'input[type="text"]'
                    ) as HTMLInputElement;
                    if (input) {
                      const nativeInputValueSetter =
                        Object.getOwnPropertyDescriptor(
                          window.HTMLInputElement.prototype,
                          "value"
                        )?.set;
                      nativeInputValueSetter?.call(input, repo.url);
                      input.dispatchEvent(
                        new Event("input", { bubbles: true })
                      );
                    }
                  }}
                  className="flex-1 p-3 rounded-lg text-left cursor-pointer transition-colors"
                  style={{
                    background: "var(--rb-bg-card)",
                    border: "1px solid var(--rb-border)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--rb-border-input)";
                    e.currentTarget.style.background = "var(--rb-bg-hover)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--rb-border)";
                    e.currentTarget.style.background = "var(--rb-bg-card)";
                  }}
                >
                  <p
                    className="text-[13px] font-mono mb-1"
                    style={{ color: "var(--rb-text-primary)" }}
                  >
                    {repo.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: repo.langColor }}
                    />
                    <span
                      className="text-[12px]"
                      style={{ color: "var(--rb-text-secondary)" }}
                    >
                      {repo.language}
                    </span>
                    <Star
                      size={10}
                      style={{ color: "var(--rb-text-muted)" }}
                    />
                    <span
                      className="text-[12px]"
                      style={{ color: "var(--rb-text-muted)" }}
                    >
                      {repo.stars}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
