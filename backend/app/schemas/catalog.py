"""
CaterConnect Backend — Catalog Pydantic Schemas
Request/response models for all catalog resources (Phase 3).
"""
from datetime import datetime
from typing import List, Optional

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
    description: Optional[str] = None
    image_url: Optional[str] = None
    is_active: bool = True
    sort_order: int = 0


class FunctionTypeUpdate(BaseModel):
    """Partial update payload for function types."""
    name: Optional[str] = Field(None, min_length=1, max_length=120)
    description: Optional[str] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None


class FunctionTypeOut(CatalogBase):
    id: str
    caterer_id: str
    name: str
    slug: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    is_active: bool
    sort_order: int
    created_at: datetime
    updated_at: datetime


# ---------------------------------------------------------------------------
# Catering Offerings
# ---------------------------------------------------------------------------

class CateringOfferingIn(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    description: Optional[str] = None
    image_url: Optional[str] = None
    is_active: bool = True
    sort_order: int = 0


class CateringOfferingUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=150)
    description: Optional[str] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None


class CateringOfferingOut(CatalogBase):
    id: str
    caterer_id: str
    name: str
    slug: str
    description: Optional[str] = None
    image_url: Optional[str] = None
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
    description: Optional[str] = None
    sort_order: int = 0
    is_active: bool = True


class MenuCategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=120)
    description: Optional[str] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None


class MenuCategoryOut(CatalogBase):
    id: str
    caterer_id: str
    name: str
    slug: str
    description: Optional[str] = None
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
    description: Optional[str] = None
    dietary_type: Optional[str] = Field(None, description="VEG, NON_VEG, VEGAN, EGG")
    image_url: Optional[str] = None
    is_active: bool = True
    sort_order: int = 0
    extra_metadata: Optional[dict] = None


class MenuItemUpdate(BaseModel):
    category_id: Optional[str] = None
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    dietary_type: Optional[str] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None
    extra_metadata: Optional[dict] = None


class MenuItemOut(CatalogBase):
    id: str
    caterer_id: str
    category_id: str
    name: str
    slug: str
    description: Optional[str] = None
    dietary_type: Optional[str] = None
    image_url: Optional[str] = None
    is_active: bool
    sort_order: int
    extra_metadata: Optional[dict] = None
    created_at: datetime
    updated_at: datetime


# ---------------------------------------------------------------------------
# Packages
# ---------------------------------------------------------------------------

class PackageIn(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    image_url: Optional[str] = None
    min_guests: Optional[int] = Field(None, gt=0)
    max_guests: Optional[int] = Field(None, gt=0)
    is_active: bool = True
    sort_order: int = 0

    @model_validator(mode="after")
    def validate_guest_limits(self) -> "PackageIn":
        if self.min_guests and self.max_guests:
            if self.max_guests < self.min_guests:
                raise ValueError("max_guests must be >= min_guests")
        return self


class PackageUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    image_url: Optional[str] = None
    min_guests: Optional[int] = Field(None, gt=0)
    max_guests: Optional[int] = Field(None, gt=0)
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None

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
    description: Optional[str] = None
    image_url: Optional[str] = None
    min_guests: Optional[int] = None
    max_guests: Optional[int] = None
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
    description: Optional[str] = None
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
    name: Optional[str] = Field(None, min_length=1, max_length=150)
    description: Optional[str] = None
    min_selections: Optional[int] = Field(None, ge=0)
    max_selections: Optional[int] = Field(None, ge=1)
    sort_order: Optional[int] = None
    is_required: Optional[bool] = None


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
    description: Optional[str] = None
    min_selections: int
    max_selections: int
    sort_order: int
    is_required: bool
    created_at: datetime
    updated_at: datetime
    items: List[PackageSelectionGroupItemOut] = []


# ---------------------------------------------------------------------------
# Package Addons
# ---------------------------------------------------------------------------

class PackageAddonIn(BaseModel):
    menu_item_id: str
    display_name: Optional[str] = Field(None, max_length=200)
    is_active: bool = True
    sort_order: int = 0


class PackageAddonOut(CatalogBase):
    id: str
    package_id: str
    menu_item_id: str
    display_name: Optional[str] = None
    is_active: bool
    sort_order: int
    created_at: datetime


# ---------------------------------------------------------------------------
# Package Full Detail (nested)
# ---------------------------------------------------------------------------

class PackageDetailOut(PackageOut):
    package_items: List[PackageItemOut] = []
    selection_groups: List[PackageSelectionGroupOut] = []
    addons: List[PackageAddonOut] = []
