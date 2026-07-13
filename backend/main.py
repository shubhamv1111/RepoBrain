"""
RepoBrain Backend — FastAPI Application Entry Point
"""

import ssl_setup  # noqa: F401 — OS TLS trust store for MongoDB on Windows

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

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
_origins = {
    o.strip()
    for o in f"{settings.allowed_origins},{settings.frontend_url}".split(",")
    if o.strip()
}
_origins.update(
    {
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    }
)
ALLOWED_ORIGINS = sorted(_origins)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    origin = request.headers.get("origin")
    headers = {}
    if origin in ALLOWED_ORIGINS:
        headers["Access-Control-Allow-Origin"] = origin
        headers["Access-Control-Allow-Credentials"] = "true"
        headers["Vary"] = "Origin"
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers=headers,
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    """Ensure CORS headers on 500s — otherwise browsers report a CORS error."""
    origin = request.headers.get("origin")
    headers = {}
    if origin in ALLOWED_ORIGINS:
        headers["Access-Control-Allow-Origin"] = origin
        headers["Access-Control-Allow-Credentials"] = "true"
        headers["Vary"] = "Origin"
    print(f"Unhandled error on {request.method} {request.url.path}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
        headers=headers,
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
