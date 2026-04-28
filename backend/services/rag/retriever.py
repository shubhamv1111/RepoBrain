"""
RepoBrain — RAG Retriever
Query ChromaDB for relevant code chunks.
"""

from services.ingestion.embedder import get_chroma_client, _embed_texts


def retrieve_chunks(
    collection_name: str,
    query: str,
    top_k: int = 5,
) -> list[dict]:
    """
    Retrieve the most relevant code chunks from ChromaDB.

    Returns list of:
    { content, filePath, startLine, endLine, language, type, name, score }
    """
    client = get_chroma_client()

    try:
        collection = client.get_collection(collection_name)
    except Exception:
        return []

    # Embed the query via OpenAI API
    query_embedding = _embed_texts([query])

    # Search ChromaDB
    results = collection.query(
        query_embeddings=query_embedding,
        n_results=top_k,
        include=["documents", "metadatas", "distances"],
    )

    if not results or not results["documents"] or not results["documents"][0]:
        return []

    chunks = []
    for doc, meta, distance in zip(
        results["documents"][0],
        results["metadatas"][0],
        results["distances"][0],
    ):
        chunks.append({
            "content": doc,
            "filePath": meta.get("filePath", ""),
            "startLine": meta.get("startLine", 0),
            "endLine": meta.get("endLine", 0),
            "language": meta.get("language", "text"),
            "type": meta.get("type", "chunk"),
            "name": meta.get("name", ""),
            "score": 1 - distance,  # Convert distance to similarity
        })

    return chunks
