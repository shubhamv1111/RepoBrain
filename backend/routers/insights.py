"""
RepoBrain — Insights Router
Handles dependency graphs, issues, hotspots, and commit Q&A.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from bson import ObjectId

from database import get_db
from services.ingestion.embedder import get_chroma_client
from services.analysis.dependency import build_dependency_graph
from services.analysis.issues import detect_issues
from services.analysis.hotspots import analyze_hotspots


router = APIRouter()


class CommitQARequest(BaseModel):
    query: str


def _get_files_from_chroma(collection_name: str) -> list[dict]:
    """Extract file data from ChromaDB collection."""
    client = get_chroma_client()
    try:
        collection = client.get_collection(collection_name)
        results = collection.get(include=["documents", "metadatas"])

        # Group by file path
        file_map: dict[str, dict] = {}
        for doc, meta in zip(results["documents"], results["metadatas"]):
            fp = meta.get("filePath", "")
            if fp not in file_map:
                file_map[fp] = {
                    "path": fp,
                    "content": "",
                    "language": meta.get("language", "text"),
                }
            # Append content
            lines = doc.split("\n")
            start_idx = 0
            for j, line in enumerate(lines):
                if line == "" and j > 0:
                    start_idx = j + 1
                    break
            file_map[fp]["content"] += "\n".join(lines[start_idx:]) + "\n"

        return list(file_map.values())
    except Exception:
        return []


@router.get("/repos/{repo_id}/insights")
async def get_insights(repo_id: str):
    """Get repository insights: dependency graph, issues, hotspots."""
    db = get_db()

    try:
        repo = await db.repos.find_one({"_id": ObjectId(repo_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid repo ID")

    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")

    collection_name = repo.get("chromaCollectionId", f"repo_{repo_id}")

    # Get files from ChromaDB
    files = _get_files_from_chroma(collection_name)

    # Run analysis
    dependency_graph = build_dependency_graph(files)
    issues = detect_issues(files)
    hotspots = analyze_hotspots(files)

    return {
        "dependencyGraph": dependency_graph,
        "mermaidDiagram": repo.get("mermaidDiagram"),
        "issues": issues,
        "hotspots": hotspots,
    }


@router.post("/repos/{repo_id}/commit-qa")
async def commit_qa(repo_id: str, body: CommitQARequest):
    """Answer questions about commits using LLM."""
    db = get_db()

    try:
        repo = await db.repos.find_one({"_id": ObjectId(repo_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid repo ID")

    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")

    # For now, use RAG to answer commit-related questions
    from services.rag.chain import query_repo

    collection_name = repo.get("chromaCollectionId", f"repo_{repo_id}")
    result = await query_repo(
        collection_name=collection_name,
        repo_name=repo.get("name", ""),
        question=f"Based on the code: {body.query}",
        top_k=5,
    )

    return {
        "answer": result["answer"],
        "commits": [],
    }
