"""
CaterConnect Backend — Pricing & Estimate Models
Defines PricingVersion, PricingRule, PackagePricingRule, MenuItemPricingRule, and Estimate.
"""

from __future__ import annotations

import enum
from datetime import datetime
from decimal import Decimal
from typing import Any

from sqlalchemy import (
    JSON,
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDPrimaryKeyMixin


class PricingRuleType(enum.StrEnum):
    PACKAGE_BASE = "PACKAGE_BASE"
    PER_PERSON = "PER_PERSON"
    ITEM_ADDON = "ITEM_ADDON"
    FIXED_CHARGE = "FIXED_CHARGE"
    SERVICE_CHARGE = "SERVICE_CHARGE"
    TRAVEL_CHARGE = "TRAVEL_CHARGE"
    DISCOUNT = "DISCOUNT"
    TAX = "TAX"


class PricingScopeType(enum.StrEnum):
    CATERER = "CATERER"
    PACKAGE = "PACKAGE"
    MENU_ITEM = "MENU_ITEM"
    OFFERING = "OFFERING"
    FUNCTION = "FUNCTION"
    EVENT = "EVENT"


class BudgetStatus(enum.StrEnum):
    UNDER_BUDGET = "UNDER_BUDGET"
    WITHIN_BUDGET = "WITHIN_BUDGET"
    SLIGHTLY_ABOVE = "SLIGHTLY_ABOVE"
    ABOVE_BUDGET = "ABOVE_BUDGET"
    NO_BUDGET = "NO_BUDGET"


class PricingVersion(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Tracks versioned pricing configurations for caterers.
    """

    __tablename__ = "pricing_versions"

    caterer_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("caterers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    version_number: Mapped[int] = mapped_column(Integer, nullable=False)
    effective_from: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    effective_to: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relationships
    caterer = relationship("Caterer", backref="pricing_versions", lazy="selectin")
    rules = relationship(
        "PricingRule",
        back_populates="pricing_version",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    __table_args__ = (
        UniqueConstraint(
            "caterer_id", "version_number", name="uq_pricing_versions_caterer_version"
        ),
    )


class PricingRule(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Configurable pricing rule for caterers, packages, items, or events.
    """

    __tablename__ = "pricing_rules"

    caterer_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("caterers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    pricing_version_id: Mapped[str | None] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("pricing_versions.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    rule_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default=PricingRuleType.PER_PERSON.value,
        index=True,
    )
    scope_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default=PricingScopeType.CATERER.value,
        index=True,
    )
    amount: Mapped[Decimal | None] = mapped_column(
        Numeric(12, 2),
        nullable=True,
    )
    percentage: Mapped[Decimal | None] = mapped_column(
        Numeric(7, 4),
        nullable=True,
    )
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="INR")
    configuration: Mapped[dict[str, Any] | None] = mapped_column(
        JSON,
        nullable=True,
    )
    priority: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    effective_from: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    effective_to: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    caterer = relationship("Caterer", backref="pricing_rules", lazy="selectin")
    pricing_version = relationship("PricingVersion", back_populates="rules", lazy="selectin")
    package_rules = relationship(
        "PackagePricingRule",
        back_populates="pricing_rule",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    menu_item_rules = relationship(
        "MenuItemPricingRule",
        back_populates="pricing_rule",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    __table_args__ = (
        Index("ix_pricing_rules_caterer_active", "caterer_id", "is_active", "rule_type"),
    )


class PackagePricingRule(Base):
    """
    Links a pricing rule to a specific package.
    """

    __tablename__ = "package_pricing_rules"

    package_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("packages.id", ondelete="CASCADE"),
        primary_key=True,
        nullable=False,
    )
    pricing_rule_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("pricing_rules.id", ondelete="CASCADE"),
        primary_key=True,
        nullable=False,
    )

    # Relationships
    package = relationship("Package", backref="pricing_rule_mappings", lazy="selectin")
    pricing_rule = relationship("PricingRule", back_populates="package_rules", lazy="selectin")


class MenuItemPricingRule(Base):
    """
    Links a pricing rule to a specific menu item.
    """

    __tablename__ = "menu_item_pricing_rules"

    menu_item_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("menu_items.id", ondelete="CASCADE"),
        primary_key=True,
        nullable=False,
    )
    pricing_rule_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("pricing_rules.id", ondelete="CASCADE"),
        primary_key=True,
        nullable=False,
    )

    # Relationships
    menu_item = relationship("MenuItem", backref="pricing_rule_mappings", lazy="selectin")
    pricing_rule = relationship("PricingRule", back_populates="menu_item_rules", lazy="selectin")


class Estimate(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Authoritative estimate generated for an event draft configuration version.
    """

    __tablename__ = "estimates"

    event_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("events.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    event_version: Mapped[int] = mapped_column(Integer, nullable=False)
    pricing_version_id: Mapped[str | None] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("pricing_versions.id", ondelete="SET NULL"),
        nullable=True,
    )
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="INR")
    lower_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    upper_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    budget_min: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    budget_max: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    budget_status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default=BudgetStatus.NO_BUDGET.value,
    )
    breakdown: Mapped[list[dict[str, Any]]] = mapped_column(
        JSON,
        nullable=False,
        default=list,
    )
    disclaimer: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        default="Estimated price only. Final quotation is subject to caterer confirmation.",
    )
    generated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # Relationships
    event = relationship("Event", backref="estimates", lazy="selectin")
    pricing_version = relationship("PricingVersion", lazy="selectin")

    __table_args__ = (
        CheckConstraint("lower_amount >= 0", name="ck_estimates_lower_non_negative"),
        CheckConstraint("upper_amount >= lower_amount", name="ck_estimates_upper_gte_lower"),
        Index("ix_estimates_event_version", "event_id", "event_version"),
    )
