"""
RepoBrain — Embedding Service
Embeds code chunks using fastembed (ONNX-based) and stores them in ChromaDB.
fastembed uses ONNX Runtime instead of PyTorch, keeping RAM well under 512 MB.
"""
from __future__ import annotations

import uuid
import chromadb
from fastembed import TextEmbedding

from config import get_settings

# ── Globals (loaded once) ────────────────────────────────────
_model: TextEmbedding | None = None
_chroma_client: chromadb.PersistentClient | None = None


def get_embedding_model() -> TextEmbedding:
    """Load the embedding model (singleton)."""
    global _model
    if _model is None:
        _model = TextEmbedding("sentence-transformers/all-MiniLM-L6-v2")
    return _model


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
    model = get_embedding_model()
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

        # Generate embeddings (fastembed returns a generator of numpy arrays)
        embeddings = [vec.tolist() for vec in model.embed(texts)]

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
