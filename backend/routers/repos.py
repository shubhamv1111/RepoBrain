"""
RepoBrain — Repos Router
Handles repository ingestion and status tracking.
"""

from fastapi import APIRouter

router = APIRouter()


@router.post("/repos")
async def create_repo():
    """Ingest a new GitHub repository."""
    # TODO: Implement in Phase 2
    return {"message": "Not implemented yet"}


@router.get("/repos/{repo_id}/status")
async def get_repo_status(repo_id: str):
    """SSE stream for ingestion progress."""
    # TODO: Implement SSE in Phase 2
    return {"message": "Not implemented yet"}
