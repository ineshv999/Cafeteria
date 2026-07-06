from sqlalchemy import Column, ForeignKey, Integer, Numeric
from sqlalchemy.orm import relationship

from app.database import Base


class DetalleCompra(Base):

    __tablename__ = "detalle_compra"

    id_detalle_compra = Column(
        Integer,
        primary_key=True,
        index=True
    )

    cantidad = Column(
        Numeric(10, 2),
        nullable=False
    )

    costo_unitario = Column(
        Numeric(10, 2),
        nullable=False
    )

    subtotal = Column(
        Numeric(10, 2),
        nullable=False
    )

    id_compra = Column(
        Integer,
        ForeignKey("compra.id_compra"),
        nullable=False
    )

    id_ingrediente = Column(
        Integer,
        ForeignKey("ingrediente.id_ingrediente"),
        nullable=False
    )

    compra = relationship(
        "Compra",
        back_populates="detalles"
    )

    ingrediente = relationship(
        "Ingrediente",
        back_populates="detalles_compra"
    )
