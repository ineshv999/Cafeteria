from sqlalchemy import Column, DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Compra(Base):

    __tablename__ = "compra"

    id_compra = Column(
        Integer,
        primary_key=True,
        index=True
    )

    fecha = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    proveedor = Column(
        String(120),
        nullable=False
    )

    total = Column(
        Numeric(10, 2),
        default=0
    )

    id_usuario = Column(
        Integer,
        ForeignKey("usuario.id_usuario"),
        nullable=False
    )

    usuario = relationship("Usuario")

    detalles = relationship(
        "DetalleCompra",
        back_populates="compra",
        cascade="all, delete-orphan"
    )
