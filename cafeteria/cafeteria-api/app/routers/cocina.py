from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app.models.pedido import Pedido
from app.schemas.pedido import PedidoResponse
from app.schemas.detalle_pedido import DetallePedidoResponse
from app.services.pedido_service import PedidoService
from app.services.detalle_pedido_service import DetallePedidoService

from app.auth.permissions import requiere_roles

router = APIRouter(
    prefix="/cocina",
    tags=["Cocina"]
)


@router.get(
    "/pedidos",
    response_model=list[PedidoResponse]
)
def listar_pedidos_cocina(
    usuario=Depends(
        requiere_roles(
            "administrador",
            "cocina"
        )
    ),
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


@router.get(
    "/pedidos/{id_pedido}/detalle",
    response_model=list[DetallePedidoResponse]
)
def obtener_detalle_pedido_cocina(
    id_pedido: int,
    usuario=Depends(
        requiere_roles(
            "administrador",
            "cocina"
        )
    ),
    db: Session = Depends(get_db)
):

    return DetallePedidoService.listar_por_pedido(
        db,
        id_pedido
    )


@router.put(
    "/pedidos/{id_pedido}/preparar",
    response_model=PedidoResponse
)
def preparar_pedido(
    id_pedido: int,
    usuario=Depends(
        requiere_roles(
            "administrador",
            "cocina"
        )
    ),
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
    usuario=Depends(
        requiere_roles(
            "administrador",
            "cocina"
        )
    ),
    db: Session = Depends(get_db)
):

    return PedidoService.cambiar_estado(
        db,
        id_pedido,
        "Listo"
    )
