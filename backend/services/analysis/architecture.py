"""
RepoBrain — Architecture Diagram Generator
Uses LLM to generate a Mermaid flowchart of the repository's architecture.
"""

import re
from typing import Optional

from langchain_openai import ChatOpenAI
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage

from config import get_settings

ARCHITECTURE_PROMPT = """
You are a software architect. Based on the repository structure and summary below,
generate a Mermaid flowchart showing the high-level architecture.

Repository name: {repo_name}
Summary: {summary}
Top-level folders: {folders}
Key files: {key_files}
Languages detected: {languages}

Rules:
- Return ONLY valid Mermaid flowchart syntax. No explanation, no markdown fences.
- Use flowchart TD (top-down)
- Show max 8 nodes — keep it clean and readable
- Group by: Frontend, Backend/API, Database, External Services
- Use descriptive node labels
- Do NOT use special characters in node labels that break mermaid syntax

Example of valid output:
flowchart TD
    A[Next.js Frontend] --> B[FastAPI Backend]
    B --> C[LangChain RAG]
    B --> D[GitHub API]
    C --> E[ChromaDB]
    C --> F[OpenAI GPT-4o]
    B --> G[MongoDB Atlas]
"""

DEFAULT_FALLBACK_DIAGRAM = """flowchart TD
    A[Source Code] --> B[Code Parser]
    B --> C[Embeddings]
    C --> D[Vector Store]
    D --> E[RAG Pipeline]
    E --> F[LLM Response]
"""


def _clean_mermaid_output(text: str) -> str:
    """Strip accidental markdown fences from LLM output."""
    text = re.sub(r"^```[a-z]*\n?", "", text, flags=re.MULTILINE)
    text = re.sub(r"```$", "", text, flags=re.MULTILINE)
    return text.strip()


def _get_llm():
    """Get the LLM client — OpenAI primary, Groq fallback."""
    settings = get_settings()

    if settings.openai_api_key:
        return ChatOpenAI(
            model="gpt-4o",
            api_key=settings.openai_api_key,
            temperature=0.2,
            max_tokens=500,
        )

    if settings.groq_api_key:
        return ChatGroq(
            model="llama-3.1-8b-instant",
            api_key=settings.groq_api_key,
            temperature=0.2,
            max_tokens=500,
        )

    return None


async def generate_architecture_diagram(
    repo_name: str,
    summary: str,
    folders: list[str],
    key_files: list[str],
    languages: list[str],
) -> Optional[str]:
    """
    Generate a Mermaid architecture diagram using LLM.

    Returns the mermaid string or None on failure.
    """
    llm = _get_llm()
    if not llm:
        return DEFAULT_FALLBACK_DIAGRAM.strip()

    prompt = ARCHITECTURE_PROMPT.format(
        repo_name=repo_name,
        summary=summary or "No summary available",
        folders=", ".join(folders[:15]),
        key_files=", ".join(key_files[:20]),
        languages=", ".join(languages),
    )

    try:
        response = await llm.ainvoke([HumanMessage(content=prompt)])
        mermaid_text = _clean_mermaid_output(response.content)

        # Basic validation
        if not mermaid_text.startswith("flowchart"):
            return DEFAULT_FALLBACK_DIAGRAM.strip()

        return mermaid_text

    except Exception as e:
        print(f"Architecture diagram generation failed: {e}")
        return DEFAULT_FALLBACK_DIAGRAM.strip()
