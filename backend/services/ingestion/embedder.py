"""
RepoBrain — Embedding Service
Embeds code chunks via OpenAI text-embedding-3-small and stores in ChromaDB.
Using the API means zero local ML model RAM — safe for Render's 512 MB tier.
"""
from __future__ import annotations

import uuid
import chromadb
from openai import OpenAI

from config import get_settings

# ── Globals (loaded once) ────────────────────────────────────
_openai_client: OpenAI | None = None
_chroma_client: chromadb.PersistentClient | None = None

EMBEDDING_MODEL = "text-embedding-3-small"


def get_openai_client() -> OpenAI:
    """Get or create the OpenAI client (singleton)."""
    global _openai_client
    if _openai_client is None:
        settings = get_settings()
        _openai_client = OpenAI(api_key=settings.openai_api_key)
    return _openai_client


def _embed_texts(texts: list[str]) -> list[list[float]]:
    """Call OpenAI embeddings API and return a list of float vectors."""
    client = get_openai_client()
    response = client.embeddings.create(model=EMBEDDING_MODEL, input=texts)
    return [item.embedding for item in response.data]


def get_chroma_client() -> chromadb.PersistentClient:
    """Get or create ChromaDB persistent client (singleton)."""
    global _chroma_client
    if _chroma_client is None:
        settings = get_settings()
        _chroma_client = chromadb.PersistentClient(
            path=settings.chroma_persist_dir
        )
    return _chroma_client


def embed_chunks(
    repo_id: str,
    chunks: list[dict],
    progress_callback=None,
    batch_size: int = 50,
) -> tuple[str, int]:
    """
    Embed code chunks and store in ChromaDB.

    Args:
        repo_id: MongoDB repo ID (used as collection name)
        chunks: list of { path, language, type, name, startLine, endLine, content }
        progress_callback: optional (message, percent) callback
        batch_size: number of chunks to process per batch

    Returns:
        (collection_name, total_stored) tuple
    """
    client = get_chroma_client()
    collection_name = f"repo_{repo_id}"

    # Get or create collection
    collection = client.get_or_create_collection(
        name=collection_name,
        metadata={"hnsw:space": "cosine"},
    )

    total = len(chunks)
    stored = 0

    if progress_callback:
        progress_callback("Loading embedding model...", 5)

    for i in range(0, total, batch_size):
        batch = chunks[i : i + batch_size]

        # Prepare texts for embedding
        texts = []
        ids = []
        metadatas = []

        for chunk in batch:
            # Build a rich text representation for embedding
            text = f"File: {chunk['path']}\n"
            if chunk["type"] in ("function", "class"):
                text += f"{chunk['type'].title()}: {chunk['name']}\n"
            text += f"\n{chunk['content']}"

            texts.append(text)
            ids.append(str(uuid.uuid4()))
            metadatas.append({
                "filePath": chunk["path"],
                "startLine": chunk["startLine"],
                "endLine": chunk["endLine"],
                "language": chunk["language"],
                "type": chunk["type"],
                "name": chunk["name"],
            })

        # Generate embeddings via OpenAI API
        embeddings = _embed_texts(texts)

        # Store in ChromaDB
        collection.add(
            ids=ids,
            embeddings=embeddings,
            documents=texts,
            metadatas=metadatas,
        )

        stored += len(batch)

        if progress_callback:
            pct = int((stored / max(total, 1)) * 100)
            progress_callback(
                f"Embedding {stored} of {total} chunks...",
                min(pct, 95),
            )

    if progress_callback:
        progress_callback(
            f"Embedding complete — {stored} chunks stored",
            100,
        )

    return collection_name, stored


def delete_collection(repo_id: str) -> None:
    """Delete a repo's ChromaDB collection."""
    client = get_chroma_client()
    collection_name = f"repo_{repo_id}"
    try:
        client.delete_collection(collection_name)
    except Exception:
        pass  # Collection may not exist
