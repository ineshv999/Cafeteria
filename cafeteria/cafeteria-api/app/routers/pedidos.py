from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.models.pedido import Pedido

from app.database import get_db
from app.schemas.pedido import (
    PedidoCreate,
    PedidoResponse
)
from app.services.pedido_service import PedidoService

from app.schemas.pedido import PedidoEstadoUpdate

from app.auth.permissions import requiere_roles

from typing import Optional

router = APIRouter(
    prefix="/pedidos",
    tags=["Pedidos"]
)


@router.post("/", response_model=PedidoResponse)
def crear_pedido(
    datos: PedidoCreate,
    usuario=Depends(
        requiere_roles(
            "administrador",
            "mesero"
        )
    ),
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
    usuario=Depends(
        requiere_roles(
            "administrador",
            "mesero"
        )
    ),
    db: Session = Depends(get_db)
):

    return PedidoService.obtener(db,id_pedido)

@router.get("/", response_model=list[PedidoResponse])
def listar_pedidos(
    estado: Optional[str] = None,
    id_mesa: Optional[int] = None,
    id_usuario: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    usuario=Depends(
        requiere_roles(
            "administrador",
            "mesero"
        )
    ),
    db: Session = Depends(get_db)
):

    return PedidoService.listar(
        db,
        estado,
        id_mesa,
        id_usuario,
        skip,
        limit
    )

@router.put("/{id_pedido}/estado",
            response_model=PedidoResponse)
def cambiar_estado(
    id_pedido: int,
    datos: PedidoEstadoUpdate,
    usuario=Depends(
        requiere_roles("administrador")
    ),
    db: Session = Depends(get_db)
):

    return PedidoService.cambiar_estado(
        db,
        id_pedido,
        datos.estado
    )

@router.delete("/{id_pedido}")
def eliminar_pedido(
    id_pedido: int,
    usuario=Depends(
        requiere_roles(
            "administrador",
            "mesero"
        )
    ),
    db: Session = Depends(get_db)
):
    PedidoService.eliminar(db, id_pedido)

    return {
        "mensaje": "Pedido eliminado correctamente."
    }