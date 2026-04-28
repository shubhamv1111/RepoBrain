"use client";

import { useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { useAppStore, initModelPreference, type ModelPreference } from "@/lib/store";
import { Settings, Cpu, Zap, CheckCircle2 } from "lucide-react";

interface ModelOption {
  id: ModelPreference;
  label: string;
  description: string;
  badge: string;
  badgeColor: string;
  icon: React.ReactNode;
  pros: string[];
}

const MODEL_OPTIONS: ModelOption[] = [
  {
    id: "openai",
    label: "OpenAI GPT-4o",
    description: "Best reasoning, detailed code explanations, and accurate citations. Requires an OPENAI_API_KEY in the server environment.",
    badge: "Default",
    badgeColor: "#3b82f6",
    icon: <Cpu className="w-5 h-5" />,
    pros: ["Most accurate answers", "Best code comprehension", "Detailed citations"],
  },
  {
    id: "groq",
    label: "Groq · Llama 3.1 8B",
    description: "Ultra-fast inference with near-zero latency. Great for quick lookups. Requires a GROQ_API_KEY in the server environment.",
    badge: "Fast",
    badgeColor: "#8b5cf6",
    icon: <Zap className="w-5 h-5" />,
    pros: ["Fastest responses", "Free-tier friendly", "Low latency"],
  },
];

export default function SettingsPage() {
  const preferredModel = useAppStore((s) => s.preferredModel);
  const setPreferredModel = useAppStore((s) => s.setPreferredModel);

  useEffect(() => {
    initModelPreference();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background-dark">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header breadcrumb={[{ label: "Settings" }]} />
        <div className="flex-1 overflow-y-auto px-8 py-10 max-w-2xl mx-auto w-full">
          {/* Page header */}
          <div className="flex items-center gap-3 mb-8">
            <Settings className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-slate-100">Settings</h1>
          </div>

          {/* Model selection */}
          <section>
            <div className="mb-4">
              <h2 className="text-base font-semibold text-slate-100 mb-1">AI Model</h2>
              <p className="text-sm text-slate-400">
                Choose which LLM powers Chat and Commit Q&amp;A. The server must have the
                corresponding API key configured; if the key is missing the server will fall back
                to whichever key is available.
              </p>
            </div>

            <div className="space-y-3">
              {MODEL_OPTIONS.map((option) => {
                const isSelected = preferredModel === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => setPreferredModel(option.id)}
                    className="w-full text-left rounded-xl p-5 transition-all"
                    style={{
                      background: isSelected ? "rgba(59,130,246,0.07)" : "#111116",
                      border: isSelected
                        ? "1.5px solid rgba(59,130,246,0.5)"
                        : "1px solid #1e1e26",
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div
                          className="mt-0.5 p-2 rounded-lg flex-shrink-0"
                          style={{
                            background: isSelected
                              ? "rgba(59,130,246,0.15)"
                              : "rgba(255,255,255,0.05)",
                            color: isSelected ? "#3b82f6" : "#64748b",
                          }}
                        >
                          {option.icon}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-semibold text-slate-100 text-sm">
                              {option.label}
                            </span>
                            <span
                              className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                              style={{
                                background: `${option.badgeColor}22`,
                                color: option.badgeColor,
                              }}
                            >
                              {option.badge}
                            </span>
                          </div>
                          <p className="text-slate-400 text-xs leading-relaxed mb-3">
                            {option.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {option.pros.map((pro) => (
                              <span
                                key={pro}
                                className="text-[11px] px-2 py-0.5 rounded-full"
                                style={{
                                  background: "rgba(255,255,255,0.05)",
                                  color: "#94a3b8",
                                }}
                              >
                                {pro}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Selected check */}
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-1 text-blue-400" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <p className="mt-3 text-[11px] text-slate-600">
              Preference saved locally in your browser. Changing it here instantly affects all
              new queries — no page reload needed.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
