"""
CaterConnect Backend — Budget Recommendation Engine
Rule-based recommendation engine to optimize event configurations toward a customer's target budget.
"""

from __future__ import annotations

import uuid
from decimal import Decimal

from app.models.catalog import Package
from app.models.event import Event, EventItemSourceType, EventMenuItem
from app.models.pricing import BudgetStatus, PricingRule
from app.pricing.engine import PricingCalculationResult, PricingEngine
from app.schemas.pricing import (
    BudgetRecommendationItem,
    EstimatedRange,
    RecommendationChange,
)


class RecommendationEngine:
    """
    Generates structured, non-destructive suggestions to bring an event configuration within budget.
    """

    @classmethod
    def generate_recommendations(
        cls,
        event: Event,
        package: Package | None,
        event_menu_items: list[EventMenuItem],
        pricing_rules: list[PricingRule],
        current_estimate: PricingCalculationResult,
        target_budget: Decimal | None = None,
        max_suggestions: int = 3,
    ) -> list[BudgetRecommendationItem]:
        budget_target = target_budget or event.budget_max or event.budget_min
        if not budget_target or budget_target <= Decimal("0"):
            return []

        midpoint = (current_estimate.lower_amount + current_estimate.upper_amount) / Decimal("2")
        overrun = midpoint - budget_target
        if overrun <= Decimal("0"):
            return []

        recommendations: list[BudgetRecommendationItem] = []
        guest_count = Decimal(str(event.guest_count or 100))

        # 1. Inspect Custom & Optional Add-on Items for Removals
        custom_addons = [
            item
            for item in event_menu_items
            if item.source_type
            in (EventItemSourceType.CUSTOM.value, EventItemSourceType.ADDON.value)
            and item.is_included
            and item.menu_item is not None
        ]

        for item in sorted(
            custom_addons,
            key=lambda x: (
                Decimal(
                    str(
                        x.menu_item.extra_metadata.get("addon_price", 85)
                        if x.menu_item.extra_metadata
                        else 85
                    )
                )
                * (x.quantity or Decimal("1"))
            ),
            reverse=True,
        ):
            dish_name = item.menu_item.name if item.menu_item else "Add-on Item"
            item_price = Decimal("85.00")
            if item.menu_item and item.menu_item.extra_metadata:
                price_override = item.menu_item.extra_metadata.get("addon_price")
                if price_override:
                    try:
                        item_price = Decimal(str(price_override))
                    except Exception:
                        pass

            item_qty = item.quantity or Decimal("1.0")
            # includes tax/service delta
            est_savings = item_price * guest_count * item_qty * Decimal("1.10")

            simulated_items = [i for i in event_menu_items if i.id != item.id]
            sim_result = PricingEngine.calculate(
                event=event,
                package=package,
                event_menu_items=simulated_items,
                pricing_rules=pricing_rules,
            )

            sim_midpoint = (sim_result.lower_amount + sim_result.upper_amount) / Decimal("2")
            proj_status = (
                BudgetStatus.WITHIN_BUDGET
                if sim_midpoint <= budget_target
                else BudgetStatus.SLIGHTLY_ABOVE
            )

            rec_id = str(uuid.uuid4())
            recommendations.append(
                BudgetRecommendationItem(
                    id=rec_id,
                    title=f"Remove Optional Add-on: {dish_name}",
                    explanation=(
                        f"Removing '{dish_name}' preserves all package inclusions while reducing "
                        f"the overall estimate by approximately ₹{int(est_savings):,}."
                    ),
                    category="MENU_CUSTOMIZATION",
                    changes=[
                        RecommendationChange(
                            operation="REMOVE",
                            menu_item_id=item.menu_item_id,
                            menu_item_name=dish_name,
                            estimated_savings=est_savings,
                        )
                    ],
                    estimated_savings=est_savings,
                    projected_range=EstimatedRange(
                        lower=sim_result.lower_amount,
                        upper=sim_result.upper_amount,
                        currency="INR",
                    ),
                    projected_budget_status=proj_status,
                )
            )
            if len(recommendations) >= max_suggestions:
                break

        # 2. Combined removal if multiple addons exist and single removal was not enough
        if len(custom_addons) > 1 and len(recommendations) < max_suggestions:
            simulated_items = [
                i
                for i in event_menu_items
                if i.source_type
                not in (EventItemSourceType.CUSTOM.value, EventItemSourceType.ADDON.value)
            ]
            sim_result = PricingEngine.calculate(
                event=event,
                package=package,
                event_menu_items=simulated_items,
                pricing_rules=pricing_rules,
            )
            total_savings = current_estimate.lower_amount - sim_result.lower_amount
            if total_savings > Decimal("0"):
                rec_id = str(uuid.uuid4())
                changes = [
                    RecommendationChange(
                        operation="REMOVE",
                        menu_item_id=it.menu_item_id,
                        menu_item_name=it.menu_item.name if it.menu_item else "Add-on",
                        estimated_savings=Decimal("5000"),
                    )
                    for it in custom_addons
                ]
                sim_mid = (sim_result.lower_amount + sim_result.upper_amount) / Decimal("2")
                proj_status = (
                    BudgetStatus.WITHIN_BUDGET
                    if sim_mid <= budget_target
                    else BudgetStatus.SLIGHTLY_ABOVE
                )
                recommendations.append(
                    BudgetRecommendationItem(
                        id=rec_id,
                        title="Revert to Core Package Menu (Remove All Add-ons)",
                        explanation=(
                            f"Focus on core package dishes to save ₹{int(total_savings):,} "
                            f"and bring your event within ₹{int(budget_target):,} target budget."
                        ),
                        category="MENU_CUSTOMIZATION",
                        changes=changes,
                        estimated_savings=total_savings,
                        projected_range=EstimatedRange(
                            lower=sim_result.lower_amount,
                            upper=sim_result.upper_amount,
                            currency="INR",
                        ),
                        projected_budget_status=proj_status,
                    )
                )

        return recommendations[:max_suggestions]
