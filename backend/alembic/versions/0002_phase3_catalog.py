"""Phase 3: Create catalog tables — function_types, catering_offerings, function_offerings,
menu_categories, menu_items, menu_item_functions, menu_item_offerings,
packages, package_functions, package_offerings, package_items,
package_selection_groups, package_selection_group_items, package_addons

Revision ID: 0002_phase3_catalog
Revises: 0001_phase2_auth
Create Date: 2026-09-08 09:00:00.000000
"""

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0002_phase3_catalog"
down_revision: str | None = "0001_phase2_auth"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # 1. function_types
    op.create_table(
        "function_types",
        sa.Column("id", postgresql.UUID(as_uuid=False), primary_key=True, nullable=False),
        sa.Column(
            "caterer_id",
            postgresql.UUID(as_uuid=False),
            sa.ForeignKey("caterers.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("name", sa.String(120), nullable=False),
        sa.Column("slug", sa.String(140), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("image_url", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("sort_order", sa.Integer(), server_default="0", nullable=False),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.UniqueConstraint("caterer_id", "slug", name="uq_function_types_caterer_slug"),
    )
    op.create_index("ix_function_types_caterer_id", "function_types", ["caterer_id"])
    op.create_index(
        "ix_function_types_caterer_active_sort",
        "function_types",
        ["caterer_id", "is_active", "sort_order"],
    )

    # 2. catering_offerings
    op.create_table(
        "catering_offerings",
        sa.Column("id", postgresql.UUID(as_uuid=False), primary_key=True, nullable=False),
        sa.Column(
            "caterer_id",
            postgresql.UUID(as_uuid=False),
            sa.ForeignKey("caterers.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("name", sa.String(150), nullable=False),
        sa.Column("slug", sa.String(160), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("image_url", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("sort_order", sa.Integer(), server_default="0", nullable=False),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.UniqueConstraint("caterer_id", "slug", name="uq_catering_offerings_caterer_slug"),
    )
    op.create_index("ix_catering_offerings_caterer_id", "catering_offerings", ["caterer_id"])

    # 3. function_offerings (M2M)
    op.create_table(
        "function_offerings",
        sa.Column("id", postgresql.UUID(as_uuid=False), primary_key=True, nullable=False),
        sa.Column(
            "function_type_id",
            postgresql.UUID(as_uuid=False),
            sa.ForeignKey("function_types.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "offering_id",
            postgresql.UUID(as_uuid=False),
            sa.ForeignKey("catering_offerings.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.UniqueConstraint("function_type_id", "offering_id", name="uq_function_offerings"),
    )
    op.create_index(
        "ix_function_offerings_function_type_id", "function_offerings", ["function_type_id"]
    )
    op.create_index("ix_function_offerings_offering_id", "function_offerings", ["offering_id"])

    # 4. menu_categories
    op.create_table(
        "menu_categories",
        sa.Column("id", postgresql.UUID(as_uuid=False), primary_key=True, nullable=False),
        sa.Column(
            "caterer_id",
            postgresql.UUID(as_uuid=False),
            sa.ForeignKey("caterers.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("name", sa.String(120), nullable=False),
        sa.Column("slug", sa.String(140), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("sort_order", sa.Integer(), server_default="0", nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.UniqueConstraint("caterer_id", "slug", name="uq_menu_categories_caterer_slug"),
    )
    op.create_index("ix_menu_categories_caterer_id", "menu_categories", ["caterer_id"])

    # 5. menu_items
    op.create_table(
        "menu_items",
        sa.Column("id", postgresql.UUID(as_uuid=False), primary_key=True, nullable=False),
        sa.Column(
            "caterer_id",
            postgresql.UUID(as_uuid=False),
            sa.ForeignKey("caterers.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "category_id",
            postgresql.UUID(as_uuid=False),
            sa.ForeignKey("menu_categories.id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("slug", sa.String(220), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("dietary_type", sa.String(40), nullable=True),
        sa.Column("image_url", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("sort_order", sa.Integer(), server_default="0", nullable=False),
        sa.Column("extra_metadata", sa.JSON(), nullable=True),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.UniqueConstraint("caterer_id", "slug", name="uq_menu_items_caterer_slug"),
    )
    op.create_index("ix_menu_items_caterer_id", "menu_items", ["caterer_id"])
    op.create_index("ix_menu_items_category_id", "menu_items", ["category_id"])
    op.create_index(
        "ix_menu_items_caterer_category_active",
        "menu_items",
        ["caterer_id", "category_id", "is_active"],
    )

    # 6. menu_item_functions (M2M)
    op.create_table(
        "menu_item_functions",
        sa.Column(
            "menu_item_id",
            postgresql.UUID(as_uuid=False),
            sa.ForeignKey("menu_items.id", ondelete="CASCADE"),
            primary_key=True,
            nullable=False,
        ),
        sa.Column(
            "function_type_id",
            postgresql.UUID(as_uuid=False),
            sa.ForeignKey("function_types.id", ondelete="CASCADE"),
            primary_key=True,
            nullable=False,
        ),
        sa.UniqueConstraint("menu_item_id", "function_type_id", name="uq_menu_item_functions"),
    )

    # 7. menu_item_offerings (M2M)
    op.create_table(
        "menu_item_offerings",
        sa.Column(
            "menu_item_id",
            postgresql.UUID(as_uuid=False),
            sa.ForeignKey("menu_items.id", ondelete="CASCADE"),
            primary_key=True,
            nullable=False,
        ),
        sa.Column(
            "offering_id",
            postgresql.UUID(as_uuid=False),
            sa.ForeignKey("catering_offerings.id", ondelete="CASCADE"),
            primary_key=True,
            nullable=False,
        ),
        sa.UniqueConstraint("menu_item_id", "offering_id", name="uq_menu_item_offerings"),
    )

    # 8. packages
    op.create_table(
        "packages",
        sa.Column("id", postgresql.UUID(as_uuid=False), primary_key=True, nullable=False),
        sa.Column(
            "caterer_id",
            postgresql.UUID(as_uuid=False),
            sa.ForeignKey("caterers.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("slug", sa.String(220), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("image_url", sa.Text(), nullable=True),
        sa.Column("min_guests", sa.Integer(), nullable=True),
        sa.Column("max_guests", sa.Integer(), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("sort_order", sa.Integer(), server_default="0", nullable=False),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.UniqueConstraint("caterer_id", "slug", name="uq_packages_caterer_slug"),
        sa.CheckConstraint(
            "(min_guests IS NULL OR min_guests > 0) AND "
            "(max_guests IS NULL OR (min_guests IS NULL OR max_guests >= min_guests))",
            name="ck_packages_guest_limits",
        ),
    )
    op.create_index("ix_packages_caterer_id", "packages", ["caterer_id"])

    # 9. package_functions (M2M)
    op.create_table(
        "package_functions",
        sa.Column(
            "package_id",
            postgresql.UUID(as_uuid=False),
            sa.ForeignKey("packages.id", ondelete="CASCADE"),
            primary_key=True,
            nullable=False,
        ),
        sa.Column(
            "function_type_id",
            postgresql.UUID(as_uuid=False),
            sa.ForeignKey("function_types.id", ondelete="CASCADE"),
            primary_key=True,
            nullable=False,
        ),
    )

    # 10. package_offerings (M2M)
    op.create_table(
        "package_offerings",
        sa.Column(
            "package_id",
            postgresql.UUID(as_uuid=False),
            sa.ForeignKey("packages.id", ondelete="CASCADE"),
            primary_key=True,
            nullable=False,
        ),
        sa.Column(
            "offering_id",
            postgresql.UUID(as_uuid=False),
            sa.ForeignKey("catering_offerings.id", ondelete="CASCADE"),
            primary_key=True,
            nullable=False,
        ),
    )

    # 11. package_items
    op.create_table(
        "package_items",
        sa.Column("id", postgresql.UUID(as_uuid=False), primary_key=True, nullable=False),
        sa.Column(
            "package_id",
            postgresql.UUID(as_uuid=False),
            sa.ForeignKey("packages.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "menu_item_id",
            postgresql.UUID(as_uuid=False),
            sa.ForeignKey("menu_items.id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column("inclusion_type", sa.String(30), server_default="INCLUDED", nullable=False),
        sa.Column("sort_order", sa.Integer(), server_default="0", nullable=False),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.UniqueConstraint("package_id", "menu_item_id", name="uq_package_items"),
    )
    op.create_index("ix_package_items_package_id", "package_items", ["package_id"])
    op.create_index("ix_package_items_menu_item_id", "package_items", ["menu_item_id"])

    # 12. package_selection_groups
    op.create_table(
        "package_selection_groups",
        sa.Column("id", postgresql.UUID(as_uuid=False), primary_key=True, nullable=False),
        sa.Column(
            "package_id",
            postgresql.UUID(as_uuid=False),
            sa.ForeignKey("packages.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("name", sa.String(150), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("min_selections", sa.Integer(), server_default="0", nullable=False),
        sa.Column("max_selections", sa.Integer(), server_default="1", nullable=False),
        sa.Column("sort_order", sa.Integer(), server_default="0", nullable=False),
        sa.Column("is_required", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.CheckConstraint(
            "min_selections >= 0 AND max_selections >= min_selections",
            name="ck_selection_groups_range",
        ),
    )
    op.create_index(
        "ix_package_selection_groups_package_id", "package_selection_groups", ["package_id"]
    )

    # 13. package_selection_group_items
    op.create_table(
        "package_selection_group_items",
        sa.Column("id", postgresql.UUID(as_uuid=False), primary_key=True, nullable=False),
        sa.Column(
            "selection_group_id",
            postgresql.UUID(as_uuid=False),
            sa.ForeignKey("package_selection_groups.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "menu_item_id",
            postgresql.UUID(as_uuid=False),
            sa.ForeignKey("menu_items.id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.UniqueConstraint("selection_group_id", "menu_item_id", name="uq_selection_group_items"),
    )
    op.create_index(
        "ix_package_selection_group_items_group_id",
        "package_selection_group_items",
        ["selection_group_id"],
    )
    op.create_index(
        "ix_package_selection_group_items_menu_item_id",
        "package_selection_group_items",
        ["menu_item_id"],
    )

    # 14. package_addons
    op.create_table(
        "package_addons",
        sa.Column("id", postgresql.UUID(as_uuid=False), primary_key=True, nullable=False),
        sa.Column(
            "package_id",
            postgresql.UUID(as_uuid=False),
            sa.ForeignKey("packages.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "menu_item_id",
            postgresql.UUID(as_uuid=False),
            sa.ForeignKey("menu_items.id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column("display_name", sa.String(200), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("sort_order", sa.Integer(), server_default="0", nullable=False),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
    )
    op.create_index("ix_package_addons_package_id", "package_addons", ["package_id"])
    op.create_index("ix_package_addons_menu_item_id", "package_addons", ["menu_item_id"])


def downgrade() -> None:
    op.drop_table("package_addons")
    op.drop_table("package_selection_group_items")
    op.drop_table("package_selection_groups")
    op.drop_table("package_items")
    op.drop_table("package_offerings")
    op.drop_table("package_functions")
    op.drop_table("packages")
    op.drop_table("menu_item_offerings")
    op.drop_table("menu_item_functions")
    op.drop_table("menu_items")
    op.drop_table("menu_categories")
    op.drop_table("function_offerings")
    op.drop_table("catering_offerings")
    op.drop_table("function_types")
