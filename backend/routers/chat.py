"""
RepoBrain — Chat Router
Handles RAG queries, feedback, and session management.
"""

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from bson import ObjectId

from database import get_db
from models.chat import QueryRequest, QueryResponse, FeedbackRequest
from services.rag.chain import query_repo

router = APIRouter()


@router.post("/repos/{repo_id}/query", response_model=QueryResponse)
async def handle_query(repo_id: str, body: QueryRequest):
    """Query the repository using RAG."""
    db = get_db()

    # Get repo
    try:
        repo = await db.repos.find_one({"_id": ObjectId(repo_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid repo ID")

    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")

    if repo.get("status") != "ready":
        raise HTTPException(status_code=400, detail="Repository not ready for queries")

    collection_name = repo.get("chromaCollectionId", f"repo_{repo_id}")

    # Run RAG query
    result = await query_repo(
        collection_name=collection_name,
        repo_name=repo.get("name", ""),
        question=body.query,
        top_k=body.topK,
        model=body.model,
    )

    query_id = str(uuid.uuid4())

    # Handle session
    if body.sessionId:
        session_id = body.sessionId
        # Add messages to existing session
        await db.sessions.update_one(
            {"_id": ObjectId(session_id)},
            {
                "$push": {
                    "messages": {
                        "$each": [
                            {
                                "id": str(uuid.uuid4()),
                                "role": "user",
                                "content": body.query,
                                "citations": [],
                                "sources": [],
                                "feedback": None,
                                "createdAt": datetime.now(timezone.utc),
                            },
                            {
                                "id": query_id,
                                "role": "assistant",
                                "content": result["answer"],
                                "citations": result["citations"],
                                "sources": result["sources"],
                                "feedback": None,
                                "createdAt": datetime.now(timezone.utc),
                            },
                        ]
                    }
                },
                "$set": {"updatedAt": datetime.now(timezone.utc)},
            },
        )
    else:
        # Create new session
        session_doc = {
            "repoId": repo_id,
            "userId": None,
            "title": body.query[:50] + ("..." if len(body.query) > 50 else ""),
            "messages": [
                {
                    "id": str(uuid.uuid4()),
                    "role": "user",
                    "content": body.query,
                    "citations": [],
                    "sources": [],
                    "feedback": None,
                    "createdAt": datetime.now(timezone.utc),
                },
                {
                    "id": query_id,
                    "role": "assistant",
                    "content": result["answer"],
                    "citations": result["citations"],
                    "sources": result["sources"],
                    "feedback": None,
                    "createdAt": datetime.now(timezone.utc),
                },
            ],
            "createdAt": datetime.now(timezone.utc),
            "updatedAt": datetime.now(timezone.utc),
        }
        insert_result = await db.sessions.insert_one(session_doc)
        session_id = str(insert_result.inserted_id)

    return QueryResponse(
        answer=result["answer"],
        citations=result.get("citations", []),
        sources=result.get("sources", []),
        queryId=query_id,
        sessionId=session_id,
    )


@router.post("/feedback")
async def submit_feedback(body: FeedbackRequest):
    """Submit feedback on a query response."""
    db = get_db()

    feedback_value = "up" if body.liked else "down"

    await db.sessions.update_one(
        {"_id": ObjectId(body.sessionId), "messages.id": body.queryId},
        {"$set": {"messages.$.feedback": feedback_value}},
    )

    return {"status": "ok"}


@router.get("/repos/{repo_id}/sessions")
async def get_sessions(repo_id: str):
    """List chat sessions for a repo."""
    db = get_db()

    cursor = db.sessions.find(
        {"repoId": repo_id},
        {"messages": {"$slice": -1}, "title": 1, "createdAt": 1, "updatedAt": 1},
    ).sort("updatedAt", -1).limit(20)

    sessions = []
    async for doc in cursor:
        sessions.append({
            "id": str(doc["_id"]),
            "title": doc.get("title", "Untitled"),
            "createdAt": doc.get("createdAt", "").isoformat() if doc.get("createdAt") else "",
            "updatedAt": doc.get("updatedAt", "").isoformat() if doc.get("updatedAt") else "",
            "messageCount": len(doc.get("messages", [])),
        })

    return {"sessions": sessions}


@router.get("/sessions/{session_id}")
async def get_session(session_id: str):
    """Get a specific chat session with all messages."""
    db = get_db()

    try:
        session = await db.sessions.find_one({"_id": ObjectId(session_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid session ID")

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    return {
        "id": str(session["_id"]),
        "repoId": session.get("repoId", ""),
        "title": session.get("title", ""),
        "messages": session.get("messages", []),
        "createdAt": session.get("createdAt", "").isoformat() if session.get("createdAt") else "",
        "updatedAt": session.get("updatedAt", "").isoformat() if session.get("updatedAt") else "",
    }
