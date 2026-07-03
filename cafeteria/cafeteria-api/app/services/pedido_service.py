from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.pedido import Pedido
from app.models.mesa import Mesa

from app.models.detalle_pedido import DetallePedido


class PedidoService:

    @staticmethod
    def crear(db: Session, datos, usuario_id: int):

        mesa = (
            db.query(Mesa)
            .filter(Mesa.id_mesa == datos.id_mesa)
            .first()
        )

        if not mesa:
            raise HTTPException(
                status_code=404,
                detail="La mesa no existe."
            )

        if mesa.estado != "Libre":
            raise HTTPException(
                status_code=409,
                detail="La mesa no está disponible."
            )

        mesa.estado = "Ocupada"

        pedido = Pedido(
            id_mesa=datos.id_mesa,
            id_usuario=usuario_id,
            estado="Pendiente",
            total=0
        )

        db.add(pedido)
        db.commit()
        db.refresh(pedido)

        return pedido

    @staticmethod
    def listar(db: Session):
        return db.query(Pedido).all()

    @staticmethod
    def cambiar_estado(
        db: Session,
        id_pedido: int,
        estado: str
    ):

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

        pedido.estado = estado

        db.commit()
        db.refresh(pedido)

        return pedido
    
    @staticmethod
    def obtener(
        db: Session,
        id_pedido: int
    ):

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

        return pedido
    
    @staticmethod
    def eliminar(
        db: Session,
        id_pedido: int
    ):

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

        detalles = (
            db.query(DetallePedido)
            .filter(DetallePedido.id_pedido == id_pedido)
            .all()
        )

        for detalle in detalles:
            db.delete(detalle)

        if mesa:
            mesa.estado = "Libre"

        db.delete(pedido)

        db.commit()