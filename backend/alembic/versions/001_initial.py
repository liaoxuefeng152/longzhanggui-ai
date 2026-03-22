"""初始数据库迁移

Revision ID: 001
Revises: 
Create Date: 2024-01-01

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 用户表
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('phone', sa.String(20), nullable=False, unique=True),
        sa.Column('password_hash', sa.String(255), nullable=True),
        sa.Column('nickname', sa.String(50), nullable=True),
        sa.Column('avatar', sa.String(500), nullable=True),
        sa.Column('role', sa.String(20), nullable=False, default='user'),
        sa.Column('status', sa.String(20), nullable=False, default='active'),
        sa.Column('call_quota', sa.Integer(), nullable=False, default=0),
        sa.Column('quota_expire', sa.DateTime(), nullable=True),
        sa.Column('last_login', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now(), onupdate=sa.func.now()),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_users_phone', 'users', ['phone'])
    
    # 套餐表
    op.create_table(
        'packages',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(50), nullable=False),
        sa.Column('price', sa.Integer(), nullable=False, default=0),
        sa.Column('call_quota', sa.Integer(), nullable=False),
        sa.Column('duration', sa.Integer(), nullable=False),
        sa.Column('features', sa.Text(), nullable=True),
        sa.Column('status', sa.String(20), nullable=False, default='active'),
        sa.Column('sort_order', sa.Integer(), nullable=False, default=0),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now(), onupdate=sa.func.now()),
        sa.PrimaryKeyConstraint('id')
    )
    
    # 飞书用户表
    op.create_table(
        'feishu_users',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('feishu_user_id', sa.String(100), nullable=False, unique=True),
        sa.Column('name', sa.String(100), nullable=True),
        sa.Column('avatar_url', sa.String(500), nullable=True),
        sa.Column('department_id', sa.String(100), nullable=True),
        sa.Column('department_name', sa.String(200), nullable=True),
        sa.Column('main_user_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now(), onupdate=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['main_user_id'], ['users.id'], ondelete='SET NULL')
    )


def downgrade() -> None:
    op.drop_table('feishu_users')
    op.drop_table('packages')
    op.drop_table('users')
