import { create } from "zustand";
import type { Repo, ChatSession } from "@/types";
import { getRecentRepos } from "@/lib/api";

export type ModelPreference = "openrouter" | "openai";

const MODEL_STORAGE_KEY = "repobrain_model_preference";

function loadModelPreference(): ModelPreference {
  if (typeof window === "undefined") return "openai";
  const stored = localStorage.getItem(MODEL_STORAGE_KEY);
  if (stored === "openrouter") return "openrouter";
  // default + legacy values → openai
  return "openai";
}

interface AppState {
  // ─── Current repo context ─────────────────────────────────
  currentRepo: Repo | null;
  setCurrentRepo: (repo: Repo | null) => void;

  // ─── Recent repos (sidebar) ───────────────────────────────
  recentRepos: Repo[];
  addRecentRepo: (repo: Repo) => void;
  setRecentRepos: (repos: Repo[]) => void;

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

  setRecentRepos: (repos) => set({ recentRepos: repos.slice(0, 10) }),

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

/** Load recent repos from MongoDB (survives logout / page refresh). */
export async function loadRecentRepos() {
  try {
    const res = await getRecentRepos(10);
    useAppStore.getState().setRecentRepos(res.data.repos);
  } catch (error) {
    console.error("Failed to load recent repos:", error);
  }
}
