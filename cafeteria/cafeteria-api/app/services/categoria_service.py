from sqlalchemy.orm import Session

from app.models.categoria import Categoria


class CategoriaService:

    @staticmethod
    def listar(db: Session):
        return db.query(Categoria).all()

    @staticmethod
    def obtener(db: Session, id_categoria: int):
        return (
            db.query(Categoria)
            .filter(Categoria.id_categoria == id_categoria)
            .first()
        )

    @staticmethod
    def crear(db: Session, datos):

        categoria = Categoria(
            nombre=datos.nombre,
            descripcion=datos.descripcion
        )

        db.add(categoria)
        db.commit()
        db.refresh(categoria)

        return categoria

    @staticmethod
    def eliminar(db: Session, id_categoria: int):

        categoria = CategoriaService.obtener(
            db,
            id_categoria
        )

        if categoria:
            db.delete(categoria)
            db.commit()

        return categoria