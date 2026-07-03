from pydantic import BaseModel


class MesaBase(BaseModel):
    numero: int
    capacidad: int
    estado: str = "Libre"


class MesaCreate(MesaBase):
    pass


class MesaUpdate(MesaBase):
    pass


class MesaResponse(MesaBase):

    id_mesa: int

    model_config = {
        "from_attributes": True
    }