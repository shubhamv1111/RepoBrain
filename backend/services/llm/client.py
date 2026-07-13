"""
RepoBrain — LLM client factory.

All chat models go through OpenRouter (single API key).

Model config via .env:
  DEFAULT_LLM          → openai | openrouter (UI preference — both use OpenRouter)
  DEFAULT_CHAT_MODEL   → e.g. openai/gpt-4o-mini
  OPENAI_MODEL         → OpenAI model slug via OpenRouter (when user picks OpenAI in Settings)
  OPENROUTER_MODEL     → Google/Gemini slug via OpenRouter (when user picks Gemini in Settings)
"""

from typing import Literal, Optional

from langchain_core.language_models.chat_models import BaseChatModel
from langchain_openai import ChatOpenAI

from config import get_settings

ModelPreference = Literal["openrouter", "openai"]

OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"


def _resolve_preference(model: str | None) -> ModelPreference:
    settings = get_settings()
    if model in ("openai", "openrouter"):
        return model  # type: ignore[return-value]
    if settings.default_llm in ("openai", "openrouter"):
        return settings.default_llm  # type: ignore[return-value]
    return "openai"


def get_llm(
    model: str | None = None,
    *,
    temperature: float = 0.3,
    max_tokens: int = 1500,
) -> Optional[BaseChatModel]:
    """
    Resolve an LLM client — always via OpenRouter.

    Args:
        model: "openrouter" | "openai" | None.
               None → uses DEFAULT_LLM + DEFAULT_CHAT_MODEL from .env.
    """
    settings = get_settings()
    if not settings.openrouter_api_key:
        return None

    preference = _resolve_preference(model)
    model_slug = settings.chat_model_for(preference, model)

    return ChatOpenAI(
        model=model_slug,
        api_key=settings.openrouter_api_key,
        base_url=OPENROUTER_BASE_URL,
        temperature=temperature,
        max_tokens=max_tokens,
    )


# ── Direct OpenAI API (disabled — use OpenRouter instead) ────
# def _openai_llm(...):
#     ...
