from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app.models.pedido import Pedido
from app.models.producto import Producto
from app.models.categoria import Categoria
from app.schemas.pedido import PedidoResponse
from app.schemas.detalle_pedido import DetallePedidoResponse
from app.schemas.producto import ProductoResponse
from app.schemas.categoria import CategoriaResponse
from app.schemas.ingrediente import (
    IngredienteCreate,
    IngredienteResponse,
    IngredienteStockUpdate,
    IngredienteUpdate
)
from app.services.pedido_service import PedidoService
from app.services.detalle_pedido_service import DetallePedidoService
from app.services.ingrediente_service import IngredienteService

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


@router.get(
    "/menu/productos",
    response_model=list[ProductoResponse]
)
def listar_menu_productos_cocina(
    usuario=Depends(
        requiere_roles(
            "administrador",
            "cocina"
        )
    ),
    db: Session = Depends(get_db)
):

    return (
        db.query(Producto)
        .filter(Producto.activo == True)
        .all()
    )


@router.get(
    "/menu/categorias",
    response_model=list[CategoriaResponse]
)
def listar_menu_categorias_cocina(
    usuario=Depends(
        requiere_roles(
            "administrador",
            "cocina"
        )
    ),
    db: Session = Depends(get_db)
):

    return db.query(Categoria).all()


@router.get(
    "/suministros",
    response_model=list[IngredienteResponse]
)
def listar_suministros_cocina(
    stock_bajo: bool = False,
    usuario=Depends(
        requiere_roles(
            "administrador",
            "cocina"
        )
    ),
    db: Session = Depends(get_db)
):

    return IngredienteService.listar(
        db,
        activo=True,
        stock_bajo=stock_bajo
    )


@router.post(
    "/suministros",
    response_model=IngredienteResponse
)
def crear_suministro_cocina(
    datos: IngredienteCreate,
    usuario=Depends(
        requiere_roles(
            "administrador",
            "cocina"
        )
    ),
    db: Session = Depends(get_db)
):

    return IngredienteService.crear(
        db,
        datos
    )


@router.put(
    "/suministros/{id_ingrediente}",
    response_model=IngredienteResponse
)
def actualizar_suministro_cocina(
    id_ingrediente: int,
    datos: IngredienteUpdate,
    usuario=Depends(
        requiere_roles(
            "administrador",
            "cocina"
        )
    ),
    db: Session = Depends(get_db)
):

    return IngredienteService.actualizar(
        db,
        id_ingrediente,
        datos
    )


@router.patch(
    "/suministros/{id_ingrediente}/stock",
    response_model=IngredienteResponse
)
def actualizar_stock_suministro_cocina(
    id_ingrediente: int,
    datos: IngredienteStockUpdate,
    usuario=Depends(
        requiere_roles(
            "administrador",
            "cocina"
        )
    ),
    db: Session = Depends(get_db)
):

    return IngredienteService.actualizar_stock(
        db,
        id_ingrediente,
        datos
    )
