from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.usuario import Usuario
from app.models.producto import Producto
from app.models.pedido import Pedido
from app.models.categoria import Categoria
from app.models.mesa import Mesa


class DashboardService:

    @staticmethod
    def obtener(db: Session):

        ventas = db.query(
            func.sum(Pedido.total)
        ).scalar() or 0

        pedidos = db.query(Pedido).count()

        usuarios = db.query(Usuario).count()

        productos = db.query(Producto).count()

        categorias = db.query(Categoria).count()

        mesas_ocupadas = db.query(Mesa).filter(
            Mesa.estado == "Ocupada"
        ).count()

        stock_bajo = db.query(Producto).filter(
            Producto.stock <= 5
        ).count()

        maximo = max(
                    ventas,
                    pedidos,
                    productos,
                    usuarios,
                    categorias,
                    1
                )

        productos_stock = (
            db.query(Producto)
            .filter(Producto.stock <= 5)
            .all()
        )

        insumos = []

        for p in productos_stock:
            insumos.append({
                "producto": p.nombre,
                "descripcion": f"Stock: {p.stock}",
                "monto": p.stock,
                "tipo": "minus"
            })


        return {

            "ganancias": float(ventas),

            "ordenes": pedidos,

            "usuarios": usuarios,

            "productos": productos,

            "categorias": categorias,

            "mesas_ocupadas": mesas_ocupadas,
            
            "stock_bajo": stock_bajo,

            "ventas_barra": ventas / maximo * 100,
            "pedidos_barra": pedidos / maximo * 100,
            "productos_barra": productos / maximo * 100,
            "usuarios_barra": usuarios / maximo * 100,

            "insumos": insumos,

        }