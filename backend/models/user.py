"""
RepoBrain — Pydantic models for User documents.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class UserDocument(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    githubId: str
    username: str
    email: str = ""
    avatarUrl: str = ""
    accessToken: str = ""  # encrypted
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)


class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    avatarUrl: str
