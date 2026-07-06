from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.ingrediente import Ingrediente


class IngredienteService:

    @staticmethod
    def listar(
        db: Session,
        nombre: str = None,
        activo: bool = None,
        stock_bajo: bool = False,
        skip: int = 0,
        limit: int = 100
    ):

        consulta = db.query(Ingrediente)

        if nombre:
            consulta = consulta.filter(
                Ingrediente.nombre.ilike(f"%{nombre}%")
            )

        if activo is not None:
            consulta = consulta.filter(
                Ingrediente.activo == activo
            )

        if stock_bajo:
            consulta = consulta.filter(
                Ingrediente.stock <= Ingrediente.stock_minimo
            )

        return (
            consulta
            .offset(skip)
            .limit(limit)
            .all()
        )

    @staticmethod
    def obtener(db: Session, id_ingrediente: int):

        ingrediente = (
            db.query(Ingrediente)
            .filter(Ingrediente.id_ingrediente == id_ingrediente)
            .first()
        )

        if not ingrediente:
            raise HTTPException(
                status_code=404,
                detail="Suministro no encontrado."
            )

        return ingrediente

    @staticmethod
    def crear(db: Session, datos):

        ingrediente = Ingrediente(
            nombre=datos.nombre,
            unidad_medida=datos.unidad_medida,
            stock=datos.stock,
            stock_minimo=datos.stock_minimo,
            activo=datos.activo
        )

        db.add(ingrediente)
        db.commit()
        db.refresh(ingrediente)

        return ingrediente

    @staticmethod
    def actualizar(db: Session, id_ingrediente: int, datos):

        ingrediente = IngredienteService.obtener(
            db,
            id_ingrediente
        )

        ingrediente.nombre = datos.nombre
        ingrediente.unidad_medida = datos.unidad_medida
        ingrediente.stock = datos.stock
        ingrediente.stock_minimo = datos.stock_minimo
        ingrediente.activo = datos.activo

        db.commit()
        db.refresh(ingrediente)

        return ingrediente

    @staticmethod
    def actualizar_stock(db: Session, id_ingrediente: int, datos):

        ingrediente = IngredienteService.obtener(
            db,
            id_ingrediente
        )

        ingrediente.stock = datos.stock

        db.commit()
        db.refresh(ingrediente)

        return ingrediente

    @staticmethod
    def eliminar(db: Session, id_ingrediente: int):

        ingrediente = IngredienteService.obtener(
            db,
            id_ingrediente
        )

        db.delete(ingrediente)
        db.commit()

        return ingrediente
