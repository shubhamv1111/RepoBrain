"""
RepoBrain — Overview Router
Handles repo overview data and file content retrieval.
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/repos/{repo_id}/overview")
async def get_overview(repo_id: str):
    """Get repository overview data."""
    # TODO: Implement in Phase 3
    return {"message": "Not implemented yet"}


@router.get("/repos/{repo_id}/file")
async def get_file(repo_id: str, path: str):
    """Get file content by path."""
    # TODO: Implement in Phase 3
    return {"message": "Not implemented yet"}
