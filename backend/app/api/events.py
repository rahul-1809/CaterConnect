"""
CaterConnect Backend — Customer Event API Router
Endpoints for Event Planner, Menu Customization, and Version History (Phase 5).
"""

from typing import Any

from fastapi import APIRouter, Depends, Header, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.common import StandardResponse
from app.schemas.event import (
    EventConfigurationOut,
    EventConfigurationUpdateIn,
    EventCreateIn,
    EventListOut,
    EventMenuItemAddIn,
    EventOut,
    EventUpdateIn,
    EventVersionListOut,
)
from app.services import event_service as svc

router = APIRouter()


# ---------------------------------------------------------------------------
# Event Lifecycle & CRUD
# ---------------------------------------------------------------------------


@router.post(
    "",
    response_model=StandardResponse[EventOut],
    status_code=status.HTTP_201_CREATED,
    summary="Create event draft",
)
async def create_event(
    payload: EventCreateIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    x_caterer_id: str | None = Header(None, alias="X-Caterer-ID"),
    caterer_id: str | None = Query(None),
):
    """
    Create a new catering event draft. Initial status is DRAFT with version 1.
    If a package_id is provided, included items are automatically added.
    """
    resolved_caterer = x_caterer_id or caterer_id
    event = await svc.create_event_draft(db, current_user, payload, resolved_caterer)
    return StandardResponse(data=event, message="Event draft created successfully")


@router.get(
    "",
    response_model=StandardResponse[EventListOut],
    summary="List customer events",
)
async def list_events(
    status: str | None = Query(None, description="Filter by event status: DRAFT, SUBMITTED, etc."),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all events owned by the authenticated customer with pagination."""
    result = await svc.list_events(
        db, current_user, status_filter=status, page=page, page_size=page_size
    )
    return StandardResponse(data=result)


@router.get(
    "/{event_id}",
    response_model=StandardResponse[EventOut],
    summary="Get event details",
)
async def get_event(
    event_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve full event aggregate details including function, offering, and items."""
    event = await svc.get_event(db, event_id, current_user)
    return StandardResponse(data=event)


@router.patch(
    "/{event_id}",
    response_model=StandardResponse[EventOut],
    summary="Update event details",
)
async def update_event(
    event_id: str,
    payload: EventUpdateIn,
    if_match_version: int | None = Header(None, alias="If-Match-Version"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update core event details (guest count, date, time, venue, budget).
    Supports optimistic concurrency check via If-Match-Version header or base_version payload field.
    """
    event = await svc.update_event(
        db,
        event_id,
        current_user,
        payload,
        header_version=if_match_version,
    )
    return StandardResponse(data=event, message="Event updated successfully")


# ---------------------------------------------------------------------------
# Event Configuration & Menu Customization
# ---------------------------------------------------------------------------


@router.get(
    "/{event_id}/configuration",
    response_model=StandardResponse[EventConfigurationOut],
    summary="Get event configuration",
)
async def get_configuration(
    event_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get the current package and menu item selection configuration for an event."""
    config = await svc.get_event_configuration(db, event_id, current_user)
    return StandardResponse(data=config)


@router.patch(
    "/{event_id}/configuration",
    response_model=StandardResponse[EventConfigurationOut],
    summary="Update event menu configuration",
)
async def update_configuration(
    event_id: str,
    payload: EventConfigurationUpdateIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Batch update package and menu items selection.
    Validates selection group constraints (min/max choices) and checks base_version concurrency.
    """
    config = await svc.update_event_configuration(db, event_id, current_user, payload)
    return StandardResponse(data=config, message="Configuration updated successfully")


@router.post(
    "/{event_id}/menu-items",
    response_model=StandardResponse[dict[str, Any]],
    status_code=status.HTTP_201_CREATED,
    summary="Add menu item to event",
)
async def add_menu_item(
    event_id: str,
    payload: EventMenuItemAddIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Add a custom or addon menu item to the event configuration."""
    result = await svc.add_event_menu_item(db, event_id, current_user, payload)
    return StandardResponse(data=result, message="Menu item added to event")


@router.delete(
    "/{event_id}/menu-items/{event_menu_item_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove menu item from event",
)
async def remove_menu_item(
    event_id: str,
    event_menu_item_id: str,
    base_version: int = Query(
        ..., description="Current event configuration version for optimistic concurrency"
    ),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Remove a menu item from the event configuration."""
    await svc.remove_event_menu_item(db, event_id, event_menu_item_id, base_version, current_user)
    return None


# ---------------------------------------------------------------------------
# Version History
# ---------------------------------------------------------------------------


@router.get(
    "/{event_id}/versions",
    response_model=StandardResponse[EventVersionListOut],
    summary="Get event version history",
)
async def get_version_history(
    event_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve full audit history snapshots of all past versions of this event."""
    versions = await svc.list_event_versions(db, event_id, current_user)
    return StandardResponse(data=versions)
