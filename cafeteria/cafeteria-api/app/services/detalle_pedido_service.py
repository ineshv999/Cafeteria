from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.detalle_pedido import DetallePedido
from app.models.pedido import Pedido
from app.models.producto import Producto


class DetallePedidoService:

    @staticmethod
    def crear(db: Session, datos):

        pedido = (
            db.query(Pedido)
            .filter(Pedido.id_pedido == datos.id_pedido)
            .first()
        )

        if not pedido:
            raise HTTPException(
                status_code=404,
                detail="Pedido no encontrado."
            )

        producto = (
            db.query(Producto)
            .filter(Producto.id_producto == datos.id_producto)
            .first()
        )

        if not producto:
            raise HTTPException(
                status_code=404,
                detail="Producto no encontrado."
            )

        precio = Decimal(producto.precio)

        subtotal = precio * datos.cantidad

        detalle = DetallePedido(
            id_pedido=datos.id_pedido,
            id_producto=datos.id_producto,
            cantidad=datos.cantidad,
            precio_unitario=precio,
            subtotal=subtotal
        )

        db.add(detalle)

        pedido.total += subtotal

        db.commit()

        db.refresh(detalle)

        return detalle
    
    @staticmethod
    def listar_por_pedido(
        db: Session,
        id_pedido: int
    ):
        return (
            db.query(DetallePedido)
            .filter(
                DetallePedido.id_pedido == id_pedido
            )
            .all()
        )