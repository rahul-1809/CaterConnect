"""
CaterConnect Backend — Deterministic Pricing Engine
Authoritative calculation logic for event catering estimates.

Complies with:
- FR-PRICE-001 through FR-PRICE-008
- FR-EST-001 through FR-EST-005
- BR-003 (Deterministic calculation, no LLM pricing math)
- BR-004 (Estimated range with disclaimer)
- BR-005 (Soft budget comparison)
"""

from __future__ import annotations

from dataclasses import dataclass
from decimal import ROUND_HALF_UP, Decimal

from app.models.catalog import Package
from app.models.event import Event, EventItemSourceType, EventMenuItem
from app.models.pricing import BudgetStatus, PricingRule, PricingRuleType
from app.schemas.pricing import BudgetSummary, EstimateBreakdownItem


def round_currency(val: Decimal) -> Decimal:
    """Round to whole Indian Rupees using standard commercial HALF_UP."""
    return val.quantize(Decimal("1"), rounding=ROUND_HALF_UP)


@dataclass
class PricingCalculationResult:
    lower_amount: Decimal
    upper_amount: Decimal
    currency: str
    budget: BudgetSummary
    breakdown: list[EstimateBreakdownItem]
    pricing_version_id: str | None = None
    applied_rules_count: int = 0
    raw_subtotal: Decimal = Decimal("0")


class PricingEngine:
    """
    Deterministic rule-based pricing calculator.
    """

    DEFAULT_PER_PERSON_RATE = Decimal("550.00")
    DEFAULT_ADDON_RATE = Decimal("85.00")
    DEFAULT_SERVICE_CHARGE_PCT = Decimal("5.00")
    DEFAULT_TAX_PCT = Decimal("5.00")
    DEFAULT_UPPER_MARGIN_PCT = Decimal("12.00")

    @classmethod
    def calculate(
        cls,
        event: Event,
        package: Package | None,
        event_menu_items: list[EventMenuItem],
        pricing_rules: list[PricingRule],
        pricing_version_id: str | None = None,
    ) -> PricingCalculationResult:
        guest_count = Decimal(str(event.guest_count or 100))
        if guest_count <= 0:
            guest_count = Decimal("50")

        breakdown: list[EstimateBreakdownItem] = []
        rules_by_type: dict[str, list[PricingRule]] = {}
        for rule in pricing_rules:
            if rule.is_active:
                rules_by_type.setdefault(rule.rule_type, []).append(rule)

        # 1. Base Package / Per-Person Calculation
        base_package_rate = cls.DEFAULT_PER_PERSON_RATE
        fixed_package_base = Decimal("0")

        if package:
            pkg_per_person_rules = [
                r
                for r in rules_by_type.get(PricingRuleType.PER_PERSON.value, [])
                if any(m.package_id == package.id for m in r.package_rules)
            ]
            if pkg_per_person_rules and pkg_per_person_rules[0].amount is not None:
                base_package_rate = pkg_per_person_rules[0].amount
            elif package.slug:
                if "royal" in package.slug or "premium" in package.slug:
                    base_package_rate = Decimal("750.00")
                elif "deluxe" in package.slug or "standard" in package.slug:
                    base_package_rate = Decimal("550.00")
                elif "classic" in package.slug or "budget" in package.slug:
                    base_package_rate = Decimal("400.00")

            pkg_base_rules = [
                r
                for r in rules_by_type.get(PricingRuleType.PACKAGE_BASE.value, [])
                if any(m.package_id == package.id for m in r.package_rules)
            ]
            if pkg_base_rules and pkg_base_rules[0].amount is not None:
                fixed_package_base = pkg_base_rules[0].amount

        package_subtotal = round_currency((base_package_rate * guest_count) + fixed_package_base)
        pkg_name = package.name if package else "Standard Catering Menu"
        breakdown.append(
            EstimateBreakdownItem(
                type="PACKAGE",
                description=f"{pkg_name} ({int(guest_count)} @ ₹{int(base_package_rate)}/head)",
                amount=package_subtotal,
                rate=base_package_rate,
                quantity=guest_count,
            )
        )

        # 2. Add-ons & Custom Menu Items
        addon_subtotal = Decimal("0")
        custom_items = [
            item
            for item in event_menu_items
            if item.source_type
            in (EventItemSourceType.CUSTOM.value, EventItemSourceType.ADDON.value)
            and item.is_included
        ]

        for item in custom_items:
            item_rule = None
            for r in rules_by_type.get(PricingRuleType.ITEM_ADDON.value, []):
                if any(m.menu_item_id == item.menu_item_id for m in r.menu_item_rules):
                    item_rule = r
                    break

            item_unit_rate = cls.DEFAULT_ADDON_RATE
            if item_rule and item_rule.amount is not None:
                item_unit_rate = item_rule.amount
            elif item.menu_item and item.menu_item.extra_metadata:
                price_override = item.menu_item.extra_metadata.get("addon_price")
                if price_override:
                    try:
                        item_unit_rate = Decimal(str(price_override))
                    except Exception:
                        pass

            item_qty = item.quantity or Decimal("1.0")
            item_total = round_currency(item_unit_rate * guest_count * item_qty)
            addon_subtotal += item_total

            dish_name = item.menu_item.name if item.menu_item else "Special Add-on Dish"
            breakdown.append(
                EstimateBreakdownItem(
                    type="ADDON",
                    description=f"Add-on: {dish_name} (₹{int(item_unit_rate)}/guest)",
                    amount=item_total,
                    rate=item_unit_rate,
                    quantity=guest_count * item_qty,
                )
            )

        food_subtotal = package_subtotal + addon_subtotal

        # 3. Service Charges & Fixed Event Charges
        service_charge_pct = cls.DEFAULT_SERVICE_CHARGE_PCT
        fixed_charge_amount = Decimal("0")

        sc_rules = rules_by_type.get(PricingRuleType.SERVICE_CHARGE.value, [])
        if sc_rules:
            if sc_rules[0].percentage is not None:
                service_charge_pct = sc_rules[0].percentage
            elif sc_rules[0].amount is not None:
                fixed_charge_amount += sc_rules[0].amount

        fc_rules = rules_by_type.get(PricingRuleType.FIXED_CHARGE.value, [])
        if fc_rules:
            for fc in fc_rules:
                if fc.amount:
                    fixed_charge_amount += fc.amount

        service_charge_total = round_currency((food_subtotal * service_charge_pct) / Decimal("100"))
        if service_charge_total > 0:
            breakdown.append(
                EstimateBreakdownItem(
                    type="SERVICE_CHARGE",
                    description=f"Service & Staffing ({service_charge_pct}%)",
                    amount=service_charge_total,
                    rate=service_charge_pct,
                    quantity=None,
                )
            )

        if fixed_charge_amount > 0:
            breakdown.append(
                EstimateBreakdownItem(
                    type="FIXED",
                    description="Event Setup & Logistics Fixed Charge",
                    amount=round_currency(fixed_charge_amount),
                    rate=fixed_charge_amount,
                    quantity=None,
                )
            )

        net_before_tax = food_subtotal + service_charge_total + fixed_charge_amount

        # 4. Taxes / GST
        tax_pct = cls.DEFAULT_TAX_PCT
        tax_rules = rules_by_type.get(PricingRuleType.TAX.value, [])
        if tax_rules and tax_rules[0].percentage is not None:
            tax_pct = tax_rules[0].percentage

        tax_total = round_currency((net_before_tax * tax_pct) / Decimal("100"))
        if tax_total > 0:
            breakdown.append(
                EstimateBreakdownItem(
                    type="TAX",
                    description=f"Estimated GST ({tax_pct}%)",
                    amount=tax_total,
                    rate=tax_pct,
                    quantity=None,
                )
            )

        total_baseline = net_before_tax + tax_total

        # 5. Estimate Range Calculation
        upper_margin_pct = cls.DEFAULT_UPPER_MARGIN_PCT
        lower_amount = cls._round_to_bucket(total_baseline)
        upper_raw = total_baseline * (Decimal("1") + (upper_margin_pct / Decimal("100")))
        upper_amount = cls._round_to_bucket(upper_raw)
        if upper_amount < lower_amount:
            upper_amount = lower_amount

        # 6. Budget Comparison Logic
        budget_summary = cls.evaluate_budget(
            lower_amount=lower_amount,
            upper_amount=upper_amount,
            budget_min=event.budget_min,
            budget_max=event.budget_max,
        )

        return PricingCalculationResult(
            lower_amount=lower_amount,
            upper_amount=upper_amount,
            currency="INR",
            budget=budget_summary,
            breakdown=breakdown,
            pricing_version_id=pricing_version_id,
            applied_rules_count=len(pricing_rules),
            raw_subtotal=total_baseline,
        )

    @classmethod
    def evaluate_budget(
        cls,
        lower_amount: Decimal,
        upper_amount: Decimal,
        budget_min: Decimal | None,
        budget_max: Decimal | None,
    ) -> BudgetSummary:
        if budget_min is None and budget_max is None:
            return BudgetSummary(
                min=None,
                max=None,
                status=BudgetStatus.NO_BUDGET,
                difference=None,
                difference_percentage=None,
            )

        target_max = budget_max or budget_min or lower_amount
        target_min = budget_min or (target_max * Decimal("0.8"))

        midpoint = (lower_amount + upper_amount) / Decimal("2")
        difference = round_currency(midpoint - target_max)

        diff_pct = Decimal("0")
        if target_max > 0:
            diff_pct = (difference / target_max) * Decimal("100")
            diff_pct = diff_pct.quantize(Decimal("0.1"), rounding=ROUND_HALF_UP)

        if midpoint <= target_max:
            if midpoint < (target_min * Decimal("0.9")):
                status = BudgetStatus.UNDER_BUDGET
            else:
                status = BudgetStatus.WITHIN_BUDGET
        else:
            if diff_pct <= Decimal("15.0"):
                status = BudgetStatus.SLIGHTLY_ABOVE
            else:
                status = BudgetStatus.ABOVE_BUDGET

        return BudgetSummary(
            min=budget_min,
            max=budget_max,
            status=status,
            difference=difference,
            difference_percentage=diff_pct,
        )

    @staticmethod
    def _round_to_bucket(val: Decimal, bucket_size: int = 500) -> Decimal:
        bucket = Decimal(str(bucket_size))
        divided = (val / bucket).quantize(Decimal("1"), rounding=ROUND_HALF_UP)
        return divided * bucket
