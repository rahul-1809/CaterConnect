"""
CaterConnect Backend — Phase 6 Pricing & Estimate Engine Tests
Deterministic verification of calculation logic, budget evaluation, estimate APIs, freshness,
and budget recommendations.
"""

from __future__ import annotations

import uuid
from decimal import Decimal

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_session_token
from app.models.catalog import (
    CateringOffering,
    FunctionType,
    MenuCategory,
    MenuItem,
    Package,
)
from app.models.event import Event, EventItemSourceType, EventMenuItem, EventStatus
from app.models.pricing import (
    BudgetStatus,
)
from app.models.user import Caterer, CatererAdmin, CustomerProfile, User, UserRole
from app.pricing.engine import PricingEngine

# ---------------------------------------------------------------------------
# Test Fixtures & Seed Helper
# ---------------------------------------------------------------------------


@pytest.fixture
async def phase6_setup(db_session: AsyncSession):
    """Seed caterer, customer, package, dishes, and event draft."""
    caterer_id = str(uuid.uuid4())
    customer_user_id = str(uuid.uuid4())
    admin_user_id = str(uuid.uuid4())

    # Users
    cust_user = User(
        id=customer_user_id,
        phone_number="+919876543210",
        role=UserRole.CUSTOMER.value,
        is_active=True,
    )
    cust_profile = CustomerProfile(
        id=str(uuid.uuid4()),
        user_id=customer_user_id,
        full_name="Rahul Sharma",
        email="rahul@example.com",
    )
    caterer = Caterer(
        id=caterer_id,
        business_name="Sri Krishna Caterers",
    )
    admin_user = User(
        id=admin_user_id,
        phone_number="+919999999999",
        role=UserRole.ADMIN.value,
        is_active=True,
    )
    admin_profile = CatererAdmin(
        id=str(uuid.uuid4()),
        user_id=admin_user_id,
        caterer_id=caterer_id,
    )
    db_session.add_all([cust_user, cust_profile, caterer, admin_user, admin_profile])

    # Catalog
    fn = FunctionType(
        id=str(uuid.uuid4()),
        caterer_id=caterer_id,
        name="Wedding Reception",
        slug="wedding-reception",
    )
    off = CateringOffering(
        id=str(uuid.uuid4()),
        caterer_id=caterer_id,
        name="Grand Dinner",
        slug="grand-dinner",
    )
    cat = MenuCategory(
        id=str(uuid.uuid4()),
        caterer_id=caterer_id,
        name="Main Course",
        slug="main-course",
    )
    pkg = Package(
        id=str(uuid.uuid4()),
        caterer_id=caterer_id,
        name="Royal Telugu Wedding Feast",
        slug="royal-telugu-wedding-feast",
        min_guests=50,
        max_guests=1000,
    )

    dish1 = MenuItem(
        id=str(uuid.uuid4()),
        caterer_id=caterer_id,
        category_id=cat.id,
        name="Hyderabadi Dum Biryani",
        slug="hyderabadi-dum-biryani",
        dietary_type="NON_VEG",
    )
    dish2 = MenuItem(
        id=str(uuid.uuid4()),
        caterer_id=caterer_id,
        category_id=cat.id,
        name="Special Haleem Live Counter",
        slug="special-haleem-live-counter",
        dietary_type="NON_VEG",
        extra_metadata={"addon_price": 120},
    )
    dish3 = MenuItem(
        id=str(uuid.uuid4()),
        caterer_id=caterer_id,
        category_id=cat.id,
        name="Double Ka Meetha",
        slug="double-ka-meetha",
        dietary_type="VEG",
        extra_metadata={"addon_price": 60},
    )
    db_session.add_all([fn, off, cat, pkg, dish1, dish2, dish3])

    # Event
    event = Event(
        id=str(uuid.uuid4()),
        customer_id=cust_profile.id,
        caterer_id=caterer_id,
        function_type_id=fn.id,
        offering_id=off.id,
        package_id=pkg.id,
        guest_count=150,
        budget_min=Decimal("90000"),
        budget_max=Decimal("120000"),
        status=EventStatus.DRAFT.value,
        configuration_version=1,
    )
    db_session.add(event)

    # Event Menu Items: 1 Package dish, 2 Custom add-ons
    item1 = EventMenuItem(
        id=str(uuid.uuid4()),
        event_id=event.id,
        menu_item_id=dish1.id,
        source_type=EventItemSourceType.PACKAGE.value,
        is_included=True,
    )
    item2 = EventMenuItem(
        id=str(uuid.uuid4()),
        event_id=event.id,
        menu_item_id=dish2.id,
        source_type=EventItemSourceType.ADDON.value,
        quantity=Decimal("1.0"),
        is_included=True,
    )
    item3 = EventMenuItem(
        id=str(uuid.uuid4()),
        event_id=event.id,
        menu_item_id=dish3.id,
        source_type=EventItemSourceType.ADDON.value,
        quantity=Decimal("1.0"),
        is_included=True,
    )
    db_session.add_all([item1, item2, item3])

    await db_session.commit()

    cust_token = create_session_token(customer_user_id, UserRole.CUSTOMER.value)
    admin_token = create_session_token(admin_user_id, UserRole.ADMIN.value)

    return {
        "caterer": caterer,
        "customer_user": cust_user,
        "admin_user": admin_user,
        "cust_token": cust_token,
        "admin_token": admin_token,
        "event": event,
        "package": pkg,
        "dishes": [dish1, dish2, dish3],
        "menu_items": [item1, item2, item3],
    }


# ---------------------------------------------------------------------------
# Deterministic Unit Tests
# ---------------------------------------------------------------------------


def test_deterministic_pricing_calculation():
    """Verify deterministic pricing engine calculation without database dependency."""
    event = Event(
        guest_count=100,
        budget_min=Decimal("50000"),
        budget_max=Decimal("70000"),
    )
    pkg = Package(
        name="Standard Package",
        slug="standard-classic-package",
    )
    # Royal slug baseline = ₹550/guest
    # 100 guests * ₹550 = ₹55,000 food subtotal
    # Service charge (5%) = ₹2,750
    # Net before tax = ₹57,750
    # Tax (5% GST) = ₹2,888 (approx)
    # Total baseline = ₹60,638
    # Lower bucket (rounded to 500) = ₹60,500
    # Upper buffer (+12%) = ~₹68,000
    result = PricingEngine.calculate(
        event=event,
        package=pkg,
        event_menu_items=[],
        pricing_rules=[],
    )

    assert result.lower_amount >= Decimal("55000")
    assert result.upper_amount >= result.lower_amount
    assert result.currency == "INR"
    assert len(result.breakdown) >= 3  # Package, Service charge, GST
    assert result.budget.status == BudgetStatus.WITHIN_BUDGET


def test_pricing_budget_status_evaluation():
    """Verify soft budget categorization."""
    # Under budget
    b1 = PricingEngine.evaluate_budget(
        lower_amount=Decimal("40000"),
        upper_amount=Decimal("45000"),
        budget_min=Decimal("80000"),
        budget_max=Decimal("100000"),
    )
    assert b1.status == BudgetStatus.UNDER_BUDGET

    # Within budget
    b2 = PricingEngine.evaluate_budget(
        lower_amount=Decimal("85000"),
        upper_amount=Decimal("95000"),
        budget_min=Decimal("80000"),
        budget_max=Decimal("100000"),
    )
    assert b2.status == BudgetStatus.WITHIN_BUDGET

    # Slightly above budget (<= 15% overrun)
    b3 = PricingEngine.evaluate_budget(
        lower_amount=Decimal("105000"),
        upper_amount=Decimal("110000"),
        budget_min=Decimal("80000"),
        budget_max=Decimal("100000"),
    )
    assert b3.status == BudgetStatus.SLIGHTLY_ABOVE

    # Above budget (> 15% overrun)
    b4 = PricingEngine.evaluate_budget(
        lower_amount=Decimal("130000"),
        upper_amount=Decimal("140000"),
        budget_min=Decimal("80000"),
        budget_max=Decimal("100000"),
    )
    assert b4.status == BudgetStatus.ABOVE_BUDGET

    # No budget configured
    b5 = PricingEngine.evaluate_budget(
        lower_amount=Decimal("100000"),
        upper_amount=Decimal("110000"),
        budget_min=None,
        budget_max=None,
    )
    assert b5.status == BudgetStatus.NO_BUDGET


# ---------------------------------------------------------------------------
# API Integration Tests
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_calculate_and_get_estimate_api(client: AsyncClient, phase6_setup: dict):
    """Test POST /events/{id}/estimate and GET /events/{id}/estimate."""
    event = phase6_setup["event"]
    token = phase6_setup["cust_token"]

    headers = {"Authorization": f"Bearer {token}"}

    # 1. Calculate Estimate
    calc_res = await client.post(
        f"/api/v1/events/{event.id}/estimate",
        headers=headers,
        json={"configuration_version": 1},
    )
    assert calc_res.status_code == 200
    calc_json = calc_res.json()
    assert "data" in calc_json
    est_data = calc_json["data"]
    assert est_data["event_id"] == event.id
    assert float(est_data["lower_amount"]) > 0
    assert float(est_data["upper_amount"]) >= float(est_data["lower_amount"])
    assert est_data["currency"] == "INR"
    assert len(est_data["breakdown"]) >= 3
    assert est_data["disclaimer"] == (
        "Estimated price only. Final quotation is subject to caterer confirmation."
    )

    # 2. Get Estimate
    get_res = await client.get(
        f"/api/v1/events/{event.id}/estimate",
        headers=headers,
    )
    assert get_res.status_code == 200
    get_json = get_res.json()
    assert get_json["data"]["estimate_id"] == est_data["estimate_id"]
    assert get_json["meta"]["status"] == "CURRENT"


@pytest.mark.asyncio
async def test_estimate_stale_detection(
    client: AsyncClient, phase6_setup: dict, db_session: AsyncSession
):
    """Test that bumping event configuration_version marks the estimate as STALE."""
    event = phase6_setup["event"]
    token = phase6_setup["cust_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Calculate initial estimate
    await client.post(f"/api/v1/events/{event.id}/estimate", headers=headers)

    # Bump configuration version
    event.configuration_version = 2
    await db_session.commit()

    # Get estimate should flag stale
    get_res = await client.get(
        f"/api/v1/events/{event.id}/estimate",
        headers=headers,
    )
    assert get_res.status_code == 200
    get_json = get_res.json()
    assert get_json["data"]["is_stale"] is True
    assert get_json["meta"]["status"] == "STALE"


@pytest.mark.asyncio
async def test_budget_optimization_and_apply(client: AsyncClient, phase6_setup: dict):
    """Test POST /events/{id}/optimize-budget and applying a suggestion."""
    event = phase6_setup["event"]
    token = phase6_setup["cust_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Request budget optimizations for target budget = 100,000 (lower than current total)
    opt_res = await client.post(
        f"/api/v1/events/{event.id}/optimize-budget",
        headers=headers,
        json={"target_budget": 100000, "max_suggestions": 3},
    )
    assert opt_res.status_code == 200
    opt_json = opt_res.json()
    recs = opt_json["data"]["recommendations"]
    assert len(recs) > 0

    first_rec = recs[0]
    assert "Remove Optional Add-on" in first_rec["title"] or "Core Package" in first_rec["title"]
    assert float(first_rec["estimated_savings"]) > 0
    rec_id = first_rec["id"]

    # Apply recommendation
    apply_res = await client.post(
        f"/api/v1/events/{event.id}/recommendations/{rec_id}/apply",
        headers=headers,
        json={"base_version": 1},
    )
    assert apply_res.status_code == 200
    apply_json = apply_res.json()
    fresh_est = apply_json["data"]
    assert fresh_est["event_version"] == 2  # Incremented version
    assert fresh_est["is_stale"] is False


@pytest.mark.asyncio
async def test_admin_pricing_rules_crud(client: AsyncClient, phase6_setup: dict):
    """Test admin pricing rule creation, listing, and updates."""
    admin_token = phase6_setup["admin_token"]
    headers = {"Authorization": f"Bearer {admin_token}"}

    # 1. Create rule
    create_res = await client.post(
        "/api/v1/admin/pricing-rules",
        headers=headers,
        json={
            "name": "Live Dosa Counter Surcharge",
            "rule_type": "PER_PERSON",
            "scope_type": "CATERER",
            "amount": 75.0,
            "currency": "INR",
            "priority": 10,
            "is_active": True,
        },
    )
    assert create_res.status_code == 201
    rule_data = create_res.json()["data"]
    rule_id = rule_data["id"]
    assert float(rule_data["amount"]) == 75.0

    # 2. List rules
    list_res = await client.get("/api/v1/admin/pricing-rules", headers=headers)
    assert list_res.status_code == 200
    rules = list_res.json()["data"]
    assert any(r["id"] == rule_id for r in rules)

    # 3. Update rule
    update_res = await client.patch(
        f"/api/v1/admin/pricing-rules/{rule_id}",
        headers=headers,
        json={"amount": 90.0, "name": "Premium Live Dosa Counter Surcharge"},
    )
    assert update_res.status_code == 200
    updated_rule = update_res.json()["data"]
    assert float(updated_rule["amount"]) == 90.0
    assert updated_rule["name"] == "Premium Live Dosa Counter Surcharge"
