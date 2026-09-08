"""
CaterConnect Backend — Admin Catalog API Router
Full CRUD endpoints for caterer catalog management (Phase 3).
All routes require ADMIN or STAFF role.
"""
from typing import List, Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user, require_role
from app.core.database import get_db
from app.models.user import User
from app.schemas.catalog import (
    CateringOfferingIn,
    CateringOfferingOut,
    CateringOfferingUpdate,
    FunctionOfferingLinkIn,
    FunctionOfferingOut,
    FunctionTypeIn,
    FunctionTypeOut,
    FunctionTypeUpdate,
    MenuCategoryIn,
    MenuCategoryOut,
    MenuCategoryUpdate,
    MenuItemIn,
    MenuItemOut,
    MenuItemUpdate,
    PackageAddonIn,
    PackageAddonOut,
    PackageDetailOut,
    PackageIn,
    PackageItemIn,
    PackageItemOut,
    PackageOut,
    PackageSelectionGroupIn,
    PackageSelectionGroupItemIn,
    PackageSelectionGroupItemOut,
    PackageSelectionGroupOut,
    PackageSelectionGroupUpdate,
    PackageUpdate,
)
from app.schemas.common import StandardResponse
from app.services import catalog_service as svc

router = APIRouter(dependencies=[Depends(require_role("ADMIN", "STAFF"))])


# ---------------------------------------------------------------------------
# Helper: resolve caterer_id from current admin user
# ---------------------------------------------------------------------------

async def _caterer_id(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> str:
    return await svc.resolve_caterer_id(db, current_user)


# ===========================================================================
# FUNCTION TYPES
# ===========================================================================

@router.get(
    "/functions",
    response_model=StandardResponse[List[FunctionTypeOut]],
    summary="List function types",
)
async def list_function_types(
    include_inactive: bool = Query(False, description="Set true to include inactive entries"),
    db: AsyncSession = Depends(get_db),
    caterer_id: str = Depends(_caterer_id),
):
    items = await svc.list_function_types(db, caterer_id, include_inactive)
    return StandardResponse(data=items)


@router.post(
    "/functions",
    response_model=StandardResponse[FunctionTypeOut],
    status_code=status.HTTP_201_CREATED,
    summary="Create a function type",
)
async def create_function_type(
    payload: FunctionTypeIn,
    db: AsyncSession = Depends(get_db),
    caterer_id: str = Depends(_caterer_id),
):
    obj = await svc.create_function_type(
        db,
        caterer_id=caterer_id,
        name=payload.name,
        description=payload.description,
        image_url=payload.image_url,
        is_active=payload.is_active,
        sort_order=payload.sort_order,
    )
    return StandardResponse(data=obj, message="Function type created.")


@router.patch(
    "/functions/{function_type_id}",
    response_model=StandardResponse[FunctionTypeOut],
    summary="Update a function type",
)
async def update_function_type(
    function_type_id: str,
    payload: FunctionTypeUpdate,
    db: AsyncSession = Depends(get_db),
    caterer_id: str = Depends(_caterer_id),
):
    obj = await svc.update_function_type(
        db,
        caterer_id=caterer_id,
        function_type_id=function_type_id,
        **payload.model_dump(exclude_none=True),
    )
    return StandardResponse(data=obj, message="Function type updated.")


@router.post(
    "/functions/{function_type_id}/offerings",
    response_model=StandardResponse[FunctionOfferingOut],
    status_code=status.HTTP_201_CREATED,
    summary="Link an offering to a function type",
)
async def link_offering(
    function_type_id: str,
    payload: FunctionOfferingLinkIn,
    db: AsyncSession = Depends(get_db),
    caterer_id: str = Depends(_caterer_id),
):
    link = await svc.link_function_offering(
        db, caterer_id, function_type_id, payload.offering_id
    )
    return StandardResponse(data=link, message="Offering linked to function type.")


@router.delete(
    "/functions/{function_type_id}/offerings/{offering_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove an offering link from a function type",
)
async def unlink_offering(
    function_type_id: str,
    offering_id: str,
    db: AsyncSession = Depends(get_db),
    caterer_id: str = Depends(_caterer_id),
):
    await svc.unlink_function_offering(db, caterer_id, function_type_id, offering_id)


# ===========================================================================
# CATERING OFFERINGS
# ===========================================================================

@router.get(
    "/offerings",
    response_model=StandardResponse[List[CateringOfferingOut]],
    summary="List catering offerings",
)
async def list_offerings(
    include_inactive: bool = Query(False),
    db: AsyncSession = Depends(get_db),
    caterer_id: str = Depends(_caterer_id),
):
    items = await svc.list_offerings(db, caterer_id, include_inactive)
    return StandardResponse(data=items)


@router.post(
    "/offerings",
    response_model=StandardResponse[CateringOfferingOut],
    status_code=status.HTTP_201_CREATED,
    summary="Create a catering offering",
)
async def create_offering(
    payload: CateringOfferingIn,
    db: AsyncSession = Depends(get_db),
    caterer_id: str = Depends(_caterer_id),
):
    obj = await svc.create_offering(
        db,
        caterer_id=caterer_id,
        name=payload.name,
        description=payload.description,
        image_url=payload.image_url,
        is_active=payload.is_active,
        sort_order=payload.sort_order,
    )
    return StandardResponse(data=obj, message="Offering created.")


@router.patch(
    "/offerings/{offering_id}",
    response_model=StandardResponse[CateringOfferingOut],
    summary="Update a catering offering",
)
async def update_offering(
    offering_id: str,
    payload: CateringOfferingUpdate,
    db: AsyncSession = Depends(get_db),
    caterer_id: str = Depends(_caterer_id),
):
    obj = await svc.update_offering(
        db,
        caterer_id=caterer_id,
        offering_id=offering_id,
        **payload.model_dump(exclude_none=True),
    )
    return StandardResponse(data=obj, message="Offering updated.")


# ===========================================================================
# MENU CATEGORIES
# ===========================================================================

@router.get(
    "/menu/categories",
    response_model=StandardResponse[List[MenuCategoryOut]],
    summary="List menu categories",
)
async def list_menu_categories(
    include_inactive: bool = Query(False),
    db: AsyncSession = Depends(get_db),
    caterer_id: str = Depends(_caterer_id),
):
    items = await svc.list_menu_categories(db, caterer_id, include_inactive)
    return StandardResponse(data=items)


@router.post(
    "/menu/categories",
    response_model=StandardResponse[MenuCategoryOut],
    status_code=status.HTTP_201_CREATED,
    summary="Create a menu category",
)
async def create_menu_category(
    payload: MenuCategoryIn,
    db: AsyncSession = Depends(get_db),
    caterer_id: str = Depends(_caterer_id),
):
    obj = await svc.create_menu_category(
        db,
        caterer_id=caterer_id,
        name=payload.name,
        description=payload.description,
        sort_order=payload.sort_order,
        is_active=payload.is_active,
    )
    return StandardResponse(data=obj, message="Menu category created.")


@router.patch(
    "/menu/categories/{category_id}",
    response_model=StandardResponse[MenuCategoryOut],
    summary="Update a menu category",
)
async def update_menu_category(
    category_id: str,
    payload: MenuCategoryUpdate,
    db: AsyncSession = Depends(get_db),
    caterer_id: str = Depends(_caterer_id),
):
    obj = await svc.update_menu_category(
        db,
        caterer_id=caterer_id,
        category_id=category_id,
        **payload.model_dump(exclude_none=True),
    )
    return StandardResponse(data=obj, message="Menu category updated.")


# ===========================================================================
# MENU ITEMS
# ===========================================================================

@router.get(
    "/menu/items",
    response_model=StandardResponse[List[MenuItemOut]],
    summary="List menu items",
)
async def list_menu_items(
    category_id: Optional[str] = Query(None, description="Filter by category UUID"),
    include_inactive: bool = Query(False),
    db: AsyncSession = Depends(get_db),
    caterer_id: str = Depends(_caterer_id),
):
    items = await svc.list_menu_items(db, caterer_id, category_id, include_inactive)
    return StandardResponse(data=items)


@router.post(
    "/menu/items",
    response_model=StandardResponse[MenuItemOut],
    status_code=status.HTTP_201_CREATED,
    summary="Create a menu item",
)
async def create_menu_item(
    payload: MenuItemIn,
    db: AsyncSession = Depends(get_db),
    caterer_id: str = Depends(_caterer_id),
):
    obj = await svc.create_menu_item(
        db,
        caterer_id=caterer_id,
        category_id=payload.category_id,
        name=payload.name,
        description=payload.description,
        dietary_type=payload.dietary_type,
        image_url=payload.image_url,
        is_active=payload.is_active,
        sort_order=payload.sort_order,
        extra_metadata=payload.extra_metadata,
    )
    return StandardResponse(data=obj, message="Menu item created.")


@router.patch(
    "/menu/items/{item_id}",
    response_model=StandardResponse[MenuItemOut],
    summary="Update a menu item",
)
async def update_menu_item(
    item_id: str,
    payload: MenuItemUpdate,
    db: AsyncSession = Depends(get_db),
    caterer_id: str = Depends(_caterer_id),
):
    update_data = payload.model_dump(exclude_none=True)

    obj = await svc.update_menu_item(
        db,
        caterer_id=caterer_id,
        item_id=item_id,
        **update_data,
    )
    return StandardResponse(data=obj, message="Menu item updated.")


# ===========================================================================
# PACKAGES
# ===========================================================================

@router.get(
    "/packages",
    response_model=StandardResponse[List[PackageOut]],
    summary="List packages",
)
async def list_packages(
    include_inactive: bool = Query(False),
    db: AsyncSession = Depends(get_db),
    caterer_id: str = Depends(_caterer_id),
):
    items = await svc.list_packages(db, caterer_id, include_inactive)
    return StandardResponse(data=items)


@router.post(
    "/packages",
    response_model=StandardResponse[PackageOut],
    status_code=status.HTTP_201_CREATED,
    summary="Create a package",
)
async def create_package(
    payload: PackageIn,
    db: AsyncSession = Depends(get_db),
    caterer_id: str = Depends(_caterer_id),
):
    obj = await svc.create_package(
        db,
        caterer_id=caterer_id,
        name=payload.name,
        description=payload.description,
        image_url=payload.image_url,
        min_guests=payload.min_guests,
        max_guests=payload.max_guests,
        is_active=payload.is_active,
        sort_order=payload.sort_order,
    )
    return StandardResponse(data=obj, message="Package created.")


@router.get(
    "/packages/{package_id}",
    response_model=StandardResponse[PackageDetailOut],
    summary="Get full package details including items, selection groups and addons",
)
async def get_package_detail(
    package_id: str,
    db: AsyncSession = Depends(get_db),
    caterer_id: str = Depends(_caterer_id),
):
    obj = await svc.get_package_detail(db, caterer_id, package_id)
    return StandardResponse(data=obj)


@router.patch(
    "/packages/{package_id}",
    response_model=StandardResponse[PackageOut],
    summary="Update a package",
)
async def update_package(
    package_id: str,
    payload: PackageUpdate,
    db: AsyncSession = Depends(get_db),
    caterer_id: str = Depends(_caterer_id),
):
    obj = await svc.update_package(
        db,
        caterer_id=caterer_id,
        package_id=package_id,
        **payload.model_dump(exclude_none=True),
    )
    return StandardResponse(data=obj, message="Package updated.")


# ------------------------------------
# Package Items
# ------------------------------------

@router.post(
    "/packages/{package_id}/items",
    response_model=StandardResponse[PackageItemOut],
    status_code=status.HTTP_201_CREATED,
    summary="Add a menu item to a package",
)
async def add_package_item(
    package_id: str,
    payload: PackageItemIn,
    db: AsyncSession = Depends(get_db),
    caterer_id: str = Depends(_caterer_id),
):
    obj = await svc.add_package_item(
        db, caterer_id, package_id,
        payload.menu_item_id, payload.inclusion_type, payload.sort_order,
    )
    return StandardResponse(data=obj, message="Item added to package.")


@router.delete(
    "/packages/{package_id}/items/{item_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove a menu item from a package",
)
async def remove_package_item(
    package_id: str,
    item_id: str,
    db: AsyncSession = Depends(get_db),
    caterer_id: str = Depends(_caterer_id),
):
    await svc.remove_package_item(db, caterer_id, package_id, item_id)


# ------------------------------------
# Package Selection Groups
# ------------------------------------

@router.post(
    "/packages/{package_id}/selection-groups",
    response_model=StandardResponse[PackageSelectionGroupOut],
    status_code=status.HTTP_201_CREATED,
    summary="Create a selection group in a package",
)
async def create_selection_group(
    package_id: str,
    payload: PackageSelectionGroupIn,
    db: AsyncSession = Depends(get_db),
    caterer_id: str = Depends(_caterer_id),
):
    obj = await svc.create_selection_group(
        db, caterer_id, package_id,
        payload.name, payload.description,
        payload.min_selections, payload.max_selections,
        payload.sort_order, payload.is_required,
    )
    return StandardResponse(data=obj, message="Selection group created.")


@router.patch(
    "/packages/{package_id}/selection-groups/{group_id}",
    response_model=StandardResponse[PackageSelectionGroupOut],
    summary="Update a selection group",
)
async def update_selection_group(
    package_id: str,
    group_id: str,
    payload: PackageSelectionGroupUpdate,
    db: AsyncSession = Depends(get_db),
    caterer_id: str = Depends(_caterer_id),
):
    obj = await svc.update_selection_group(
        db, caterer_id, package_id, group_id,
        **payload.model_dump(exclude_none=True),
    )
    return StandardResponse(data=obj, message="Selection group updated.")


@router.post(
    "/packages/{package_id}/selection-groups/{group_id}/items",
    response_model=StandardResponse[PackageSelectionGroupItemOut],
    status_code=status.HTTP_201_CREATED,
    summary="Add an item to a selection group",
)
async def add_selection_group_item(
    package_id: str,
    group_id: str,
    payload: PackageSelectionGroupItemIn,
    db: AsyncSession = Depends(get_db),
    caterer_id: str = Depends(_caterer_id),
):
    obj = await svc.add_selection_group_item(
        db, caterer_id, package_id, group_id, payload.menu_item_id
    )
    return StandardResponse(data=obj, message="Item added to selection group.")


@router.delete(
    "/packages/{package_id}/selection-groups/{group_id}/items/{item_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove an item from a selection group",
)
async def remove_selection_group_item(
    package_id: str,
    group_id: str,
    item_id: str,
    db: AsyncSession = Depends(get_db),
    caterer_id: str = Depends(_caterer_id),
):
    await svc.remove_selection_group_item(
        db, caterer_id, package_id, group_id, item_id
    )


# ------------------------------------
# Package Addons
# ------------------------------------

@router.post(
    "/packages/{package_id}/addons",
    response_model=StandardResponse[PackageAddonOut],
    status_code=status.HTTP_201_CREATED,
    summary="Add an optional paid addon to a package",
)
async def add_package_addon(
    package_id: str,
    payload: PackageAddonIn,
    db: AsyncSession = Depends(get_db),
    caterer_id: str = Depends(_caterer_id),
):
    obj = await svc.add_package_addon(
        db, caterer_id, package_id,
        payload.menu_item_id, payload.display_name,
        payload.is_active, payload.sort_order,
    )
    return StandardResponse(data=obj, message="Addon added to package.")


@router.delete(
    "/packages/{package_id}/addons/{addon_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove an addon from a package",
)
async def remove_package_addon(
    package_id: str,
    addon_id: str,
    db: AsyncSession = Depends(get_db),
    caterer_id: str = Depends(_caterer_id),
):
    await svc.remove_package_addon(db, caterer_id, package_id, addon_id)
