from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.mesa import Mesa


class MesaService:

    @staticmethod
    def listar(
        db: Session,
        estado: str = None,
        capacidad: int = None,
        skip: int = 0,
        limit: int = 100
    ):

        consulta = db.query(Mesa)

        if estado:
            consulta = consulta.filter(
                Mesa.estado == estado
            )

        if capacidad:
            consulta = consulta.filter(
                Mesa.capacidad >= capacidad
            )

        return (
            consulta
            .offset(skip)
            .limit(limit)
            .all()
        )

    @staticmethod
    def obtener(db: Session, id_mesa: int):
        return (
            db.query(Mesa)
            .filter(Mesa.id_mesa == id_mesa)
            .first()
        )

    @staticmethod
    def crear(db: Session, datos):

        mesa = Mesa(
            numero=datos.numero,
            capacidad=datos.capacidad,
            estado=datos.estado
        )

        db.add(mesa)
        db.commit()
        db.refresh(mesa)

        return mesa

    @staticmethod
    def eliminar(db: Session, id_mesa: int):

        mesa = MesaService.obtener(db, id_mesa)

        if mesa:
            db.delete(mesa)
            db.commit()

        return mesa
    
    @staticmethod
    def actualizar(
        db: Session,
        id_mesa: int,
        datos
    ):

        mesa = (
            db.query(Mesa)
            .filter(Mesa.id_mesa == id_mesa)
            .first()
        )

        if not mesa:
            raise HTTPException(
                status_code=404,
                detail="Mesa no encontrada."
            )

        mesa.numero = datos.numero
        mesa.capacidad = datos.capacidad
        mesa.estado = datos.estado

        db.commit()
        db.refresh(mesa)

        return mesa
