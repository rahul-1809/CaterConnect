"""
CaterConnect Backend — Catalog ORM Models
Tables: function_types, catering_offerings, function_offerings,
        menu_categories, menu_items, menu_item_functions, menu_item_offerings,
        packages, package_functions, package_offerings, package_items,
        package_selection_groups, package_selection_group_items, package_addons
"""
from datetime import datetime
from typing import Optional

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Integer,
    JSON,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDPrimaryKeyMixin


# ---------------------------------------------------------------------------
# Function Types
# ---------------------------------------------------------------------------

class FunctionType(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Represents an event category: Wedding, Birthday, Corporate, etc."""

    __tablename__ = "function_types"
    __table_args__ = (
        UniqueConstraint("caterer_id", "slug", name="uq_function_types_caterer_slug"),
    )

    caterer_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("caterers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    slug: Mapped[str] = mapped_column(String(140), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    image_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Relationships
    function_offerings: Mapped[list["FunctionOffering"]] = relationship(
        "FunctionOffering",
        back_populates="function_type",
        cascade="all, delete-orphan",
    )
    menu_item_functions: Mapped[list["MenuItemFunction"]] = relationship(
        "MenuItemFunction",
        back_populates="function_type",
        cascade="all, delete-orphan",
    )
    package_functions: Mapped[list["PackageFunction"]] = relationship(
        "PackageFunction",
        back_populates="function_type",
        cascade="all, delete-orphan",
    )


# ---------------------------------------------------------------------------
# Catering Offerings
# ---------------------------------------------------------------------------

class CateringOffering(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Represents a service type: Lunch, Dinner, Breakfast, High Tea, etc."""

    __tablename__ = "catering_offerings"
    __table_args__ = (
        UniqueConstraint("caterer_id", "slug", name="uq_catering_offerings_caterer_slug"),
    )

    caterer_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("caterers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    slug: Mapped[str] = mapped_column(String(160), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    image_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Relationships
    function_offerings: Mapped[list["FunctionOffering"]] = relationship(
        "FunctionOffering",
        back_populates="offering",
        cascade="all, delete-orphan",
    )
    menu_item_offerings: Mapped[list["MenuItemOffering"]] = relationship(
        "MenuItemOffering",
        back_populates="offering",
        cascade="all, delete-orphan",
    )
    package_offerings: Mapped[list["PackageOffering"]] = relationship(
        "PackageOffering",
        back_populates="offering",
        cascade="all, delete-orphan",
    )


# ---------------------------------------------------------------------------
# Function ↔ Offering M2M
# ---------------------------------------------------------------------------

class FunctionOffering(Base, UUIDPrimaryKeyMixin):
    """Associates function types with catering offerings (many-to-many)."""

    __tablename__ = "function_offerings"
    __table_args__ = (
        UniqueConstraint("function_type_id", "offering_id", name="uq_function_offerings"),
    )

    function_type_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("function_types.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    offering_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("catering_offerings.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    function_type: Mapped["FunctionType"] = relationship(
        "FunctionType", back_populates="function_offerings"
    )
    offering: Mapped["CateringOffering"] = relationship(
        "CateringOffering", back_populates="function_offerings"
    )


# ---------------------------------------------------------------------------
# Menu Categories
# ---------------------------------------------------------------------------

class MenuCategory(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Groups menu items: Starters, Main Course, Breads, Desserts, etc."""

    __tablename__ = "menu_categories"
    __table_args__ = (
        UniqueConstraint("caterer_id", "slug", name="uq_menu_categories_caterer_slug"),
    )

    caterer_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("caterers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    slug: Mapped[str] = mapped_column(String(140), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    menu_items: Mapped[list["MenuItem"]] = relationship(
        "MenuItem",
        back_populates="category",
        cascade="all, delete-orphan",
    )


# ---------------------------------------------------------------------------
# Menu Items
# ---------------------------------------------------------------------------

class MenuItem(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Represents an individual dish in the caterer's menu."""

    __tablename__ = "menu_items"
    __table_args__ = (
        UniqueConstraint("caterer_id", "slug", name="uq_menu_items_caterer_slug"),
    )

    caterer_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("caterers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    category_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("menu_categories.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    slug: Mapped[str] = mapped_column(String(220), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    dietary_type: Mapped[Optional[str]] = mapped_column(
        String(40), nullable=True  # VEG, NON_VEG, VEGAN, EGG
    )
    image_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    extra_metadata: Mapped[Optional[dict]] = mapped_column(
        "extra_metadata", JSON, nullable=True
    )

    # Relationships
    category: Mapped["MenuCategory"] = relationship(
        "MenuCategory", back_populates="menu_items"
    )
    menu_item_functions: Mapped[list["MenuItemFunction"]] = relationship(
        "MenuItemFunction",
        back_populates="menu_item",
        cascade="all, delete-orphan",
    )
    menu_item_offerings: Mapped[list["MenuItemOffering"]] = relationship(
        "MenuItemOffering",
        back_populates="menu_item",
        cascade="all, delete-orphan",
    )
    package_items: Mapped[list["PackageItem"]] = relationship(
        "PackageItem",
        back_populates="menu_item",
        cascade="all, delete-orphan",
    )
    package_selection_group_items: Mapped[list["PackageSelectionGroupItem"]] = relationship(
        "PackageSelectionGroupItem",
        back_populates="menu_item",
        cascade="all, delete-orphan",
    )
    package_addons: Mapped[list["PackageAddon"]] = relationship(
        "PackageAddon",
        back_populates="menu_item",
        cascade="all, delete-orphan",
    )


# ---------------------------------------------------------------------------
# Menu Item Eligibility
# ---------------------------------------------------------------------------

class MenuItemFunction(Base):
    """Associates a menu item with function types it applies to."""

    __tablename__ = "menu_item_functions"
    __table_args__ = (
        UniqueConstraint("menu_item_id", "function_type_id", name="uq_menu_item_functions"),
    )

    menu_item_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("menu_items.id", ondelete="CASCADE"),
        primary_key=True,
        nullable=False,
    )
    function_type_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("function_types.id", ondelete="CASCADE"),
        primary_key=True,
        nullable=False,
    )

    # Relationships
    menu_item: Mapped["MenuItem"] = relationship(
        "MenuItem", back_populates="menu_item_functions"
    )
    function_type: Mapped["FunctionType"] = relationship(
        "FunctionType", back_populates="menu_item_functions"
    )


class MenuItemOffering(Base):
    """Associates a menu item with catering offerings it applies to."""

    __tablename__ = "menu_item_offerings"
    __table_args__ = (
        UniqueConstraint("menu_item_id", "offering_id", name="uq_menu_item_offerings"),
    )

    menu_item_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("menu_items.id", ondelete="CASCADE"),
        primary_key=True,
        nullable=False,
    )
    offering_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("catering_offerings.id", ondelete="CASCADE"),
        primary_key=True,
        nullable=False,
    )

    # Relationships
    menu_item: Mapped["MenuItem"] = relationship(
        "MenuItem", back_populates="menu_item_offerings"
    )
    offering: Mapped["CateringOffering"] = relationship(
        "CateringOffering", back_populates="menu_item_offerings"
    )


# ---------------------------------------------------------------------------
# Packages
# ---------------------------------------------------------------------------

class Package(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """A curated catering package with optional guest limits."""

    __tablename__ = "packages"
    __table_args__ = (
        UniqueConstraint("caterer_id", "slug", name="uq_packages_caterer_slug"),
        CheckConstraint(
            "(min_guests IS NULL OR min_guests > 0) AND "
            "(max_guests IS NULL OR (min_guests IS NULL OR max_guests >= min_guests))",
            name="ck_packages_guest_limits",
        ),
    )

    caterer_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("caterers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    slug: Mapped[str] = mapped_column(String(220), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    image_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    min_guests: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    max_guests: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Relationships
    package_functions: Mapped[list["PackageFunction"]] = relationship(
        "PackageFunction",
        back_populates="package",
        cascade="all, delete-orphan",
    )
    package_offerings: Mapped[list["PackageOffering"]] = relationship(
        "PackageOffering",
        back_populates="package",
        cascade="all, delete-orphan",
    )
    package_items: Mapped[list["PackageItem"]] = relationship(
        "PackageItem",
        back_populates="package",
        cascade="all, delete-orphan",
        order_by="PackageItem.sort_order",
    )
    selection_groups: Mapped[list["PackageSelectionGroup"]] = relationship(
        "PackageSelectionGroup",
        back_populates="package",
        cascade="all, delete-orphan",
        order_by="PackageSelectionGroup.sort_order",
    )
    addons: Mapped[list["PackageAddon"]] = relationship(
        "PackageAddon",
        back_populates="package",
        cascade="all, delete-orphan",
        order_by="PackageAddon.sort_order",
    )


# ---------------------------------------------------------------------------
# Package Applicability
# ---------------------------------------------------------------------------

class PackageFunction(Base):
    """Associates a package with function types it supports."""

    __tablename__ = "package_functions"

    package_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("packages.id", ondelete="CASCADE"),
        primary_key=True,
        nullable=False,
    )
    function_type_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("function_types.id", ondelete="CASCADE"),
        primary_key=True,
        nullable=False,
    )

    # Relationships
    package: Mapped["Package"] = relationship("Package", back_populates="package_functions")
    function_type: Mapped["FunctionType"] = relationship(
        "FunctionType", back_populates="package_functions"
    )


class PackageOffering(Base):
    """Associates a package with catering offerings it supports."""

    __tablename__ = "package_offerings"

    package_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("packages.id", ondelete="CASCADE"),
        primary_key=True,
        nullable=False,
    )
    offering_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("catering_offerings.id", ondelete="CASCADE"),
        primary_key=True,
        nullable=False,
    )

    # Relationships
    package: Mapped["Package"] = relationship("Package", back_populates="package_offerings")
    offering: Mapped["CateringOffering"] = relationship(
        "CateringOffering", back_populates="package_offerings"
    )


# ---------------------------------------------------------------------------
# Package Items
# ---------------------------------------------------------------------------

class PackageItem(Base, UUIDPrimaryKeyMixin):
    """Mandatory or included menu items in a package."""

    __tablename__ = "package_items"
    __table_args__ = (
        UniqueConstraint("package_id", "menu_item_id", name="uq_package_items"),
    )

    package_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("packages.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    menu_item_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("menu_items.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    inclusion_type: Mapped[str] = mapped_column(
        String(30), default="INCLUDED", nullable=False
        # MANDATORY | INCLUDED
    )
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    package: Mapped["Package"] = relationship("Package", back_populates="package_items")
    menu_item: Mapped["MenuItem"] = relationship("MenuItem", back_populates="package_items")


# ---------------------------------------------------------------------------
# Package Selection Groups
# ---------------------------------------------------------------------------

class PackageSelectionGroup(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Defines a 'choose N of M' selection rule within a package."""

    __tablename__ = "package_selection_groups"
    __table_args__ = (
        CheckConstraint(
            "min_selections >= 0 AND max_selections >= min_selections",
            name="ck_selection_groups_range",
        ),
    )

    package_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("packages.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    min_selections: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    max_selections: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_required: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    package: Mapped["Package"] = relationship("Package", back_populates="selection_groups")
    items: Mapped[list["PackageSelectionGroupItem"]] = relationship(
        "PackageSelectionGroupItem",
        back_populates="selection_group",
        cascade="all, delete-orphan",
    )


class PackageSelectionGroupItem(Base, UUIDPrimaryKeyMixin):
    """An item available in a selection group."""

    __tablename__ = "package_selection_group_items"
    __table_args__ = (
        UniqueConstraint("selection_group_id", "menu_item_id", name="uq_selection_group_items"),
    )

    selection_group_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("package_selection_groups.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    menu_item_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("menu_items.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    selection_group: Mapped["PackageSelectionGroup"] = relationship(
        "PackageSelectionGroup", back_populates="items"
    )
    menu_item: Mapped["MenuItem"] = relationship(
        "MenuItem", back_populates="package_selection_group_items"
    )


# ---------------------------------------------------------------------------
# Package Addons
# ---------------------------------------------------------------------------

class PackageAddon(Base, UUIDPrimaryKeyMixin):
    """Optional paid additions exposed by a package."""

    __tablename__ = "package_addons"

    package_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("packages.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    menu_item_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("menu_items.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    display_name: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    package: Mapped["Package"] = relationship("Package", back_populates="addons")
    menu_item: Mapped["MenuItem"] = relationship("MenuItem", back_populates="package_addons")
