from decimal import Decimal

from pydantic import BaseModel, Field


class DetalleCompraCreate(BaseModel):
    id_ingrediente: int
    cantidad: Decimal
    costo_unitario: Decimal


class DetalleCompraResponse(BaseModel):
    id_detalle_compra: int
    id_ingrediente: int
    cantidad: Decimal
    costo_unitario: Decimal
    subtotal: Decimal

    model_config = {
        "from_attributes": True
    }


class CompraCreate(BaseModel):
    proveedor: str
    detalles: list[DetalleCompraCreate]


class CompraResponse(BaseModel):
    id_compra: int
    proveedor: str
    total: Decimal
    id_usuario: int
    detalles: list[DetalleCompraResponse] = Field(default_factory=list)

    model_config = {
        "from_attributes": True
    }
