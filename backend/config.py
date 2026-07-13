"""
RepoBrain Backend — Configuration
Environment variables and shared settings.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # ── MongoDB ──────────────────────────────────────────────
    mongodb_uri: str = "mongodb://localhost:27017/repobrain"
    mongodb_tls_insecure: bool = False  # set true on Windows if SSL verify fails

    # ── ChromaDB ─────────────────────────────────────────────
    chroma_persist_dir: str = "./chroma_store"

    # ── LLM API Keys ────────────────────────────────────────
    # All chat + embeddings go through OpenRouter (single key).
    openrouter_api_key: str = ""
    # openai_api_key: str = ""  # disabled — direct OpenAI not used
    # groq_api_key: str = ""    # disabled for now

    # ── LLM model slugs (OpenRouter format: provider/model) ─
    # DEFAULT_LLM + DEFAULT_CHAT_MODEL = main knobs to change default chat model
    default_llm: str = "openai"  # UI preference: openai | openrouter (both via OpenRouter)
    default_chat_model: str = ""  # e.g. openai/gpt-4o-mini
    openai_model: str = "openai/gpt-4o-mini"
    openrouter_model: str = "google/gemini-2.5-flash-lite"
    openai_embedding_model: str = "openai/text-embedding-3-small"
    # groq_model: str = "llama-3.1-8b-instant"  # disabled for now
    # gemini_model: str = "gemini-3.1-flash-lite"

    # ── GitHub ───────────────────────────────────────────────
    github_token: str = ""

    # ── Security ─────────────────────────────────────────────
    encryption_key: str = ""

    # ── CORS ─────────────────────────────────────────────────
    frontend_url: str = "http://localhost:3000"
    allowed_origins: str = "http://localhost:3000"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}

    def chat_model_for(self, provider: str, user_provider_choice: str | None = None) -> str:
        """Resolve model slug for a provider (respects DEFAULT_CHAT_MODEL on server default)."""
        per_provider = {
            "openai": self.openai_model,
            "openrouter": self.openrouter_model,
        }
        if (
            user_provider_choice is None
            and self.default_chat_model
            and provider == self.default_llm
        ):
            return self.default_chat_model
        return per_provider.get(provider, self.openai_model)


@lru_cache()
def get_settings() -> Settings:
    return Settings()
