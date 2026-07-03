from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app.models.pedido import Pedido
from app.schemas.pedido import (
    PedidoResponse,
    PedidoEstadoUpdate
)
from app.services.pedido_service import PedidoService
from app.auth.dependencies import obtener_usuario_actual

router = APIRouter(
    prefix="/cocina",
    tags=["Cocina"]
)

@router.get(
    "/pedidos",
    response_model=list[PedidoResponse]
)
def listar_pedidos_cocina(
    usuario=Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):

    return (
        db.query(Pedido)
        .filter(
            or_(
                Pedido.estado == "Pendiente",
                Pedido.estado == "En preparación"
            )
        )
        .all()
    )

@router.put(
    "/pedidos/{id_pedido}/preparar",
    response_model=PedidoResponse
)
def preparar_pedido(
    id_pedido: int,
    usuario=Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):

    return PedidoService.cambiar_estado(
        db,
        id_pedido,
        "En preparación"
    )

@router.put(
    "/pedidos/{id_pedido}/listo",
    response_model=PedidoResponse
)
def pedido_listo(
    id_pedido: int,
    usuario=Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):

    return PedidoService.cambiar_estado(
        db,
        id_pedido,
        "Listo"
    )