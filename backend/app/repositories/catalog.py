"""
CaterConnect Backend — Catalog Repository
Async CRUD operations for all catalog entities using SQLAlchemy.
"""

import re

from fastapi import HTTPException, status
from sqlalchemy import and_, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.logging import get_logger
from app.models.catalog import (
    CateringOffering,
    FunctionOffering,
    FunctionType,
    MenuCategory,
    MenuItem,
    MenuItemFunction,
    MenuItemOffering,
    Package,
    PackageAddon,
    PackageFunction,
    PackageItem,
    PackageOffering,
    PackageSelectionGroup,
    PackageSelectionGroupItem,
)
from app.models.user import Caterer

logger = get_logger(__name__)


# ---------------------------------------------------------------------------
# Slug helpers
# ---------------------------------------------------------------------------


def _make_slug(name: str) -> str:
    """Generate a URL-safe slug from a name string."""
    slug = name.lower().strip()
    slug = re.sub(r"[^\w\s-]", "", slug)
    slug = re.sub(r"[\s_]+", "-", slug)
    slug = re.sub(r"-+", "-", slug).strip("-")
    return slug[:220]


async def _ensure_unique_slug(
    db: AsyncSession,
    model,
    caterer_id: str,
    base_slug: str,
    exclude_id: str | None = None,
) -> str:
    """Return a slug that is unique within (caterer_id, slug). Appends -N if needed."""
    slug = base_slug
    counter = 1
    while True:
        stmt = select(model).where(
            model.caterer_id == caterer_id,
            model.slug == slug,
        )
        if exclude_id:
            stmt = stmt.where(model.id != exclude_id)
        result = await db.execute(stmt)
        existing = result.scalar_one_or_none()
        if not existing:
            return slug
        slug = f"{base_slug}-{counter}"
        counter += 1


# ---------------------------------------------------------------------------
# Function Types
# ---------------------------------------------------------------------------


async def list_function_types(
    db: AsyncSession,
    caterer_id: str,
    include_inactive: bool = False,
) -> list[FunctionType]:
    stmt = select(FunctionType).where(FunctionType.caterer_id == caterer_id)
    if not include_inactive:
        stmt = stmt.where(FunctionType.is_active == True)  # noqa: E712
    stmt = stmt.order_by(FunctionType.sort_order, FunctionType.name)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_function_type_or_404(
    db: AsyncSession, function_type_id: str, caterer_id: str
) -> FunctionType:
    stmt = select(FunctionType).where(
        FunctionType.id == function_type_id,
        FunctionType.caterer_id == caterer_id,
    )
    result = await db.execute(stmt)
    obj = result.scalar_one_or_none()
    if not obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "FUNCTION_TYPE_NOT_FOUND",
                "message": "Function type not found.",
            },
        )
    return obj


async def create_function_type(
    db: AsyncSession,
    caterer_id: str,
    name: str,
    description: str | None,
    image_url: str | None,
    is_active: bool,
    sort_order: int,
) -> FunctionType:
    slug = await _ensure_unique_slug(db, FunctionType, caterer_id, _make_slug(name))
    obj = FunctionType(
        caterer_id=caterer_id,
        name=name,
        slug=slug,
        description=description,
        image_url=image_url,
        is_active=is_active,
        sort_order=sort_order,
    )
    db.add(obj)
    await db.commit()
    await db.refresh(obj)
    logger.info("function_type_created", id=obj.id, caterer_id=caterer_id, name=name)
    return obj


async def update_function_type(
    db: AsyncSession,
    obj: FunctionType,
    **kwargs,
) -> FunctionType:
    for field, value in kwargs.items():
        if value is not None or field in ("description", "image_url"):
            if field == "name" and value:
                new_slug = await _ensure_unique_slug(
                    db,
                    FunctionType,
                    obj.caterer_id,
                    _make_slug(value),
                    exclude_id=obj.id,
                )
                obj.slug = new_slug
            if value is not None:
                setattr(obj, field, value)
    await db.commit()
    await db.refresh(obj)
    return obj


# ---------------------------------------------------------------------------
# Catering Offerings
# ---------------------------------------------------------------------------


async def list_offerings(
    db: AsyncSession,
    caterer_id: str,
    include_inactive: bool = False,
) -> list[CateringOffering]:
    stmt = select(CateringOffering).where(CateringOffering.caterer_id == caterer_id)
    if not include_inactive:
        stmt = stmt.where(CateringOffering.is_active == True)  # noqa: E712
    stmt = stmt.order_by(CateringOffering.sort_order, CateringOffering.name)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_offering_or_404(
    db: AsyncSession, offering_id: str, caterer_id: str
) -> CateringOffering:
    stmt = select(CateringOffering).where(
        CateringOffering.id == offering_id,
        CateringOffering.caterer_id == caterer_id,
    )
    result = await db.execute(stmt)
    obj = result.scalar_one_or_none()
    if not obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "OFFERING_NOT_FOUND",
                "message": "Catering offering not found.",
            },
        )
    return obj


async def create_offering(
    db: AsyncSession,
    caterer_id: str,
    name: str,
    description: str | None,
    image_url: str | None,
    is_active: bool,
    sort_order: int,
) -> CateringOffering:
    slug = await _ensure_unique_slug(db, CateringOffering, caterer_id, _make_slug(name))
    obj = CateringOffering(
        caterer_id=caterer_id,
        name=name,
        slug=slug,
        description=description,
        image_url=image_url,
        is_active=is_active,
        sort_order=sort_order,
    )
    db.add(obj)
    await db.commit()
    await db.refresh(obj)
    logger.info("offering_created", id=obj.id, caterer_id=caterer_id, name=name)
    return obj


async def update_offering(
    db: AsyncSession,
    obj: CateringOffering,
    **kwargs,
) -> CateringOffering:
    for field, value in kwargs.items():
        if field == "name" and value:
            new_slug = await _ensure_unique_slug(
                db,
                CateringOffering,
                obj.caterer_id,
                _make_slug(value),
                exclude_id=obj.id,
            )
            obj.slug = new_slug
        if value is not None:
            setattr(obj, field, value)
    await db.commit()
    await db.refresh(obj)
    return obj


# ---------------------------------------------------------------------------
# Function ↔ Offering Links
# ---------------------------------------------------------------------------


async def add_function_offering_link(
    db: AsyncSession,
    function_type: FunctionType,
    offering_id: str,
) -> FunctionOffering:
    # Check offering belongs to same caterer
    offering = await get_offering_or_404(db, offering_id, function_type.caterer_id)

    # Check if link already exists
    stmt = select(FunctionOffering).where(
        FunctionOffering.function_type_id == function_type.id,
        FunctionOffering.offering_id == offering.id,
    )
    result = await db.execute(stmt)
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "code": "LINK_EXISTS",
                "message": "This function-offering link already exists.",
            },
        )

    link = FunctionOffering(
        function_type_id=function_type.id,
        offering_id=offering.id,
    )
    db.add(link)
    await db.commit()
    await db.refresh(link)
    return link


async def remove_function_offering_link(
    db: AsyncSession,
    function_type_id: str,
    offering_id: str,
) -> None:
    stmt = select(FunctionOffering).where(
        FunctionOffering.function_type_id == function_type_id,
        FunctionOffering.offering_id == offering_id,
    )
    result = await db.execute(stmt)
    link = result.scalar_one_or_none()
    if not link:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "LINK_NOT_FOUND",
                "message": "Function-offering link not found.",
            },
        )
    await db.delete(link)
    await db.commit()


# ---------------------------------------------------------------------------
# Menu Categories
# ---------------------------------------------------------------------------


async def list_menu_categories(
    db: AsyncSession,
    caterer_id: str,
    include_inactive: bool = False,
) -> list[MenuCategory]:
    stmt = select(MenuCategory).where(MenuCategory.caterer_id == caterer_id)
    if not include_inactive:
        stmt = stmt.where(MenuCategory.is_active == True)  # noqa: E712
    stmt = stmt.order_by(MenuCategory.sort_order, MenuCategory.name)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_menu_category_or_404(
    db: AsyncSession, category_id: str, caterer_id: str
) -> MenuCategory:
    stmt = select(MenuCategory).where(
        MenuCategory.id == category_id,
        MenuCategory.caterer_id == caterer_id,
    )
    result = await db.execute(stmt)
    obj = result.scalar_one_or_none()
    if not obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "MENU_CATEGORY_NOT_FOUND",
                "message": "Menu category not found.",
            },
        )
    return obj


async def create_menu_category(
    db: AsyncSession,
    caterer_id: str,
    name: str,
    description: str | None,
    sort_order: int,
    is_active: bool,
) -> MenuCategory:
    slug = await _ensure_unique_slug(db, MenuCategory, caterer_id, _make_slug(name))
    obj = MenuCategory(
        caterer_id=caterer_id,
        name=name,
        slug=slug,
        description=description,
        sort_order=sort_order,
        is_active=is_active,
    )
    db.add(obj)
    await db.commit()
    await db.refresh(obj)
    logger.info("menu_category_created", id=obj.id, caterer_id=caterer_id, name=name)
    return obj


async def update_menu_category(
    db: AsyncSession,
    obj: MenuCategory,
    **kwargs,
) -> MenuCategory:
    for field, value in kwargs.items():
        if field == "name" and value:
            new_slug = await _ensure_unique_slug(
                db, MenuCategory, obj.caterer_id, _make_slug(value), exclude_id=obj.id
            )
            obj.slug = new_slug
        if value is not None:
            setattr(obj, field, value)
    await db.commit()
    await db.refresh(obj)
    return obj


# ---------------------------------------------------------------------------
# Menu Items
# ---------------------------------------------------------------------------


async def list_menu_items(
    db: AsyncSession,
    caterer_id: str,
    category_id: str | None = None,
    include_inactive: bool = False,
) -> list[MenuItem]:
    stmt = select(MenuItem).where(MenuItem.caterer_id == caterer_id)
    if category_id:
        stmt = stmt.where(MenuItem.category_id == category_id)
    if not include_inactive:
        stmt = stmt.where(MenuItem.is_active == True)  # noqa: E712
    stmt = stmt.order_by(MenuItem.sort_order, MenuItem.name)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_menu_item_or_404(db: AsyncSession, item_id: str, caterer_id: str) -> MenuItem:
    stmt = select(MenuItem).where(
        MenuItem.id == item_id,
        MenuItem.caterer_id == caterer_id,
    )
    result = await db.execute(stmt)
    obj = result.scalar_one_or_none()
    if not obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "MENU_ITEM_NOT_FOUND", "message": "Menu item not found."},
        )
    return obj


async def create_menu_item(
    db: AsyncSession,
    caterer_id: str,
    category_id: str,
    name: str,
    description: str | None,
    dietary_type: str | None,
    image_url: str | None,
    is_active: bool,
    sort_order: int,
    extra_metadata: dict | None,
) -> MenuItem:
    # Verify category belongs to caterer
    await get_menu_category_or_404(db, category_id, caterer_id)

    slug = await _ensure_unique_slug(db, MenuItem, caterer_id, _make_slug(name))
    obj = MenuItem(
        caterer_id=caterer_id,
        category_id=category_id,
        name=name,
        slug=slug,
        description=description,
        dietary_type=dietary_type,
        image_url=image_url,
        is_active=is_active,
        sort_order=sort_order,
        extra_metadata=extra_metadata,
    )
    db.add(obj)
    await db.commit()
    await db.refresh(obj)
    logger.info("menu_item_created", id=obj.id, caterer_id=caterer_id, name=name)
    return obj


async def update_menu_item(
    db: AsyncSession,
    obj: MenuItem,
    caterer_id: str,
    **kwargs,
) -> MenuItem:
    for field, value in kwargs.items():
        if field == "name" and value:
            new_slug = await _ensure_unique_slug(
                db, MenuItem, caterer_id, _make_slug(value), exclude_id=obj.id
            )
            obj.slug = new_slug
        if field == "category_id" and value:
            await get_menu_category_or_404(db, value, caterer_id)
        if value is not None:
            setattr(obj, field, value)
    await db.commit()
    await db.refresh(obj)
    return obj


# ---------------------------------------------------------------------------
# Packages
# ---------------------------------------------------------------------------


async def list_packages(
    db: AsyncSession,
    caterer_id: str,
    include_inactive: bool = False,
) -> list[Package]:
    stmt = (
        select(Package)
        .where(Package.caterer_id == caterer_id)
        .options(
            selectinload(Package.package_items),
            selectinload(Package.selection_groups).selectinload(PackageSelectionGroup.items),
            selectinload(Package.addons),
        )
    )
    if not include_inactive:
        stmt = stmt.where(Package.is_active == True)  # noqa: E712
    stmt = stmt.order_by(Package.sort_order, Package.name)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_package_or_404(
    db: AsyncSession,
    package_id: str,
    caterer_id: str,
    load_relations: bool = False,
) -> Package:
    stmt = select(Package).where(
        Package.id == package_id,
        Package.caterer_id == caterer_id,
    )
    if load_relations:
        stmt = stmt.options(
            selectinload(Package.package_items),
            selectinload(Package.selection_groups).selectinload(PackageSelectionGroup.items),
            selectinload(Package.addons),
        )
    result = await db.execute(stmt)
    obj = result.scalar_one_or_none()
    if not obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "PACKAGE_NOT_FOUND", "message": "Package not found."},
        )
    return obj


async def create_package(
    db: AsyncSession,
    caterer_id: str,
    name: str,
    description: str | None,
    image_url: str | None,
    min_guests: int | None,
    max_guests: int | None,
    is_active: bool,
    sort_order: int,
) -> Package:
    slug = await _ensure_unique_slug(db, Package, caterer_id, _make_slug(name))
    obj = Package(
        caterer_id=caterer_id,
        name=name,
        slug=slug,
        description=description,
        image_url=image_url,
        min_guests=min_guests,
        max_guests=max_guests,
        is_active=is_active,
        sort_order=sort_order,
    )
    db.add(obj)
    await db.commit()
    await db.refresh(obj)
    logger.info("package_created", id=obj.id, caterer_id=caterer_id, name=name)
    return obj


async def update_package(
    db: AsyncSession,
    obj: Package,
    **kwargs,
) -> Package:
    for field, value in kwargs.items():
        if field == "name" and value:
            new_slug = await _ensure_unique_slug(
                db, Package, obj.caterer_id, _make_slug(value), exclude_id=obj.id
            )
            obj.slug = new_slug
        if value is not None:
            setattr(obj, field, value)
    await db.commit()
    await db.refresh(obj)
    return obj


# ---------------------------------------------------------------------------
# Package Items
# ---------------------------------------------------------------------------


async def add_package_item(
    db: AsyncSession,
    package: Package,
    menu_item_id: str,
    inclusion_type: str,
    sort_order: int,
) -> PackageItem:
    # Verify menu item belongs to caterer
    await get_menu_item_or_404(db, menu_item_id, package.caterer_id)

    # Check for duplicate
    stmt = select(PackageItem).where(
        PackageItem.package_id == package.id,
        PackageItem.menu_item_id == menu_item_id,
    )
    result = await db.execute(stmt)
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "code": "PACKAGE_ITEM_EXISTS",
                "message": "This item is already in the package.",
            },
        )

    item = PackageItem(
        package_id=package.id,
        menu_item_id=menu_item_id,
        inclusion_type=inclusion_type,
        sort_order=sort_order,
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


async def remove_package_item(db: AsyncSession, package_id: str, item_id: str) -> None:
    stmt = select(PackageItem).where(
        PackageItem.id == item_id,
        PackageItem.package_id == package_id,
    )
    result = await db.execute(stmt)
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "PACKAGE_ITEM_NOT_FOUND",
                "message": "Package item not found.",
            },
        )
    await db.delete(item)
    await db.commit()


# ---------------------------------------------------------------------------
# Package Selection Groups
# ---------------------------------------------------------------------------


async def create_selection_group(
    db: AsyncSession,
    package: Package,
    name: str,
    description: str | None,
    min_selections: int,
    max_selections: int,
    sort_order: int,
    is_required: bool,
) -> PackageSelectionGroup:
    group = PackageSelectionGroup(
        package_id=package.id,
        name=name,
        description=description,
        min_selections=min_selections,
        max_selections=max_selections,
        sort_order=sort_order,
        is_required=is_required,
    )
    db.add(group)
    await db.commit()

    # Re-fetch with items loaded eagerly to avoid lazy-load greenlet issues
    stmt = (
        select(PackageSelectionGroup)
        .where(PackageSelectionGroup.id == group.id)
        .options(selectinload(PackageSelectionGroup.items))
    )
    result = await db.execute(stmt)
    return result.scalar_one()


async def get_selection_group_or_404(
    db: AsyncSession, group_id: str, package_id: str
) -> PackageSelectionGroup:
    stmt = (
        select(PackageSelectionGroup)
        .where(
            PackageSelectionGroup.id == group_id,
            PackageSelectionGroup.package_id == package_id,
        )
        .options(selectinload(PackageSelectionGroup.items))
    )
    result = await db.execute(stmt)
    obj = result.scalar_one_or_none()
    if not obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "SELECTION_GROUP_NOT_FOUND",
                "message": "Selection group not found.",
            },
        )
    return obj


async def update_selection_group(
    db: AsyncSession,
    obj: PackageSelectionGroup,
    **kwargs,
) -> PackageSelectionGroup:
    for field, value in kwargs.items():
        if value is not None:
            setattr(obj, field, value)
    await db.commit()
    await db.refresh(obj)
    return obj


async def add_selection_group_item(
    db: AsyncSession,
    group: PackageSelectionGroup,
    menu_item_id: str,
    caterer_id: str,
) -> PackageSelectionGroupItem:
    await get_menu_item_or_404(db, menu_item_id, caterer_id)

    stmt = select(PackageSelectionGroupItem).where(
        PackageSelectionGroupItem.selection_group_id == group.id,
        PackageSelectionGroupItem.menu_item_id == menu_item_id,
    )
    result = await db.execute(stmt)
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "code": "SELECTION_GROUP_ITEM_EXISTS",
                "message": "Item already in selection group.",
            },
        )

    sg_item = PackageSelectionGroupItem(
        selection_group_id=group.id,
        menu_item_id=menu_item_id,
    )
    db.add(sg_item)
    await db.commit()
    await db.refresh(sg_item)
    return sg_item


async def remove_selection_group_item(db: AsyncSession, group_id: str, item_id: str) -> None:
    stmt = select(PackageSelectionGroupItem).where(
        PackageSelectionGroupItem.id == item_id,
        PackageSelectionGroupItem.selection_group_id == group_id,
    )
    result = await db.execute(stmt)
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "SELECTION_GROUP_ITEM_NOT_FOUND",
                "message": "Selection group item not found.",
            },
        )
    await db.delete(item)
    await db.commit()


# ---------------------------------------------------------------------------
# Package Addons
# ---------------------------------------------------------------------------


async def add_package_addon(
    db: AsyncSession,
    package: Package,
    menu_item_id: str,
    display_name: str | None,
    is_active: bool,
    sort_order: int,
) -> PackageAddon:
    await get_menu_item_or_404(db, menu_item_id, package.caterer_id)

    addon = PackageAddon(
        package_id=package.id,
        menu_item_id=menu_item_id,
        display_name=display_name,
        is_active=is_active,
        sort_order=sort_order,
    )
    db.add(addon)
    await db.commit()
    await db.refresh(addon)
    return addon


async def remove_package_addon(db: AsyncSession, package_id: str, addon_id: str) -> None:
    stmt = select(PackageAddon).where(
        PackageAddon.id == addon_id,
        PackageAddon.package_id == package_id,
    )
    result = await db.execute(stmt)
    addon = result.scalar_one_or_none()
    if not addon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "ADDON_NOT_FOUND", "message": "Package addon not found."},
        )
    await db.delete(addon)
    await db.commit()


# ---------------------------------------------------------------------------
# Public / Customer Catalog Methods (Phase 4)
# ---------------------------------------------------------------------------


async def resolve_public_caterer_id(db: AsyncSession, caterer_id: str | None = None) -> str:
    """
    Resolves the active caterer ID for public/customer browsing.
    If caterer_id is specified, verifies it exists and is active.
    Otherwise, returns the primary active caterer (creating a default one if needed).
    """
    if caterer_id:
        stmt = select(Caterer).where(Caterer.id == caterer_id, Caterer.is_active == True)  # noqa: E712
        result = await db.execute(stmt)
        c = result.scalar_one_or_none()
        if not c:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"code": "CATERER_NOT_FOUND", "message": "Catering business not found."},
            )
        return c.id

    stmt = select(Caterer).where(Caterer.is_active == True).order_by(Caterer.created_at).limit(1)  # noqa: E712
    result = await db.execute(stmt)
    caterer = result.scalar_one_or_none()
    if not caterer:
        # Create a default active caterer for clean bootstrap
        caterer = Caterer(
            business_name="CaterConnect Signature Catering",
            description="Premier catering service for celebrations.",
            phone_number="+91 98765 43210",
            email="info@caterconnect.com",
            address="123 Celebration Plaza, Bandra West, Mumbai, Maharashtra 400050",
            timezone="Asia/Kolkata",
            currency="INR",
            is_active=True,
        )
        db.add(caterer)
        await db.commit()
        await db.refresh(caterer)
    return caterer.id


async def list_offerings_for_function(
    db: AsyncSession,
    function_type_id: str,
    caterer_id: str,
    include_inactive: bool = False,
) -> list[CateringOffering]:
    """List all catering offerings linked to a given function type."""
    # Ensure function type exists
    await get_function_type_or_404(db, function_type_id, caterer_id)

    stmt = (
        select(CateringOffering)
        .join(FunctionOffering, FunctionOffering.offering_id == CateringOffering.id)
        .where(
            FunctionOffering.function_type_id == function_type_id,
            CateringOffering.caterer_id == caterer_id,
        )
    )
    if not include_inactive:
        stmt = stmt.where(CateringOffering.is_active == True)  # noqa: E712
    stmt = stmt.order_by(CateringOffering.sort_order, CateringOffering.name)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def list_packages_filtered(
    db: AsyncSession,
    caterer_id: str,
    function_id: str | None = None,
    offering_id: str | None = None,
    guest_count: int | None = None,
    search: str | None = None,
    include_inactive: bool = False,
    page: int = 1,
    page_size: int = 50,
) -> list[Package]:
    """List packages matching optional function, offering, guest count, and search criteria."""
    stmt = (
        select(Package)
        .where(Package.caterer_id == caterer_id)
        .options(
            selectinload(Package.package_items),
            selectinload(Package.selection_groups).selectinload(PackageSelectionGroup.items),
            selectinload(Package.addons),
        )
    )
    if not include_inactive:
        stmt = stmt.where(Package.is_active == True)  # noqa: E712

    if function_id:
        stmt = stmt.join(PackageFunction, PackageFunction.package_id == Package.id).where(
            PackageFunction.function_type_id == function_id
        )

    if offering_id:
        stmt = stmt.join(PackageOffering, PackageOffering.package_id == Package.id).where(
            PackageOffering.offering_id == offering_id
        )

    if guest_count is not None and guest_count > 0:
        stmt = stmt.where(
            and_(
                or_(Package.min_guests.is_(None), Package.min_guests <= guest_count),
                or_(Package.max_guests.is_(None), Package.max_guests >= guest_count),
            )
        )

    if search and search.strip():
        term = f"%{search.strip()}%"
        stmt = stmt.where(or_(Package.name.ilike(term), Package.description.ilike(term)))

    stmt = stmt.order_by(Package.sort_order, Package.name)
    offset = max(0, (page - 1) * page_size)
    stmt = stmt.offset(offset).limit(page_size)

    result = await db.execute(stmt)
    return list(result.scalars().all())


async def list_menu_items_filtered(
    db: AsyncSession,
    caterer_id: str,
    category_id: str | None = None,
    dietary_type: str | None = None,
    function_id: str | None = None,
    offering_id: str | None = None,
    search: str | None = None,
    include_inactive: bool = False,
    page: int = 1,
    page_size: int = 50,
) -> list[MenuItem]:
    """List menu items with rich customer filtering."""
    stmt = select(MenuItem).where(MenuItem.caterer_id == caterer_id)
    if not include_inactive:
        stmt = stmt.where(MenuItem.is_active == True)  # noqa: E712

    if category_id:
        stmt = stmt.where(MenuItem.category_id == category_id)

    if dietary_type:
        stmt = stmt.where(MenuItem.dietary_type == dietary_type.upper())

    if function_id:
        stmt = stmt.join(MenuItemFunction, MenuItemFunction.menu_item_id == MenuItem.id).where(
            MenuItemFunction.function_type_id == function_id
        )

    if offering_id:
        stmt = stmt.join(MenuItemOffering, MenuItemOffering.menu_item_id == MenuItem.id).where(
            MenuItemOffering.offering_id == offering_id
        )

    if search and search.strip():
        term = f"%{search.strip()}%"
        stmt = stmt.where(or_(MenuItem.name.ilike(term), MenuItem.description.ilike(term)))

    stmt = stmt.order_by(MenuItem.sort_order, MenuItem.name)
    offset = max(0, (page - 1) * page_size)
    stmt = stmt.offset(offset).limit(page_size)

    result = await db.execute(stmt)
    return list(result.scalars().all())
