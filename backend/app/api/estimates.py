"""
CaterConnect Backend — Customer Estimate API Router
Endpoints for Pricing & Estimate Engine and Budget Recommendations (Phase 6 & Phase 7).
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, Path
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.common import StandardResponse
from app.schemas.pricing import (
    ApplyRecommendationRequest,
    BudgetOptimizationRequest,
    BudgetOptimizationResponse,
    CalculateEstimateRequest,
    EstimateData,
    EstimateResponse,
)
from app.services.pricing_service import PricingService

router = APIRouter()


@router.post(
    "/{event_id}/estimate",
    response_model=StandardResponse[EstimateData],
    summary="Calculate authoritative estimate for event",
)
async def calculate_estimate(
    event_id: str = Path(..., description="Target event ID"),
    payload: CalculateEstimateRequest | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Calculate and persist an authoritative estimate range for an event's current configuration.
    Validates business rules, per-person rates, add-on costs, service charges, and taxes.
    """
    svc = PricingService(db)
    exp_version = payload.configuration_version if payload else None
    estimate = await svc.calculate_and_save_estimate(
        event_id=event_id,
        user_id=current_user.id,
        expected_version=exp_version,
    )
    return StandardResponse(data=estimate, message="Estimate calculated successfully")


@router.get(
    "/{event_id}/estimate",
    response_model=EstimateResponse,
    summary="Get current estimate and freshness state",
)
async def get_current_estimate(
    event_id: str = Path(..., description="Target event ID"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieve current estimate for the event. If configuration changed since calculation,
    is_stale will be returned as true.
    """
    svc = PricingService(db)
    estimate = await svc.get_current_estimate(event_id=event_id)
    return EstimateResponse(
        data=estimate,
        meta={
            "status": "STALE" if (estimate and estimate.is_stale) else "CURRENT",
            "event_id": event_id,
        },
    )


@router.post(
    "/{event_id}/optimize-budget",
    response_model=BudgetOptimizationResponse,
    summary="Generate budget reduction suggestions",
)
async def optimize_budget(
    event_id: str = Path(..., description="Target event ID"),
    payload: BudgetOptimizationRequest | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Analyze event configuration against budget and propose ranked, non-destructive
    recommendations (e.g. removing optional add-ons) to bring estimate within budget.
    """
    svc = PricingService(db)
    target_budget = payload.target_budget if payload else None
    max_sugg = payload.max_suggestions if payload else 3
    return await svc.get_budget_optimizations(
        event_id=event_id,
        target_budget=target_budget,
        max_suggestions=max_sugg,
    )


@router.post(
    "/{event_id}/recommendations/{recommendation_id}/apply",
    response_model=StandardResponse[EstimateData],
    summary="Apply budget recommendation to event",
)
async def apply_recommendation(
    event_id: str = Path(..., description="Target event ID"),
    recommendation_id: str = Path(..., description="Recommendation proposal ID"),
    payload: ApplyRecommendationRequest = None,  # type: ignore[assignment]
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Atomically apply approved recommendation changes to event configuration with optimistic
    concurrency locking (base_version check). Creates an event_version history snapshot and
    recalculates a fresh estimate.
    """
    svc = PricingService(db)
    fresh_estimate = await svc.apply_budget_recommendation(
        event_id=event_id,
        recommendation_id=recommendation_id,
        base_version=payload.base_version,
        user_id=current_user.id,
    )
    return StandardResponse(
        data=fresh_estimate,
        message="Budget recommendation applied successfully. Estimate refreshed.",
    )
