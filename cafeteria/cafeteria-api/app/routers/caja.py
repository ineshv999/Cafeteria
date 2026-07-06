from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.pedido import Pedido
from app.services.caja_service import CajaService
from app.services.detalle_pedido_service import DetallePedidoService
from app.schemas.pedido import PedidoResponse
from app.schemas.detalle_pedido import DetallePedidoResponse
from app.auth.permissions import requiere_roles

router = APIRouter(
    prefix="/caja",
    tags=["Caja"]
)

@router.get("/pedidos", response_model=list[PedidoResponse])
def pedidos_listos(
    usuario=Depends(
        requiere_roles(
            "administrador",
            "caja"
        )
    ),
    db: Session = Depends(get_db)
):
    return CajaService.pedidos_listos(db)


@router.get(
    "/pedidos/{id_pedido}/detalle",
    response_model=list[DetallePedidoResponse]
)
def obtener_detalle_pedido_caja(
    id_pedido: int,
    usuario=Depends(
        requiere_roles(
            "administrador",
            "caja"
        )
    ),
    db: Session = Depends(get_db)
):
    return DetallePedidoService.listar_por_pedido(
        db,
        id_pedido
    )


@router.put(
    "/pedidos/{id_pedido}/cobrar",
    response_model=PedidoResponse
)
def cobrar_pedido(
    id_pedido: int,
    usuario=Depends(
        requiere_roles(
            "administrador",
            "caja"
        )
    ),
    db: Session = Depends(get_db)
):
    return CajaService.cobrar(
        db,
        id_pedido
    )
