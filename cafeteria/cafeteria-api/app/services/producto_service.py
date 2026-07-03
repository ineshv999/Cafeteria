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
    
    @staticmethod
    def actualizar(
        db: Session,
        id_producto: int,
        datos
    ):

        producto = (
            db.query(Producto)
            .filter(
                Producto.id_producto == id_producto
            )
            .first()
        )

        if not producto:
            raise HTTPException(
                status_code=404,
                detail="Producto no encontrado."
            )

        producto.nombre = datos.nombre
        producto.descripcion = datos.descripcion
        producto.precio = datos.precio
        producto.stock = datos.stock
        producto.imagen = datos.imagen
        producto.activo = datos.activo
        producto.id_categoria = datos.id_categoria

        db.commit()
        db.refresh(producto)

        return producto