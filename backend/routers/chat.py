"""
RepoBrain — Chat Router
Handles RAG queries, feedback, and session management.
"""

from fastapi import APIRouter

router = APIRouter()


@router.post("/repos/{repo_id}/query")
async def query_repo(repo_id: str):
    """Query the repository using RAG."""
    # TODO: Implement in Phase 4
    return {"message": "Not implemented yet"}


@router.post("/feedback")
async def submit_feedback():
    """Submit feedback on a query response."""
    # TODO: Implement in Phase 4
    return {"message": "Not implemented yet"}


@router.get("/repos/{repo_id}/sessions")
async def get_sessions(repo_id: str):
    """List chat sessions for a repo."""
    # TODO: Implement in Phase 4
    return {"message": "Not implemented yet"}


@router.get("/sessions/{session_id}")
async def get_session(session_id: str):
    """Get a specific chat session."""
    # TODO: Implement in Phase 4
    return {"message": "Not implemented yet"}
