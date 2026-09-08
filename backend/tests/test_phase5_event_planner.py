"""
CaterConnect Backend — Phase 5 Event Planner & Menu Builder Test Suite
Covers event draft creation, guest count, venue/date/budget updates, optimistic concurrency,
package constraints, menu item additions/removals, customer isolation, and version snapshots.
"""

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
    PackageItem,
    PackageSelectionGroup,
    PackageSelectionGroupItem,
)
from app.models.user import Caterer, CustomerProfile, User, UserRole

# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture
async def seed_data(db_session: AsyncSession) -> dict:
    """Seeds caterer, catalog, and test customer users."""
    caterer = Caterer(
        business_name="Grand Feast Catering",
        phone_number="+919876543210",
        email="info@grandfeast.com",
        is_active=True,
    )
    db_session.add(caterer)
    await db_session.flush()

    # Function Type
    fn_wedding = FunctionType(
        caterer_id=caterer.id,
        name="Wedding Reception",
        slug="wedding-reception",
        is_active=True,
        sort_order=1,
    )
    db_session.add(fn_wedding)

    # Offering
    off_buffet = CateringOffering(
        caterer_id=caterer.id,
        name="Grand Royal Buffet",
        slug="grand-royal-buffet",
        description="Full-service buffet catering",
        is_active=True,
    )
    db_session.add(off_buffet)
    await db_session.flush()

    # Menu Categories & Items
    cat_starters = MenuCategory(
        caterer_id=caterer.id, name="Starters", slug="starters", sort_order=1
    )
    cat_mains = MenuCategory(
        caterer_id=caterer.id, name="Main Course", slug="main-course", sort_order=2
    )
    cat_desserts = MenuCategory(
        caterer_id=caterer.id, name="Desserts", slug="desserts", sort_order=3
    )
    db_session.add_all([cat_starters, cat_mains, cat_desserts])
    await db_session.flush()

    item_paneer_tikka = MenuItem(
        caterer_id=caterer.id,
        category_id=cat_starters.id,
        name="Paneer Tikka",
        slug="paneer-tikka",
        dietary_type="VEG",
        is_active=True,
    )
    item_chicken_tikka = MenuItem(
        caterer_id=caterer.id,
        category_id=cat_starters.id,
        name="Chicken Tikka",
        slug="chicken-tikka",
        dietary_type="NON_VEG",
        is_active=True,
    )
    item_biryani = MenuItem(
        caterer_id=caterer.id,
        category_id=cat_mains.id,
        name="Dum Biryani",
        slug="dum-biryani",
        dietary_type="NON_VEG",
        is_active=True,
    )
    item_pulao = MenuItem(
        caterer_id=caterer.id,
        category_id=cat_mains.id,
        name="Kashmiri Pulao",
        slug="kashmiri-pulao",
        dietary_type="VEG",
        is_active=True,
    )
    item_gulab_jamun = MenuItem(
        caterer_id=caterer.id,
        category_id=cat_desserts.id,
        name="Gulab Jamun",
        slug="gulab-jamun",
        dietary_type="VEG",
        is_active=True,
    )
    db_session.add_all(
        [item_paneer_tikka, item_chicken_tikka, item_biryani, item_pulao, item_gulab_jamun]
    )
    await db_session.flush()

    # Package with Included Item and Selection Group
    pkg_royal = Package(
        caterer_id=caterer.id,
        name="Royal Wedding Package",
        slug="royal-wedding-package",
        min_guests=50,
        max_guests=1000,
        is_active=True,
    )
    db_session.add(pkg_royal)
    await db_session.flush()

    # Mandatory/Included package item: Gulab Jamun
    pkg_item_included = PackageItem(
        package_id=pkg_royal.id,
        menu_item_id=item_gulab_jamun.id,
        inclusion_type="INCLUDED",
    )
    db_session.add(pkg_item_included)

    # Selection Group: Main Course Choice (Min 1, Max 1)
    sel_group = PackageSelectionGroup(
        package_id=pkg_royal.id,
        name="Select 1 Main Course Rice",
        min_selections=1,
        max_selections=1,
        sort_order=1,
    )
    db_session.add(sel_group)
    await db_session.flush()

    grp_item_1 = PackageSelectionGroupItem(
        selection_group_id=sel_group.id,
        menu_item_id=item_biryani.id,
    )
    grp_item_2 = PackageSelectionGroupItem(
        selection_group_id=sel_group.id,
        menu_item_id=item_pulao.id,
    )
    db_session.add_all([grp_item_1, grp_item_2])

    # Customers
    cust_user1 = User(
        phone_number="+919100000001",
        phone_country_code="+91",
        role=UserRole.CUSTOMER.value,
        is_active=True,
    )
    cust_user2 = User(
        phone_number="+919100000002",
        phone_country_code="+91",
        role=UserRole.CUSTOMER.value,
        is_active=True,
    )
    db_session.add_all([cust_user1, cust_user2])
    await db_session.flush()

    profile1 = CustomerProfile(
        user_id=cust_user1.id, full_name="Alice Customer", email="alice@test.com"
    )
    profile2 = CustomerProfile(
        user_id=cust_user2.id, full_name="Bob Customer", email="bob@test.com"
    )
    db_session.add_all([profile1, profile2])
    await db_session.commit()

    return {
        "caterer": caterer,
        "function": fn_wedding,
        "offering": off_buffet,
        "package": pkg_royal,
        "selection_group": sel_group,
        "items": {
            "paneer_tikka": item_paneer_tikka,
            "chicken_tikka": item_chicken_tikka,
            "biryani": item_biryani,
            "pulao": item_pulao,
            "gulab_jamun": item_gulab_jamun,
        },
        "customer1": cust_user1,
        "customer2": cust_user2,
    }


def auth_headers(user: User) -> dict[str, str]:
    """Generates Bearer authorization header for a given user."""
    token = create_session_token(str(user.id), user.role)
    return {"Authorization": f"Bearer {token}"}


# ---------------------------------------------------------------------------
# Test Cases
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_create_event_draft_blank(client: AsyncClient, seed_data: dict):
    """Creating a blank draft returns 201 with version 1 and status DRAFT."""
    user = seed_data["customer1"]
    resp = await client.post(
        "/api/v1/events",
        headers=auth_headers(user),
        json={},
    )
    assert resp.status_code == 201, resp.text
    data = resp.json()["data"]
    assert data["status"] == "DRAFT"
    assert data["configuration_version"] == 1
    assert data["guest_count"] is None
    assert len(data["menu_items"]) == 0


@pytest.mark.asyncio
async def test_create_event_draft_with_package(client: AsyncClient, seed_data: dict):
    """Creating a draft with package automatically populates items and records v1."""
    user = seed_data["customer1"]
    pkg = seed_data["package"]
    fn = seed_data["function"]
    off = seed_data["offering"]

    payload = {
        "function_type_id": fn.id,
        "offering_id": off.id,
        "package_id": pkg.id,
        "guest_count": 250,
        "budget_min": 150000,
        "budget_max": 200000,
        "event_date": "2026-12-25",
        "venue_name": "Royal Palace Hall",
    }
    resp = await client.post(
        "/api/v1/events",
        headers=auth_headers(user),
        json=payload,
    )
    assert resp.status_code == 201, resp.text
    data = resp.json()["data"]
    assert data["status"] == "DRAFT"
    assert data["guest_count"] == 250
    assert data["configuration_version"] == 1
    assert data["package"]["name"] == "Royal Wedding Package"
    assert len(data["menu_items"]) == 1
    assert data["menu_items"][0]["name"] == "Gulab Jamun"


@pytest.mark.asyncio
async def test_list_and_filter_customer_events(client: AsyncClient, seed_data: dict):
    """Customer only sees their own events and can filter by status."""
    cust1 = seed_data["customer1"]
    cust2 = seed_data["customer2"]

    # Create 2 events for cust1 and 1 for cust2
    await client.post(
        "/api/v1/events", headers=auth_headers(cust1), json={"venue_name": "Cust1 Venue A"}
    )
    await client.post(
        "/api/v1/events", headers=auth_headers(cust1), json={"venue_name": "Cust1 Venue B"}
    )
    await client.post(
        "/api/v1/events", headers=auth_headers(cust2), json={"venue_name": "Cust2 Venue X"}
    )

    # Check Cust1 list
    resp1 = await client.get("/api/v1/events", headers=auth_headers(cust1))
    assert resp1.status_code == 200
    list_data1 = resp1.json()["data"]
    assert list_data1["total"] == 2
    venue_names = [e["venue_name"] for e in list_data1["items"]]
    assert "Cust1 Venue A" in venue_names
    assert "Cust2 Venue X" not in venue_names

    # Check Cust2 list
    resp2 = await client.get("/api/v1/events", headers=auth_headers(cust2))
    assert resp2.status_code == 200
    assert resp2.json()["data"]["total"] == 1


@pytest.mark.asyncio
async def test_get_event_details(client: AsyncClient, seed_data: dict):
    """Get event retrieves full aggregate structure."""
    cust = seed_data["customer1"]
    create_resp = await client.post(
        "/api/v1/events",
        headers=auth_headers(cust),
        json={"venue_name": "Grand Hall", "guest_count": 300},
    )
    event_id = create_resp.json()["data"]["id"]

    get_resp = await client.get(f"/api/v1/events/{event_id}", headers=auth_headers(cust))
    assert get_resp.status_code == 200
    event_data = get_resp.json()["data"]
    assert event_data["id"] == event_id
    assert event_data["venue"]["name"] == "Grand Hall"
    assert event_data["guest_count"] == 300


@pytest.mark.asyncio
async def test_update_event_core_details_and_versioning(client: AsyncClient, seed_data: dict):
    """Updating core details increments configuration version and creates snapshot."""
    cust = seed_data["customer1"]
    create_resp = await client.post(
        "/api/v1/events",
        headers=auth_headers(cust),
        json={"venue_name": "Initial Hall", "guest_count": 100},
    )
    event_id = create_resp.json()["data"]["id"]
    assert create_resp.json()["data"]["configuration_version"] == 1

    # Update venue, date, and budget with If-Match-Version: 1
    update_payload = {
        "venue_name": "Updated Ballroom",
        "guest_count": 150,
        "budget_min": 75000,
        "budget_max": 90000,
    }
    update_resp = await client.patch(
        f"/api/v1/events/{event_id}",
        headers={**auth_headers(cust), "If-Match-Version": "1"},
        json=update_payload,
    )
    assert update_resp.status_code == 200, update_resp.text
    updated_data = update_resp.json()["data"]
    assert updated_data["configuration_version"] == 2
    assert updated_data["venue"]["name"] == "Updated Ballroom"
    assert updated_data["guest_count"] == 150
    assert updated_data["budget"]["min"] == 75000


@pytest.mark.asyncio
async def test_optimistic_concurrency_conflict(client: AsyncClient, seed_data: dict):
    """Mismatched If-Match-Version returns 409 EVENT_VERSION_CONFLICT."""
    cust = seed_data["customer1"]
    create_resp = await client.post(
        "/api/v1/events",
        headers=auth_headers(cust),
        json={"venue_name": "Initial Venue"},
    )
    event_id = create_resp.json()["data"]["id"]

    # Attempt update with stale version 99
    conflict_resp = await client.patch(
        f"/api/v1/events/{event_id}",
        headers={**auth_headers(cust), "If-Match-Version": "99"},
        json={"venue_name": "Conflicting Update"},
    )
    assert conflict_resp.status_code == 409
    error = conflict_resp.json()["detail"]
    assert error["code"] == "EVENT_VERSION_CONFLICT"


@pytest.mark.asyncio
async def test_update_configuration_package_constraints(client: AsyncClient, seed_data: dict):
    """Selection group choices must satisfy min_choices and max_choices."""
    cust = seed_data["customer1"]
    pkg = seed_data["package"]
    sel_group = seed_data["selection_group"]
    biryani = seed_data["items"]["biryani"]
    pulao = seed_data["items"]["pulao"]

    create_resp = await client.post(
        "/api/v1/events",
        headers=auth_headers(cust),
        json={"package_id": pkg.id},
    )
    event_id = create_resp.json()["data"]["id"]

    # 1. Invalid: 0 items selected for group requiring min 1
    bad_config_1 = {
        "base_version": 1,
        "package_id": pkg.id,
        "menu_items": [],
    }
    resp1 = await client.patch(
        f"/api/v1/events/{event_id}/configuration",
        headers=auth_headers(cust),
        json=bad_config_1,
    )
    assert resp1.status_code == 422
    assert resp1.json()["detail"]["code"] == "INVALID_SELECTION_GROUP_CHOICES"

    # 2. Invalid: 2 items selected for group allowing max 1
    bad_config_2 = {
        "base_version": 1,
        "package_id": pkg.id,
        "menu_items": [
            {
                "menu_item_id": biryani.id,
                "selection_group_id": sel_group.id,
                "source_type": "PACKAGE",
            },
            {
                "menu_item_id": pulao.id,
                "selection_group_id": sel_group.id,
                "source_type": "PACKAGE",
            },
        ],
    }
    resp2 = await client.patch(
        f"/api/v1/events/{event_id}/configuration",
        headers=auth_headers(cust),
        json=bad_config_2,
    )
    assert resp2.status_code == 422
    assert resp2.json()["detail"]["code"] == "INVALID_SELECTION_GROUP_CHOICES"

    # 3. Valid: Exactly 1 item selected for the group
    valid_config = {
        "base_version": 1,
        "package_id": pkg.id,
        "menu_items": [
            {
                "menu_item_id": biryani.id,
                "selection_group_id": sel_group.id,
                "source_type": "PACKAGE",
            },
        ],
    }
    resp3 = await client.patch(
        f"/api/v1/events/{event_id}/configuration",
        headers=auth_headers(cust),
        json=valid_config,
    )
    assert resp3.status_code == 200, resp3.text
    config_data = resp3.json()["data"]
    assert config_data["version"] == 2
    assert len(config_data["menu_items"]) == 1
    assert config_data["menu_items"][0]["menu_item_id"] == biryani.id


@pytest.mark.asyncio
async def test_add_and_remove_event_menu_item(client: AsyncClient, seed_data: dict):
    """Add custom menu item and delete it with concurrency checks."""
    cust = seed_data["customer1"]
    tikka = seed_data["items"]["paneer_tikka"]

    create_resp = await client.post("/api/v1/events", headers=auth_headers(cust), json={})
    event_id = create_resp.json()["data"]["id"]

    # Add Paneer Tikka (base_version: 1)
    add_resp = await client.post(
        f"/api/v1/events/{event_id}/menu-items",
        headers=auth_headers(cust),
        json={
            "menu_item_id": tikka.id,
            "source_type": "CUSTOM",
            "quantity": 1.0,
            "base_version": 1,
        },
    )
    assert add_resp.status_code == 201, add_resp.text
    resp_json = add_resp.json()["data"]
    assert resp_json["configuration_version"] == 2
    event_item_id = resp_json["menu_item"]["id"]

    # Verify event now has 1 menu item and version 2
    get_resp = await client.get(f"/api/v1/events/{event_id}", headers=auth_headers(cust))
    assert len(get_resp.json()["data"]["menu_items"]) == 1

    # Remove menu item with base_version: 2
    del_resp = await client.delete(
        f"/api/v1/events/{event_id}/menu-items/{event_item_id}?base_version=2",
        headers=auth_headers(cust),
    )
    assert del_resp.status_code == 204

    # Verify event is empty and version incremented to 3
    get_resp2 = await client.get(f"/api/v1/events/{event_id}", headers=auth_headers(cust))
    assert get_resp2.json()["data"]["configuration_version"] == 3
    assert len(get_resp2.json()["data"]["menu_items"]) == 0


@pytest.mark.asyncio
async def test_event_version_history(client: AsyncClient, seed_data: dict):
    """GET /events/{id}/versions returns immutable snapshot trail."""
    cust = seed_data["customer1"]
    tikka = seed_data["items"]["paneer_tikka"]

    # 1. Create draft (v1)
    create_resp = await client.post(
        "/api/v1/events",
        headers=auth_headers(cust),
        json={"venue_name": "First Venue"},
    )
    event_id = create_resp.json()["data"]["id"]

    # 2. Update venue (v2)
    await client.patch(
        f"/api/v1/events/{event_id}",
        headers={**auth_headers(cust), "If-Match-Version": "1"},
        json={"venue_name": "Second Venue"},
    )

    # 3. Add menu item (v3)
    await client.post(
        f"/api/v1/events/{event_id}/menu-items",
        headers=auth_headers(cust),
        json={
            "menu_item_id": tikka.id,
            "source_type": "CUSTOM",
            "base_version": 2,
        },
    )

    # 4. Fetch version history
    ver_resp = await client.get(f"/api/v1/events/{event_id}/versions", headers=auth_headers(cust))
    assert ver_resp.status_code == 200
    ver_data = ver_resp.json()["data"]
    assert ver_data["current_version"] == 3
    versions = ver_data["versions"]
    assert len(versions) == 3
    # Ordered descending: v3, v2, v1
    assert [v["version_number"] for v in versions] == [3, 2, 1]
    assert versions[2]["snapshot"]["venue_name"] == "First Venue"
    assert versions[1]["snapshot"]["venue_name"] == "Second Venue"
    assert len(versions[0]["snapshot"]["menu_items"]) == 1


@pytest.mark.asyncio
async def test_cross_customer_isolation(client: AsyncClient, seed_data: dict):
    """Customer 2 cannot view or edit Customer 1's event."""
    cust1 = seed_data["customer1"]
    cust2 = seed_data["customer2"]

    create_resp = await client.post(
        "/api/v1/events",
        headers=auth_headers(cust1),
        json={"venue_name": "Secret Party"},
    )
    event_id = create_resp.json()["data"]["id"]

    # Cust2 tries GET -> 404
    get_resp = await client.get(f"/api/v1/events/{event_id}", headers=auth_headers(cust2))
    assert get_resp.status_code == 404

    # Cust2 tries PATCH -> 404
    patch_resp = await client.patch(
        f"/api/v1/events/{event_id}",
        headers={**auth_headers(cust2), "If-Match-Version": "1"},
        json={"venue_name": "Hacked"},
    )
    assert patch_resp.status_code == 404
