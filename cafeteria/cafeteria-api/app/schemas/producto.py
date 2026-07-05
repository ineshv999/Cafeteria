from decimal import Decimal

from pydantic import BaseModel

from app.schemas.categoria import CategoriaSimple

class ProductoBase(BaseModel):
    nombre: str
    descripcion: str | None = None
    precio: Decimal
    stock: int
    imagen: str | None = None
    activo: bool = True
    id_categoria: int


class ProductoCreate(BaseModel):
    nombre: str
    descripcion: str
    precio: Decimal
    stock: int
    imagen: str
    activo: bool
    id_categoria: int


class ProductoUpdate(BaseModel):
    nombre: str
    descripcion: str
    precio: Decimal
    stock: int
    imagen: str
    activo: bool
    id_categoria: int


class ProductoResponse(ProductoBase):

    id_producto: int

    categoria: CategoriaSimple

    model_config = {
        "from_attributes": True
    }