"""sync opportunity and service schema

Revision ID: 081cf780a66c
Revises: 3bb5d59d751c
Create Date: 2026-09-15 14:19:45.450876

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "081cf780a66c"
down_revision: Union[str, Sequence[str], None] = "3bb5d59d751c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # --------------------------------------------------
    # CREATE ENUM TYPES
    # --------------------------------------------------

    opportunity_type_enum = postgresql.ENUM(
        "EVENT",
        "POSITION",
        name="opportunitytype",
        create_type=False,
    )

    payment_type_enum = postgresql.ENUM(
        "PAID",
        "UNPAID",
        name="paymenttype",
        create_type=False,
    )

    opportunity_status_enum = postgresql.ENUM(
        "DRAFT",
        "PUBLISHED",
        "ONGOING",
        "COMPLETED",
        "CANCELLED",
        "EXPIRED",
        name="opportunitystatus",
        create_type=False,
    )

    opportunity_type_enum.create(op.get_bind(), checkfirst=True)
    payment_type_enum.create(op.get_bind(), checkfirst=True)
    opportunity_status_enum.create(op.get_bind(), checkfirst=True)

    # --------------------------------------------------
    # ADD ONLY COLUMNS THAT DO NOT ALREADY EXIST
    # --------------------------------------------------

    bind = op.get_bind()
    inspector = sa.inspect(bind)

    existing_columns = {
        column["name"]
        for column in inspector.get_columns("opportunities")
    }

    if "opportunity_type" not in existing_columns:
        op.add_column(
            "opportunities",
            sa.Column(
                "opportunity_type",
                opportunity_type_enum,
                nullable=True,
            ),
        )

    if "payment_type" not in existing_columns:
        op.add_column(
            "opportunities",
            sa.Column(
                "payment_type",
                payment_type_enum,
                nullable=True,
            ),
        )

    if "start_time" not in existing_columns:
        op.add_column(
            "opportunities",
            sa.Column(
                "start_time",
                sa.Time(),
                nullable=True,
            ),
        )

    if "end_time" not in existing_columns:
        op.add_column(
            "opportunities",
            sa.Column(
                "end_time",
                sa.Time(),
                nullable=True,
            ),
        )

    if "requirements" not in existing_columns:
        op.add_column(
            "opportunities",
            sa.Column(
                "requirements",
                sa.Text(),
                nullable=True,
            ),
        )

    if "application_deadline" not in existing_columns:
        op.add_column(
            "opportunities",
            sa.Column(
                "application_deadline",
                sa.DateTime(),
                nullable=True,
            ),
        )

    if "status" not in existing_columns:
        op.add_column(
            "opportunities",
            sa.Column(
                "status",
                opportunity_status_enum,
                nullable=True,
            ),
        )

    if "original_opportunity_id" not in existing_columns:
        op.add_column(
            "opportunities",
            sa.Column(
                "original_opportunity_id",
                sa.Integer(),
                nullable=True,
            ),
        )

    # --------------------------------------------------
    # SET DEFAULT VALUES
    # --------------------------------------------------

    op.execute(
        """
        UPDATE opportunities
        SET opportunity_type = 'EVENT'
        WHERE opportunity_type IS NULL
        """
    )

    op.execute(
        """
        UPDATE opportunities
        SET payment_type = 'UNPAID'
        WHERE payment_type IS NULL
        """
    )

    op.execute(
        """
        UPDATE opportunities
        SET status = 'PUBLISHED'
        WHERE status IS NULL
        """
    )

    # --------------------------------------------------
    # MAKE REQUIRED COLUMNS NON-NULLABLE
    # --------------------------------------------------

    op.alter_column(
        "opportunities",
        "opportunity_type",
        existing_type=opportunity_type_enum,
        nullable=False,
    )

    op.alter_column(
        "opportunities",
        "payment_type",
        existing_type=payment_type_enum,
        nullable=False,
    )

    op.alter_column(
        "opportunities",
        "status",
        existing_type=opportunity_status_enum,
        nullable=False,
    )

    # --------------------------------------------------
    # CONVERT DATE COLUMN
    # --------------------------------------------------

    columns = {
        column["name"]: column
        for column in inspector.get_columns("opportunities")
    }

    date_column = columns.get("date")

    if date_column is not None:
        current_type = date_column["type"]

        if isinstance(current_type, postgresql.TIMESTAMP):
            op.alter_column(
                "opportunities",
                "date",
                existing_type=postgresql.TIMESTAMP(),
                type_=sa.Date(),
                existing_nullable=True,
                postgresql_using="date::date",
            )

    # --------------------------------------------------
    # CREATE SELF-REFERENCING FOREIGN KEY IF MISSING
    # --------------------------------------------------

    foreign_keys = inspector.get_foreign_keys("opportunities")

    fk_exists = any(
        fk.get("name") == "fk_opportunities_original_opportunity_id"
        for fk in foreign_keys
    )

    if not fk_exists:
        op.create_foreign_key(
            "fk_opportunities_original_opportunity_id",
            "opportunities",
            "opportunities",
            ["original_opportunity_id"],
            ["id"],
        )

    # --------------------------------------------------
    # SERVICE DESCRIPTION BECOMES OPTIONAL
    # --------------------------------------------------

    op.alter_column(
        "services",
        "description",
        existing_type=sa.TEXT(),
        nullable=True,
    )


def downgrade() -> None:
    # --------------------------------------------------
    # SERVICE DESCRIPTION
    # --------------------------------------------------

    op.alter_column(
        "services",
        "description",
        existing_type=sa.TEXT(),
        nullable=False,
    )

    # --------------------------------------------------
    # DROP SELF-REFERENCING FOREIGN KEY
    # --------------------------------------------------

    op.drop_constraint(
        "fk_opportunities_original_opportunity_id",
        "opportunities",
        type_="foreignkey",
    )

    # --------------------------------------------------
    # CONVERT DATE BACK TO TIMESTAMP
    # --------------------------------------------------

    op.alter_column(
        "opportunities",
        "date",
        existing_type=sa.Date(),
        type_=postgresql.TIMESTAMP(),
        existing_nullable=True,
        postgresql_using="date::timestamp",
    )

    # --------------------------------------------------
    # DROP COLUMNS
    # --------------------------------------------------

    op.drop_column(
        "opportunities",
        "original_opportunity_id",
    )

    op.drop_column(
        "opportunities",
        "status",
    )

    op.drop_column(
        "opportunities",
        "application_deadline",
    )

    op.drop_column(
        "opportunities",
        "requirements",
    )

    op.drop_column(
        "opportunities",
        "end_time",
    )

    op.drop_column(
        "opportunities",
        "start_time",
    )

    op.drop_column(
        "opportunities",
        "payment_type",
    )

    op.drop_column(
        "opportunities",
        "opportunity_type",
    )

    # --------------------------------------------------
    # DROP ENUM TYPES
    # --------------------------------------------------

    opportunity_status_enum = postgresql.ENUM(
        "DRAFT",
        "PUBLISHED",
        "ONGOING",
        "COMPLETED",
        "CANCELLED",
        "EXPIRED",
        name="opportunitystatus",
    )

    payment_type_enum = postgresql.ENUM(
        "PAID",
        "UNPAID",
        name="paymenttype",
    )

    opportunity_type_enum = postgresql.ENUM(
        "EVENT",
        "POSITION",
        name="opportunitytype",
    )

    opportunity_status_enum.drop(
        op.get_bind(),
        checkfirst=True,
    )

    payment_type_enum.drop(
        op.get_bind(),
        checkfirst=True,
    )

    opportunity_type_enum.drop(
        op.get_bind(),
        checkfirst=True,
    )