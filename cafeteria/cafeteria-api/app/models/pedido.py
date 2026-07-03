from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    Numeric,
    ForeignKey
)

from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Pedido(Base):

    __tablename__ = "pedido"

    id_pedido = Column(
        Integer,
        primary_key=True,
        index=True
    )

    fecha = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    estado = Column(
        String(30),
        default="Pendiente"
    )

    total = Column(
        Numeric(10, 2),
        default=0
    )

    id_mesa = Column(
        Integer,
        ForeignKey("mesa.id_mesa"),
        nullable=False
    )

    id_usuario = Column(
        Integer,
        ForeignKey("usuario.id_usuario"),
        nullable=False
    )

    mesa = relationship("Mesa")
    usuario = relationship("Usuario")