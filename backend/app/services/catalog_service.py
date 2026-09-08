"""
CaterConnect Backend — Catalog Service Layer
Business logic: resolves caterer context, delegates to repository, handles auth.
"""

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import get_logger
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
from app.models.user import CatererAdmin, User
from app.repositories import catalog as repo

logger = get_logger(__name__)


# ---------------------------------------------------------------------------
# Caterer resolution helpers
# ---------------------------------------------------------------------------


async def resolve_caterer_id(db: AsyncSession, user: User) -> str:
    """
    For ADMIN/STAFF users, return the caterer_id they are associated with.
    Raises 403 if the user is not an admin of any caterer.
    """
    stmt = select(CatererAdmin).where(CatererAdmin.user_id == user.id)
    result = await db.execute(stmt)
    admin_link = result.scalar_one_or_none()
    if not admin_link:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "NOT_A_CATERER_ADMIN",
                "message": "You are not associated with any catering business.",
            },
        )
    return admin_link.caterer_id


# ---------------------------------------------------------------------------
# Function Types
# ---------------------------------------------------------------------------


async def list_function_types(
    db: AsyncSession,
    caterer_id: str,
    include_inactive: bool = False,
) -> list[FunctionType]:
    return await repo.list_function_types(db, caterer_id, include_inactive)


async def create_function_type(
    db: AsyncSession,
    caterer_id: str,
    name: str,
    description: str | None = None,
    image_url: str | None = None,
    is_active: bool = True,
    sort_order: int = 0,
) -> FunctionType:
    return await repo.create_function_type(
        db, caterer_id, name, description, image_url, is_active, sort_order
    )


async def update_function_type(
    db: AsyncSession,
    caterer_id: str,
    function_type_id: str,
    **kwargs,
) -> FunctionType:
    obj = await repo.get_function_type_or_404(db, function_type_id, caterer_id)
    return await repo.update_function_type(db, obj, **kwargs)


# ---------------------------------------------------------------------------
# Catering Offerings
# ---------------------------------------------------------------------------


async def list_offerings(
    db: AsyncSession,
    caterer_id: str,
    include_inactive: bool = False,
) -> list[CateringOffering]:
    return await repo.list_offerings(db, caterer_id, include_inactive)


async def create_offering(
    db: AsyncSession,
    caterer_id: str,
    name: str,
    description: str | None = None,
    image_url: str | None = None,
    is_active: bool = True,
    sort_order: int = 0,
) -> CateringOffering:
    return await repo.create_offering(
        db, caterer_id, name, description, image_url, is_active, sort_order
    )


async def update_offering(
    db: AsyncSession,
    caterer_id: str,
    offering_id: str,
    **kwargs,
) -> CateringOffering:
    obj = await repo.get_offering_or_404(db, offering_id, caterer_id)
    return await repo.update_offering(db, obj, **kwargs)


async def link_function_offering(
    db: AsyncSession,
    caterer_id: str,
    function_type_id: str,
    offering_id: str,
) -> FunctionOffering:
    fn = await repo.get_function_type_or_404(db, function_type_id, caterer_id)
    return await repo.add_function_offering_link(db, fn, offering_id)


async def unlink_function_offering(
    db: AsyncSession,
    caterer_id: str,
    function_type_id: str,
    offering_id: str,
) -> None:
    await repo.get_function_type_or_404(db, function_type_id, caterer_id)
    await repo.remove_function_offering_link(db, function_type_id, offering_id)


# ---------------------------------------------------------------------------
# Menu Categories
# ---------------------------------------------------------------------------


async def list_menu_categories(
    db: AsyncSession,
    caterer_id: str,
    include_inactive: bool = False,
) -> list[MenuCategory]:
    return await repo.list_menu_categories(db, caterer_id, include_inactive)


async def create_menu_category(
    db: AsyncSession,
    caterer_id: str,
    name: str,
    description: str | None = None,
    sort_order: int = 0,
    is_active: bool = True,
) -> MenuCategory:
    return await repo.create_menu_category(db, caterer_id, name, description, sort_order, is_active)


async def update_menu_category(
    db: AsyncSession,
    caterer_id: str,
    category_id: str,
    **kwargs,
) -> MenuCategory:
    obj = await repo.get_menu_category_or_404(db, category_id, caterer_id)
    return await repo.update_menu_category(db, obj, **kwargs)


# ---------------------------------------------------------------------------
# Menu Items
# ---------------------------------------------------------------------------


async def list_menu_items(
    db: AsyncSession,
    caterer_id: str,
    category_id: str | None = None,
    include_inactive: bool = False,
) -> list[MenuItem]:
    return await repo.list_menu_items(db, caterer_id, category_id, include_inactive)


async def create_menu_item(
    db: AsyncSession,
    caterer_id: str,
    category_id: str,
    name: str,
    description: str | None = None,
    dietary_type: str | None = None,
    image_url: str | None = None,
    is_active: bool = True,
    sort_order: int = 0,
    extra_metadata: dict | None = None,
) -> MenuItem:
    return await repo.create_menu_item(
        db,
        caterer_id,
        category_id,
        name,
        description,
        dietary_type,
        image_url,
        is_active,
        sort_order,
        extra_metadata,
    )


async def update_menu_item(
    db: AsyncSession,
    caterer_id: str,
    item_id: str,
    **kwargs,
) -> MenuItem:
    obj = await repo.get_menu_item_or_404(db, item_id, caterer_id)
    return await repo.update_menu_item(db, obj, caterer_id, **kwargs)


# ---------------------------------------------------------------------------
# Packages
# ---------------------------------------------------------------------------


async def list_packages(
    db: AsyncSession,
    caterer_id: str,
    include_inactive: bool = False,
) -> list[Package]:
    return await repo.list_packages(db, caterer_id, include_inactive)


async def create_package(
    db: AsyncSession,
    caterer_id: str,
    name: str,
    description: str | None = None,
    image_url: str | None = None,
    min_guests: int | None = None,
    max_guests: int | None = None,
    is_active: bool = True,
    sort_order: int = 0,
) -> Package:
    return await repo.create_package(
        db,
        caterer_id,
        name,
        description,
        image_url,
        min_guests,
        max_guests,
        is_active,
        sort_order,
    )


async def update_package(
    db: AsyncSession,
    caterer_id: str,
    package_id: str,
    **kwargs,
) -> Package:
    obj = await repo.get_package_or_404(db, package_id, caterer_id)
    return await repo.update_package(db, obj, **kwargs)


async def get_package_detail(db: AsyncSession, caterer_id: str, package_id: str) -> Package:
    return await repo.get_package_or_404(db, package_id, caterer_id, load_relations=True)


# ---------------------------------------------------------------------------
# Package Items
# ---------------------------------------------------------------------------


async def add_package_item(
    db: AsyncSession,
    caterer_id: str,
    package_id: str,
    menu_item_id: str,
    inclusion_type: str,
    sort_order: int,
) -> PackageItem:
    pkg = await repo.get_package_or_404(db, package_id, caterer_id)
    return await repo.add_package_item(db, pkg, menu_item_id, inclusion_type, sort_order)


async def remove_package_item(
    db: AsyncSession, caterer_id: str, package_id: str, item_id: str
) -> None:
    await repo.get_package_or_404(db, package_id, caterer_id)
    await repo.remove_package_item(db, package_id, item_id)


# ---------------------------------------------------------------------------
# Package Selection Groups
# ---------------------------------------------------------------------------


async def create_selection_group(
    db: AsyncSession,
    caterer_id: str,
    package_id: str,
    name: str,
    description: str | None,
    min_selections: int,
    max_selections: int,
    sort_order: int,
    is_required: bool,
) -> PackageSelectionGroup:
    pkg = await repo.get_package_or_404(db, package_id, caterer_id)
    return await repo.create_selection_group(
        db,
        pkg,
        name,
        description,
        min_selections,
        max_selections,
        sort_order,
        is_required,
    )


async def update_selection_group(
    db: AsyncSession,
    caterer_id: str,
    package_id: str,
    group_id: str,
    **kwargs,
) -> PackageSelectionGroup:
    await repo.get_package_or_404(db, package_id, caterer_id)
    obj = await repo.get_selection_group_or_404(db, group_id, package_id)
    return await repo.update_selection_group(db, obj, **kwargs)


async def add_selection_group_item(
    db: AsyncSession,
    caterer_id: str,
    package_id: str,
    group_id: str,
    menu_item_id: str,
) -> PackageSelectionGroupItem:
    await repo.get_package_or_404(db, package_id, caterer_id)
    group = await repo.get_selection_group_or_404(db, group_id, package_id)
    return await repo.add_selection_group_item(db, group, menu_item_id, caterer_id)


async def remove_selection_group_item(
    db: AsyncSession,
    caterer_id: str,
    package_id: str,
    group_id: str,
    item_id: str,
) -> None:
    await repo.get_package_or_404(db, package_id, caterer_id)
    await repo.get_selection_group_or_404(db, group_id, package_id)
    await repo.remove_selection_group_item(db, group_id, item_id)


# ---------------------------------------------------------------------------
# Package Addons
# ---------------------------------------------------------------------------


async def add_package_addon(
    db: AsyncSession,
    caterer_id: str,
    package_id: str,
    menu_item_id: str,
    display_name: str | None,
    is_active: bool,
    sort_order: int,
) -> PackageAddon:
    pkg = await repo.get_package_or_404(db, package_id, caterer_id)
    return await repo.add_package_addon(db, pkg, menu_item_id, display_name, is_active, sort_order)


async def remove_package_addon(
    db: AsyncSession, caterer_id: str, package_id: str, addon_id: str
) -> None:
    await repo.get_package_or_404(db, package_id, caterer_id)
    await repo.remove_package_addon(db, package_id, addon_id)


# ---------------------------------------------------------------------------
# Customer Browsing Services (Phase 4)
# ---------------------------------------------------------------------------


async def resolve_public_caterer_id(db: AsyncSession, caterer_id: str | None = None) -> str:
    return await repo.resolve_public_caterer_id(db, caterer_id)


async def list_public_function_types(
    db: AsyncSession, caterer_id: str, include_inactive: bool = False
) -> list[FunctionType]:
    return await repo.list_function_types(db, caterer_id, include_inactive)


async def get_public_function_type(
    db: AsyncSession, function_type_id: str, caterer_id: str
) -> FunctionType:
    return await repo.get_function_type_or_404(db, function_type_id, caterer_id)


async def list_public_offerings_for_function(
    db: AsyncSession, function_type_id: str, caterer_id: str
) -> list[CateringOffering]:
    return await repo.list_offerings_for_function(
        db, function_type_id, caterer_id, include_inactive=False
    )


async def list_public_offerings(db: AsyncSession, caterer_id: str) -> list[CateringOffering]:
    return await repo.list_offerings(db, caterer_id, include_inactive=False)


async def get_public_offering(
    db: AsyncSession, offering_id: str, caterer_id: str
) -> CateringOffering:
    return await repo.get_offering_or_404(db, offering_id, caterer_id)


async def list_public_packages(
    db: AsyncSession,
    caterer_id: str,
    function_id: str | None = None,
    offering_id: str | None = None,
    guest_count: int | None = None,
    search: str | None = None,
    page: int = 1,
    page_size: int = 50,
) -> list[Package]:
    return await repo.list_packages_filtered(
        db,
        caterer_id=caterer_id,
        function_id=function_id,
        offering_id=offering_id,
        guest_count=guest_count,
        search=search,
        include_inactive=False,
        page=page,
        page_size=page_size,
    )


async def get_public_package(db: AsyncSession, package_id: str, caterer_id: str) -> Package:
    return await repo.get_package_or_404(db, package_id, caterer_id, load_relations=True)


async def list_public_menu_categories(db: AsyncSession, caterer_id: str) -> list[MenuCategory]:
    return await repo.list_menu_categories(db, caterer_id, include_inactive=False)


async def list_public_menu_items(
    db: AsyncSession,
    caterer_id: str,
    category_id: str | None = None,
    dietary_type: str | None = None,
    function_id: str | None = None,
    offering_id: str | None = None,
    search: str | None = None,
    page: int = 1,
    page_size: int = 50,
) -> list[MenuItem]:
    return await repo.list_menu_items_filtered(
        db,
        caterer_id=caterer_id,
        category_id=category_id,
        dietary_type=dietary_type,
        function_id=function_id,
        offering_id=offering_id,
        search=search,
        include_inactive=False,
        page=page,
        page_size=page_size,
    )


async def get_public_menu_item(db: AsyncSession, item_id: str, caterer_id: str) -> MenuItem:
    return await repo.get_menu_item_or_404(db, item_id, caterer_id)
