"""
CaterConnect Backend — Admin Pricing Rules API Router
Endpoints for caterers to configure and manage pricing rules, versions, and overrides.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, Path, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user, require_role
from app.core.database import get_db
from app.models.user import User
from app.schemas.common import StandardResponse
from app.schemas.pricing import (
    PricingRuleCreate,
    PricingRuleResponse,
    PricingRuleUpdate,
)
from app.services.catalog_service import resolve_caterer_id
from app.services.pricing_service import PricingService

router = APIRouter(dependencies=[Depends(require_role("ADMIN", "STAFF", "CATERER_ADMIN"))])


async def _caterer_id(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> str:
    return await resolve_caterer_id(db, current_user)


@router.get(
    "/pricing-rules",
    response_model=StandardResponse[list[PricingRuleResponse]],
    summary="List caterer pricing rules",
)
async def list_pricing_rules(
    rule_type: str | None = Query(None, description="Filter by rule type"),
    is_active: bool | None = Query(None, description="Filter by active status"),
    db: AsyncSession = Depends(get_db),
    caterer_id: str = Depends(_caterer_id),
):
    """
    List all pricing rules configured for the authenticated caterer.
    """
    svc = PricingService(db)
    rules = await svc.list_pricing_rules(
        caterer_id=caterer_id, rule_type=rule_type, is_active=is_active
    )
    return StandardResponse(
        data=[PricingRuleResponse.model_validate(r) for r in rules],
        message="Pricing rules retrieved",
    )


@router.post(
    "/pricing-rules",
    response_model=StandardResponse[PricingRuleResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create pricing rule",
)
async def create_pricing_rule(
    payload: PricingRuleCreate,
    db: AsyncSession = Depends(get_db),
    caterer_id: str = Depends(_caterer_id),
):
    """
    Create a new pricing rule for the caterer.
    """
    svc = PricingService(db)
    rule = await svc.create_pricing_rule(caterer_id=caterer_id, payload=payload)
    return StandardResponse(
        data=PricingRuleResponse.model_validate(rule),
        message="Pricing rule created successfully",
    )


@router.patch(
    "/pricing-rules/{rule_id}",
    response_model=StandardResponse[PricingRuleResponse],
    summary="Update pricing rule",
)
async def update_pricing_rule(
    rule_id: str = Path(...),
    payload: PricingRuleUpdate = None,  # type: ignore[assignment]
    db: AsyncSession = Depends(get_db),
    caterer_id: str = Depends(_caterer_id),
):
    """
    Update parameters or active status of an existing pricing rule.
    """
    svc = PricingService(db)
    rule = await svc.update_pricing_rule(rule_id=rule_id, caterer_id=caterer_id, payload=payload)
    return StandardResponse(
        data=PricingRuleResponse.model_validate(rule),
        message="Pricing rule updated successfully",
    )
