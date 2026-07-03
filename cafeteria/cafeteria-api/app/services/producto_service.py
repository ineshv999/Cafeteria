from sqlalchemy.orm import Session

from app.models.producto import Producto


class ProductoService:

    @staticmethod
    def listar(db: Session):
        return db.query(Producto).all()

    @staticmethod
    def obtener(db: Session, id_producto: int):
        return (
            db.query(Producto)
            .filter(Producto.id_producto == id_producto)
            .first()
        )

    @staticmethod
    def crear(db: Session, datos):

        producto = Producto(
            nombre=datos.nombre,
            descripcion=datos.descripcion,
            precio=datos.precio,
            stock=datos.stock,
            imagen=datos.imagen,
            activo=datos.activo,
            id_categoria=datos.id_categoria
        )

        db.add(producto)
        db.commit()
        db.refresh(producto)

        return producto

    @staticmethod
    def eliminar(db: Session, id_producto: int):

        producto = ProductoService.obtener(
            db,
            id_producto
        )

        if producto:
            db.delete(producto)
            db.commit()

        return producto