"""
CaterConnect Backend — Health Check API
Provides basic health and readiness endpoints.
"""

from datetime import UTC, datetime

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.database import get_db

router = APIRouter()


@router.get("/health", summary="Health check")
async def health_check():
    """
    Basic liveness probe — returns 200 if the application is running.
    Used by load balancers and container orchestrators.
    """
    settings = get_settings()
    return {
        "status": "ok",
        "app": settings.app_name,
        "version": settings.app_version,
        "env": settings.app_env,
        "timestamp": datetime.now(tz=UTC).isoformat(),
    }


@router.get("/health/ready", summary="Readiness check")
async def readiness_check(db: AsyncSession = Depends(get_db)):
    """
    Readiness probe — verifies database connectivity.
    Returns 200 only when all dependencies are healthy.
    """
    db_ok = False
    db_error = None
    try:
        await db.execute(text("SELECT 1"))
        db_ok = True
    except Exception as e:
        db_error = str(e)

    status = "ok" if db_ok else "degraded"

    return {
        "status": status,
        "checks": {
            "database": {"ok": db_ok, "error": db_error},
        },
        "timestamp": datetime.now(tz=UTC).isoformat(),
    }
