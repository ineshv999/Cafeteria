from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.pedido import Pedido
from app.services.caja_service import CajaService
from app.services.detalle_pedido_service import DetallePedidoService
from app.schemas.pedido import PedidoResponse
from app.schemas.detalle_pedido import DetallePedidoResponse
from app.schemas.compra import CompraCreate, CompraResponse
from app.schemas.gasto import GastoCreate, GastoResponse
from app.schemas.ingrediente import IngredienteResponse
from app.auth.permissions import requiere_roles
from app.services.compra_service import CompraService
from app.services.gasto_service import GastoService
from app.services.ingrediente_service import IngredienteService

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


@router.get(
    "/suministros",
    response_model=list[IngredienteResponse]
)
def listar_suministros_caja(
    usuario=Depends(
        requiere_roles(
            "administrador",
            "caja"
        )
    ),
    db: Session = Depends(get_db)
):
    return IngredienteService.listar(
        db,
        activo=True
    )


@router.get(
    "/compras",
    response_model=list[CompraResponse]
)
def listar_compras_caja(
    usuario=Depends(
        requiere_roles(
            "administrador",
            "caja"
        )
    ),
    db: Session = Depends(get_db)
):
    return CompraService.listar(db)


@router.post(
    "/compras",
    response_model=CompraResponse
)
def crear_compra_caja(
    datos: CompraCreate,
    usuario=Depends(
        requiere_roles(
            "administrador",
            "caja"
        )
    ),
    db: Session = Depends(get_db)
):
    return CompraService.crear(
        db,
        datos,
        usuario["id"]
    )


@router.get(
    "/gastos",
    response_model=list[GastoResponse]
)
def listar_gastos_caja(
    usuario=Depends(
        requiere_roles(
            "administrador",
            "caja"
        )
    ),
    db: Session = Depends(get_db)
):
    return GastoService.listar(db)


@router.post(
    "/gastos",
    response_model=GastoResponse
)
def crear_gasto_caja(
    datos: GastoCreate,
    usuario=Depends(
        requiere_roles(
            "administrador",
            "caja"
        )
    ),
    db: Session = Depends(get_db)
):
    return GastoService.crear(
        db,
        datos,
        usuario["id"]
    )
