from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.producto import (
    ProductoCreate,
    ProductoResponse
)
from app.services.producto_service import ProductoService
from app.auth.roles import solo_administrador

router = APIRouter(
    prefix="/productos",
    tags=["Productos"]
)


@router.get("/", response_model=list[ProductoResponse])
def listar_productos(
    db: Session = Depends(get_db)
):
    return ProductoService.listar(db)


@router.get("/{id_producto}", response_model=ProductoResponse)
def obtener_producto(
    id_producto: int,
    db: Session = Depends(get_db)
):
    return ProductoService.obtener(db, id_producto)


@router.post("/", response_model=ProductoResponse)
def crear_producto(
    datos: ProductoCreate,
    usuario=Depends(solo_administrador),
    db: Session = Depends(get_db)
):
    return ProductoService.crear(db, datos)


@router.delete("/{id_producto}")
def eliminar_producto(
    id_producto: int,
    usuario=Depends(solo_administrador),
    db: Session = Depends(get_db)
):
    ProductoService.eliminar(db, id_producto)

    return {
        "mensaje": "Producto eliminado correctamente"
    }