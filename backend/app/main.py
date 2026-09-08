"""
CaterConnect Backend — FastAPI Application Entry Point
"""

import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import get_settings
from app.core.logging import configure_logging, get_logger
from app.core.security import generate_request_id

# Configure logging first
configure_logging()
logger = get_logger(__name__)

# Import all models so SQLAlchemy / Alembic can detect them at import time
from app import models as _models  # noqa: F401, E402


@asynccontextmanager
async def lifespan(application: FastAPI):
    """Application lifespan — startup and shutdown events."""
    settings = get_settings()
    logger.info(
        "starting_application",
        name=settings.app_name,
        version=settings.app_version,
        env=settings.app_env,
    )
    yield
    logger.info("application_shutdown")


def create_application() -> FastAPI:
    settings = get_settings()

    application = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description="Catering Planning & Quotation Platform API",
        docs_url="/docs" if settings.is_development else None,
        redoc_url="/redoc" if settings.is_development else None,
        lifespan=lifespan,
    )

    # ---------------------------------------------------------------------------
    # CORS
    # ---------------------------------------------------------------------------
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ---------------------------------------------------------------------------
    # Request ID middleware
    # ---------------------------------------------------------------------------
    @application.middleware("http")
    async def request_id_middleware(request: Request, call_next):
        request_id = request.headers.get("X-Request-ID") or generate_request_id()
        request.state.request_id = request_id
        response: Response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response

    # ---------------------------------------------------------------------------
    # Request timing middleware
    # ---------------------------------------------------------------------------
    @application.middleware("http")
    async def timing_middleware(request: Request, call_next):
        start = time.perf_counter()
        response: Response = await call_next(request)
        elapsed_ms = round((time.perf_counter() - start) * 1000, 2)
        response.headers["X-Process-Time-Ms"] = str(elapsed_ms)
        return response

    # ---------------------------------------------------------------------------
    # Global exception handler
    # ---------------------------------------------------------------------------
    @application.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        request_id = getattr(request.state, "request_id", "unknown")
        logger.error(
            "unhandled_exception",
            request_id=request_id,
            path=str(request.url),
            exc_info=exc,
        )
        return JSONResponse(
            status_code=500,
            content={
                "error": {
                    "code": "INTERNAL_ERROR",
                    "message": "An unexpected error occurred. Please try again.",
                    "details": {},
                },
                "request_id": request_id,
            },
        )

    # ---------------------------------------------------------------------------
    # Routers
    # ---------------------------------------------------------------------------
    from app.api import auth, events, health
    from app.api import catalog as customer_catalog
    from app.api.admin import catalog as admin_catalog

    application.include_router(health.router, prefix="/api/v1", tags=["health"])
    application.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
    application.include_router(customer_catalog.router, prefix="/api/v1", tags=["catalog"])
    application.include_router(events.router, prefix="/api/v1/events", tags=["events"])
    application.include_router(
        admin_catalog.router,
        prefix="/api/v1/admin",
        tags=["admin-catalog"],
    )

    return application


app = create_application()
