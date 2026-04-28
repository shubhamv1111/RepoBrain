"""
RepoBrain — Pydantic models for Chat documents.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class Citation(BaseModel):
    filePath: str
    lineStart: int
    lineEnd: int


class Source(BaseModel):
    filePath: str
    snippet: str
    chunkId: str


class MessageModel(BaseModel):
    id: str
    role: str  # "user" | "assistant"
    content: str
    citations: list[Citation] = []
    sources: list[Source] = []
    feedback: Optional[str] = None  # "up" | "down" | null
    createdAt: datetime = Field(default_factory=datetime.utcnow)


class SessionDocument(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    repoId: str
    userId: Optional[str] = None
    title: str = "New conversation"
    messages: list[MessageModel] = []
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)


class QueryRequest(BaseModel):
    query: str
    sessionId: Optional[str] = None
    topK: int = 5
    model: Optional[str] = None  # "openai" | "groq" — None means use server default


class QueryResponse(BaseModel):
    answer: str
    citations: list[Citation] = []
    sources: list[Source] = []
    queryId: str
    sessionId: str


class FeedbackRequest(BaseModel):
    queryId: str
    sessionId: str
    liked: bool
