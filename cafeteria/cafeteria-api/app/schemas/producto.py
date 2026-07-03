from decimal import Decimal

from pydantic import BaseModel


class ProductoBase(BaseModel):
    nombre: str
    descripcion: str | None = None
    precio: Decimal
    stock: int
    imagen: str | None = None
    activo: bool = True
    id_categoria: int


class ProductoCreate(ProductoBase):
    pass


class ProductoUpdate(ProductoBase):
    pass


class ProductoResponse(ProductoBase):
    id_producto: int

    model_config = {
        "from_attributes": True
    }