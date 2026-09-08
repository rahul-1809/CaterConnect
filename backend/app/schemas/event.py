"""
CaterConnect Backend — Event Pydantic Schemas
Request/response models for Event Planner & Menu Builder (Phase 5).
"""

from __future__ import annotations

from datetime import date, datetime, time
from decimal import Decimal
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, model_validator


class EventSchemaBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Budget models
# ---------------------------------------------------------------------------


class BudgetInfo(BaseModel):
    min: float | None = None
    max: float | None = None
    currency: str = "INR"


class VenueInfo(BaseModel):
    name: str | None = None
    address: str | None = None
    notes: str | None = None


# ---------------------------------------------------------------------------
# Event Menu Items
# ---------------------------------------------------------------------------


class EventMenuItemIn(BaseModel):
    menu_item_id: str
    source_type: str = Field(default="PACKAGE", pattern="^(PACKAGE|CUSTOM|ADDON|AI)$")
    selection_group_id: str | None = None
    quantity: float = 1.0
    is_included: bool = True
    metadata_json: dict[str, Any] | None = None


class EventMenuItemAddIn(BaseModel):
    menu_item_id: str
    source_type: str = Field(default="CUSTOM", pattern="^(PACKAGE|CUSTOM|ADDON|AI)$")
    selection_group_id: str | None = None
    quantity: float = 1.0
    is_included: bool = True
    base_version: int


class EventMenuItemOut(EventSchemaBase):
    id: str
    event_id: str
    menu_item_id: str
    source_type: str
    selection_group_id: str | None = None
    quantity: float | None = 1.0
    is_included: bool
    metadata_json: dict[str, Any] | None = None
    created_at: datetime
    # Enriched item details if joined
    name: str | None = None
    category_id: str | None = None
    category_name: str | None = None
    dietary_type: str | None = None
    price: Decimal | None = None
    image_url: str | None = None


# ---------------------------------------------------------------------------
# Event Creation & Update
# ---------------------------------------------------------------------------


class EventCreateIn(BaseModel):
    function_type_id: str | None = None
    offering_id: str | None = None
    package_id: str | None = None
    guest_count: int | None = Field(None, ge=1, le=100000)
    budget_min: Decimal | None = Field(None, ge=0)
    budget_max: Decimal | None = Field(None, ge=0)
    event_date: date | None = None
    event_time: time | None = None
    timezone: str = "Asia/Kolkata"
    venue_name: str | None = Field(None, max_length=250)
    venue_address: str | None = None
    venue_notes: str | None = None
    customer_notes: str | None = None

    @model_validator(mode="after")
    def check_budget_range(self) -> EventCreateIn:
        if self.budget_min is not None and self.budget_max is not None:
            if self.budget_min > self.budget_max:
                raise ValueError("budget_min cannot exceed budget_max")
        return self


class EventUpdateIn(BaseModel):
    base_version: int | None = None
    function_type_id: str | None = None
    offering_id: str | None = None
    package_id: str | None = None
    guest_count: int | None = Field(None, ge=1, le=100000)
    budget_min: Decimal | None = Field(None, ge=0)
    budget_max: Decimal | None = Field(None, ge=0)
    event_date: date | None = None
    event_time: time | None = None
    timezone: str | None = None
    venue_name: str | None = Field(None, max_length=250)
    venue_address: str | None = None
    venue_notes: str | None = None
    customer_notes: str | None = None
    status: str | None = Field(None, pattern="^(DRAFT|SUBMITTED|CANCELLED|COMPLETED)$")

    @model_validator(mode="after")
    def check_budget_range(self) -> EventUpdateIn:
        if self.budget_min is not None and self.budget_max is not None:
            if self.budget_min > self.budget_max:
                raise ValueError("budget_min cannot exceed budget_max")
        return self


# ---------------------------------------------------------------------------
# Event Configuration
# ---------------------------------------------------------------------------


class EventConfigurationUpdateIn(BaseModel):
    base_version: int
    package_id: str | None = None
    menu_items: list[EventMenuItemIn] = Field(default_factory=list)


class EventConfigurationOut(BaseModel):
    event_id: str
    version: int
    package_id: str | None = None
    guest_count: int | None = None
    budget: BudgetInfo | None = None
    menu_items: list[EventMenuItemOut] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Event Read Outputs
# ---------------------------------------------------------------------------


class EventOut(EventSchemaBase):
    id: str
    customer_id: str
    caterer_id: str
    status: str
    configuration_version: int
    function_type_id: str | None = None
    offering_id: str | None = None
    package_id: str | None = None
    guest_count: int | None = None
    budget: BudgetInfo
    event_date: date | None = None
    event_time: time | None = None
    timezone: str
    venue: VenueInfo
    customer_notes: str | None = None
    function: dict[str, Any] | None = None
    offering: dict[str, Any] | None = None
    package: dict[str, Any] | None = None
    menu_items: list[EventMenuItemOut] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime


class EventSummaryOut(EventSchemaBase):
    id: str
    status: str
    configuration_version: int
    guest_count: int | None = None
    budget_min: Decimal | None = None
    budget_max: Decimal | None = None
    event_date: date | None = None
    event_time: time | None = None
    venue_name: str | None = None
    function_name: str | None = None
    offering_name: str | None = None
    package_name: str | None = None
    items_count: int = 0
    created_at: datetime
    updated_at: datetime


class EventListOut(BaseModel):
    items: list[EventSummaryOut]
    total: int
    page: int
    page_size: int
    total_pages: int


# ---------------------------------------------------------------------------
# Version History Schemas
# ---------------------------------------------------------------------------


class EventVersionOut(EventSchemaBase):
    id: str
    event_id: str
    version_number: int
    snapshot: dict[str, Any]
    changed_by_user_id: str | None = None
    change_reason: str | None = None
    created_at: datetime


class EventVersionListOut(BaseModel):
    event_id: str
    current_version: int
    versions: list[EventVersionOut]
