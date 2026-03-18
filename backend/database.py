"""
RepoBrain Backend — Database Connection
Async MongoDB client using motor.
"""
from __future__ import annotations

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from config import get_settings

_client: AsyncIOMotorClient | None = None
_db: AsyncIOMotorDatabase | None = None


async def connect_db() -> None:
    """Initialize MongoDB connection."""
    global _client, _db
    settings = get_settings()
    _client = AsyncIOMotorClient(
        settings.mongodb_uri,
        serverSelectionTimeoutMS=5000,
    )
    _db = _client.get_default_database(default="repobrain")
    # Verify connection — non-fatal so startup isn't blocked by transient SSL issues
    try:
        await _client.admin.command("ping")
        print("✓ Connected to MongoDB")
    except Exception as exc:  # noqa: BLE001
        print(f"⚠  MongoDB ping failed at startup (will retry on first request): {exc}")


async def close_db() -> None:
    """Close MongoDB connection."""
    global _client
    if _client:
        _client.close()
        print("✓ MongoDB connection closed")


def get_db() -> AsyncIOMotorDatabase:
    """Get the database instance."""
    if _db is None:
        raise RuntimeError("Database not initialized. Call connect_db() first.")
    return _db
