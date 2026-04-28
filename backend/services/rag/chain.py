"""
RepoBrain — RAG Chain
LangChain-based RAG chain that retrieves context and generates answers with citations.
"""

import json
import re
from typing import Optional

from langchain_openai import ChatOpenAI
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage

from config import get_settings
from services.rag.prompts import RAG_PROMPT
from services.rag.retriever import retrieve_chunks


def _get_llm(model: str | None = None):
    """
    Get the LLM client.

    Args:
        model: "openai" | "groq" | None.
               None → use OpenAI if key is present, else fall back to Groq.
               "openai" → force OpenAI (error if key missing).
               "groq"   → force Groq   (error if key missing).
    """
    settings = get_settings()

    prefer_groq = model == "groq"
    prefer_openai = model == "openai" or model is None

    if prefer_openai and settings.openai_api_key:
        return ChatOpenAI(
            model="gpt-4o",
            api_key=settings.openai_api_key,
            temperature=0.3,
            max_tokens=1500,
        )

    if settings.groq_api_key and (prefer_groq or not settings.openai_api_key):
        return ChatGroq(
            model="llama-3.1-8b-instant",
            api_key=settings.groq_api_key,
            temperature=0.3,
            max_tokens=1500,
        )

    # Last-resort: if groq preferred but openai is the only key available
    if settings.openai_api_key:
        return ChatOpenAI(
            model="gpt-4o",
            api_key=settings.openai_api_key,
            temperature=0.3,
            max_tokens=1500,
        )

    return None


def _parse_citations(text: str) -> tuple[str, list[dict]]:
    """Extract CITATIONS block from LLM response."""
    citations = []
    clean_text = text

    # Find CITATIONS: [...] pattern
    match = re.search(r"CITATIONS:\s*(\[.*?\])", text, re.DOTALL)
    if match:
        try:
            citations = json.loads(match.group(1))
            # Remove the citations block from the answer
            clean_text = text[: match.start()].strip()
        except json.JSONDecodeError:
            pass

    return clean_text, citations


async def query_repo(
    collection_name: str,
    repo_name: str,
    question: str,
    top_k: int = 5,
    model: str | None = None,
) -> dict:
    """
    Run a RAG query against a repo's indexed code.

    Returns: { answer, citations, sources }
    """
    # Step 1: Retrieve relevant chunks
    chunks = retrieve_chunks(collection_name, question, top_k)

    if not chunks:
        return {
            "answer": "I could not find relevant code in the index for this question.",
            "citations": [],
            "sources": [],
        }

    # Step 2: Build context string
    context_parts = []
    for i, chunk in enumerate(chunks):
        context_parts.append(
            f"--- Chunk {i + 1} ---\n"
            f"File: {chunk['filePath']} (lines {chunk['startLine']}-{chunk['endLine']})\n"
            f"Type: {chunk['type']} | Name: {chunk['name']}\n\n"
            f"{chunk['content']}\n"
        )
    context = "\n".join(context_parts)

    # Step 3: Call LLM
    llm = _get_llm(model)
    if not llm:
        return {
            "answer": "No LLM API key configured. Please set OPENAI_API_KEY or GROQ_API_KEY.",
            "citations": [],
            "sources": [
                {
                    "filePath": c["filePath"],
                    "snippet": c["content"][:200],
                    "chunkId": f"{c['filePath']}:{c['startLine']}",
                }
                for c in chunks[:3]
            ],
        }

    prompt = RAG_PROMPT.format(
        repo_name=repo_name,
        question=question,
        context=context,
    )

    response = await llm.ainvoke([HumanMessage(content=prompt)])
    answer_text = response.content

    # Step 4: Parse citations
    answer, citations = _parse_citations(answer_text)

    # Step 5: Build sources
    sources = [
        {
            "filePath": c["filePath"],
            "snippet": c["content"][:300],
            "chunkId": f"{c['filePath']}:{c['startLine']}",
        }
        for c in chunks[:3]
    ]

    return {
        "answer": answer,
        "citations": citations,
        "sources": sources,
    }
