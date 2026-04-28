import { create } from "zustand";
import type { Repo, ChatSession } from "@/types";

export type ModelPreference = "openai" | "groq";

const MODEL_STORAGE_KEY = "repobrain_model_preference";

function loadModelPreference(): ModelPreference {
  if (typeof window === "undefined") return "openai";
  const stored = localStorage.getItem(MODEL_STORAGE_KEY);
  return stored === "groq" ? "groq" : "openai";
}

interface AppState {
  // ─── Current repo context ─────────────────────────────────
  currentRepo: Repo | null;
  setCurrentRepo: (repo: Repo | null) => void;

  // ─── Recent repos (sidebar) ───────────────────────────────
  recentRepos: Repo[];
  addRecentRepo: (repo: Repo) => void;

  // ─── Active chat session ──────────────────────────────────
  activeSession: ChatSession | null;
  setActiveSession: (session: ChatSession | null) => void;

  // ─── Sidebar visibility (mobile) ──────────────────────────
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // ─── LLM model preference ─────────────────────────────────
  preferredModel: ModelPreference;
  setPreferredModel: (model: ModelPreference) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentRepo: null,
  setCurrentRepo: (repo) => set({ currentRepo: repo }),

  recentRepos: [],
  addRecentRepo: (repo) =>
    set((state) => {
      const filtered = state.recentRepos.filter((r) => r._id !== repo._id);
      return { recentRepos: [repo, ...filtered].slice(0, 5) };
    }),

  activeSession: null,
  setActiveSession: (session) => set({ activeSession: session }),

  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  preferredModel: "openai",
  setPreferredModel: (model) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(MODEL_STORAGE_KEY, model);
    }
    set({ preferredModel: model });
  },
}));

/** Initialise the model preference from localStorage on the client. */
export function initModelPreference() {
  const model = loadModelPreference();
  useAppStore.setState({ preferredModel: model });
}
