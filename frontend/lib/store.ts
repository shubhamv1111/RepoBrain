import { create } from "zustand";
import type { Repo, ChatSession } from "@/types";

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
}));
