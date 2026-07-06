from sqlalchemy import Column, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Gasto(Base):

    __tablename__ = "gasto"

    id_gasto = Column(
        Integer,
        primary_key=True,
        index=True
    )

    fecha = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    concepto = Column(
        String(120),
        nullable=False
    )

    categoria = Column(
        String(80),
        nullable=False
    )

    monto = Column(
        Numeric(10, 2),
        nullable=False
    )

    descripcion = Column(Text)

    id_usuario = Column(
        Integer,
        ForeignKey("usuario.id_usuario"),
        nullable=False
    )

    usuario = relationship("Usuario")
