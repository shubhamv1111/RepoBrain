import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// ─── Ingestion ──────────────────────────────────────────────
export const ingestRepo = (repoUrl: string, githubToken?: string) =>
  api.post("/repos", { repoUrl, githubToken });

export const getRepoStatusSSE = (repoId: string): EventSource =>
  new EventSource(`${API_BASE}/api/repos/${repoId}/status`);

// ─── Overview ───────────────────────────────────────────────
export const getRepoOverview = (repoId: string) =>
  api.get(`/repos/${repoId}/overview`);

export const getFileContent = (repoId: string, filePath: string) =>
  api.get(`/repos/${repoId}/file`, { params: { path: filePath } });

// ─── Chat ───────────────────────────────────────────────────
export const queryRepo = (
  repoId: string,
  query: string,
  sessionId?: string,
  topK = 5
) => api.post(`/repos/${repoId}/query`, { query, sessionId, topK });

export const submitFeedback = (
  queryId: string,
  sessionId: string,
  liked: boolean
) => api.post("/feedback", { queryId, sessionId, liked });

export const getRepoSessions = (repoId: string) =>
  api.get(`/repos/${repoId}/sessions`);

export const getSession = (sessionId: string) =>
  api.get(`/sessions/${sessionId}`);

// ─── Insights ───────────────────────────────────────────────
export const getRepoInsights = (repoId: string) =>
  api.get(`/repos/${repoId}/insights`);

export const commitQA = (repoId: string, query: string) =>
  api.post(`/repos/${repoId}/commit-qa`, { query });

// ─── Auth ───────────────────────────────────────────────────
export const getMe = () => api.get("/auth/me");

export default api;
