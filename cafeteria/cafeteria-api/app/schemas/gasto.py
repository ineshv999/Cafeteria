from decimal import Decimal

from pydantic import BaseModel


class GastoBase(BaseModel):
    concepto: str
    categoria: str
    monto: Decimal
    descripcion: str | None = None


class GastoCreate(GastoBase):
    pass


class GastoUpdate(GastoBase):
    pass


class GastoResponse(GastoBase):
    id_gasto: int
    id_usuario: int

    model_config = {
        "from_attributes": True
    }
