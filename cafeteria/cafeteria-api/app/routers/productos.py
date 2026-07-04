from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.producto import (
    ProductoCreate,
    ProductoResponse
)
from app.services.producto_service import ProductoService

from app.auth.permissions import requiere_roles

from app.schemas.producto import ProductoUpdate

from typing import Optional

import os
import shutil

from fastapi import (
    APIRouter,
    Depends,
    UploadFile,
    File,
    Form
)

router = APIRouter(
    prefix="/productos",
    tags=["Productos"]
)


@router.get("/", response_model=list[ProductoResponse])
def listar_productos(
    nombre: Optional[str] = None,
    id_categoria: Optional[int] = None,
    activo: Optional[bool] = None,
    stock_minimo: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):

    return ProductoService.listar(
        db,
        nombre,
        id_categoria,
        activo,
        stock_minimo,
        skip,
        limit
    )

@router.get("/{id_producto}", response_model=ProductoResponse)
def obtener_producto(
    id_producto: int,
    usuario=Depends(
        requiere_roles("administrador")
    ),
    db: Session = Depends(get_db)
):
    return ProductoService.obtener(db, id_producto)


@router.post("/", response_model=ProductoResponse)
def crear_producto(
    nombre: str = Form(...),
    descripcion: str = Form(...),
    precio: float = Form(...),
    stock: int = Form(...),
    activo: bool = Form(...),
    id_categoria: int = Form(...),
    imagen: UploadFile = File(...),
    usuario=Depends(
        requiere_roles("administrador")
    ),
    db: Session = Depends(get_db)
):

    os.makedirs("uploads", exist_ok=True)

    ruta = f"uploads/{imagen.filename}"

    with open(ruta, "wb") as buffer:
        shutil.copyfileobj(
            imagen.file,
            buffer
        )

    datos = ProductoCreate(
        nombre=nombre,
        descripcion=descripcion,
        precio=precio,
        stock=stock,
        imagen=ruta,
        activo=activo,
        id_categoria=id_categoria
    )

    return ProductoService.crear(
        db,
        datos
    )


def eliminar_producto(
    id_producto: int,
    usuario=Depends(
        requiere_roles("administrador")
    ),
    db: Session = Depends(get_db)
):
    ProductoService.eliminar(db, id_producto)

    return {
        "mensaje": "Producto eliminado correctamente"
    }

@router.put(
    "/{id_producto}",
    response_model=ProductoResponse
)
def actualizar_producto(
    id_producto: int,
    datos: ProductoUpdate,
    usuario=Depends(
        requiere_roles("administrador")
    ),
    db: Session = Depends(get_db)
):

    return ProductoService.actualizar(
        db,
        id_producto,
        datos
    )
