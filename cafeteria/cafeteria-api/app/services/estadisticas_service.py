from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.pedido import Pedido
from app.models.detalle_pedido import DetallePedido


class EstadisticasService:

    @staticmethod
    def resumen(db: Session):

        pedidos_pagados = (
            db.query(Pedido)
            .filter(Pedido.estado == "Pagado")
            .count()
        )

        ventas = (
            db.query(
                func.sum(Pedido.total)
            )
            .filter(Pedido.estado == "Pagado")
            .scalar()
        )

        if ventas is None:
            ventas = 0

        productos = (
            db.query(
                func.sum(
                    DetallePedido.cantidad
                )
            )
            .scalar()
        )

        if productos is None:
            productos = 0

        ticket = 0

        if pedidos_pagados > 0:
            ticket = ventas / pedidos_pagados

        return {
            "ventas": ventas,
            "pedidos": pedidos_pagados,
            "productos": productos,
            "ticket_promedio": ticket
        }