# 🧠 RepoBrain

> AI-powered GitHub repository analyser — index any repo, explore its architecture, and chat with the code.

![Next.js](https://img.shields.io/badge/Next.js_14-000?logo=next.js&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)
![ChromaDB](https://img.shields.io/badge/ChromaDB-FF6F61)
![LangChain](https://img.shields.io/badge/LangChain-121212?logo=langchain&logoColor=white)

---

## ✨ Features

| Page | What it does |
|------|-------------|
| **Home** | Paste a GitHub URL → repo is cloned, parsed, and embedded with live SSE progress |
| **Overview** | 3-column layout: file explorer, metrics/summary/Monaco preview, architecture diagram |
| **Chat** | RAG-powered Q&A with citation chips, sources panel, and session history |
| **Insights** | Dependency graph (React Flow), static issue detection, hotspots, commit Q&A |

### Key Highlights
- 🎯 **RAG Pipeline** — clone → parse (regex AST) → embed (all-MiniLM-L6-v2) → ChromaDB
- 🗺️ **Architecture Diagrams** — AI-generated Mermaid flowcharts via OpenAI/Groq
- 📝 **Citation-based Answers** — every response references exact files and line numbers
- 🔍 **Static Analysis** — detects hardcoded secrets, eval(), large functions, missing error handling
- 🌙 **Premium Dark UI** — inspired by Vercel, Linear, and GitHub dark mode

---

## 🏗️ Tech Stack

### Frontend
- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** — dark theme design system
- **TanStack Query** — server state management
- **Zustand** — client state
- **NextAuth.js v5** — GitHub OAuth
- **Monaco Editor** — code preview
- **React Flow** — dependency graph
- **Mermaid.js** — architecture diagrams
- **Lucide React** — icons

### Backend
- **FastAPI** (Python 3.11+)
- **Motor** — async MongoDB driver
- **ChromaDB** — vector embeddings (persistent)
- **sentence-transformers** — all-MiniLM-L6-v2
- **LangChain** + OpenAI / Groq — RAG chain
- **GitPython** — repository cloning
- **Pydantic v2** — data validation

### Infrastructure
- **MongoDB Atlas** — metadata, chat history, sessions
- **ChromaDB** — vector store (disk-persisted)
- **Docker Compose** — local development

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- MongoDB (local or Atlas)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/RepoBrain.git
cd RepoBrain
```

### 2. Frontend setup
```bash
cd frontend
cp ../.env.example .env.local
# Fill in NEXTAUTH_SECRET, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
npm install
npm run dev
```

### 3. Backend setup
```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example .env
# Fill in MONGODB_URI, OPENAI_API_KEY or GROQ_API_KEY
uvicorn main:app --reload
```

### 4. Docker (optional)
```bash
docker-compose up --build
```

---

## 📁 Project Structure

```
RepoBrain/
├── frontend/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Home — repo input + progress
│   │   ├── repo/[id]/          # Overview page
│   │   │   ├── chat/           # Chat page
│   │   │   └── insights/       # Insights page
│   │   └── api/auth/           # NextAuth route handler
│   ├── components/
│   │   ├── layout/             # Navbar, Sidebar
│   │   ├── ingest/             # RepoInput, ProgressStepper
│   │   ├── overview/           # MetricsGrid, FileTree, FilePreview, etc.
│   │   ├── chat/               # MessageBubble, CitationChip, SourcesPanel, etc.
│   │   └── insights/           # DependencyGraph, IssuesPanel, HotspotsPanel, etc.
│   ├── hooks/                  # useRepo, useChat, useIngestion
│   ├── lib/                    # api.ts, store.ts, auth.ts
│   └── types/                  # TypeScript interfaces
├── backend/
│   ├── main.py                 # FastAPI entry point
│   ├── config.py               # Pydantic settings
│   ├── database.py             # Async MongoDB (Motor)
│   ├── models/                 # Pydantic models
│   ├── routers/                # API endpoints
│   │   ├── repos.py            # Ingestion + SSE progress
│   │   ├── overview.py         # Overview + file content
│   │   ├── chat.py             # RAG query + sessions
│   │   └── insights.py         # Analysis + commit Q&A
│   └── services/
│       ├── ingestion/          # cloner, parser, embedder
│       ├── rag/                # retriever, chain, prompts
│       └── analysis/           # architecture, dependency, issues, hotspots
├── .env.example                # Environment variable template
├── docker-compose.yml          # Local development setup
└── README.md
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/repos` | Start repo ingestion |
| `GET` | `/api/repos/{id}/status` | SSE progress stream |
| `GET` | `/api/repos/{id}/overview` | Full repo overview |
| `GET` | `/api/repos/{id}/file?path=...` | File content |
| `POST` | `/api/repos/{id}/query` | RAG chat query |
| `POST` | `/api/feedback` | Thumbs up/down |
| `GET` | `/api/repos/{id}/sessions` | List chat sessions |
| `GET` | `/api/sessions/{id}` | Get session messages |
| `GET` | `/api/repos/{id}/insights` | Analysis data |
| `POST` | `/api/repos/{id}/commit-qa` | Commit Q&A |

---

## 📄 License

MIT

---

**Built with ❤️ by RepoBrain**
