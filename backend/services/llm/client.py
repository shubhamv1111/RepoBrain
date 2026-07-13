"""
RepoBrain — LLM client factory.

Model config via .env:
  DEFAULT_LLM          → openai | openrouter (which API is default)
  DEFAULT_CHAT_MODEL   → model slug for default provider (main knob)
  OPENAI_MODEL         → model when OpenAI is selected explicitly
  OPENROUTER_MODEL     → model when OpenRouter is selected explicitly
"""

from typing import Literal, Optional

from langchain_core.language_models.chat_models import BaseChatModel
from langchain_openai import ChatOpenAI

from config import get_settings

ModelPreference = Literal["openrouter", "openai"]

OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"

_PROVIDER_ORDER: dict[ModelPreference, tuple[ModelPreference, ...]] = {
    "openrouter": ("openrouter", "openai"),
    "openai": ("openai", "openrouter"),
}


def _openai_llm(
    temperature: float,
    max_tokens: int,
    *,
    model_slug: str,
) -> Optional[BaseChatModel]:
    settings = get_settings()
    if not settings.openai_api_key:
        return None

    return ChatOpenAI(
        model=model_slug,
        api_key=settings.openai_api_key,
        temperature=temperature,
        max_tokens=max_tokens,
    )


def _openrouter_llm(
    temperature: float,
    max_tokens: int,
    *,
    model_slug: str,
) -> Optional[BaseChatModel]:
    settings = get_settings()
    if not settings.openrouter_api_key:
        return None

    return ChatOpenAI(
        model=model_slug,
        api_key=settings.openrouter_api_key,
        base_url=OPENROUTER_BASE_URL,
        temperature=temperature,
        max_tokens=max_tokens,
    )


_BUILDERS = {
    "openai": _openai_llm,
    "openrouter": _openrouter_llm,
}


def _resolve_preference(model: str | None) -> ModelPreference:
    settings = get_settings()
    if model in _BUILDERS:
        return model  # type: ignore[return-value]
    if settings.default_llm in _BUILDERS:
        return settings.default_llm  # type: ignore[return-value]
    return "openai"


def get_llm(
    model: str | None = None,
    *,
    temperature: float = 0.3,
    max_tokens: int = 1500,
) -> Optional[BaseChatModel]:
    """
    Resolve an LLM client from user preference and configured API keys.

    Args:
        model: "openrouter" | "openai" | None.
               None → uses DEFAULT_LLM + DEFAULT_CHAT_MODEL from .env.
    """
    settings = get_settings()
    preference = _resolve_preference(model)
    for provider in _PROVIDER_ORDER[preference]:
        model_slug = settings.chat_model_for(provider, model)
        llm = _BUILDERS[provider](temperature, max_tokens, model_slug=model_slug)
        if llm is not None:
            return llm
    return None
