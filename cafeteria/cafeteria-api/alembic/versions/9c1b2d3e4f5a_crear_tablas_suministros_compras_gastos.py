"""Crear tablas suministros, compras y gastos

Revision ID: 9c1b2d3e4f5a
Revises: 6fb8c23e0923
Create Date: 2026-07-05 22:10:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9c1b2d3e4f5a'
down_revision: Union[str, Sequence[str], None] = '6fb8c23e0923'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('ingrediente',
    sa.Column('id_ingrediente', sa.Integer(), nullable=False),
    sa.Column('nombre', sa.String(length=100), nullable=False),
    sa.Column('unidad_medida', sa.String(length=30), nullable=False),
    sa.Column('stock', sa.Numeric(precision=10, scale=2), nullable=True),
    sa.Column('stock_minimo', sa.Numeric(precision=10, scale=2), nullable=True),
    sa.Column('activo', sa.Boolean(), nullable=True),
    sa.PrimaryKeyConstraint('id_ingrediente'),
    sa.UniqueConstraint('nombre')
    )
    op.create_index(op.f('ix_ingrediente_id_ingrediente'), 'ingrediente', ['id_ingrediente'], unique=False)

    op.create_table('compra',
    sa.Column('id_compra', sa.Integer(), nullable=False),
    sa.Column('fecha', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.Column('proveedor', sa.String(length=120), nullable=False),
    sa.Column('total', sa.Numeric(precision=10, scale=2), nullable=True),
    sa.Column('id_usuario', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['id_usuario'], ['usuario.id_usuario'], ),
    sa.PrimaryKeyConstraint('id_compra')
    )
    op.create_index(op.f('ix_compra_id_compra'), 'compra', ['id_compra'], unique=False)

    op.create_table('gasto',
    sa.Column('id_gasto', sa.Integer(), nullable=False),
    sa.Column('fecha', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.Column('concepto', sa.String(length=120), nullable=False),
    sa.Column('categoria', sa.String(length=80), nullable=False),
    sa.Column('monto', sa.Numeric(precision=10, scale=2), nullable=False),
    sa.Column('descripcion', sa.Text(), nullable=True),
    sa.Column('id_usuario', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['id_usuario'], ['usuario.id_usuario'], ),
    sa.PrimaryKeyConstraint('id_gasto')
    )
    op.create_index(op.f('ix_gasto_id_gasto'), 'gasto', ['id_gasto'], unique=False)

    op.create_table('detalle_compra',
    sa.Column('id_detalle_compra', sa.Integer(), nullable=False),
    sa.Column('cantidad', sa.Numeric(precision=10, scale=2), nullable=False),
    sa.Column('costo_unitario', sa.Numeric(precision=10, scale=2), nullable=False),
    sa.Column('subtotal', sa.Numeric(precision=10, scale=2), nullable=False),
    sa.Column('id_compra', sa.Integer(), nullable=False),
    sa.Column('id_ingrediente', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['id_compra'], ['compra.id_compra'], ),
    sa.ForeignKeyConstraint(['id_ingrediente'], ['ingrediente.id_ingrediente'], ),
    sa.PrimaryKeyConstraint('id_detalle_compra')
    )
    op.create_index(op.f('ix_detalle_compra_id_detalle_compra'), 'detalle_compra', ['id_detalle_compra'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_detalle_compra_id_detalle_compra'), table_name='detalle_compra')
    op.drop_table('detalle_compra')
    op.drop_index(op.f('ix_gasto_id_gasto'), table_name='gasto')
    op.drop_table('gasto')
    op.drop_index(op.f('ix_compra_id_compra'), table_name='compra')
    op.drop_table('compra')
    op.drop_index(op.f('ix_ingrediente_id_ingrediente'), table_name='ingrediente')
    op.drop_table('ingrediente')
