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

class CategoriaResponse(BaseModel):

    id_categoria: int
    nombre: str
    descripcion: str

    total_productos: int

    model_config = {
        "from_attributes": True
    }

class CategoriaSimple(BaseModel):

    id_categoria: int
    nombre: str

    model_config = {
        "from_attributes": True
    }