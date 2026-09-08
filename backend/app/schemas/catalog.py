"""
CaterConnect Backend — Catalog Pydantic Schemas
Request/response models for all catalog resources (Phase 3).
"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, model_validator

# ---------------------------------------------------------------------------
# Shared helpers
# ---------------------------------------------------------------------------


class CatalogBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Function Types
# ---------------------------------------------------------------------------


class FunctionTypeIn(BaseModel):
    """Payload to create a new function type."""

    name: str = Field(..., min_length=1, max_length=120)
    description: str | None = None
    image_url: str | None = None
    is_active: bool = True
    sort_order: int = 0


class FunctionTypeUpdate(BaseModel):
    """Partial update payload for function types."""

    name: str | None = Field(None, min_length=1, max_length=120)
    description: str | None = None
    image_url: str | None = None
    is_active: bool | None = None
    sort_order: int | None = None


class FunctionTypeOut(CatalogBase):
    id: str
    caterer_id: str
    name: str
    slug: str
    description: str | None = None
    image_url: str | None = None
    is_active: bool
    sort_order: int
    created_at: datetime
    updated_at: datetime


# ---------------------------------------------------------------------------
# Catering Offerings
# ---------------------------------------------------------------------------


class CateringOfferingIn(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    description: str | None = None
    image_url: str | None = None
    is_active: bool = True
    sort_order: int = 0


class CateringOfferingUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=150)
    description: str | None = None
    image_url: str | None = None
    is_active: bool | None = None
    sort_order: int | None = None


class CateringOfferingOut(CatalogBase):
    id: str
    caterer_id: str
    name: str
    slug: str
    description: str | None = None
    image_url: str | None = None
    is_active: bool
    sort_order: int
    created_at: datetime
    updated_at: datetime


# ---------------------------------------------------------------------------
# Function ↔ Offering Link
# ---------------------------------------------------------------------------


class FunctionOfferingLinkIn(BaseModel):
    offering_id: str = Field(..., description="UUID of the catering offering to associate")


class FunctionOfferingOut(CatalogBase):
    id: str
    function_type_id: str
    offering_id: str
    created_at: datetime


# ---------------------------------------------------------------------------
# Menu Categories
# ---------------------------------------------------------------------------


class MenuCategoryIn(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    description: str | None = None
    sort_order: int = 0
    is_active: bool = True


class MenuCategoryUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=120)
    description: str | None = None
    sort_order: int | None = None
    is_active: bool | None = None


class MenuCategoryOut(CatalogBase):
    id: str
    caterer_id: str
    name: str
    slug: str
    description: str | None = None
    sort_order: int
    is_active: bool
    created_at: datetime
    updated_at: datetime


# ---------------------------------------------------------------------------
# Menu Items
# ---------------------------------------------------------------------------


class MenuItemIn(BaseModel):
    category_id: str = Field(..., description="UUID of the parent menu category")
    name: str = Field(..., min_length=1, max_length=200)
    description: str | None = None
    dietary_type: str | None = Field(None, description="VEG, NON_VEG, VEGAN, EGG")
    image_url: str | None = None
    is_active: bool = True
    sort_order: int = 0
    extra_metadata: dict | None = None


class MenuItemUpdate(BaseModel):
    category_id: str | None = None
    name: str | None = Field(None, min_length=1, max_length=200)
    description: str | None = None
    dietary_type: str | None = None
    image_url: str | None = None
    is_active: bool | None = None
    sort_order: int | None = None
    extra_metadata: dict | None = None


class MenuItemOut(CatalogBase):
    id: str
    caterer_id: str
    category_id: str
    name: str
    slug: str
    description: str | None = None
    dietary_type: str | None = None
    image_url: str | None = None
    is_active: bool
    sort_order: int
    extra_metadata: dict | None = None
    created_at: datetime
    updated_at: datetime


# ---------------------------------------------------------------------------
# Packages
# ---------------------------------------------------------------------------


class PackageIn(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: str | None = None
    image_url: str | None = None
    min_guests: int | None = Field(None, gt=0)
    max_guests: int | None = Field(None, gt=0)
    is_active: bool = True
    sort_order: int = 0

    @model_validator(mode="after")
    def validate_guest_limits(self) -> "PackageIn":
        if self.min_guests and self.max_guests:
            if self.max_guests < self.min_guests:
                raise ValueError("max_guests must be >= min_guests")
        return self


class PackageUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=200)
    description: str | None = None
    image_url: str | None = None
    min_guests: int | None = Field(None, gt=0)
    max_guests: int | None = Field(None, gt=0)
    is_active: bool | None = None
    sort_order: int | None = None

    @model_validator(mode="after")
    def validate_guest_limits(self) -> "PackageUpdate":
        if self.min_guests and self.max_guests:
            if self.max_guests < self.min_guests:
                raise ValueError("max_guests must be >= min_guests")
        return self


class PackageOut(CatalogBase):
    id: str
    caterer_id: str
    name: str
    slug: str
    description: str | None = None
    image_url: str | None = None
    min_guests: int | None = None
    max_guests: int | None = None
    is_active: bool
    sort_order: int
    created_at: datetime
    updated_at: datetime


# ---------------------------------------------------------------------------
# Package Items
# ---------------------------------------------------------------------------


class PackageItemIn(BaseModel):
    menu_item_id: str
    inclusion_type: str = Field("INCLUDED", description="MANDATORY or INCLUDED")
    sort_order: int = 0


class PackageItemOut(CatalogBase):
    id: str
    package_id: str
    menu_item_id: str
    inclusion_type: str
    sort_order: int
    created_at: datetime


# ---------------------------------------------------------------------------
# Package Selection Groups
# ---------------------------------------------------------------------------


class PackageSelectionGroupIn(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    description: str | None = None
    min_selections: int = Field(0, ge=0)
    max_selections: int = Field(1, ge=1)
    sort_order: int = 0
    is_required: bool = False

    @model_validator(mode="after")
    def validate_selections(self) -> "PackageSelectionGroupIn":
        if self.max_selections < self.min_selections:
            raise ValueError("max_selections must be >= min_selections")
        return self


class PackageSelectionGroupUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=150)
    description: str | None = None
    min_selections: int | None = Field(None, ge=0)
    max_selections: int | None = Field(None, ge=1)
    sort_order: int | None = None
    is_required: bool | None = None


class PackageSelectionGroupItemIn(BaseModel):
    menu_item_id: str


class PackageSelectionGroupItemOut(CatalogBase):
    id: str
    selection_group_id: str
    menu_item_id: str
    created_at: datetime


class PackageSelectionGroupOut(CatalogBase):
    id: str
    package_id: str
    name: str
    description: str | None = None
    min_selections: int
    max_selections: int
    sort_order: int
    is_required: bool
    created_at: datetime
    updated_at: datetime
    items: list[PackageSelectionGroupItemOut] = []


# ---------------------------------------------------------------------------
# Package Addons
# ---------------------------------------------------------------------------


class PackageAddonIn(BaseModel):
    menu_item_id: str
    display_name: str | None = Field(None, max_length=200)
    is_active: bool = True
    sort_order: int = 0


class PackageAddonOut(CatalogBase):
    id: str
    package_id: str
    menu_item_id: str
    display_name: str | None = None
    is_active: bool
    sort_order: int
    created_at: datetime


# ---------------------------------------------------------------------------
# Package Full Detail (nested)
# ---------------------------------------------------------------------------


class PackageDetailOut(PackageOut):
    package_items: list[PackageItemOut] = []
    selection_groups: list[PackageSelectionGroupOut] = []
    addons: list[PackageAddonOut] = []
