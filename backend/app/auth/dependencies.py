"""
CaterConnect Backend — Auth Dependencies
FastAPI dependencies for extracting session tokens, authenticating users, and enforcing RBAC.
"""

from collections.abc import Callable

from fastapi import Cookie, Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.logging import get_logger
from app.core.security import decode_session_token
from app.models.user import User
from app.services.auth_service import get_user_by_id

logger = get_logger(__name__)
bearer_scheme = HTTPBearer(auto_error=False)


async def extract_token(
    request: Request,
    bearer: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    session_token_cookie: str | None = Cookie(None, alias="session_token"),
) -> str | None:
    """
    Extract session token with priority:
    1. Authorization Bearer header
    2. HTTP-only session_token cookie
    """
    if bearer and bearer.credentials:
        return bearer.credentials
    if session_token_cookie:
        return session_token_cookie
    return None


async def get_current_user(
    token: str | None = Depends(extract_token),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Validate session token and return active User instance.
    Raises 401 Unauthorized on invalid/missing credentials.
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "code": "AUTH_UNAUTHORIZED",
                "message": "Authentication required. Please log in.",
            },
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = decode_session_token(token)
        user_id = payload.get("sub")
        if not user_id:
            raise ValueError("Token missing subject")
    except JWTError as e:
        logger.warning("invalid_session_token", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "code": "AUTH_SESSION_INVALID",
                "message": "Your session is invalid or has expired. Please log in again.",
            },
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = await get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "code": "AUTH_USER_NOT_FOUND",
                "message": "User account no longer exists or is deactivated.",
            },
        )

    return user


async def get_optional_current_user(
    token: str | None = Depends(extract_token),
    db: AsyncSession = Depends(get_db),
) -> User | None:
    """
    Extract current user if authenticated, otherwise return None.
    Does not raise 401.
    """
    if not token:
        return None
    try:
        payload = decode_session_token(token)
        user_id = payload.get("sub")
        if not user_id:
            return None
        return await get_user_by_id(db, user_id)
    except Exception:
        return None


def require_role(*allowed_roles: str) -> Callable:
    """
    Dependency factory that checks if current user has one of the allowed roles.
    Example: Depends(require_role("ADMIN"))
    """

    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "code": "AUTH_FORBIDDEN",
                    "message": f"Access denied. Requires one of roles: {', '.join(allowed_roles)}.",
                },
            )
        return current_user

    return role_checker
