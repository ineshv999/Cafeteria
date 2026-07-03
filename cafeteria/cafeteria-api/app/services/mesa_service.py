from sqlalchemy.orm import Session

from app.models.mesa import Mesa


class MesaService:

    @staticmethod
    def listar(db: Session):
        return db.query(Mesa).all()

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