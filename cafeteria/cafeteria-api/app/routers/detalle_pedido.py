from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.detalle_pedido import (
    DetallePedidoCreate,
    DetallePedidoResponse
)
from app.services.detalle_pedido_service import (
    DetallePedidoService
)
from app.auth.dependencies import obtener_usuario_actual

from app.schemas.detalle_pedido import DetallePedidoView

router = APIRouter(
    prefix="/detalle-pedido",
    tags=["Detalle Pedido"]
)


@router.post("/", response_model=DetallePedidoResponse)
def agregar_producto(
    datos: DetallePedidoCreate,
    usuario=Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    return DetallePedidoService.crear(
        db,
        datos
    )

@router.get(
    "/pedido/{id_pedido}",
    response_model=list[DetallePedidoView]
)
def obtener_detalle_pedido(
    id_pedido: int,
    db: Session = Depends(get_db)
):

    return DetallePedidoService.listar_por_pedido(
        db,
        id_pedido
    )