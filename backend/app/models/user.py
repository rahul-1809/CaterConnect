"""
CaterConnect Backend — User and Auth Models
Tables: users, customer_profiles, caterers, caterer_admins, otp_challenges
"""
from datetime import datetime, timezone
from enum import Enum
from typing import Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDPrimaryKeyMixin


class UserRole(str, Enum):
    CUSTOMER = "CUSTOMER"
    ADMIN = "ADMIN"
    STAFF = "STAFF"


class User(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Represents an authenticated application identity."""

    __tablename__ = "users"

    phone_number: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False)
    phone_country_code: Mapped[str] = mapped_column(String(8), default="+91", nullable=False)
    role: Mapped[str] = mapped_column(String(30), default=UserRole.CUSTOMER.value, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    last_login_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    customer_profile: Mapped[Optional["CustomerProfile"]] = relationship(
        "CustomerProfile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    caterer_admin: Mapped[Optional["CatererAdmin"]] = relationship(
        "CatererAdmin",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )


class CustomerProfile(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Stores customer information beyond authentication."""

    __tablename__ = "customer_profiles"

    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )
    full_name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="customer_profile")


class Caterer(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Represents the single catering business entity."""

    __tablename__ = "caterers"

    business_name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    phone_number: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    timezone: Mapped[str] = mapped_column(String(64), default="Asia/Kolkata", nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="INR", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    admins: Mapped[list["CatererAdmin"]] = relationship(
        "CatererAdmin",
        back_populates="caterer",
        cascade="all, delete-orphan",
    )


class CatererAdmin(Base, UUIDPrimaryKeyMixin):
    """Associates application users with the caterer admin role."""

    __tablename__ = "caterer_admins"
    __table_args__ = (
        UniqueConstraint("caterer_id", "user_id", name="uq_caterer_admin_caterer_user"),
    )

    caterer_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("caterers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    caterer: Mapped["Caterer"] = relationship("Caterer", back_populates="admins")
    user: Mapped["User"] = relationship("User", back_populates="caterer_admin")


class OTPChallenge(Base, UUIDPrimaryKeyMixin):
    """
    Stores ephemeral OTP challenges.
    The raw OTP code is NEVER stored — only the SHA-256 hash.
    """

    __tablename__ = "otp_challenges"

    phone_number: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    country_code: Mapped[str] = mapped_column(String(8), default="+91", nullable=False)
    code_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    attempt_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    max_attempts: Mapped[int] = mapped_column(Integer, default=5, nullable=False)
    consumed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    provider: Mapped[Optional[str]] = mapped_column(String(60), default="dev", nullable=True)
    provider_reference: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True,
    )

    @property
    def is_expired(self) -> bool:
        """Check if this challenge has expired."""
        exp = self.expires_at
        if exp.tzinfo is None:
            exp = exp.replace(tzinfo=timezone.utc)
        return datetime.now(tz=timezone.utc) > exp

    @property
    def is_consumed(self) -> bool:
        """Check if this challenge has already been used."""
        return self.consumed_at is not None

    @property
    def is_max_attempts_exceeded(self) -> bool:
        """Check if failed attempts reached the limit."""
        return self.attempt_count >= self.max_attempts
