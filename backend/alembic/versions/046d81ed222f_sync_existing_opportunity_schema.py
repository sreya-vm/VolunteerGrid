"""sync existing opportunity schema

Revision ID: 046d81ed222f
Revises: 081cf780a66c
Create Date: 2026-09-15 23:30:55.911248

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '046d81ed222f'
down_revision: Union[str, Sequence[str], None] = '081cf780a66c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
