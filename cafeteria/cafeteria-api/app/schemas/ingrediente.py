from decimal import Decimal

from pydantic import BaseModel


class IngredienteBase(BaseModel):
    nombre: str
    unidad_medida: str
    stock: Decimal = Decimal("0.00")
    stock_minimo: Decimal = Decimal("0.00")
    activo: bool = True


class IngredienteCreate(IngredienteBase):
    pass


class IngredienteUpdate(IngredienteBase):
    pass


class IngredienteStockUpdate(BaseModel):
    stock: Decimal


class IngredienteResponse(IngredienteBase):
    id_ingrediente: int

    model_config = {
        "from_attributes": True
    }
