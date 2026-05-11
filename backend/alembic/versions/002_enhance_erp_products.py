"""增强ERP商品表 - 支持工作流数据流转

Revision ID: 002
Revises: 001
Create Date: 2024-01-15

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '002'
down_revision: Union[str, None] = '001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # erp_products 表新增字段
    op.add_column('erp_products', sa.Column('description', sa.Text(), nullable=True))
    op.add_column('erp_products', sa.Column('weight', sa.Numeric(10, 3), nullable=True, server_default='0'))
    op.add_column('erp_products', sa.Column('source_id', sa.String(100), nullable=True))
    op.add_column('erp_products', sa.Column('sale_title', sa.String(500), nullable=True))
    op.add_column('erp_products', sa.Column('sale_description', sa.Text(), nullable=True))
    op.add_column('erp_products', sa.Column('sale_keywords', sa.Text(), nullable=True))
    op.add_column('erp_products', sa.Column('suggested_price', sa.Numeric(10, 2), nullable=True))
    op.add_column('erp_products', sa.Column('target_profit_rate', sa.Numeric(5, 2), nullable=True, server_default='0.30'))
    op.add_column('erp_products', sa.Column('listing_status', sa.String(20), nullable=True, server_default='pending'))
    op.add_column('erp_products', sa.Column('workflow_status', sa.String(20), nullable=True, server_default='draft'))
    op.add_column('erp_products', sa.Column('selection_id', sa.String(36), nullable=True))
    
    # collection_1688 表新增weight字段
    op.add_column('collection_1688', sa.Column('weight', sa.Numeric(10, 3), nullable=True, server_default='0'))


def downgrade() -> None:
    op.drop_column('erp_products', 'description')
    op.drop_column('erp_products', 'weight')
    op.drop_column('erp_products', 'source_id')
    op.drop_column('erp_products', 'sale_title')
    op.drop_column('erp_products', 'sale_description')
    op.drop_column('erp_products', 'sale_keywords')
    op.drop_column('erp_products', 'suggested_price')
    op.drop_column('erp_products', 'target_profit_rate')
    op.drop_column('erp_products', 'listing_status')
    op.drop_column('erp_products', 'workflow_status')
    op.drop_column('erp_products', 'selection_id')
    op.drop_column('collection_1688', 'weight')
