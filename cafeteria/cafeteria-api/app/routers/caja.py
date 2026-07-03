from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.pedido import Pedido
from app.services.caja_service import CajaService
from app.schemas.pedido import PedidoResponse
from app.auth.dependencies import obtener_usuario_actual

router = APIRouter(
    prefix="/caja",
    tags=["Caja"]
)

@router.get(
    "/pedidos",
    response_model=list[PedidoResponse]
)
def pedidos_listos(
    usuario=Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    return CajaService.pedidos_listos(db)


@router.put(
    "/pedidos/{id_pedido}/cobrar",
    response_model=PedidoResponse
)
def cobrar_pedido(
    id_pedido: int,
    usuario=Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):

    return CajaService.cobrar(
        db,
        id_pedido
    )