"""
CaterConnect Backend — Event Models
Defines Event, EventVersion, and EventMenuItem models according to database design spec.
"""

from __future__ import annotations

import enum
from datetime import date, time
from decimal import Decimal
from typing import Any

from sqlalchemy import (
    JSON,
    Boolean,
    Date,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    Time,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDPrimaryKeyMixin


class EventStatus(enum.StrEnum):
    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"
    CANCELLED = "CANCELLED"
    COMPLETED = "COMPLETED"


class EventItemSourceType(enum.StrEnum):
    PACKAGE = "PACKAGE"
    CUSTOM = "CUSTOM"
    ADDON = "ADDON"
    AI = "AI"


class Event(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Central planning aggregate for a customer catering event.
    """

    __tablename__ = "events"

    customer_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("customer_profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    caterer_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("caterers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    function_type_id: Mapped[str | None] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("function_types.id", ondelete="SET NULL"),
        nullable=True,
    )
    offering_id: Mapped[str | None] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("catering_offerings.id", ondelete="SET NULL"),
        nullable=True,
    )
    package_id: Mapped[str | None] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("packages.id", ondelete="SET NULL"),
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String(40),
        nullable=False,
        default=EventStatus.DRAFT.value,
        index=True,
    )
    guest_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    budget_min: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    budget_max: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)

    event_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    event_time: Mapped[time | None] = mapped_column(Time, nullable=True)
    timezone: Mapped[str] = mapped_column(String(64), nullable=False, default="Asia/Kolkata")

    venue_name: Mapped[str | None] = mapped_column(String(250), nullable=True)
    venue_address: Mapped[str | None] = mapped_column(Text, nullable=True)
    venue_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    customer_notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    configuration_version: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
    )

    # Relationships
    customer = relationship("CustomerProfile", backref="events", lazy="selectin")
    caterer = relationship("Caterer", backref="events", lazy="selectin")
    function_type = relationship("FunctionType", lazy="selectin")
    offering = relationship("CateringOffering", lazy="selectin")
    package = relationship("Package", lazy="selectin")

    menu_items = relationship(
        "EventMenuItem",
        back_populates="event",
        cascade="all, delete-orphan",
        order_by="EventMenuItem.created_at",
        lazy="selectin",
    )
    versions = relationship(
        "EventVersion",
        back_populates="event",
        cascade="all, delete-orphan",
        order_by="EventVersion.version_number.desc()",
        lazy="selectin",
    )

    __table_args__ = (Index("ix_events_customer_status", "customer_id", "status"),)


class EventMenuItem(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Selected menu items for an event draft/plan.
    """

    __tablename__ = "event_menu_items"

    event_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("events.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    menu_item_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("menu_items.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    source_type: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default=EventItemSourceType.PACKAGE.value,
    )
    selection_group_id: Mapped[str | None] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("package_selection_groups.id", ondelete="SET NULL"),
        nullable=True,
    )
    quantity: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2), nullable=True, default=Decimal("1.0")
    )
    is_included: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    metadata_json: Mapped[dict[str, Any] | None] = mapped_column(
        JSON,
        nullable=True,
    )

    # Relationships
    event = relationship("Event", back_populates="menu_items", lazy="selectin")
    menu_item = relationship("MenuItem", lazy="selectin")
    selection_group = relationship("PackageSelectionGroup", lazy="selectin")

    __table_args__ = (
        UniqueConstraint(
            "event_id", "menu_item_id", "selection_group_id", name="uq_event_menu_item_selection"
        ),
    )


class EventVersion(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Historical snapshot of an event configuration state.
    """

    __tablename__ = "event_versions"

    event_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("events.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    version_number: Mapped[int] = mapped_column(Integer, nullable=False)
    snapshot: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    changed_by_user_id: Mapped[str | None] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    change_reason: Mapped[str | None] = mapped_column(String(250), nullable=True)

    event = relationship("Event", back_populates="versions")
    changed_by_user = relationship("User")

    __table_args__ = (
        UniqueConstraint("event_id", "version_number", name="uq_event_version_number"),
    )
