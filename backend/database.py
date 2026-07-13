"""
RepoBrain Backend — Database Connection
Async MongoDB client using motor.
"""
from __future__ import annotations

import ssl_setup  # noqa: F401 — must load before motor/pymongo SSL

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from config import get_settings

_client: AsyncIOMotorClient | None = None
_db: AsyncIOMotorDatabase | None = None


def _mongo_client_kwargs(*, tls_insecure: bool) -> dict:
    kwargs: dict = {"serverSelectionTimeoutMS": 10000}
    if tls_insecure:
        kwargs["tlsAllowInvalidCertificates"] = True
    return kwargs


async def connect_db() -> None:
    """Initialize MongoDB connection with TLS fallbacks for Windows/Python 3.14."""
    global _client, _db

    if _client is not None:
        _client.close()
        _client = None
        _db = None

    settings = get_settings()
    attempts: list[tuple[str, bool]] = [("truststore", False)]
    if settings.mongodb_tls_insecure:
        attempts.append(("insecure", True))
    else:
        attempts.append(("insecure-fallback", True))

    last_error: Exception | None = None
    for label, tls_insecure in attempts:
        try:
            _client = AsyncIOMotorClient(
                settings.mongodb_uri,
                **_mongo_client_kwargs(tls_insecure=tls_insecure),
            )
            _db = _client.get_default_database(default="repobrain")
            await _client.admin.command("ping")
            print(f"✓ Connected to MongoDB ({label})")
            return
        except Exception as exc:  # noqa: BLE001
            last_error = exc
            if _client is not None:
                _client.close()
                _client = None
                _db = None
            print(f"⚠  MongoDB connect failed ({label}): {exc}")

    print(f"⚠  MongoDB unavailable at startup: {last_error}")


async def close_db() -> None:
    """Close MongoDB connection."""
    global _client, _db
    if _client:
        _client.close()
        _client = None
        _db = None
        print("✓ MongoDB connection closed")


def get_db() -> AsyncIOMotorDatabase:
    """Get the database instance."""
    if _db is None:
        raise RuntimeError("Database not initialized. Call connect_db() first.")
    return _db
