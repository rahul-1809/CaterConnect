"""
CaterConnect Backend — Event Repository
CRUD operations, optimistic concurrency checks, and version snapshot creation for Events.
"""

from __future__ import annotations

import math
from decimal import Decimal
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.logging import get_logger
from app.models.catalog import MenuItem, Package, PackageItem, PackageSelectionGroup
from app.models.event import (
    Event,
    EventItemSourceType,
    EventMenuItem,
    EventStatus,
    EventVersion,
)

logger = get_logger(__name__)


def _build_snapshot(event: Event) -> dict[str, Any]:
    """Serializes the current event configuration into an immutable JSON snapshot."""
    return {
        "event_id": str(event.id),
        "version": event.configuration_version,
        "customer_id": str(event.customer_id),
        "caterer_id": str(event.caterer_id),
        "status": event.status,
        "function_type_id": str(event.function_type_id) if event.function_type_id else None,
        "offering_id": str(event.offering_id) if event.offering_id else None,
        "package_id": str(event.package_id) if event.package_id else None,
        "guest_count": event.guest_count,
        "budget_min": float(event.budget_min) if event.budget_min is not None else None,
        "budget_max": float(event.budget_max) if event.budget_max is not None else None,
        "event_date": event.event_date.isoformat() if event.event_date else None,
        "event_time": event.event_time.isoformat() if event.event_time else None,
        "timezone": event.timezone,
        "venue_name": event.venue_name,
        "venue_address": event.venue_address,
        "venue_notes": event.venue_notes,
        "customer_notes": event.customer_notes,
        "menu_items": [
            {
                "id": str(item.id),
                "menu_item_id": str(item.menu_item_id),
                "source_type": item.source_type,
                "selection_group_id": str(item.selection_group_id)
                if item.selection_group_id
                else None,
                "quantity": float(item.quantity) if item.quantity is not None else 1.0,
                "is_included": item.is_included,
                "metadata": item.metadata_json or {},
            }
            for item in event.menu_items
        ],
    }


def _check_concurrency(event: Event, base_version: int | None) -> None:
    """Verifies that the caller's base version matches the current event configuration version."""
    if base_version is not None and event.configuration_version != base_version:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "code": "EVENT_VERSION_CONFLICT",
                "message": (
                    f"The event was changed by another request. "
                    f"Current version is {event.configuration_version}, "
                    f"received {base_version}. Refresh and try again."
                ),
            },
        )


async def create_event(
    db: AsyncSession,
    data: dict[str, Any],
    changed_by_user_id: str | None = None,
) -> Event:
    """Creates a new event draft, populates package items, and records version 1."""
    event = Event(**data)
    event.configuration_version = 1
    event.status = EventStatus.DRAFT.value
    db.add(event)
    await db.flush()

    # If package_id was specified during creation, populate mandatory/included package items
    if event.package_id:
        pkg_stmt = (
            select(Package)
            .options(
                selectinload(Package.package_items).selectinload(PackageItem.menu_item),
            )
            .where(Package.id == event.package_id)
        )
        pkg_res = await db.execute(pkg_stmt)
        package = pkg_res.scalar_one_or_none()
        if package:
            for p_item in package.package_items:
                menu_item = EventMenuItem(
                    event_id=event.id,
                    menu_item_id=p_item.menu_item_id,
                    source_type=EventItemSourceType.PACKAGE.value,
                    selection_group_id=None,
                    quantity=1.0,
                    is_included=True,
                )
                db.add(menu_item)
            await db.flush()

    # Re-fetch event with loaded relationships to build initial snapshot
    loaded_event = await get_event_by_id(db, event.id)
    assert loaded_event is not None

    snapshot = _build_snapshot(loaded_event)
    version_record = EventVersion(
        event_id=loaded_event.id,
        version_number=1,
        snapshot=snapshot,
        changed_by_user_id=changed_by_user_id,
        change_reason="Initial event draft created",
    )
    db.add(version_record)
    await db.commit()
    final_event = await get_event_by_id(db, event.id)
    assert final_event is not None
    return final_event


async def get_event_by_id(
    db: AsyncSession,
    event_id: str,
    customer_id: str | None = None,
) -> Event | None:
    """Loads an event with its full aggregate relationships."""
    stmt = (
        select(Event)
        .options(
            selectinload(Event.function_type),
            selectinload(Event.offering),
            selectinload(Event.package),
            selectinload(Event.menu_items)
            .selectinload(EventMenuItem.menu_item)
            .selectinload(MenuItem.category),
            selectinload(Event.menu_items).selectinload(EventMenuItem.selection_group),
        )
        .where(Event.id == event_id)
    )
    if customer_id is not None:
        stmt = stmt.where(Event.customer_id == customer_id)

    res = await db.execute(stmt)
    return res.scalar_one_or_none()


async def list_events_by_customer(
    db: AsyncSession,
    customer_id: str,
    status_filter: str | None = None,
    page: int = 1,
    page_size: int = 20,
) -> tuple[list[Event], int, int]:
    """Lists customer events with pagination and optional status filter."""
    base_query = select(Event).where(Event.customer_id == customer_id)
    if status_filter:
        base_query = base_query.where(Event.status == status_filter)

    count_stmt = select(func.count()).select_from(base_query.subquery())
    total_res = await db.execute(count_stmt)
    total = total_res.scalar() or 0

    total_pages = math.ceil(total / page_size) if total > 0 else 1
    offset = (page - 1) * page_size

    stmt = (
        base_query.options(
            selectinload(Event.function_type),
            selectinload(Event.offering),
            selectinload(Event.package),
            selectinload(Event.menu_items)
            .selectinload(EventMenuItem.menu_item)
            .selectinload(MenuItem.category),
        )
        .order_by(Event.updated_at.desc())
        .offset(offset)
        .limit(page_size)
    )

    items_res = await db.execute(stmt)
    items = list(items_res.scalars().all())
    return items, total, total_pages


async def update_event_details(
    db: AsyncSession,
    event: Event,
    updates: dict[str, Any],
    base_version: int | None = None,
    changed_by_user_id: str | None = None,
    change_reason: str = "Updated event details",
) -> Event:
    """Updates core event fields (venue, date, budget, guest count) and saves snapshot."""
    _check_concurrency(event, base_version)

    for field, value in updates.items():
        if hasattr(event, field) and value is not None:
            setattr(event, field, value)

    event.configuration_version += 1
    await db.flush()

    snapshot = _build_snapshot(event)
    version_record = EventVersion(
        event_id=event.id,
        version_number=event.configuration_version,
        snapshot=snapshot,
        changed_by_user_id=changed_by_user_id,
        change_reason=change_reason,
    )
    db.add(version_record)
    await db.commit()
    final_event = await get_event_by_id(db, event.id)
    assert final_event is not None
    return final_event


async def update_event_configuration(
    db: AsyncSession,
    event: Event,
    package_id: str | None,
    menu_items_payload: list[dict[str, Any]],
    base_version: int,
    changed_by_user_id: str | None = None,
    change_reason: str = "Updated menu & package configuration",
) -> Event:
    """
    Updates the package selection and menu items for the event.
    Validates selection group constraints if a package is selected.
    """
    _check_concurrency(event, base_version)

    if package_id is not None:
        event.package_id = package_id

    # If package selected, validate package selection group constraints
    if event.package_id:
        pkg_stmt = (
            select(Package)
            .options(
                selectinload(Package.selection_groups).selectinload(PackageSelectionGroup.items),
                selectinload(Package.package_items),
            )
            .where(Package.id == event.package_id)
        )
        pkg_res = await db.execute(pkg_stmt)
        pkg = pkg_res.scalar_one_or_none()
        if not pkg:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "code": "PACKAGE_NOT_FOUND",
                    "message": "The selected package does not exist.",
                },
            )

        # Count selections per group
        group_counts: dict[str, int] = {}
        for item_data in menu_items_payload:
            grp_id = item_data.get("selection_group_id")
            if grp_id:
                group_counts[grp_id] = group_counts.get(grp_id, 0) + 1

        # Check selection group limits
        for grp in pkg.selection_groups:
            count = group_counts.get(grp.id, 0)
            if count < grp.min_selections:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail={
                        "code": "INVALID_SELECTION_GROUP_CHOICES",
                        "message": (
                            f"Selection group '{grp.name}' requires at least "
                            f"{grp.min_selections} choice(s), but {count} selected."
                        ),
                    },
                )
            if grp.max_selections is not None and count > grp.max_selections:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail={
                        "code": "INVALID_SELECTION_GROUP_CHOICES",
                        "message": (
                            f"Selection group '{grp.name}' allows at most "
                            f"{grp.max_selections} choice(s), but {count} selected."
                        ),
                    },
                )

    # Delete existing menu items and replace with new selections
    event.menu_items.clear()
    await db.flush()

    for item_data in menu_items_payload:
        new_item = EventMenuItem(
            event_id=event.id,
            menu_item_id=item_data["menu_item_id"],
            source_type=item_data.get("source_type", EventItemSourceType.PACKAGE.value),
            selection_group_id=item_data.get("selection_group_id"),
            quantity=item_data.get("quantity", 1.0),
            is_included=item_data.get("is_included", True),
            metadata_json=item_data.get("metadata_json"),
        )
        event.menu_items.append(new_item)
        db.add(new_item)

    event.configuration_version += 1
    await db.flush()

    snapshot = _build_snapshot(event)
    version_record = EventVersion(
        event_id=event.id,
        version_number=event.configuration_version,
        snapshot=snapshot,
        changed_by_user_id=changed_by_user_id,
        change_reason=change_reason,
    )
    db.add(version_record)
    await db.commit()
    final_event = await get_event_by_id(db, event.id)
    assert final_event is not None
    return final_event


async def add_event_menu_item(
    db: AsyncSession,
    event: Event,
    menu_item_id: str,
    source_type: str,
    selection_group_id: str | None,
    quantity: float,
    base_version: int,
    changed_by_user_id: str | None = None,
) -> tuple[Event, EventMenuItem]:
    """Adds a single menu item to the event configuration and creates a new version snapshot."""
    _check_concurrency(event, base_version)

    # Verify menu item exists
    item_stmt = select(MenuItem).where(MenuItem.id == menu_item_id)
    item_res = await db.execute(item_stmt)
    menu_item = item_res.scalar_one_or_none()
    if not menu_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "MENU_ITEM_NOT_FOUND", "message": "Menu item not found in catalog."},
        )

    # Check for existing duplicate item in same selection context
    existing_stmt = select(EventMenuItem).where(
        EventMenuItem.event_id == event.id,
        EventMenuItem.menu_item_id == menu_item_id,
    )
    if selection_group_id:
        existing_stmt = existing_stmt.where(EventMenuItem.selection_group_id == selection_group_id)
    else:
        existing_stmt = existing_stmt.where(EventMenuItem.selection_group_id.is_(None))

    existing_res = await db.execute(existing_stmt)
    existing_item = existing_res.scalar_one_or_none()
    if existing_item:
        # Increase quantity or return existing
        curr_qty = float(existing_item.quantity) if existing_item.quantity is not None else 1.0
        existing_item.quantity = Decimal(str(curr_qty + quantity))
        created_or_updated = existing_item
    else:
        new_event_item = EventMenuItem(
            event_id=event.id,
            menu_item_id=menu_item_id,
            source_type=source_type,
            selection_group_id=selection_group_id,
            quantity=Decimal(str(quantity)),
            is_included=True,
        )
        event.menu_items.append(new_event_item)
        db.add(new_event_item)
        created_or_updated = new_event_item

    event.configuration_version += 1
    await db.flush()

    snapshot = _build_snapshot(event)
    version_record = EventVersion(
        event_id=event.id,
        version_number=event.configuration_version,
        snapshot=snapshot,
        changed_by_user_id=changed_by_user_id,
        change_reason=f"Added menu item: {menu_item.name}",
    )
    db.add(version_record)
    await db.commit()
    final_event = await get_event_by_id(db, event.id)
    assert final_event is not None
    # find created/updated item in final_event
    found_item = next(
        (i for i in final_event.menu_items if i.menu_item_id == menu_item_id), created_or_updated
    )
    return final_event, found_item


async def remove_event_menu_item(
    db: AsyncSession,
    event: Event,
    event_menu_item_id: str,
    base_version: int,
    changed_by_user_id: str | None = None,
) -> Event:
    """Removes a menu item from the event configuration and increments the version."""
    _check_concurrency(event, base_version)

    target_item = None
    for item in event.menu_items:
        if item.id == event_menu_item_id:
            target_item = item
            break

    if not target_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "EVENT_MENU_ITEM_NOT_FOUND",
                "message": "Menu item not found in event configuration.",
            },
        )

    item_name = target_item.menu_item.name if target_item.menu_item else "Item"
    event.menu_items.remove(target_item)
    await db.delete(target_item)
    event.configuration_version += 1
    await db.flush()

    snapshot = _build_snapshot(event)
    version_record = EventVersion(
        event_id=event.id,
        version_number=event.configuration_version,
        snapshot=snapshot,
        changed_by_user_id=changed_by_user_id,
        change_reason=f"Removed menu item: {item_name}",
    )
    db.add(version_record)
    await db.commit()
    final_event = await get_event_by_id(db, event.id)
    assert final_event is not None
    return final_event


async def list_event_versions(
    db: AsyncSession,
    event_id: str,
) -> list[EventVersion]:
    """Retrieves all version records for an event ordered by version number descending."""
    stmt = (
        select(EventVersion)
        .where(EventVersion.event_id == event_id)
        .order_by(EventVersion.version_number.desc())
    )
    res = await db.execute(stmt)
    return list(res.scalars().all())
