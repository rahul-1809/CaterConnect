"""
CaterConnect Backend — Phase 4 Customer Browsing Test Suite
Covers public customer catalog APIs: function types, offerings, packages,
package details, menu categories, menu items, dietary filtering, and guest limits.
"""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.catalog import (
    CateringOffering,
    FunctionOffering,
    FunctionType,
    MenuCategory,
    MenuItem,
    Package,
    PackageAddon,
    PackageItem,
    PackageSelectionGroup,
    PackageSelectionGroupItem,
)
from app.models.user import Caterer


@pytest.fixture
async def browsing_seed(db_session: AsyncSession) -> dict:
    """Populate full catalog dataset for customer browsing tests."""
    caterer = Caterer(
        business_name="Royal Heritage Banquets",
        description="Premium luxury catering services",
        phone_number="+919800000001",
        email="contact@royalheritage.com",
        is_active=True,
    )
    db_session.add(caterer)
    await db_session.flush()

    # Functions
    fn_wedding = FunctionType(
        caterer_id=caterer.id,
        name="Wedding Grand Reception",
        slug="wedding-grand-reception",
        description="Opulent culinary experience for wedding galas",
        is_active=True,
        sort_order=1,
    )
    fn_corporate = FunctionType(
        caterer_id=caterer.id,
        name="Corporate Summit",
        slug="corporate-summit",
        description="Executive business lunch & dinners",
        is_active=True,
        sort_order=2,
    )
    fn_inactive = FunctionType(
        caterer_id=caterer.id,
        name="Archived Winter Gala",
        slug="archived-winter-gala",
        description="Legacy archived function",
        is_active=False,
        sort_order=99,
    )
    db_session.add_all([fn_wedding, fn_corporate, fn_inactive])
    await db_session.flush()

    # Offerings
    off_dinner = CateringOffering(
        caterer_id=caterer.id,
        name="Grand 5-Course Dinner",
        slug="grand-5-course-dinner",
        is_active=True,
        sort_order=1,
    )
    off_lunch = CateringOffering(
        caterer_id=caterer.id,
        name="Executive Lunch Buffet",
        slug="executive-lunch-buffet",
        is_active=True,
        sort_order=2,
    )
    db_session.add_all([off_dinner, off_lunch])
    await db_session.flush()

    # Link wedding -> dinner
    link_wf = FunctionOffering(
        function_type_id=fn_wedding.id,
        offering_id=off_dinner.id,
    )
    db_session.add(link_wf)

    # Categories
    cat_starters = MenuCategory(
        caterer_id=caterer.id,
        name="Appetizers & Starters",
        slug="appetizers-starters",
        sort_order=1,
        is_active=True,
    )
    cat_mains = MenuCategory(
        caterer_id=caterer.id,
        name="Main Courses",
        slug="main-courses",
        sort_order=2,
        is_active=True,
    )
    cat_desserts = MenuCategory(
        caterer_id=caterer.id,
        name="Desserts & Sweets",
        slug="desserts-sweets",
        sort_order=3,
        is_active=True,
    )
    db_session.add_all([cat_starters, cat_mains, cat_desserts])
    await db_session.flush()

    # Menu Items
    dish_paneer = MenuItem(
        caterer_id=caterer.id,
        category_id=cat_starters.id,
        name="Paneer Tikka Angara",
        slug="paneer-tikka-angara",
        description="Charcoal smoked cottage cheese with spiced mint chutney",
        dietary_type="VEG",
        is_active=True,
        sort_order=1,
    )
    dish_chicken = MenuItem(
        caterer_id=caterer.id,
        category_id=cat_starters.id,
        name="Murgh Malai Kebab",
        slug="murgh-malai-kebab",
        description="Tender chicken morsels in cardamom cream marinade",
        dietary_type="NON_VEG",
        is_active=True,
        sort_order=2,
    )
    dish_dal = MenuItem(
        caterer_id=caterer.id,
        category_id=cat_mains.id,
        name="Dal Makhani Royale",
        slug="dal-makhani-royale",
        description="Slow-cooked black lentils simmered overnight with butter",
        dietary_type="VEG",
        is_active=True,
        sort_order=1,
    )
    dish_gulab = MenuItem(
        caterer_id=caterer.id,
        category_id=cat_desserts.id,
        name="Kesari Shahi Gulab Jamun",
        slug="kesari-shahi-gulab-jamun",
        description="Warm saffron infused milk dumplings stuffed with pistachio",
        dietary_type="VEG",
        is_active=True,
        sort_order=1,
    )
    dish_hidden = MenuItem(
        caterer_id=caterer.id,
        category_id=cat_mains.id,
        name="Inactive Seasonal Special",
        slug="inactive-seasonal-special",
        description="Item not currently served",
        dietary_type="VEG",
        is_active=False,
        sort_order=99,
    )
    db_session.add_all([dish_paneer, dish_chicken, dish_dal, dish_gulab, dish_hidden])
    await db_session.flush()

    # Packages
    pkg_royal = Package(
        caterer_id=caterer.id,
        name="Imperial Wedding Banquet",
        slug="imperial-wedding-banquet",
        description="Our flagship wedding feast package",
        min_guests=100,
        max_guests=1500,
        is_active=True,
        sort_order=1,
    )
    pkg_intimate = Package(
        caterer_id=caterer.id,
        name="Intimate Gathering Platter",
        slug="intimate-gathering-platter",
        description="Curated package for private boutique parties",
        min_guests=20,
        max_guests=80,
        is_active=True,
        sort_order=2,
    )
    pkg_inactive = Package(
        caterer_id=caterer.id,
        name="Discontinued Monsoon Special",
        slug="discontinued-monsoon-special",
        description="No longer active",
        is_active=False,
        sort_order=99,
    )
    db_session.add_all([pkg_royal, pkg_intimate, pkg_inactive])
    await db_session.flush()

    # Package Items & Groups
    p_item = PackageItem(
        package_id=pkg_royal.id,
        menu_item_id=dish_dal.id,
        inclusion_type="INCLUDED",
        sort_order=1,
    )
    group = PackageSelectionGroup(
        package_id=pkg_royal.id,
        name="Select 1 Premium Starter",
        min_selections=1,
        max_selections=1,
        is_required=True,
        sort_order=1,
    )
    db_session.add_all([p_item, group])
    await db_session.flush()

    g_item1 = PackageSelectionGroupItem(
        selection_group_id=group.id,
        menu_item_id=dish_paneer.id,
    )
    g_item2 = PackageSelectionGroupItem(
        selection_group_id=group.id,
        menu_item_id=dish_chicken.id,
    )
    addon = PackageAddon(
        package_id=pkg_royal.id,
        menu_item_id=dish_gulab.id,
        display_name="Dessert Counter Addon",
        is_active=True,
        sort_order=1,
    )
    db_session.add_all([g_item1, g_item2, addon])
    await db_session.commit()

    return {
        "caterer_id": caterer.id,
        "fn_wedding_id": fn_wedding.id,
        "fn_corporate_id": fn_corporate.id,
        "off_dinner_id": off_dinner.id,
        "pkg_royal_id": pkg_royal.id,
        "pkg_intimate_id": pkg_intimate.id,
        "dish_paneer_id": dish_paneer.id,
        "dish_chicken_id": dish_chicken.id,
        "cat_starters_id": cat_starters.id,
        "cat_mains_id": cat_mains.id,
    }


# ===========================================================================
# Function Type Browsing Tests
# ===========================================================================


@pytest.mark.asyncio
async def test_public_list_function_types(client: AsyncClient, browsing_seed: dict):
    """Customer can list active function types without authentication."""
    res = await client.get(
        "/api/v1/functions", headers={"X-Caterer-ID": browsing_seed["caterer_id"]}
    )
    assert res.status_code == 200
    data = res.json()["data"]
    assert len(data) == 2
    slugs = [f["slug"] for f in data]
    assert "wedding-grand-reception" in slugs
    assert "corporate-summit" in slugs
    assert "archived-winter-gala" not in slugs  # Inactive excluded


@pytest.mark.asyncio
async def test_public_get_function_detail(client: AsyncClient, browsing_seed: dict):
    """Customer can inspect single function type detail."""
    fn_id = browsing_seed["fn_wedding_id"]
    res = await client.get(
        f"/api/v1/functions/{fn_id}", headers={"X-Caterer-ID": browsing_seed["caterer_id"]}
    )
    assert res.status_code == 200
    assert res.json()["data"]["name"] == "Wedding Grand Reception"


@pytest.mark.asyncio
async def test_public_list_function_offerings(client: AsyncClient, browsing_seed: dict):
    """Customer can view offerings linked to a function type."""
    fn_id = browsing_seed["fn_wedding_id"]
    res = await client.get(
        f"/api/v1/functions/{fn_id}/offerings",
        headers={"X-Caterer-ID": browsing_seed["caterer_id"]},
    )
    assert res.status_code == 200
    data = res.json()["data"]
    assert len(data) == 1
    assert data[0]["name"] == "Grand 5-Course Dinner"


# ===========================================================================
# Packages Browsing & Filtering Tests
# ===========================================================================


@pytest.mark.asyncio
async def test_public_list_packages(client: AsyncClient, browsing_seed: dict):
    """Customer can list active packages."""
    res = await client.get(
        "/api/v1/packages", headers={"X-Caterer-ID": browsing_seed["caterer_id"]}
    )
    assert res.status_code == 200
    data = res.json()["data"]
    assert len(data) == 2
    names = [p["name"] for p in data]
    assert "Imperial Wedding Banquet" in names
    assert "Intimate Gathering Platter" in names
    assert "Discontinued Monsoon Special" not in names


@pytest.mark.asyncio
async def test_public_filter_packages_by_guest_count(client: AsyncClient, browsing_seed: dict):
    """Packages are filtered according to min and max guest limits."""
    # 500 guests -> matches Imperial Banquet (100 - 1500)
    res_large = await client.get(
        "/api/v1/packages?guest_count=500",
        headers={"X-Caterer-ID": browsing_seed["caterer_id"]},
    )
    assert res_large.status_code == 200
    data_large = res_large.json()["data"]
    assert len(data_large) == 1
    assert data_large[0]["name"] == "Imperial Wedding Banquet"

    # 40 guests -> matches Intimate Gathering (20 - 80)
    res_small = await client.get(
        "/api/v1/packages?guest_count=40",
        headers={"X-Caterer-ID": browsing_seed["caterer_id"]},
    )
    assert res_small.status_code == 200
    data_small = res_small.json()["data"]
    assert len(data_small) == 1
    assert data_small[0]["name"] == "Intimate Gathering Platter"


@pytest.mark.asyncio
async def test_public_search_packages(client: AsyncClient, browsing_seed: dict):
    """Customer can search packages by keyword."""
    res = await client.get(
        "/api/v1/packages?search=wedding",
        headers={"X-Caterer-ID": browsing_seed["caterer_id"]},
    )
    assert res.status_code == 200
    data = res.json()["data"]
    assert len(data) == 1
    assert data[0]["name"] == "Imperial Wedding Banquet"


@pytest.mark.asyncio
async def test_public_get_package_detail(client: AsyncClient, browsing_seed: dict):
    """Customer can inspect nested package structure (included items, selection groups, addons)."""
    pkg_id = browsing_seed["pkg_royal_id"]
    res = await client.get(
        f"/api/v1/packages/{pkg_id}",
        headers={"X-Caterer-ID": browsing_seed["caterer_id"]},
    )
    assert res.status_code == 200
    pkg = res.json()["data"]
    assert pkg["name"] == "Imperial Wedding Banquet"
    assert len(pkg["package_items"]) == 1
    assert len(pkg["selection_groups"]) == 1
    assert len(pkg["selection_groups"][0]["items"]) == 2
    assert len(pkg["addons"]) == 1
    assert pkg["addons"][0]["display_name"] == "Dessert Counter Addon"


# ===========================================================================
# Menu Browsing Tests
# ===========================================================================


@pytest.mark.asyncio
async def test_public_list_menu_categories(client: AsyncClient, browsing_seed: dict):
    """Customer can browse active menu categories."""
    res = await client.get(
        "/api/v1/menu/categories", headers={"X-Caterer-ID": browsing_seed["caterer_id"]}
    )
    assert res.status_code == 200
    data = res.json()["data"]
    assert len(data) == 3
    names = [c["name"] for c in data]
    assert "Appetizers & Starters" in names
    assert "Main Courses" in names


@pytest.mark.asyncio
async def test_public_list_menu_items_by_category(client: AsyncClient, browsing_seed: dict):
    """Customer can list items belonging to a specific category."""
    cat_id = browsing_seed["cat_starters_id"]
    res = await client.get(
        f"/api/v1/menu/items?category_id={cat_id}",
        headers={"X-Caterer-ID": browsing_seed["caterer_id"]},
    )
    assert res.status_code == 200
    items = res.json()["data"]
    assert len(items) == 2
    names = [i["name"] for i in items]
    assert "Paneer Tikka Angara" in names
    assert "Murgh Malai Kebab" in names


@pytest.mark.asyncio
async def test_public_filter_menu_items_dietary(client: AsyncClient, browsing_seed: dict):
    """Customer can filter dishes by VEG / NON_VEG dietary type."""
    # Veg only
    res_veg = await client.get(
        "/api/v1/menu/items?dietary_type=VEG",
        headers={"X-Caterer-ID": browsing_seed["caterer_id"]},
    )
    assert res_veg.status_code == 200
    veg_items = res_veg.json()["data"]
    assert all(i["dietary_type"] == "VEG" for i in veg_items)
    veg_names = [i["name"] for i in veg_items]
    assert "Paneer Tikka Angara" in veg_names
    assert "Murgh Malai Kebab" not in veg_names

    # Non-Veg only
    res_nonveg = await client.get(
        "/api/v1/menu/items?dietary_type=NON_VEG",
        headers={"X-Caterer-ID": browsing_seed["caterer_id"]},
    )
    assert res_nonveg.status_code == 200
    nonveg_items = res_nonveg.json()["data"]
    assert len(nonveg_items) == 1
    assert nonveg_items[0]["name"] == "Murgh Malai Kebab"


@pytest.mark.asyncio
async def test_public_search_menu_items(client: AsyncClient, browsing_seed: dict):
    """Customer can search dishes by keywords like 'paneer' or 'charcoal'."""
    res = await client.get(
        "/api/v1/menu/items?search=paneer",
        headers={"X-Caterer-ID": browsing_seed["caterer_id"]},
    )
    assert res.status_code == 200
    items = res.json()["data"]
    assert len(items) == 1
    assert items[0]["name"] == "Paneer Tikka Angara"


@pytest.mark.asyncio
async def test_public_get_menu_item_detail(client: AsyncClient, browsing_seed: dict):
    """Customer can view single item detail."""
    item_id = browsing_seed["dish_paneer_id"]
    res = await client.get(
        f"/api/v1/menu/items/{item_id}",
        headers={"X-Caterer-ID": browsing_seed["caterer_id"]},
    )
    assert res.status_code == 200
    data = res.json()["data"]
    assert data["name"] == "Paneer Tikka Angara"
    assert data["dietary_type"] == "VEG"
