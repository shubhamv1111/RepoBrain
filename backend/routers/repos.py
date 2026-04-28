"""
RepoBrain — Repos Router
Handles repository ingestion with SSE progress streaming.
"""

import asyncio
import json
from datetime import datetime, timezone
from typing import AsyncGenerator

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from bson import ObjectId

from database import get_db
from models.repo import RepoCreate
from services.ingestion.cloner import clone_and_collect, cleanup_clone, parse_repo_url
from services.ingestion.parser import parse_files
from services.ingestion.embedder import embed_chunks
from services.analysis.architecture import generate_architecture_diagram

router = APIRouter()

# ── In-memory job progress store (per repo) ──────────────────
_job_progress: dict[str, list[dict]] = {}


def _update_progress(repo_id: str, step: str, status: str, message: str, percent: int):
    """Update in-memory progress for SSE."""
    if repo_id not in _job_progress:
        _job_progress[repo_id] = []
    _job_progress[repo_id].append({
        "step": step,
        "status": status,
        "message": message,
        "percent": percent,
    })


@router.post("/repos")
async def create_repo(body: RepoCreate):
    """Ingest a new GitHub repository — kicks off the pipeline."""
    db = get_db()

    # Parse URL
    try:
        owner, name = parse_repo_url(body.repoUrl)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Check if already indexed
    existing = await db.repos.find_one({"repoUrl": body.repoUrl, "status": "ready"})
    if existing:
        return {
            "repoId": str(existing["_id"]),
            "jobId": str(existing["_id"]),
            "message": "Repository already indexed",
        }

    # Create repo document
    repo_doc = {
        "repoUrl": body.repoUrl,
        "owner": owner,
        "name": name,
        "ownerId": None,
        "isPublic": True,
        "status": "pending",
        "metrics": {
            "filesIndexed": 0,
            "functionsFound": 0,
            "chunksStored": 0,
            "commitsAnalysed": 0,
        },
        "languages": [],
        "summary": "",
        "keyModules": [],
        "mermaidDiagram": None,
        "recentCommits": [],
        "chromaCollectionId": "",
        "error": None,
        "indexedAt": None,
        "createdAt": datetime.now(timezone.utc),
    }

    result = await db.repos.insert_one(repo_doc)
    repo_id = str(result.inserted_id)

    # Create job document
    job_doc = {
        "repoId": repo_id,
        "steps": [
            {"name": "clone", "status": "pending", "message": "", "percent": 0},
            {"name": "parse", "status": "pending", "message": "", "percent": 0},
            {"name": "embed", "status": "pending", "message": "", "percent": 0},
        ],
        "startedAt": datetime.now(timezone.utc),
        "completedAt": None,
    }
    await db.jobs.insert_one(job_doc)

    # Start ingestion in background
    asyncio.create_task(_run_ingestion(repo_id, body.repoUrl, body.githubToken))

    return {"repoId": repo_id, "jobId": repo_id}


async def _run_ingestion(repo_id: str, repo_url: str, github_token: str | None):
    """Run the full ingestion pipeline in the background."""
    db = get_db()
    clone_dir = None

    try:
        # ── Step 1: Clone ────────────────────────────────────
        await db.repos.update_one(
            {"_id": ObjectId(repo_id)},
            {"$set": {"status": "cloning"}},
        )
        _update_progress(repo_id, "clone", "active", "Cloning repository...", 0)

        def clone_progress(msg, pct):
            _update_progress(repo_id, "clone", "active", msg, pct)

        clone_dir, files, recent_commits = await asyncio.to_thread(
            clone_and_collect, repo_url, github_token, clone_progress
        )
        _update_progress(repo_id, "clone", "done", f"Cloned — {len(files)} files found", 100)

        # Calculate language stats
        lang_counts: dict[str, int] = {}
        for f in files:
            lang = f["language"]
            lang_counts[lang] = lang_counts.get(lang, 0) + 1
        total_files = max(len(files), 1)
        languages = [
            {"name": lang, "percent": round(count / total_files * 100, 1)}
            for lang, count in sorted(lang_counts.items(), key=lambda x: -x[1])
        ]

        # ── Step 2: Parse ────────────────────────────────────
        await db.repos.update_one(
            {"_id": ObjectId(repo_id)},
            {"$set": {"status": "parsing"}},
        )
        _update_progress(repo_id, "parse", "active", "Parsing files...", 0)

        def parse_progress(msg, pct):
            _update_progress(repo_id, "parse", "active", msg, pct)

        chunks = await asyncio.to_thread(parse_files, files, parse_progress)

        functions_found = sum(1 for c in chunks if c["type"] in ("function", "class"))
        _update_progress(repo_id, "parse", "done", f"Parsed — {len(chunks)} chunks", 100)

        # ── Step 3: Embed ────────────────────────────────────
        await db.repos.update_one(
            {"_id": ObjectId(repo_id)},
            {"$set": {"status": "embedding"}},
        )
        _update_progress(repo_id, "embed", "active", "Embedding into ChromaDB...", 0)

        def embed_progress(msg, pct):
            _update_progress(repo_id, "embed", "active", msg, pct)

        collection_name, total_stored = await asyncio.to_thread(
            embed_chunks, repo_id, chunks, embed_progress
        )
        _update_progress(repo_id, "embed", "done", f"Stored {total_stored} chunks", 100)

        # ── Post-processing: Generate summary & architecture ──
        # Extract top-level folders and key files for the diagram
        top_folders = list(set(
            f["path"].split("/")[0] for f in files if "/" in f["path"]
        ))
        key_files = [f["path"] for f in files[:20]]
        lang_names = [l["name"] for l in languages[:5]]

        # Generate summary from first few chunks
        summary_text = f"Repository with {len(files)} files across {len(lang_counts)} languages. "
        if functions_found:
            summary_text += f"Contains {functions_found} functions/classes. "
        summary_text += f"Primary language: {languages[0]['name'] if languages else 'unknown'}."

        # Generate architecture diagram
        mermaid_diagram = await generate_architecture_diagram(
            repo_name=parse_repo_url(repo_url)[1],
            summary=summary_text,
            folders=top_folders,
            key_files=key_files,
            languages=lang_names,
        )

        # ── Update repo as ready ─────────────────────────────
        await db.repos.update_one(
            {"_id": ObjectId(repo_id)},
            {
                "$set": {
                    "status": "ready",
                    "metrics": {
                        "filesIndexed": len(files),
                        "functionsFound": functions_found,
                        "chunksStored": total_stored,
                        "commitsAnalysed": len(recent_commits),
                    },
                    "languages": languages,
                    "summary": summary_text,
                    "keyModules": top_folders[:6],
                    "mermaidDiagram": mermaid_diagram,
                    "recentCommits": recent_commits,
                    "chromaCollectionId": collection_name,
                    "indexedAt": datetime.now(timezone.utc),
                    "error": None,
                }
            },
        )

        _update_progress(repo_id, "complete", "done", "Indexing complete!", 100)

    except Exception as e:
        error_msg = str(e)
        await db.repos.update_one(
            {"_id": ObjectId(repo_id)},
            {"$set": {"status": "failed", "error": error_msg}},
        )
        _update_progress(repo_id, "error", "failed", error_msg, 0)

    finally:
        if clone_dir:
            cleanup_clone(clone_dir)


@router.get("/repos/{repo_id}/status")
async def get_repo_status(repo_id: str):
    """SSE stream for ingestion progress."""

    async def event_generator() -> AsyncGenerator[str, None]:
        last_index = 0
        while True:
            events = _job_progress.get(repo_id, [])
            while last_index < len(events):
                event = events[last_index]
                yield f"data: {json.dumps(event)}\n\n"
                last_index += 1

                # Stop streaming when complete or failed
                if event.get("step") in ("complete", "error"):
                    return

            await asyncio.sleep(0.5)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
