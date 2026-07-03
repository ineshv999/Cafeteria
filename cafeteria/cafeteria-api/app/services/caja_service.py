from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.pedido import Pedido
from app.models.mesa import Mesa


class CajaService:

    @staticmethod
    def pedidos_listos(db: Session):

        return (
            db.query(Pedido)
            .filter(Pedido.estado == "Listo")
            .all()
        )

    @staticmethod
    def cobrar(db: Session, id_pedido: int):

        pedido = (
            db.query(Pedido)
            .filter(Pedido.id_pedido == id_pedido)
            .first()
        )

        if not pedido:
            raise HTTPException(
                status_code=404,
                detail="Pedido no encontrado."
            )

        mesa = (
            db.query(Mesa)
            .filter(Mesa.id_mesa == pedido.id_mesa)
            .first()
        )

        pedido.estado = "Pagado"

        mesa.estado = "Libre"

        db.commit()

        db.refresh(pedido)

        return pedido