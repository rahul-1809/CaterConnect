"""
CaterConnect Backend — Customer Catalog API Router
Public customer-facing endpoints for browsing functions, offerings, packages, and menus (Phase 4).
Accessible without authentication (or by authenticated customers).
"""

from fastapi import APIRouter, Depends, Header, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.catalog import (
    CateringOfferingOut,
    FunctionTypeOut,
    MenuCategoryOut,
    MenuItemOut,
    PackageDetailOut,
    PackageOut,
)
from app.schemas.common import StandardResponse
from app.services import catalog_service as svc

router = APIRouter()


# ---------------------------------------------------------------------------
# Helper: Resolve public caterer context
# ---------------------------------------------------------------------------


async def get_caterer_id(
    db: AsyncSession = Depends(get_db),
    x_caterer_id: str | None = Header(None, alias="X-Caterer-ID"),
    caterer_id: str | None = Query(None),
) -> str:
    resolved_id = x_caterer_id or caterer_id
    return await svc.resolve_public_caterer_id(db, resolved_id)


# ===========================================================================
# Functions (Event Types)
# ===========================================================================


@router.get(
    "/functions",
    response_model=StandardResponse[list[FunctionTypeOut]],
    summary="List active function types",
)
async def list_functions(
    active: bool = Query(True, description="Filter by active status"),
    db: AsyncSession = Depends(get_db),
    caterer_id: str = Depends(get_caterer_id),
):
    """Retrieve all available function/event types (e.g. Wedding, Birthday, Corporate)."""
    items = await svc.list_public_function_types(db, caterer_id, include_inactive=not active)
    return StandardResponse(data=[FunctionTypeOut.model_validate(item) for item in items])


@router.get(
    "/functions/{function_id}",
    response_model=StandardResponse[FunctionTypeOut],
    summary="Get function type details",
)
async def get_function(
    function_id: str,
    db: AsyncSession = Depends(get_db),
    caterer_id: str = Depends(get_caterer_id),
):
    item = await svc.get_public_function_type(db, function_id, caterer_id)
    return StandardResponse(data=FunctionTypeOut.model_validate(item))


@router.get(
    "/functions/{function_id}/offerings",
    response_model=StandardResponse[list[CateringOfferingOut]],
    summary="List offerings for a function type",
)
async def list_function_offerings(
    function_id: str,
    db: AsyncSession = Depends(get_db),
    caterer_id: str = Depends(get_caterer_id),
):
    """Retrieve catering service styles available for the selected function."""
    items = await svc.list_public_offerings_for_function(db, function_id, caterer_id)
    return StandardResponse(data=[CateringOfferingOut.model_validate(item) for item in items])


# ===========================================================================
# Catering Offerings
# ===========================================================================


@router.get(
    "/offerings",
    response_model=StandardResponse[list[CateringOfferingOut]],
    summary="List active catering offerings",
)
async def list_offerings(
    db: AsyncSession = Depends(get_db),
    caterer_id: str = Depends(get_caterer_id),
):
    items = await svc.list_public_offerings(db, caterer_id)
    return StandardResponse(data=[CateringOfferingOut.model_validate(item) for item in items])


@router.get(
    "/offerings/{offering_id}",
    response_model=StandardResponse[CateringOfferingOut],
    summary="Get offering details",
)
async def get_offering(
    offering_id: str,
    db: AsyncSession = Depends(get_db),
    caterer_id: str = Depends(get_caterer_id),
):
    item = await svc.get_public_offering(db, offering_id, caterer_id)
    return StandardResponse(data=CateringOfferingOut.model_validate(item))


# ===========================================================================
# Packages
# ===========================================================================


@router.get(
    "/packages",
    response_model=StandardResponse[list[PackageOut]],
    summary="List catering packages",
)
async def list_packages(
    function_id: str | None = Query(None, description="Filter by function type UUID"),
    offering_id: str | None = Query(None, description="Filter by offering UUID"),
    guest_count: int | None = Query(None, ge=1, description="Filter packages valid for guest size"),
    search: str | None = Query(None, description="Search packages by name or description"),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    caterer_id: str = Depends(get_caterer_id),
):
    """Browse packages with optional function, offering, guest count, and search filters."""
    items = await svc.list_public_packages(
        db,
        caterer_id=caterer_id,
        function_id=function_id,
        offering_id=offering_id,
        guest_count=guest_count,
        search=search,
        page=page,
        page_size=page_size,
    )
    return StandardResponse(data=[PackageOut.model_validate(item) for item in items])


@router.get(
    "/packages/{package_id}",
    response_model=StandardResponse[PackageDetailOut],
    summary="Get package details and menu options",
)
async def get_package(
    package_id: str,
    db: AsyncSession = Depends(get_db),
    caterer_id: str = Depends(get_caterer_id),
):
    """Retrieve full package structure including included items, selection groups, and add-ons."""
    pkg = await svc.get_public_package(db, package_id, caterer_id)
    return StandardResponse(data=PackageDetailOut.model_validate(pkg))


# ===========================================================================
# Menu Categories & Items
# ===========================================================================


@router.get(
    "/menu/categories",
    response_model=StandardResponse[list[MenuCategoryOut]],
    summary="List menu categories",
)
async def list_categories(
    db: AsyncSession = Depends(get_db),
    caterer_id: str = Depends(get_caterer_id),
):
    """Browse all menu categories (Starters, Main Course, Desserts, etc.)."""
    items = await svc.list_public_menu_categories(db, caterer_id)
    return StandardResponse(data=[MenuCategoryOut.model_validate(item) for item in items])


@router.get(
    "/menu/items",
    response_model=StandardResponse[list[MenuItemOut]],
    summary="List menu items",
)
async def list_menu_items(
    category_id: str | None = Query(None, description="Filter by category UUID"),
    dietary_type: str | None = Query(
        None, description="Filter by dietary type (VEG, NON_VEG, VEGAN)"
    ),
    function_id: str | None = Query(None, description="Filter by function type UUID"),
    offering_id: str | None = Query(None, description="Filter by offering UUID"),
    search: str | None = Query(None, description="Search dish by name or description"),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    caterer_id: str = Depends(get_caterer_id),
):
    """Browse menu items with dietary, category, and keyword filters."""
    items = await svc.list_public_menu_items(
        db,
        caterer_id=caterer_id,
        category_id=category_id,
        dietary_type=dietary_type,
        function_id=function_id,
        offering_id=offering_id,
        search=search,
        page=page,
        page_size=page_size,
    )
    return StandardResponse(data=[MenuItemOut.model_validate(item) for item in items])


@router.get(
    "/menu/items/{item_id}",
    response_model=StandardResponse[MenuItemOut],
    summary="Get menu item details",
)
async def get_menu_item(
    item_id: str,
    db: AsyncSession = Depends(get_db),
    caterer_id: str = Depends(get_caterer_id),
):
    """Get single dish details."""
    item = await svc.get_public_menu_item(db, item_id, caterer_id)
    return StandardResponse(data=MenuItemOut.model_validate(item))
