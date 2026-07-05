from pydantic import BaseModel


class CategoriaBase(BaseModel):
    nombre: str
    descripcion: str | None = None

class CategoriaCreate(BaseModel):
    nombre: str
    descripcion: str

class CategoriaUpdate(BaseModel):
    nombre: str
    descripcion: str

class CategoriaResponse(CategoriaBase):

    id_categoria: int

    model_config = {
        "from_attributes": True
    }

class CategoriaSimple(BaseModel):

    id_categoria: int
    nombre: str

    model_config = {
        "from_attributes": True
    }