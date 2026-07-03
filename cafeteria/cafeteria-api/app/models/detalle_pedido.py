from sqlalchemy import (
    Column,
    Integer,
    Numeric,
    ForeignKey
)

from sqlalchemy.orm import relationship

from app.database import Base


class DetallePedido(Base):

    __tablename__ = "detalle_pedido"

    id_detalle = Column(
        Integer,
        primary_key=True,
        index=True
    )

    cantidad = Column(
        Integer,
        nullable=False
    )

    precio_unitario = Column(
        Numeric(10, 2),
        nullable=False
    )

    subtotal = Column(
        Numeric(10, 2),
        nullable=False
    )

    id_pedido = Column(
        Integer,
        ForeignKey("pedido.id_pedido"),
        nullable=False
    )

    id_producto = Column(
        Integer,
        ForeignKey("producto.id_producto"),
        nullable=False
    )

    pedido = relationship(
    "Pedido",
    back_populates="detalles"
    )

    producto = relationship("Producto")