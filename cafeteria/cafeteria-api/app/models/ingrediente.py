from sqlalchemy import Boolean, Column, Integer, Numeric, String
from sqlalchemy.orm import relationship

from app.database import Base


class Ingrediente(Base):

    __tablename__ = "ingrediente"

    id_ingrediente = Column(
        Integer,
        primary_key=True,
        index=True
    )

    nombre = Column(
        String(100),
        unique=True,
        nullable=False
    )

    unidad_medida = Column(
        String(30),
        nullable=False
    )

    stock = Column(
        Numeric(10, 2),
        default=0
    )

    stock_minimo = Column(
        Numeric(10, 2),
        default=0
    )

    activo = Column(
        Boolean,
        default=True
    )

    detalles_compra = relationship(
        "DetalleCompra",
        back_populates="ingrediente"
    )
