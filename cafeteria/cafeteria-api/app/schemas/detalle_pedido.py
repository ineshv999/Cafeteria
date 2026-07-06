from decimal import Decimal

from pydantic import BaseModel


class DetallePedidoCreate(BaseModel):

    id_pedido: int

    id_producto: int

    cantidad: int


class DetallePedidoResponse(BaseModel):

    id_detalle: int

    cantidad: int

    precio_unitario: Decimal

    subtotal: Decimal

    id_producto: int

    id_pedido: int

    model_config = {
        "from_attributes": True
    }

from decimal import Decimal

from pydantic import BaseModel


class DetallePedidoCreate(BaseModel):

    id_pedido: int

    id_producto: int

    cantidad: int


class DetallePedidoResponse(BaseModel):

    id_detalle: int

    cantidad: int

    precio_unitario: Decimal

    subtotal: Decimal

    id_producto: int

    id_pedido: int

    model_config = {
        "from_attributes": True
    }

class DetallePedidoView(BaseModel):

    id_detalle: int

    cantidad: int

    precio_unitario: Decimal

    subtotal: Decimal

    producto: str

    model_config = {
        "from_attributes": True
    }