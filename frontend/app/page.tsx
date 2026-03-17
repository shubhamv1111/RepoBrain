export default function Home() {
  return (
    <div className="flex items-center justify-center" style={{ minHeight: "calc(100vh - var(--rb-navbar-height))" }}>
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
          className="text-sm leading-relaxed mb-6"
          style={{ color: "var(--rb-text-muted)" }}
        >
          Paste a GitHub URL. RepoBrain indexes every function, class, and file
          — then lets you chat with it.
        </p>

        {/* Placeholder for RepoInput — will be built in Phase 2 */}
        <div
          className="h-11 rounded-lg mb-8"
          style={{
            background: "var(--rb-bg-input)",
            border: "1px solid var(--rb-border-input)",
          }}
        />
      </div>
    </div>
  );
}
