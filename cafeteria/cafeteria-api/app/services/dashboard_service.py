from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.usuario import Usuario
from app.models.producto import Producto
from app.models.categoria import Categoria
from app.models.pedido import Pedido
from app.models.mesa import Mesa


class DashboardService:

    @staticmethod
    def obtener(db: Session):

        return {

            "usuarios": db.query(Usuario).count(),

            "productos": db.query(Producto).count(),

            "categorias": db.query(Categoria).count(),

            "pedidos": db.query(Pedido).count(),

            "mesas_ocupadas": db.query(Mesa).filter(
                Mesa.estado == "Ocupada"
            ).count(),

            "productos_stock_bajo": db.query(Producto).filter(
                Producto.stock <= 5
            ).count(),

            "ventas": db.query(
                func.coalesce(func.sum(Pedido.total), 0)
            ).scalar()

        }