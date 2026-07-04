from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.pedido import Pedido
from app.models.mesa import Mesa

from app.models.detalle_pedido import DetallePedido

from app.models.producto import Producto

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

        if mesa:
            mesa.estado = "Libre"

        detalles = (
            db.query(DetallePedido)
            .filter(DetallePedido.id_pedido == id_pedido)
            .all()
        )

        for detalle in detalles:

            producto = (
                db.query(Producto)
                .filter(
                    Producto.id_producto == detalle.id_producto
                )
                .first()
            )

            if producto:
                producto.stock += detalle.cantidad

            db.delete(detalle)

        db.delete(pedido)

        db.commit()

    @staticmethod
    def listar(
        db: Session,
        estado: str = None,
        id_mesa: int = None,
        id_usuario: int = None,
        skip: int = 0,
        limit: int = 100
    ):

        consulta = db.query(Pedido)

        if estado:
            consulta = consulta.filter(
                Pedido.estado == estado
            )

        if id_mesa:
            consulta = consulta.filter(
                Pedido.id_mesa == id_mesa
            )

        if id_usuario:
            consulta = consulta.filter(
                Pedido.id_usuario == id_usuario
            )

        return (
            consulta
            .offset(skip)
            .limit(limit)
            .all()
        )