"""
RepoBrain — Auth Router
Handles GitHub OAuth token management.
"""

from fastapi import APIRouter

router = APIRouter()


@router.post("/auth/github")
async def github_auth():
    """Store GitHub OAuth token."""
    # TODO: Implement in Phase 1 extension
    return {"message": "Not implemented yet"}


@router.get("/auth/me")
async def get_me():
    """Get current authenticated user."""
    # TODO: Implement in Phase 1 extension
    return {"message": "Not implemented yet"}


@router.post("/auth/logout")
async def logout():
    """Logout current user."""
    # TODO: Implement
    return {"message": "Not implemented yet"}
