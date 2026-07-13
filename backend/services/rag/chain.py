"""
RepoBrain — RAG Chain
LangChain-based RAG chain that retrieves context and generates answers with citations.
"""

import json
import re
from typing import Optional

from langchain_core.messages import HumanMessage

from services.llm.client import get_llm
from services.rag.prompts import RAG_PROMPT
from services.rag.retriever import retrieve_chunks


def _get_llm(model: str | None = None):
    """Backward-compatible wrapper around the shared LLM factory."""
    return get_llm(model)


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
            "answer": "No LLM API key configured. Set OPENROUTER_API_KEY in the server environment.",
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
