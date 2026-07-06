from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy.orm import Session, selectinload

from app.models.compra import Compra
from app.models.detalle_compra import DetalleCompra
from app.models.ingrediente import Ingrediente


class CompraService:

    @staticmethod
    def listar(
        db: Session,
        proveedor: str = None,
        skip: int = 0,
        limit: int = 100
    ):

        consulta = db.query(Compra).options(
            selectinload(Compra.detalles)
        )

        if proveedor:
            consulta = consulta.filter(
                Compra.proveedor.ilike(f"%{proveedor}%")
            )

        return (
            consulta
            .offset(skip)
            .limit(limit)
            .all()
        )

    @staticmethod
    def obtener(db: Session, id_compra: int):

        compra = (
            db.query(Compra)
            .options(selectinload(Compra.detalles))
            .filter(Compra.id_compra == id_compra)
            .first()
        )

        if not compra:
            raise HTTPException(
                status_code=404,
                detail="Compra no encontrada."
            )

        return compra

    @staticmethod
    def crear(db: Session, datos, usuario_id: int):

        if not datos.detalles:
            raise HTTPException(
                status_code=400,
                detail="La compra debe incluir al menos un suministro."
            )

        compra = Compra(
            proveedor=datos.proveedor,
            total=Decimal("0.00"),
            id_usuario=usuario_id
        )

        db.add(compra)
        db.flush()

        total = Decimal("0.00")

        for detalle in datos.detalles:
            ingrediente = (
                db.query(Ingrediente)
                .filter(
                    Ingrediente.id_ingrediente == detalle.id_ingrediente
                )
                .first()
            )

            if not ingrediente:
                raise HTTPException(
                    status_code=404,
                    detail="Suministro no encontrado."
                )

            subtotal = detalle.cantidad * detalle.costo_unitario
            total += subtotal
            ingrediente.stock += detalle.cantidad

            db.add(
                DetalleCompra(
                    id_compra=compra.id_compra,
                    id_ingrediente=detalle.id_ingrediente,
                    cantidad=detalle.cantidad,
                    costo_unitario=detalle.costo_unitario,
                    subtotal=subtotal
                )
            )

        compra.total = total

        db.commit()
        db.refresh(compra)

        return CompraService.obtener(
            db,
            compra.id_compra
        )
