"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import type { JobStep, JobStepStatus } from "@/types";

interface ProgressStepperProps {
  repoId: string;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

const STEP_LABELS: Record<string, string> = {
  clone: "Clone",
  parse: "Parse",
  embed: "Embed",
};

export default function ProgressStepper({
  repoId,
  onComplete,
  onError,
}: ProgressStepperProps) {
  const [steps, setSteps] = useState<JobStep[]>([
    { name: "clone", status: "pending", message: "", percent: 0 },
    { name: "parse", status: "pending", message: "", percent: 0 },
    { name: "embed", status: "pending", message: "", percent: 0 },
  ]);
  const [error, setError] = useState("");

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const eventSource = new EventSource(`${apiUrl}/api/repos/${repoId}/status`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.step === "complete") {
          eventSource.close();
          onComplete?.();
          return;
        }

        if (data.step === "error") {
          eventSource.close();
          setError(data.message);
          onError?.(data.message);
          return;
        }

        setSteps((prev) =>
          prev.map((s) =>
            s.name === data.step
              ? {
                  ...s,
                  status: data.status as JobStepStatus,
                  message: data.message,
                  percent: data.percent,
                }
              : s
          )
        );
      } catch {
        // Ignore parse errors
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => eventSource.close();
  }, [repoId, onComplete, onError]);

  return (
    <div className="mt-6">
      {/* Steps */}
      <div className="flex items-center justify-center gap-0">
        {steps.map((step, index) => {
          const isDone = step.status === "done";
          const isActive = step.status === "active";
          const isFailed = step.status === "failed";

          return (
            <div key={step.name} className="flex items-center">
              {/* Step circle + label */}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-medium"
                  style={{
                    background: isDone
                      ? "var(--rb-green)"
                      : isActive
                      ? "var(--rb-blue)"
                      : isFailed
                      ? "var(--rb-red)"
                      : "transparent",
                    border: isDone || isActive || isFailed
                      ? "none"
                      : "1px solid var(--rb-border-input)",
                    color: isDone || isActive || isFailed
                      ? "#fff"
                      : "var(--rb-text-muted)",
                  }}
                >
                  {isDone ? (
                    <Check size={10} />
                  ) : isActive ? (
                    <Loader2 size={10} className="animate-spin" />
                  ) : isFailed ? (
                    <X size={10} />
                  ) : (
                    index + 1
                  )}
                </div>

                <span
                  className="text-[12px]"
                  style={{
                    color: isActive || isDone
                      ? "var(--rb-text-primary)"
                      : "var(--rb-text-muted)",
                  }}
                >
                  {STEP_LABELS[step.name]}
                </span>

                {/* Step message */}
                {(isActive || isFailed) && step.message && (
                  <span
                    className="text-[11px] italic max-w-[160px] text-center"
                    style={{
                      color: isFailed
                        ? "var(--rb-red)"
                        : "var(--rb-text-muted)",
                    }}
                  >
                    {step.message}
                  </span>
                )}
              </div>

              {/* Connecting line */}
              {index < steps.length - 1 && (
                <div
                  className="w-16 h-px mx-2 mt-[-24px]"
                  style={{
                    background: isDone
                      ? "var(--rb-blue)"
                      : "var(--rb-border)",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Error with retry */}
      {error && (
        <div className="mt-4 text-center">
          <p className="text-[12px]" style={{ color: "var(--rb-red)" }}>
            {error}
          </p>
          <button
            className="mt-1 text-[12px] underline cursor-pointer"
            style={{ color: "var(--rb-text-muted)" }}
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
