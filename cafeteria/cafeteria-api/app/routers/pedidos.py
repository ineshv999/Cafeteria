from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.models.pedido import Pedido

from app.database import get_db
from app.schemas.pedido import (
    PedidoCreate,
    PedidoResponse
)
from app.services.pedido_service import PedidoService
from app.auth.dependencies import obtener_usuario_actual

from app.schemas.pedido import PedidoEstadoUpdate

router = APIRouter(
    prefix="/pedidos",
    tags=["Pedidos"]
)


@router.post("/", response_model=PedidoResponse)
def crear_pedido(
    datos: PedidoCreate,
    usuario=Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):

    return PedidoService.crear(
        db,
        datos,
        usuario["id"]
    )

@router.get("/{id_pedido}", response_model=PedidoResponse)
def obtener_pedido(
    id_pedido: int,
    db: Session = Depends(get_db)
):
    return db.query(Pedido).filter(
        Pedido.id_pedido == id_pedido
    ).first()

@router.get("/", response_model=list[PedidoResponse])
def listar_pedidos(
    db: Session = Depends(get_db)
):
    return PedidoService.listar(db)


@router.put("/{id_pedido}/estado",
            response_model=PedidoResponse)
def cambiar_estado(
    id_pedido: int,
    datos: PedidoEstadoUpdate,
    usuario=Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):

    return PedidoService.cambiar_estado(
        db,
        id_pedido,
        datos.estado
    )