from decimal import Decimal

from pydantic import BaseModel


class PedidoCreate(BaseModel):

    id_mesa: int


class PedidoResponse(BaseModel):

    id_pedido: int

    estado: str

    total: Decimal

    id_mesa: int

    id_usuario: int

    model_config = {
        "from_attributes": True
    }

class PedidoEstadoUpdate(BaseModel):
    estado: str