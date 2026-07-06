from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.gasto import Gasto


class GastoService:

    @staticmethod
    def listar(
        db: Session,
        categoria: str = None,
        skip: int = 0,
        limit: int = 100
    ):

        consulta = db.query(Gasto)

        if categoria:
            consulta = consulta.filter(
                Gasto.categoria.ilike(f"%{categoria}%")
            )

        return (
            consulta
            .offset(skip)
            .limit(limit)
            .all()
        )

    @staticmethod
    def obtener(db: Session, id_gasto: int):

        gasto = (
            db.query(Gasto)
            .filter(Gasto.id_gasto == id_gasto)
            .first()
        )

        if not gasto:
            raise HTTPException(
                status_code=404,
                detail="Gasto no encontrado."
            )

        return gasto

    @staticmethod
    def crear(db: Session, datos, usuario_id: int):

        gasto = Gasto(
            concepto=datos.concepto,
            categoria=datos.categoria,
            monto=datos.monto,
            descripcion=datos.descripcion,
            id_usuario=usuario_id
        )

        db.add(gasto)
        db.commit()
        db.refresh(gasto)

        return gasto

    @staticmethod
    def actualizar(db: Session, id_gasto: int, datos):

        gasto = GastoService.obtener(db, id_gasto)

        gasto.concepto = datos.concepto
        gasto.categoria = datos.categoria
        gasto.monto = datos.monto
        gasto.descripcion = datos.descripcion

        db.commit()
        db.refresh(gasto)

        return gasto

    @staticmethod
    def eliminar(db: Session, id_gasto: int):

        gasto = GastoService.obtener(db, id_gasto)

        db.delete(gasto)
        db.commit()

        return gasto
