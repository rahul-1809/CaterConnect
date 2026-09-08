"""
CaterConnect Backend — Models Package
Exports all SQLAlchemy ORM models.
"""

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDPrimaryKeyMixin
from app.models.user import (
    Caterer,
    CatererAdmin,
    CustomerProfile,
    OTPChallenge,
    User,
    UserRole,
)

__all__ = [
    "Base",
    "TimestampMixin",
    "UUIDPrimaryKeyMixin",
    "User",
    "UserRole",
    "CustomerProfile",
    "Caterer",
    "CatererAdmin",
    "OTPChallenge",
]
