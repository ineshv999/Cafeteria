from pydantic import BaseModel


class MesaBase(BaseModel):
    numero: int
    capacidad: int
    estado: str = "Libre"


class MesaCreate(BaseModel):
    numero: int
    capacidad: int
    estado: str


class MesaUpdate(BaseModel):
    numero: int
    capacidad: int
    estado: str


class MesaResponse(MesaBase):

    id_mesa: int

    model_config = {
        "from_attributes": True
    }