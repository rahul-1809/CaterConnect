"""
CaterConnect Backend — Event Service Layer
Business logic and authorization boundaries for Customer Event Planning (Phase 5).
"""

from __future__ import annotations

from typing import Any

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import get_logger
from app.models.event import Event, EventMenuItem
from app.models.user import CustomerProfile, User
from app.repositories import event as repo
from app.schemas.event import (
    BudgetInfo,
    EventConfigurationOut,
    EventConfigurationUpdateIn,
    EventCreateIn,
    EventListOut,
    EventMenuItemAddIn,
    EventMenuItemOut,
    EventOut,
    EventSummaryOut,
    EventUpdateIn,
    EventVersionListOut,
    EventVersionOut,
    VenueInfo,
)
from app.services import catalog_service

logger = get_logger(__name__)


async def get_or_create_customer_profile(db: AsyncSession, user: User) -> CustomerProfile:
    """Returns the CustomerProfile associated with the user, creating one if needed."""
    if user.customer_profile:
        return user.customer_profile

    stmt = select(CustomerProfile).where(CustomerProfile.user_id == user.id)
    res = await db.execute(stmt)
    profile = res.scalar_one_or_none()
    if not profile:
        profile = CustomerProfile(user_id=user.id, full_name="Valued Customer")
        db.add(profile)
        await db.commit()
        await db.refresh(profile)
    return profile


def _map_menu_item_out(item: EventMenuItem) -> EventMenuItemOut:
    """Maps EventMenuItem ORM model to EventMenuItemOut schema."""
    mi = item.menu_item
    return EventMenuItemOut(
        id=str(item.id),
        event_id=str(item.event_id),
        menu_item_id=str(item.menu_item_id),
        source_type=item.source_type,
        selection_group_id=str(item.selection_group_id) if item.selection_group_id else None,
        quantity=float(item.quantity) if item.quantity is not None else 1.0,
        is_included=item.is_included,
        metadata_json=item.metadata_json,
        created_at=item.created_at,
        name=mi.name if mi else None,
        category_id=str(mi.category_id) if mi and mi.category_id else None,
        category_name=mi.category.name if mi and mi.category else None,
        dietary_type=mi.dietary_type if mi else None,
        price=None,
        image_url=mi.image_url if mi else None,
    )


def map_event_out(event: Event) -> EventOut:
    """Serializes an Event ORM model into the full EventOut schema."""
    return EventOut(
        id=str(event.id),
        customer_id=str(event.customer_id),
        caterer_id=str(event.caterer_id),
        status=event.status,
        configuration_version=event.configuration_version,
        function_type_id=str(event.function_type_id) if event.function_type_id else None,
        offering_id=str(event.offering_id) if event.offering_id else None,
        package_id=str(event.package_id) if event.package_id else None,
        guest_count=event.guest_count,
        budget=BudgetInfo(
            min=float(event.budget_min) if event.budget_min is not None else None,
            max=float(event.budget_max) if event.budget_max is not None else None,
            currency="INR",
        ),
        event_date=event.event_date,
        event_time=event.event_time,
        timezone=event.timezone,
        venue=VenueInfo(
            name=event.venue_name,
            address=event.venue_address,
            notes=event.venue_notes,
        ),
        customer_notes=event.customer_notes,
        function={
            "id": str(event.function_type.id),
            "name": event.function_type.name,
            "slug": event.function_type.slug,
        }
        if event.function_type
        else None,
        offering={
            "id": str(event.offering.id),
            "name": event.offering.name,
            "slug": event.offering.slug,
        }
        if event.offering
        else None,
        package={
            "id": str(event.package.id),
            "name": event.package.name,
            "slug": event.package.slug,
            "description": event.package.description,
        }
        if event.package
        else None,
        menu_items=[_map_menu_item_out(item) for item in event.menu_items],
        created_at=event.created_at,
        updated_at=event.updated_at,
    )


def map_event_summary_out(event: Event) -> EventSummaryOut:
    """Serializes an Event ORM model into the compact EventSummaryOut schema."""
    return EventSummaryOut(
        id=str(event.id),
        status=event.status,
        configuration_version=event.configuration_version,
        guest_count=event.guest_count,
        budget_min=event.budget_min,
        budget_max=event.budget_max,
        event_date=event.event_date,
        event_time=event.event_time,
        venue_name=event.venue_name,
        function_name=event.function_type.name if event.function_type else None,
        offering_name=event.offering.name if event.offering else None,
        package_name=event.package.name if event.package else None,
        items_count=len(event.menu_items),
        created_at=event.created_at,
        updated_at=event.updated_at,
    )


async def create_event_draft(
    db: AsyncSession,
    user: User,
    payload: EventCreateIn,
    caterer_id: str | None = None,
) -> EventOut:
    """Creates a new customer event draft."""
    profile = await get_or_create_customer_profile(db, user)
    resolved_caterer_id = await catalog_service.resolve_public_caterer_id(db, caterer_id)

    data: dict[str, Any] = {
        "customer_id": profile.id,
        "caterer_id": resolved_caterer_id,
        "function_type_id": payload.function_type_id,
        "offering_id": payload.offering_id,
        "package_id": payload.package_id,
        "guest_count": payload.guest_count,
        "budget_min": payload.budget_min,
        "budget_max": payload.budget_max,
        "event_date": payload.event_date,
        "event_time": payload.event_time,
        "timezone": payload.timezone,
        "venue_name": payload.venue_name,
        "venue_address": payload.venue_address,
        "venue_notes": payload.venue_notes,
        "customer_notes": payload.customer_notes,
    }

    event = await repo.create_event(db, data, changed_by_user_id=str(user.id))
    logger.info("event_draft_created", event_id=str(event.id), customer_id=str(profile.id))
    return map_event_out(event)


async def get_event(
    db: AsyncSession,
    event_id: str,
    user: User,
) -> EventOut:
    """Retrieves an event owned by the authenticated customer."""
    profile = await get_or_create_customer_profile(db, user)
    event = await repo.get_event_by_id(db, event_id, customer_id=str(profile.id))
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "EVENT_NOT_FOUND", "message": "Event not found or access denied."},
        )
    return map_event_out(event)


async def list_events(
    db: AsyncSession,
    user: User,
    status_filter: str | None = None,
    page: int = 1,
    page_size: int = 20,
) -> EventListOut:
    """Lists all events belonging to the authenticated customer."""
    profile = await get_or_create_customer_profile(db, user)
    items, total, total_pages = await repo.list_events_by_customer(
        db,
        customer_id=str(profile.id),
        status_filter=status_filter,
        page=page,
        page_size=page_size,
    )
    return EventListOut(
        items=[map_event_summary_out(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


async def update_event(
    db: AsyncSession,
    event_id: str,
    user: User,
    payload: EventUpdateIn,
    header_version: int | None = None,
) -> EventOut:
    """Updates core event fields with optimistic concurrency control."""
    profile = await get_or_create_customer_profile(db, user)
    event = await repo.get_event_by_id(db, event_id, customer_id=str(profile.id))
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "EVENT_NOT_FOUND", "message": "Event not found or access denied."},
        )

    base_version = payload.base_version if payload.base_version is not None else header_version
    updates = payload.model_dump(exclude_unset=True, exclude={"base_version"})

    updated_event = await repo.update_event_details(
        db=db,
        event=event,
        updates=updates,
        base_version=base_version,
        changed_by_user_id=str(user.id),
        change_reason="Updated event core details",
    )
    return map_event_out(updated_event)


async def get_event_configuration(
    db: AsyncSession,
    event_id: str,
    user: User,
) -> EventConfigurationOut:
    """Returns the current package and menu item configuration for the event."""
    profile = await get_or_create_customer_profile(db, user)
    event = await repo.get_event_by_id(db, event_id, customer_id=str(profile.id))
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "EVENT_NOT_FOUND", "message": "Event not found or access denied."},
        )

    return EventConfigurationOut(
        event_id=str(event.id),
        version=event.configuration_version,
        package_id=str(event.package_id) if event.package_id else None,
        guest_count=event.guest_count,
        budget=BudgetInfo(
            min=float(event.budget_min) if event.budget_min is not None else None,
            max=float(event.budget_max) if event.budget_max is not None else None,
            currency="INR",
        ),
        menu_items=[_map_menu_item_out(item) for item in event.menu_items],
    )


async def update_event_configuration(
    db: AsyncSession,
    event_id: str,
    user: User,
    payload: EventConfigurationUpdateIn,
) -> EventConfigurationOut:
    """Batch updates package and menu item selections with constraint validation."""
    profile = await get_or_create_customer_profile(db, user)
    event = await repo.get_event_by_id(db, event_id, customer_id=str(profile.id))
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "EVENT_NOT_FOUND", "message": "Event not found or access denied."},
        )

    menu_items_dicts = [item.model_dump() for item in payload.menu_items]
    updated_event = await repo.update_event_configuration(
        db=db,
        event=event,
        package_id=payload.package_id,
        menu_items_payload=menu_items_dicts,
        base_version=payload.base_version,
        changed_by_user_id=str(user.id),
    )

    return EventConfigurationOut(
        event_id=str(updated_event.id),
        version=updated_event.configuration_version,
        package_id=str(updated_event.package_id) if updated_event.package_id else None,
        guest_count=updated_event.guest_count,
        budget=BudgetInfo(
            min=float(updated_event.budget_min) if updated_event.budget_min is not None else None,
            max=float(updated_event.budget_max) if updated_event.budget_max is not None else None,
            currency="INR",
        ),
        menu_items=[_map_menu_item_out(item) for item in updated_event.menu_items],
    )


async def add_event_menu_item(
    db: AsyncSession,
    event_id: str,
    user: User,
    payload: EventMenuItemAddIn,
) -> dict[str, Any]:
    """Adds a single menu item to the event."""
    profile = await get_or_create_customer_profile(db, user)
    event = await repo.get_event_by_id(db, event_id, customer_id=str(profile.id))
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "EVENT_NOT_FOUND", "message": "Event not found or access denied."},
        )

    updated_event, added_item = await repo.add_event_menu_item(
        db=db,
        event=event,
        menu_item_id=payload.menu_item_id,
        source_type=payload.source_type,
        selection_group_id=payload.selection_group_id,
        quantity=payload.quantity,
        base_version=payload.base_version,
        changed_by_user_id=str(user.id),
    )

    return {
        "event_id": str(updated_event.id),
        "configuration_version": updated_event.configuration_version,
        "menu_item": _map_menu_item_out(added_item),
    }


async def remove_event_menu_item(
    db: AsyncSession,
    event_id: str,
    event_menu_item_id: str,
    base_version: int,
    user: User,
) -> None:
    """Removes a menu item from the event configuration."""
    profile = await get_or_create_customer_profile(db, user)
    event = await repo.get_event_by_id(db, event_id, customer_id=str(profile.id))
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "EVENT_NOT_FOUND", "message": "Event not found or access denied."},
        )

    await repo.remove_event_menu_item(
        db=db,
        event=event,
        event_menu_item_id=event_menu_item_id,
        base_version=base_version,
        changed_by_user_id=str(user.id),
    )


async def list_event_versions(
    db: AsyncSession,
    event_id: str,
    user: User,
) -> EventVersionListOut:
    """Retrieves all historical version snapshots for an event."""
    profile = await get_or_create_customer_profile(db, user)
    event = await repo.get_event_by_id(db, event_id, customer_id=str(profile.id))
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "EVENT_NOT_FOUND", "message": "Event not found or access denied."},
        )

    versions = await repo.list_event_versions(db, event_id)
    return EventVersionListOut(
        event_id=str(event.id),
        current_version=event.configuration_version,
        versions=[
            EventVersionOut(
                id=str(v.id),
                event_id=str(v.event_id),
                version_number=v.version_number,
                snapshot=v.snapshot,
                changed_by_user_id=str(v.changed_by_user_id) if v.changed_by_user_id else None,
                change_reason=v.change_reason,
                created_at=v.created_at,
            )
            for v in versions
        ],
    )
