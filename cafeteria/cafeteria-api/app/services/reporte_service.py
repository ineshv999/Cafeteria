from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.usuario import Usuario
from app.models.producto import Producto
from app.models.categoria import Categoria
from app.models.pedido import Pedido


class ReporteService:

    @staticmethod
    def obtener(db: Session):

        total_usuarios = db.query(Usuario).count()

        total_productos = db.query(Producto).count()

        total_categorias = db.query(Categoria).count()

        total_pedidos = db.query(Pedido).count()

        ventas = db.query(
            func.sum(Pedido.total)
        ).scalar() or 0

        poco_stock = (
            db.query(Producto)
            .filter(Producto.stock <= 5)
            .count()
        )

        return {

            "usuarios": total_usuarios,

            "productos": total_productos,

            "categorias": total_categorias,

            "pedidos": total_pedidos,

            "ventas": float(ventas),

            "poco_stock": poco_stock

        }