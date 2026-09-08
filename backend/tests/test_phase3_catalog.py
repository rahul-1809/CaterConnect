"""
CaterConnect Backend — Phase 3 Catalog Management Test Suite
Covers CRUD operations, slug generation, enable/disable, package-item constraints,
and authorization enforcement for all catalog entities.
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_session_token
from app.models.user import Caterer, CatererAdmin, User, UserRole


# ---------------------------------------------------------------------------
# Fixtures: Admin user + caterer setup
# ---------------------------------------------------------------------------

@pytest.fixture
async def caterer(db_session: AsyncSession) -> Caterer:
    """Create a test caterer business."""
    c = Caterer(
        business_name="Test Caterers Pvt Ltd",
        phone_number="+919900000001",
        email="test@caterer.com",
        is_active=True,
    )
    db_session.add(c)
    await db_session.commit()
    await db_session.refresh(c)
    return c


@pytest.fixture
async def admin_user(db_session: AsyncSession, caterer: Caterer) -> User:
    """Create an admin user linked to the caterer."""
    user = User(
        phone_number="+919900000002",
        phone_country_code="+91",
        role=UserRole.ADMIN.value,
        is_active=True,
    )
    db_session.add(user)
    await db_session.flush()

    link = CatererAdmin(caterer_id=caterer.id, user_id=user.id)
    db_session.add(link)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest.fixture
async def customer_user(db_session: AsyncSession) -> User:
    """Create a non-admin customer user."""
    user = User(
        phone_number="+919900000003",
        phone_country_code="+91",
        role=UserRole.CUSTOMER.value,
        is_active=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest.fixture
def admin_token(admin_user: User) -> str:
    return create_session_token(user_id=admin_user.id, role=admin_user.role)


@pytest.fixture
def customer_token(customer_user: User) -> str:
    return create_session_token(user_id=customer_user.id, role=customer_user.role)


def auth_headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


# ===========================================================================
# FUNCTION TYPES
# ===========================================================================

@pytest.mark.asyncio
async def test_create_function_type(client: AsyncClient, admin_token: str):
    """Admin can create a function type."""
    r = await client.post(
        "/api/v1/admin/functions",
        json={"name": "Wedding", "description": "Wedding events", "sort_order": 1},
        headers=auth_headers(admin_token),
    )
    assert r.status_code == 201, r.text
    data = r.json()["data"]
    assert data["name"] == "Wedding"
    assert data["slug"] == "wedding"
    assert data["is_active"] is True


@pytest.mark.asyncio
async def test_create_function_type_slug_uniqueness(client: AsyncClient, admin_token: str):
    """Creating two function types with the same name should produce unique slugs."""
    r1 = await client.post(
        "/api/v1/admin/functions",
        json={"name": "Birthday"},
        headers=auth_headers(admin_token),
    )
    r2 = await client.post(
        "/api/v1/admin/functions",
        json={"name": "Birthday"},
        headers=auth_headers(admin_token),
    )
    assert r1.status_code == 201
    assert r2.status_code == 201
    assert r1.json()["data"]["slug"] != r2.json()["data"]["slug"]


@pytest.mark.asyncio
async def test_list_function_types_active_only(client: AsyncClient, admin_token: str):
    """List endpoint only returns active function types by default."""
    # Create active
    await client.post(
        "/api/v1/admin/functions",
        json={"name": "Active FT", "is_active": True},
        headers=auth_headers(admin_token),
    )
    # Create and deactivate
    r_create = await client.post(
        "/api/v1/admin/functions",
        json={"name": "Inactive FT", "is_active": True},
        headers=auth_headers(admin_token),
    )
    ft_id = r_create.json()["data"]["id"]
    await client.patch(
        f"/api/v1/admin/functions/{ft_id}",
        json={"is_active": False},
        headers=auth_headers(admin_token),
    )

    r = await client.get("/api/v1/admin/functions", headers=auth_headers(admin_token))
    assert r.status_code == 200
    names = [item["name"] for item in r.json()["data"]]
    assert "Inactive FT" not in names


@pytest.mark.asyncio
async def test_update_function_type(client: AsyncClient, admin_token: str):
    """Admin can update name and is_active for a function type."""
    r = await client.post(
        "/api/v1/admin/functions",
        json={"name": "Corporate"},
        headers=auth_headers(admin_token),
    )
    ft_id = r.json()["data"]["id"]

    r2 = await client.patch(
        f"/api/v1/admin/functions/{ft_id}",
        json={"name": "Corporate Events", "is_active": False},
        headers=auth_headers(admin_token),
    )
    assert r2.status_code == 200
    data = r2.json()["data"]
    assert data["name"] == "Corporate Events"
    assert data["slug"] == "corporate-events"
    assert data["is_active"] is False


@pytest.mark.asyncio
async def test_customer_cannot_access_admin_functions(client: AsyncClient, customer_token: str):
    """Customer role must receive 403 on admin endpoints."""
    r = await client.get("/api/v1/admin/functions", headers=auth_headers(customer_token))
    assert r.status_code == 403


@pytest.mark.asyncio
async def test_unauthenticated_cannot_access_admin(client: AsyncClient):
    """Unauthenticated requests must receive 401 on admin endpoints."""
    r = await client.get("/api/v1/admin/functions")
    assert r.status_code == 401


# ===========================================================================
# CATERING OFFERINGS
# ===========================================================================

@pytest.mark.asyncio
async def test_create_and_list_offerings(client: AsyncClient, admin_token: str):
    """Admin can create and list catering offerings."""
    r = await client.post(
        "/api/v1/admin/offerings",
        json={"name": "Dinner", "description": "Full dinner service", "sort_order": 1},
        headers=auth_headers(admin_token),
    )
    assert r.status_code == 201
    data = r.json()["data"]
    assert data["name"] == "Dinner"
    assert data["slug"] == "dinner"

    r_list = await client.get("/api/v1/admin/offerings", headers=auth_headers(admin_token))
    assert r_list.status_code == 200
    assert any(o["slug"] == "dinner" for o in r_list.json()["data"])


@pytest.mark.asyncio
async def test_link_offering_to_function(client: AsyncClient, admin_token: str):
    """Admin can link an offering to a function type."""
    r_ft = await client.post(
        "/api/v1/admin/functions",
        json={"name": "Anniversary"},
        headers=auth_headers(admin_token),
    )
    ft_id = r_ft.json()["data"]["id"]

    r_off = await client.post(
        "/api/v1/admin/offerings",
        json={"name": "Lunch"},
        headers=auth_headers(admin_token),
    )
    off_id = r_off.json()["data"]["id"]

    r_link = await client.post(
        f"/api/v1/admin/functions/{ft_id}/offerings",
        json={"offering_id": off_id},
        headers=auth_headers(admin_token),
    )
    assert r_link.status_code == 201
    assert r_link.json()["data"]["offering_id"] == off_id


@pytest.mark.asyncio
async def test_duplicate_link_returns_409(client: AsyncClient, admin_token: str):
    """Linking the same offering twice to a function type returns 409."""
    r_ft = await client.post(
        "/api/v1/admin/functions",
        json={"name": "DupTest"},
        headers=auth_headers(admin_token),
    )
    ft_id = r_ft.json()["data"]["id"]
    r_off = await client.post(
        "/api/v1/admin/offerings",
        json={"name": "DupLunch"},
        headers=auth_headers(admin_token),
    )
    off_id = r_off.json()["data"]["id"]

    await client.post(
        f"/api/v1/admin/functions/{ft_id}/offerings",
        json={"offering_id": off_id},
        headers=auth_headers(admin_token),
    )
    r_dup = await client.post(
        f"/api/v1/admin/functions/{ft_id}/offerings",
        json={"offering_id": off_id},
        headers=auth_headers(admin_token),
    )
    assert r_dup.status_code == 409


# ===========================================================================
# MENU CATEGORIES
# ===========================================================================

@pytest.mark.asyncio
async def test_create_menu_category(client: AsyncClient, admin_token: str):
    """Admin can create a menu category."""
    r = await client.post(
        "/api/v1/admin/menu/categories",
        json={"name": "Starters", "description": "Appetizers and starters", "sort_order": 1},
        headers=auth_headers(admin_token),
    )
    assert r.status_code == 201
    data = r.json()["data"]
    assert data["name"] == "Starters"
    assert data["slug"] == "starters"


@pytest.mark.asyncio
async def test_deactivate_menu_category(client: AsyncClient, admin_token: str):
    """Admin can deactivate a menu category (soft delete)."""
    r = await client.post(
        "/api/v1/admin/menu/categories",
        json={"name": "Old Category"},
        headers=auth_headers(admin_token),
    )
    cat_id = r.json()["data"]["id"]
    r2 = await client.patch(
        f"/api/v1/admin/menu/categories/{cat_id}",
        json={"is_active": False},
        headers=auth_headers(admin_token),
    )
    assert r2.status_code == 200
    assert r2.json()["data"]["is_active"] is False

    # Should not appear in default list
    r_list = await client.get("/api/v1/admin/menu/categories", headers=auth_headers(admin_token))
    ids = [c["id"] for c in r_list.json()["data"]]
    assert cat_id not in ids


# ===========================================================================
# MENU ITEMS
# ===========================================================================

@pytest.mark.asyncio
async def test_create_menu_item(client: AsyncClient, admin_token: str):
    """Admin can create a menu item linked to an existing category."""
    r_cat = await client.post(
        "/api/v1/admin/menu/categories",
        json={"name": "Main Course"},
        headers=auth_headers(admin_token),
    )
    cat_id = r_cat.json()["data"]["id"]

    r_item = await client.post(
        "/api/v1/admin/menu/items",
        json={
            "category_id": cat_id,
            "name": "Paneer Butter Masala",
            "dietary_type": "VEG",
            "sort_order": 1,
        },
        headers=auth_headers(admin_token),
    )
    assert r_item.status_code == 201
    data = r_item.json()["data"]
    assert data["name"] == "Paneer Butter Masala"
    assert data["dietary_type"] == "VEG"
    assert data["slug"] == "paneer-butter-masala"


@pytest.mark.asyncio
async def test_menu_item_invalid_category(client: AsyncClient, admin_token: str):
    """Creating a menu item with a non-existent category returns 404."""
    r = await client.post(
        "/api/v1/admin/menu/items",
        json={
            "category_id": "00000000-0000-0000-0000-000000000000",
            "name": "Ghost Item",
        },
        headers=auth_headers(admin_token),
    )
    assert r.status_code == 404


@pytest.mark.asyncio
async def test_list_menu_items_by_category(client: AsyncClient, admin_token: str):
    """Listing menu items can be filtered by category_id."""
    r_cat1 = await client.post(
        "/api/v1/admin/menu/categories",
        json={"name": "Desserts"},
        headers=auth_headers(admin_token),
    )
    cat1_id = r_cat1.json()["data"]["id"]

    r_cat2 = await client.post(
        "/api/v1/admin/menu/categories",
        json={"name": "Soups"},
        headers=auth_headers(admin_token),
    )
    cat2_id = r_cat2.json()["data"]["id"]

    await client.post(
        "/api/v1/admin/menu/items",
        json={"category_id": cat1_id, "name": "Gulab Jamun"},
        headers=auth_headers(admin_token),
    )
    await client.post(
        "/api/v1/admin/menu/items",
        json={"category_id": cat2_id, "name": "Tomato Soup"},
        headers=auth_headers(admin_token),
    )

    r_list = await client.get(
        f"/api/v1/admin/menu/items?category_id={cat1_id}",
        headers=auth_headers(admin_token),
    )
    names = [item["name"] for item in r_list.json()["data"]]
    assert "Gulab Jamun" in names
    assert "Tomato Soup" not in names


# ===========================================================================
# PACKAGES
# ===========================================================================

@pytest.fixture
async def category_and_item(client: AsyncClient, admin_token: str):
    """Helper: creates a category and a menu item, returns their IDs."""
    r_cat = await client.post(
        "/api/v1/admin/menu/categories",
        json={"name": "Fixture Category"},
        headers=auth_headers(admin_token),
    )
    cat_id = r_cat.json()["data"]["id"]
    r_item = await client.post(
        "/api/v1/admin/menu/items",
        json={"category_id": cat_id, "name": "Fixture Item"},
        headers=auth_headers(admin_token),
    )
    item_id = r_item.json()["data"]["id"]
    return cat_id, item_id


@pytest.mark.asyncio
async def test_create_package(client: AsyncClient, admin_token: str):
    """Admin can create a package with guest limits."""
    r = await client.post(
        "/api/v1/admin/packages",
        json={
            "name": "Gold Package",
            "description": "Premium wedding package",
            "min_guests": 100,
            "max_guests": 500,
        },
        headers=auth_headers(admin_token),
    )
    assert r.status_code == 201
    data = r.json()["data"]
    assert data["name"] == "Gold Package"
    assert data["min_guests"] == 100
    assert data["max_guests"] == 500


@pytest.mark.asyncio
async def test_package_invalid_guest_limits(client: AsyncClient, admin_token: str):
    """Creating a package where max_guests < min_guests fails validation."""
    r = await client.post(
        "/api/v1/admin/packages",
        json={"name": "Bad Package", "min_guests": 500, "max_guests": 100},
        headers=auth_headers(admin_token),
    )
    assert r.status_code == 422


@pytest.mark.asyncio
async def test_add_item_to_package(client: AsyncClient, admin_token: str, category_and_item):
    """Admin can add a menu item to a package."""
    _, item_id = category_and_item
    r_pkg = await client.post(
        "/api/v1/admin/packages",
        json={"name": "Test Package"},
        headers=auth_headers(admin_token),
    )
    pkg_id = r_pkg.json()["data"]["id"]

    r_add = await client.post(
        f"/api/v1/admin/packages/{pkg_id}/items",
        json={"menu_item_id": item_id, "inclusion_type": "MANDATORY"},
        headers=auth_headers(admin_token),
    )
    assert r_add.status_code == 201
    assert r_add.json()["data"]["inclusion_type"] == "MANDATORY"


@pytest.mark.asyncio
async def test_add_duplicate_item_to_package_returns_409(
    client: AsyncClient, admin_token: str, category_and_item
):
    """Adding the same item twice to a package returns 409."""
    _, item_id = category_and_item
    r_pkg = await client.post(
        "/api/v1/admin/packages",
        json={"name": "Dup Item Package"},
        headers=auth_headers(admin_token),
    )
    pkg_id = r_pkg.json()["data"]["id"]

    await client.post(
        f"/api/v1/admin/packages/{pkg_id}/items",
        json={"menu_item_id": item_id, "inclusion_type": "INCLUDED"},
        headers=auth_headers(admin_token),
    )
    r_dup = await client.post(
        f"/api/v1/admin/packages/{pkg_id}/items",
        json={"menu_item_id": item_id, "inclusion_type": "INCLUDED"},
        headers=auth_headers(admin_token),
    )
    assert r_dup.status_code == 409


@pytest.mark.asyncio
async def test_remove_item_from_package(
    client: AsyncClient, admin_token: str, category_and_item
):
    """Admin can remove an item from a package."""
    _, item_id = category_and_item
    r_pkg = await client.post(
        "/api/v1/admin/packages",
        json={"name": "Remove Item Package"},
        headers=auth_headers(admin_token),
    )
    pkg_id = r_pkg.json()["data"]["id"]

    r_add = await client.post(
        f"/api/v1/admin/packages/{pkg_id}/items",
        json={"menu_item_id": item_id, "inclusion_type": "INCLUDED"},
        headers=auth_headers(admin_token),
    )
    pkg_item_id = r_add.json()["data"]["id"]

    r_del = await client.delete(
        f"/api/v1/admin/packages/{pkg_id}/items/{pkg_item_id}",
        headers=auth_headers(admin_token),
    )
    assert r_del.status_code == 204


@pytest.mark.asyncio
async def test_create_selection_group_in_package(
    client: AsyncClient, admin_token: str, category_and_item
):
    """Admin can create a selection group with min/max validation."""
    _, item_id = category_and_item
    r_pkg = await client.post(
        "/api/v1/admin/packages",
        json={"name": "Selection Group Package"},
        headers=auth_headers(admin_token),
    )
    pkg_id = r_pkg.json()["data"]["id"]

    r_grp = await client.post(
        f"/api/v1/admin/packages/{pkg_id}/selection-groups",
        json={
            "name": "Choose Your Starters",
            "min_selections": 2,
            "max_selections": 4,
            "is_required": True,
        },
        headers=auth_headers(admin_token),
    )
    assert r_grp.status_code == 201
    data = r_grp.json()["data"]
    assert data["min_selections"] == 2
    assert data["max_selections"] == 4
    assert data["is_required"] is True


@pytest.mark.asyncio
async def test_selection_group_invalid_range(client: AsyncClient, admin_token: str):
    """Creating a selection group with max < min fails validation."""
    r_pkg = await client.post(
        "/api/v1/admin/packages",
        json={"name": "Invalid SG Package"},
        headers=auth_headers(admin_token),
    )
    pkg_id = r_pkg.json()["data"]["id"]

    r_grp = await client.post(
        f"/api/v1/admin/packages/{pkg_id}/selection-groups",
        json={"name": "Bad Group", "min_selections": 5, "max_selections": 2},
        headers=auth_headers(admin_token),
    )
    assert r_grp.status_code == 422


@pytest.mark.asyncio
async def test_add_addon_to_package(
    client: AsyncClient, admin_token: str, category_and_item
):
    """Admin can add a paid addon to a package."""
    _, item_id = category_and_item
    r_pkg = await client.post(
        "/api/v1/admin/packages",
        json={"name": "Addon Package"},
        headers=auth_headers(admin_token),
    )
    pkg_id = r_pkg.json()["data"]["id"]

    r_addon = await client.post(
        f"/api/v1/admin/packages/{pkg_id}/addons",
        json={"menu_item_id": item_id, "display_name": "Extra Dessert Plate"},
        headers=auth_headers(admin_token),
    )
    assert r_addon.status_code == 201
    assert r_addon.json()["data"]["display_name"] == "Extra Dessert Plate"


@pytest.mark.asyncio
async def test_get_package_detail(
    client: AsyncClient, admin_token: str, category_and_item
):
    """Package detail endpoint returns nested items, groups, and addons."""
    _, item_id = category_and_item
    r_pkg = await client.post(
        "/api/v1/admin/packages",
        json={"name": "Detail Package"},
        headers=auth_headers(admin_token),
    )
    pkg_id = r_pkg.json()["data"]["id"]

    await client.post(
        f"/api/v1/admin/packages/{pkg_id}/items",
        json={"menu_item_id": item_id, "inclusion_type": "INCLUDED"},
        headers=auth_headers(admin_token),
    )

    r_detail = await client.get(
        f"/api/v1/admin/packages/{pkg_id}",
        headers=auth_headers(admin_token),
    )
    assert r_detail.status_code == 200
    data = r_detail.json()["data"]
    assert "package_items" in data
    assert len(data["package_items"]) == 1
    assert "selection_groups" in data
    assert "addons" in data


@pytest.mark.asyncio
async def test_deactivate_package(client: AsyncClient, admin_token: str):
    """Admin can deactivate a package (soft delete)."""
    r = await client.post(
        "/api/v1/admin/packages",
        json={"name": "Deactivate Me"},
        headers=auth_headers(admin_token),
    )
    pkg_id = r.json()["data"]["id"]

    r2 = await client.patch(
        f"/api/v1/admin/packages/{pkg_id}",
        json={"is_active": False},
        headers=auth_headers(admin_token),
    )
    assert r2.status_code == 200
    assert r2.json()["data"]["is_active"] is False

    r_list = await client.get("/api/v1/admin/packages", headers=auth_headers(admin_token))
    ids = [p["id"] for p in r_list.json()["data"]]
    assert pkg_id not in ids
