"use client";

import { useState, useCallback } from "react";
import { ingestRepo, getRepoStatusSSE } from "@/lib/api";
import type { JobStep, JobStepStatus } from "@/types";

export function useIngestion() {
  const [repoId, setRepoId] = useState<string | null>(null);
  const [steps, setSteps] = useState<JobStep[]>([
    { name: "clone", status: "pending", message: "", percent: 0 },
    { name: "parse", status: "pending", message: "", percent: 0 },
    { name: "embed", status: "pending", message: "", percent: 0 },
  ]);
  const [error, setError] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  const startIngestion = useCallback(async (url: string, token?: string) => {
    try {
      const res = await ingestRepo(url, token);
      const id = res.data.repoId;
      setRepoId(id);
      return id;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to start ingestion";
      setError(errorMsg);
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setRepoId(null);
    setSteps([
      { name: "clone", status: "pending", message: "", percent: 0 },
      { name: "parse", status: "pending", message: "", percent: 0 },
      { name: "embed", status: "pending", message: "", percent: 0 },
    ]);
    setError("");
    setIsComplete(false);
  }, []);

  return {
    repoId,
    steps,
    error,
    isComplete,
    startIngestion,
    reset,
    setSteps,
    setError,
    setIsComplete,
  };
}
