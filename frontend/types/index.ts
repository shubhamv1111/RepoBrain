// ─── Repository ─────────────────────────────────────────────
export interface RepoLanguage {
  name: string;
  percent: number;
}

export interface RepoMetrics {
  filesIndexed: number;
  functionsFound: number;
  chunksStored: number;
  commitsAnalysed: number;
}

export interface Repo {
  _id: string;
  repoUrl: string;
  owner: string;
  name: string;
  ownerId: string | null;
  isPublic: boolean;
  status: "pending" | "cloning" | "parsing" | "embedding" | "ready" | "failed";
  metrics: RepoMetrics;
  languages: RepoLanguage[];
  summary: string;
  keyModules: string[];
  mermaidDiagram: string | null;
  chromaCollectionId: string;
  error: string | null;
  indexedAt: string;
  createdAt: string;
}

// ─── Ingestion Job ──────────────────────────────────────────
export type JobStepName = "clone" | "parse" | "embed";
export type JobStepStatus = "pending" | "active" | "done" | "failed";

export interface JobStep {
  name: JobStepName;
  status: JobStepStatus;
  message: string;
  percent: number;
}

export interface Job {
  _id: string;
  repoId: string;
  steps: JobStep[];
  startedAt: string;
  completedAt: string | null;
}

// ─── Chat ───────────────────────────────────────────────────
export interface Citation {
  filePath: string;
  lineStart: number;
  lineEnd: number;
}

export interface Source {
  filePath: string;
  snippet: string;
  chunkId: string;
}

export type MessageRole = "user" | "assistant";
export type Feedback = "up" | "down" | null;

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  citations: Citation[];
  sources: Source[];
  feedback: Feedback;
  createdAt: string;
}

export interface ChatSession {
  _id: string;
  repoId: string;
  userId: string | null;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

// ─── File Tree ──────────────────────────────────────────────
export interface FileTreeNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileTreeNode[];
}

export interface FileContent {
  content: string;
  language: string;
  totalLines: number;
}

// ─── Insights ───────────────────────────────────────────────
export interface GraphNode {
  id: string;
  data: { label: string; summary: string };
  position: { x: number; y: number };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
}

export interface DependencyGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export type IssueSeverity = "HIGH" | "MEDIUM" | "LOW";

export interface DetectedIssue {
  id: string;
  severity: IssueSeverity;
  message: string;
  filePath: string;
  line: number;
}

export interface HotspotEntry {
  filePath: string;
  value: number;
}

export interface InsightsData {
  dependencyGraph: DependencyGraph;
  mermaidDiagram: string | null;
  issues: DetectedIssue[];
  hotspots: {
    largestFiles: HotspotEntry[];
    highestChurn: HotspotEntry[];
  };
}

// ─── Overview ───────────────────────────────────────────────
export interface OverviewData {
  repo: Repo;
  metrics: RepoMetrics;
  languages: RepoLanguage[];
  summary: string;
  keyModules: string[];
  fileTree: FileTreeNode;
  mermaidDiagram: string | null;
}

// ─── Query Response ─────────────────────────────────────────
export interface QueryResponse {
  answer: string;
  citations: Citation[];
  sources: Source[];
  queryId: string;
  sessionId: string;
}

// ─── User ───────────────────────────────────────────────────
export interface User {
  _id: string;
  githubId: string;
  username: string;
  email: string;
  avatarUrl: string;
  createdAt: string;
  updatedAt: string;
}
