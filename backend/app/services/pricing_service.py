"""
CaterConnect Backend — Pricing & Estimate Service
Coordinates calculation, persistence, freshness checking, and budget optimization workflows.
"""

from __future__ import annotations

import uuid
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy import delete, desc, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.logging import get_logger
from app.models.event import Event, EventMenuItem, EventVersion
from app.models.pricing import (
    Estimate,
    MenuItemPricingRule,
    PackagePricingRule,
    PricingRule,
)
from app.pricing.engine import PricingEngine
from app.pricing.recommendation import RecommendationEngine
from app.schemas.pricing import (
    BudgetOptimizationResponse,
    BudgetRecommendationItem,
    EstimateData,
    PricingRuleCreate,
    PricingRuleUpdate,
)

logger = get_logger(__name__)


class PricingService:
    def __init__(self, db: AsyncSession):
        self.db = db

    # ---------------------------------------------------------------------------
    # Pricing Rules Querying
    # ---------------------------------------------------------------------------

    async def get_active_rules_for_caterer(self, caterer_id: str) -> list[PricingRule]:
        """Fetch all active pricing rules for a caterer with their package/item mappings."""
        stmt = (
            select(PricingRule)
            .where(PricingRule.caterer_id == caterer_id, PricingRule.is_active == True)  # noqa: E712
            .options(
                selectinload(PricingRule.package_rules),
                selectinload(PricingRule.menu_item_rules),
            )
            .order_by(PricingRule.priority.asc())
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    # ---------------------------------------------------------------------------
    # Estimate Generation & Retrieval
    # ---------------------------------------------------------------------------

    async def calculate_and_save_estimate(
        self,
        event_id: str,
        user_id: str | None = None,
        expected_version: int | None = None,
    ) -> EstimateData:
        """
        Calculate and persist an authoritative estimate for event's current configuration version.
        """
        # Load event with full relations
        stmt = (
            select(Event)
            .where(Event.id == event_id)
            .options(
                selectinload(Event.package),
                selectinload(Event.menu_items).selectinload(EventMenuItem.menu_item),
            )
        )
        result = await self.db.execute(stmt)
        event = result.scalar_one_or_none()
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"code": "EVENT_NOT_FOUND", "message": f"Event {event_id} not found"},
            )

        if expected_version is not None and event.configuration_version != expected_version:
            logger.warn(
                "version_mismatch_during_estimate_calc",
                event_id=event_id,
                expected=expected_version,
                current=event.configuration_version,
            )

        # Load active rules
        rules = await self.get_active_rules_for_caterer(event.caterer_id)

        # Run deterministic engine
        calc_result = PricingEngine.calculate(
            event=event,
            package=event.package,
            event_menu_items=event.menu_items,
            pricing_rules=rules,
        )

        # Persist estimate record
        estimate = Estimate(
            id=str(uuid.uuid4()),
            event_id=event.id,
            event_version=event.configuration_version,
            pricing_version_id=calc_result.pricing_version_id,
            currency=calc_result.currency,
            lower_amount=calc_result.lower_amount,
            upper_amount=calc_result.upper_amount,
            budget_min=event.budget_min,
            budget_max=event.budget_max,
            budget_status=calc_result.budget.status.value,
            breakdown=[b.model_dump(mode="json") for b in calc_result.breakdown],
            disclaimer="Estimated price only. Final quotation is subject to caterer confirmation.",
        )
        self.db.add(estimate)
        await self.db.commit()
        await self.db.refresh(estimate)

        logger.info(
            "estimate_generated",
            event_id=event.id,
            event_version=event.configuration_version,
            lower=str(calc_result.lower_amount),
            upper=str(calc_result.upper_amount),
            budget_status=calc_result.budget.status.value,
        )

        return EstimateData(
            estimate_id=estimate.id,
            event_id=event.id,
            event_version=estimate.event_version,
            pricing_version_id=estimate.pricing_version_id,
            currency=estimate.currency,
            lower_amount=estimate.lower_amount,
            upper_amount=estimate.upper_amount,
            budget=calc_result.budget,
            breakdown=calc_result.breakdown,
            disclaimer=estimate.disclaimer,
            generated_at=estimate.generated_at,
            is_stale=False,
        )

    async def get_current_estimate(self, event_id: str) -> EstimateData | None:
        """
        Fetch most recent estimate for event and evaluate freshness against configuration_version.
        """
        stmt = (
            select(Event)
            .where(Event.id == event_id)
            .options(
                selectinload(Event.package),
                selectinload(Event.menu_items).selectinload(EventMenuItem.menu_item),
            )
        )
        result = await self.db.execute(stmt)
        event = result.scalar_one_or_none()
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"code": "EVENT_NOT_FOUND", "message": f"Event {event_id} not found"},
            )

        # Get latest estimate record
        est_stmt = (
            select(Estimate)
            .where(Estimate.event_id == event_id)
            .order_by(desc(Estimate.generated_at))
            .limit(1)
        )
        est_result = await self.db.execute(est_stmt)
        estimate = est_result.scalar_one_or_none()

        if not estimate:
            # Auto-calculate if none exists yet
            return await self.calculate_and_save_estimate(event_id)

        is_stale = estimate.event_version != event.configuration_version

        # Parse breakdown
        from app.schemas.pricing import EstimateBreakdownItem

        breakdown_items = [EstimateBreakdownItem(**item) for item in estimate.breakdown]
        budget_summary = PricingEngine.evaluate_budget(
            lower_amount=estimate.lower_amount,
            upper_amount=estimate.upper_amount,
            budget_min=event.budget_min,
            budget_max=event.budget_max,
        )

        return EstimateData(
            estimate_id=estimate.id,
            event_id=event.id,
            event_version=estimate.event_version,
            pricing_version_id=estimate.pricing_version_id,
            currency=estimate.currency,
            lower_amount=estimate.lower_amount,
            upper_amount=estimate.upper_amount,
            budget=budget_summary,
            breakdown=breakdown_items,
            disclaimer=estimate.disclaimer,
            generated_at=estimate.generated_at,
            is_stale=is_stale,
        )

    # ---------------------------------------------------------------------------
    # Budget Recommendation Engine
    # ---------------------------------------------------------------------------

    async def get_budget_optimizations(
        self,
        event_id: str,
        target_budget: Decimal | None = None,
        max_suggestions: int = 3,
    ) -> BudgetOptimizationResponse:
        """
        Generate budget-reduction recommendations for an event exceeding target budget.
        """
        stmt = (
            select(Event)
            .where(Event.id == event_id)
            .options(
                selectinload(Event.package),
                selectinload(Event.menu_items).selectinload(EventMenuItem.menu_item),
            )
        )
        result = await self.db.execute(stmt)
        event = result.scalar_one_or_none()
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"code": "EVENT_NOT_FOUND", "message": f"Event {event_id} not found"},
            )

        rules = await self.get_active_rules_for_caterer(event.caterer_id)
        current_calc = PricingEngine.calculate(
            event=event,
            package=event.package,
            event_menu_items=event.menu_items,
            pricing_rules=rules,
        )

        effective_target = target_budget or event.budget_max or event.budget_min
        recommendations = RecommendationEngine.generate_recommendations(
            event=event,
            package=event.package,
            event_menu_items=event.menu_items,
            pricing_rules=rules,
            current_estimate=current_calc,
            target_budget=effective_target,
            max_suggestions=max_suggestions,
        )

        return BudgetOptimizationResponse(
            data={
                "base_configuration_version": event.configuration_version,
                "target_budget": effective_target,
                "current_lower": current_calc.lower_amount,
                "current_upper": current_calc.upper_amount,
                "recommendations": [r.model_dump(mode="json") for r in recommendations],
            }
        )

    async def apply_budget_recommendation(
        self,
        event_id: str,
        recommendation_id: str,
        base_version: int,
        user_id: str | None = None,
    ) -> EstimateData:
        """
        Apply a budget recommendation to an event atomically with optimistic version locking.
        """
        stmt = (
            select(Event)
            .where(Event.id == event_id)
            .options(
                selectinload(Event.package),
                selectinload(Event.menu_items).selectinload(EventMenuItem.menu_item),
            )
        )
        result = await self.db.execute(stmt)
        event = result.scalar_one_or_none()
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"code": "EVENT_NOT_FOUND", "message": f"Event {event_id} not found"},
            )

        # Concurrency version check
        if event.configuration_version != base_version:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={
                    "code": "EVENT_VERSION_MISMATCH",
                    "message": (
                        f"Event configuration was modified (current version "
                        f"{event.configuration_version}, expected {base_version}). Please refresh."
                    ),
                },
            )

        rules = await self.get_active_rules_for_caterer(event.caterer_id)
        current_calc = PricingEngine.calculate(
            event=event,
            package=event.package,
            event_menu_items=event.menu_items,
            pricing_rules=rules,
        )

        recommendations = RecommendationEngine.generate_recommendations(
            event=event,
            package=event.package,
            event_menu_items=event.menu_items,
            pricing_rules=rules,
            current_estimate=current_calc,
            target_budget=event.budget_max or event.budget_min,
            max_suggestions=5,
        )

        # Match recommendation by id or fallback to first available if simulated
        target_rec: BudgetRecommendationItem | None = None
        for r in recommendations:
            if r.id == recommendation_id:
                target_rec = r
                break
        if not target_rec and recommendations:
            target_rec = recommendations[0]

        if not target_rec:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "code": "RECOMMENDATION_NOT_FOUND",
                    "message": "Recommendation is no longer applicable or expired.",
                },
            )

        # Execute operations defined in recommendation
        applied_notes = []
        for change in target_rec.changes:
            if change.operation == "REMOVE" and change.menu_item_id:
                # Remove matching event menu items
                del_stmt = delete(EventMenuItem).where(
                    EventMenuItem.event_id == event.id,
                    EventMenuItem.menu_item_id == change.menu_item_id,
                )
                await self.db.execute(del_stmt)
                applied_notes.append(f"Removed {change.menu_item_name or change.menu_item_id}")

        # Increment configuration version
        event.configuration_version += 1

        # Create historical snapshot in event_versions
        snapshot_data = {
            "guest_count": event.guest_count,
            "package_id": event.package_id,
            "budget_min": float(event.budget_min) if event.budget_min else None,
            "budget_max": float(event.budget_max) if event.budget_max else None,
            "applied_recommendation": target_rec.title,
        }
        event_version_record = EventVersion(
            id=str(uuid.uuid4()),
            event_id=event.id,
            version_number=event.configuration_version,
            snapshot=snapshot_data,
            changed_by_user_id=user_id,
            change_reason=f"Applied budget recommendation: {target_rec.title}",
        )
        self.db.add(event_version_record)
        await self.db.commit()

        # Recalculate fresh estimate
        return await self.calculate_and_save_estimate(event.id, user_id=user_id)

    # ---------------------------------------------------------------------------
    # Admin Pricing Rules Management
    # ---------------------------------------------------------------------------

    async def create_pricing_rule(self, caterer_id: str, payload: PricingRuleCreate) -> PricingRule:
        rule_id = str(uuid.uuid4())
        rule = PricingRule(
            id=rule_id,
            caterer_id=caterer_id,
            pricing_version_id=payload.pricing_version_id,
            name=payload.name,
            rule_type=payload.rule_type.value,
            scope_type=payload.scope_type.value,
            amount=payload.amount,
            percentage=payload.percentage,
            currency=payload.currency,
            configuration=payload.configuration,
            priority=payload.priority,
            effective_from=payload.effective_from,
            effective_to=payload.effective_to,
            is_active=payload.is_active,
        )
        self.db.add(rule)

        # Scoping links
        if payload.package_ids:
            for pkg_id in payload.package_ids:
                self.db.add(PackagePricingRule(package_id=pkg_id, pricing_rule_id=rule_id))

        if payload.menu_item_ids:
            for item_id in payload.menu_item_ids:
                self.db.add(MenuItemPricingRule(menu_item_id=item_id, pricing_rule_id=rule_id))

        await self.db.commit()
        await self.db.refresh(rule)
        return rule

    async def list_pricing_rules(
        self, caterer_id: str, rule_type: str | None = None, is_active: bool | None = None
    ) -> list[PricingRule]:
        stmt = select(PricingRule).where(PricingRule.caterer_id == caterer_id)
        if rule_type:
            stmt = stmt.where(PricingRule.rule_type == rule_type)
        if is_active is not None:
            stmt = stmt.where(PricingRule.is_active == is_active)
        stmt = stmt.order_by(PricingRule.priority.asc())
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def update_pricing_rule(
        self, rule_id: str, caterer_id: str, payload: PricingRuleUpdate
    ) -> PricingRule:
        stmt = select(PricingRule).where(
            PricingRule.id == rule_id, PricingRule.caterer_id == caterer_id
        )
        result = await self.db.execute(stmt)
        rule = result.scalar_one_or_none()
        if not rule:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"code": "RULE_NOT_FOUND", "message": f"Pricing rule {rule_id} not found"},
            )

        for field, value in payload.model_dump(exclude_unset=True).items():
            if field in ("package_ids", "menu_item_ids"):
                continue
            if hasattr(rule, field):
                if hasattr(value, "value"):
                    setattr(rule, field, value.value)
                else:
                    setattr(rule, field, value)

        await self.db.commit()
        await self.db.refresh(rule)
        return rule
