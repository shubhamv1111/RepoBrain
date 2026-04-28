"use client";

import { useEffect, useState } from "react";
import { commitQA } from "@/lib/api";
import { useAppStore, initModelPreference } from "@/lib/store";

interface CommitQAProps {
  repoId: string;
}

export default function CommitQA({ repoId }: CommitQAProps) {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const preferredModel = useAppStore((s) => s.preferredModel);

  useEffect(() => { initModelPreference(); }, []);

  const handleSubmit = async () => {
    if (!query.trim() || loading) return;
    setLoading(true);
    try {
      const res = await commitQA(repoId, query, preferredModel);
      setAnswer(res.data.answer);
    } catch {
      setAnswer("Failed to get answer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="p-5 rounded-lg"
      style={{ background: "var(--rb-bg-card)", border: "1px solid var(--rb-border)" }}
    >
      <p className="text-[12px] mb-3" style={{ color: "var(--rb-text-secondary)" }}>
        Commit Q&A
      </p>

      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="What changed in auth last week?"
          className="flex-1 px-3 py-2 rounded-lg text-[12px] font-mono outline-none"
          style={{
            background: "var(--rb-bg-input)",
            border: "1px solid var(--rb-border-input)",
            color: "var(--rb-text-primary)",
          }}
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-3 py-2 rounded-lg text-[12px] cursor-pointer"
          style={{ background: "var(--rb-blue)", color: "#fff" }}
        >
          {loading ? "..." : "Ask"}
        </button>
      </div>

      {answer && (
        <div
          className="text-[13px] leading-relaxed p-3 rounded-lg"
          style={{
            color: "#d1d5db",
            background: "#0a0a0d",
            border: "1px solid var(--rb-border)",
          }}
        >
          {answer}
        </div>
      )}
    </div>
  );
}
