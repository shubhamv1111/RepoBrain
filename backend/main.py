"""
RepoBrain Backend — FastAPI Application Entry Point
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings
from database import connect_db, close_db

from routers import repos, overview, chat, insights, auth


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    await connect_db()
    print("✓ RepoBrain backend started")
    yield
    await close_db()
    print("✓ RepoBrain backend stopped")


app = FastAPI(
    title="RepoBrain API",
    description="AI-powered GitHub repository analyser with RAG-based Q&A",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ─────────────────────────────────────────────────────
settings = get_settings()
origins = [o.strip() for o in settings.allowed_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──────────────────────────────────────────────────
app.include_router(repos.router, prefix="/api", tags=["repos"])
app.include_router(overview.router, prefix="/api", tags=["overview"])
app.include_router(chat.router, prefix="/api", tags=["chat"])
app.include_router(insights.router, prefix="/api", tags=["insights"])
app.include_router(auth.router, prefix="/api", tags=["auth"])


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "repobrain-api"}
