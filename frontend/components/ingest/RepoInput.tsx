"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ingestRepo } from "@/lib/api";

interface RepoInputProps {
  onSubmit?: (repoId: string) => void;
}

export default function RepoInput({ onSubmit }: RepoInputProps) {
  const [url, setUrl] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const validateUrl = (value: string) => {
    const pattern = /^(https?:\/\/)?(www\.)?github\.com\/[\w.-]+\/[\w.-]+\/?$/;
    return pattern.test(value.trim());
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrl(value);
    setIsValid(validateUrl(value));
    setError("");
  };

  const handleSubmit = async () => {
    if (!isValid || isLoading) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await ingestRepo(url.trim());
      const { repoId } = response.data;

      if (onSubmit) {
        onSubmit(repoId);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to start ingestion";
      setError(errorMsg);
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div>
      <div className="flex gap-3">
        {/* URL Input */}
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={url}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="github.com/owner/repo"
            className="w-full h-11 px-4 rounded-lg text-sm font-mono outline-none transition-colors"
            style={{
              background: "var(--rb-bg-input)",
              border: `1px solid ${error ? "var(--rb-red)" : "var(--rb-border-input)"}`,
              color: "var(--rb-text-primary)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--rb-blue)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = error
                ? "var(--rb-red)"
                : "var(--rb-border-input)";
            }}
          />
          {/* Green validation dot */}
          {isValid && (
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
              style={{ background: "var(--rb-green)" }}
            />
          )}
        </div>

        {/* Analyse button */}
        <button
          onClick={handleSubmit}
          disabled={!isValid || isLoading}
          className="h-11 px-6 rounded-lg text-[13px] font-medium cursor-pointer transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: "var(--rb-blue)",
            color: "#fff",
            minWidth: "96px",
          }}
        >
          {isLoading ? "..." : "Analyse"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <p className="mt-2 text-[12px]" style={{ color: "var(--rb-red)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
