"""
CaterConnect Backend — Security Utilities
Session management, token signing, and password hashing utilities.
"""

import hashlib
import secrets
import uuid
from datetime import UTC, datetime, timedelta

from jose import jwt
from passlib.context import CryptContext

from app.core.config import get_settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def generate_uuid() -> str:
    """Generate a new random UUID string."""
    return str(uuid.uuid4())


def generate_otp(length: int = 6) -> str:
    """Generate a numeric OTP of the specified length."""
    return "".join([str(secrets.randbelow(10)) for _ in range(length)])


def hash_otp(otp: str) -> str:
    """Return a SHA-256 hash of the OTP. Raw OTPs are never persisted."""
    return hashlib.sha256(otp.encode()).hexdigest()


def verify_otp_hash(otp: str, hashed: str) -> bool:
    """Verify an OTP against its stored hash."""
    return hash_otp(otp) == hashed


def hash_password(password: str) -> str:
    """Hash a plain-text password (for admin accounts)."""
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    """Verify a plain-text password against its hash."""
    return pwd_context.verify(plain, hashed)


def create_session_token(user_id: str, role: str) -> str:
    """
    Create a signed JWT used as the session token.
    The token is stored in an HTTP-only cookie on the client.
    """
    settings = get_settings()
    now = datetime.now(tz=UTC)
    expire = now + timedelta(seconds=settings.session_expire_seconds)
    payload = {
        "sub": user_id,
        "role": role,
        "iat": now,
        "exp": expire,
        "jti": str(uuid.uuid4()),  # JWT ID for revocation tracking
    }
    return jwt.encode(payload, settings.secret_key, algorithm="HS256")


def decode_session_token(token: str) -> dict:
    """
    Decode and validate a session token.
    Raises jose.JWTError on invalid/expired tokens.
    """
    settings = get_settings()
    return jwt.decode(token, settings.secret_key, algorithms=["HS256"])


def generate_request_id() -> str:
    """Generate a unique request correlation ID."""
    return f"req_{uuid.uuid4().hex[:20]}"


def generate_human_readable_id(prefix: str, year: int, sequence: int) -> str:
    """
    Generate human-readable IDs like CR-2026-00125, QT-2026-00082.
    The sequence number is zero-padded to 5 digits.
    """
    return f"{prefix}-{year}-{sequence:05d}"
