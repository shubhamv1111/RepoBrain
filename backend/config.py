"""
RepoBrain Backend — Configuration
Environment variables and shared settings.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # ── MongoDB ──────────────────────────────────────────────
    mongodb_uri: str = "mongodb://localhost:27017/repobrain"

    # ── ChromaDB ─────────────────────────────────────────────
    chroma_persist_dir: str = "./chroma_store"

    # ── LLM API Keys ────────────────────────────────────────
    openai_api_key: str = ""
    groq_api_key: str = ""

    # ── GitHub ───────────────────────────────────────────────
    github_token: str = ""

    # ── Security ─────────────────────────────────────────────
    encryption_key: str = ""

    # ── CORS ─────────────────────────────────────────────────
    frontend_url: str = "http://localhost:3000"
    allowed_origins: str = "http://localhost:3000"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


@lru_cache()
def get_settings() -> Settings:
    return Settings()
