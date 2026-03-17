"""
RepoBrain — Pydantic models for Repository documents.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class RepoLanguage(BaseModel):
    name: str
    percent: float


class RepoMetrics(BaseModel):
    filesIndexed: int = 0
    functionsFound: int = 0
    chunksStored: int = 0
    commitsAnalysed: int = 0


class RepoCreate(BaseModel):
    """Request body for creating/ingesting a repo."""
    repoUrl: str
    githubToken: Optional[str] = None


class RepoDocument(BaseModel):
    """Full repo document as stored in MongoDB."""
    model_config = ConfigDict(arbitrary_types_allowed=True)

    id: Optional[str] = Field(None, alias="_id")
    repoUrl: str
    owner: str
    name: str
    ownerId: Optional[str] = None
    isPublic: bool = True
    status: str = "pending"
    metrics: RepoMetrics = RepoMetrics()
    languages: list[RepoLanguage] = []
    summary: str = ""
    keyModules: list[str] = []
    mermaidDiagram: Optional[str] = None
    chromaCollectionId: str = ""
    error: Optional[str] = None
    indexedAt: Optional[datetime] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)


class RepoResponse(BaseModel):
    """API response for a repo."""
    id: str
    repoUrl: str
    owner: str
    name: str
    status: str
    metrics: RepoMetrics
    languages: list[RepoLanguage]
    summary: str
    keyModules: list[str]
    mermaidDiagram: Optional[str] = None
    error: Optional[str] = None
