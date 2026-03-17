"""
RepoBrain — Overview Router
Handles repo overview data and file content retrieval.
"""

import os
from pathlib import Path
from fastapi import APIRouter, HTTPException
from bson import ObjectId

from database import get_db

router = APIRouter()


def _build_file_tree(files: list[dict]) -> dict:
    """Build a nested file tree structure from flat file paths."""
    root = {"name": "root", "path": "", "type": "directory", "children": []}

    for file_info in files:
        parts = file_info["path"].split("/")
        current = root

        for i, part in enumerate(parts):
            is_file = i == len(parts) - 1
            path_so_far = "/".join(parts[: i + 1])

            existing = next(
                (c for c in current.get("children", []) if c["name"] == part),
                None,
            )

            if existing:
                current = existing
            else:
                node = {
                    "name": part,
                    "path": path_so_far,
                    "type": "file" if is_file else "directory",
                }
                if not is_file:
                    node["children"] = []
                current.setdefault("children", []).append(node)
                current = node

    return root


@router.get("/repos/{repo_id}/overview")
async def get_overview(repo_id: str):
    """Get full repository overview including metrics, languages, summary, file tree, and diagram."""
    db = get_db()

    try:
        repo = await db.repos.find_one({"_id": ObjectId(repo_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid repo ID")

    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")

    if repo.get("status") != "ready":
        raise HTTPException(
            status_code=400,
            detail=f"Repository not ready. Current status: {repo.get('status')}",
        )

    # Build file tree from ChromaDB metadata
    from services.ingestion.embedder import get_chroma_client

    chroma = get_chroma_client()
    collection_name = repo.get("chromaCollectionId", f"repo_{repo_id}")

    file_tree = {"name": "root", "path": "", "type": "directory", "children": []}
    try:
        collection = chroma.get_collection(collection_name)
        results = collection.get(include=["metadatas"])
        if results and results["metadatas"]:
            # Get unique file paths
            seen_paths = set()
            file_list = []
            for meta in results["metadatas"]:
                fp = meta.get("filePath", "")
                if fp and fp not in seen_paths:
                    seen_paths.add(fp)
                    file_list.append({"path": fp})

            file_tree = _build_file_tree(file_list)
    except Exception:
        pass

    return {
        "repo": {
            "id": str(repo["_id"]),
            "repoUrl": repo.get("repoUrl", ""),
            "owner": repo.get("owner", ""),
            "name": repo.get("name", ""),
            "status": repo.get("status", ""),
        },
        "metrics": repo.get("metrics", {}),
        "languages": repo.get("languages", []),
        "summary": repo.get("summary", ""),
        "keyModules": repo.get("keyModules", []),
        "fileTree": file_tree,
        "mermaidDiagram": repo.get("mermaidDiagram"),
    }


@router.get("/repos/{repo_id}/file")
async def get_file(repo_id: str, path: str):
    """Get file content from ChromaDB chunks for a given path."""
    db = get_db()

    try:
        repo = await db.repos.find_one({"_id": ObjectId(repo_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid repo ID")

    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")

    from services.ingestion.embedder import get_chroma_client

    chroma = get_chroma_client()
    collection_name = repo.get("chromaCollectionId", f"repo_{repo_id}")

    try:
        collection = chroma.get_collection(collection_name)
        results = collection.get(
            where={"filePath": path},
            include=["documents", "metadatas"],
        )

        if not results or not results["documents"]:
            raise HTTPException(status_code=404, detail="File not found in index")

        # Reconstruct file content from chunks, sorted by startLine
        chunks = list(zip(results["documents"], results["metadatas"]))
        chunks.sort(key=lambda x: x[1].get("startLine", 0))

        # Extract raw content (remove the "File: path\n..." prefix we added during embedding)
        content_parts = []
        for doc, meta in chunks:
            lines = doc.split("\n")
            # Skip the metadata lines we prepended
            start_idx = 0
            for j, line in enumerate(lines):
                if line == "" and j > 0:
                    start_idx = j + 1
                    break
            content_parts.append("\n".join(lines[start_idx:]))

        content = "\n".join(content_parts)
        language = chunks[0][1].get("language", "text") if chunks else "text"
        total_lines = content.count("\n") + 1

        return {
            "content": content,
            "language": language,
            "totalLines": total_lines,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading file: {str(e)}")
