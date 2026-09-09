"""
CaterConnect Backend — Pricing & Estimate Schemas
Defines request and response schemas for pricing rules, estimates, and budget recommendations.
"""

from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.models.pricing import BudgetStatus, PricingRuleType, PricingScopeType

# ---------------------------------------------------------------------------
# Pricing Rule Schemas
# ---------------------------------------------------------------------------


class PricingRuleBase(BaseModel):
    name: str = Field(..., max_length=200, description="Display name for the pricing rule")
    rule_type: PricingRuleType = Field(
        ..., description="Type of pricing: PER_PERSON, PACKAGE_BASE, ITEM_ADDON, etc."
    )
    scope_type: PricingScopeType = Field(
        default=PricingScopeType.CATERER,
        description="Target scope: CATERER, PACKAGE, MENU_ITEM, OFFERING, FUNCTION, EVENT",
    )
    amount: Decimal | None = Field(
        None, ge=0, description="Fixed amount or unit rate in currency units"
    )
    percentage: Decimal | None = Field(
        None, ge=0, le=100, description="Percentage rate (e.g. 5.0 for 5% tax or service charge)"
    )
    currency: str = Field(default="INR", max_length=3)
    configuration: dict[str, Any] | None = Field(
        default=None, description="Optional rule-specific parameter JSON"
    )
    priority: int = Field(default=0, description="Evaluation order priority")
    effective_from: datetime | None = None
    effective_to: datetime | None = None
    is_active: bool = True


class PricingRuleCreate(PricingRuleBase):
    caterer_id: str | None = None
    pricing_version_id: str | None = None
    package_ids: list[str] | None = None
    menu_item_ids: list[str] | None = None


class PricingRuleUpdate(BaseModel):
    name: str | None = Field(None, max_length=200)
    rule_type: PricingRuleType | None = None
    scope_type: PricingScopeType | None = None
    amount: Decimal | None = Field(None, ge=0)
    percentage: Decimal | None = Field(None, ge=0, le=100)
    currency: str | None = Field(None, max_length=3)
    configuration: dict[str, Any] | None = None
    priority: int | None = None
    effective_from: datetime | None = None
    effective_to: datetime | None = None
    is_active: bool | None = None
    package_ids: list[str] | None = None
    menu_item_ids: list[str] | None = None


class PricingRuleResponse(PricingRuleBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    caterer_id: str
    pricing_version_id: str | None = None
    created_at: datetime
    updated_at: datetime


class PricingVersionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    caterer_id: str
    version_number: int
    effective_from: datetime
    effective_to: datetime | None = None
    is_active: bool
    description: str | None = None
    created_at: datetime


# ---------------------------------------------------------------------------
# Estimate Breakdown & Response Schemas
# ---------------------------------------------------------------------------


class EstimateBreakdownItem(BaseModel):
    type: str = Field(..., description="PACKAGE, PER_PERSON, ADDON, SERVICE_CHARGE, TAX, FIXED")
    description: str = Field(..., description="Customer-safe line item description")
    amount: Decimal = Field(..., description="Subtotal amount for this component")
    rate: Decimal | None = Field(None, description="Unit rate if applicable (e.g. ₹550/guest)")
    quantity: Decimal | None = Field(None, description="Guest count or item quantity")


class BudgetSummary(BaseModel):
    min: Decimal | None = None
    max: Decimal | None = None
    status: BudgetStatus
    difference: Decimal | None = Field(
        None, description="Amount above or below budget (+ over, - under)"
    )
    difference_percentage: Decimal | None = Field(None, description="Percentage deviation")


class EstimateData(BaseModel):
    estimate_id: str
    event_id: str
    event_version: int
    pricing_version_id: str | None = None
    currency: str = "INR"
    lower_amount: Decimal
    upper_amount: Decimal
    budget: BudgetSummary
    breakdown: list[EstimateBreakdownItem]
    disclaimer: str = "Estimated price only. Final quotation is subject to caterer confirmation."
    generated_at: datetime
    is_stale: bool = False


class EstimateResponse(BaseModel):
    data: EstimateData | None
    meta: dict[str, Any] = Field(default_factory=dict)


class CalculateEstimateRequest(BaseModel):
    configuration_version: int | None = Field(
        None, description="Expected configuration version to protect against stale calculation"
    )


# ---------------------------------------------------------------------------
# Budget Recommendation Schemas
# ---------------------------------------------------------------------------


class RecommendationChange(BaseModel):
    operation: str = Field(..., description="REMOVE | SWAP | REDUCE_QUANTITY")
    menu_item_id: str | None = None
    menu_item_name: str | None = None
    replacement_item_id: str | None = None
    replacement_item_name: str | None = None
    estimated_savings: Decimal


class EstimatedRange(BaseModel):
    lower: Decimal
    upper: Decimal
    currency: str = "INR"


class BudgetRecommendationItem(BaseModel):
    id: str
    title: str
    explanation: str
    category: str = Field(
        default="MENU_CUSTOMIZATION", description="MENU_CUSTOMIZATION | PACKAGE | GUEST_TIER"
    )
    changes: list[RecommendationChange]
    estimated_savings: Decimal
    projected_range: EstimatedRange
    projected_budget_status: BudgetStatus


class BudgetOptimizationRequest(BaseModel):
    configuration_version: int | None = None
    target_budget: Decimal | None = Field(
        None, ge=0, description="Override target budget or defaults to event budget_max"
    )
    max_suggestions: int = Field(default=3, ge=1, le=10)


class BudgetOptimizationResponse(BaseModel):
    data: dict[str, Any]


class ApplyRecommendationRequest(BaseModel):
    base_version: int = Field(
        ..., description="Current event configuration_version required for optimistic locking"
    )
