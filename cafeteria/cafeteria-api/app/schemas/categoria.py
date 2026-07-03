from pydantic import BaseModel


class CategoriaBase(BaseModel):
    nombre: str
    descripcion: str | None = None


class CategoriaCreate(CategoriaBase):
    pass


class CategoriaUpdate(CategoriaBase):
    pass


class CategoriaResponse(CategoriaBase):

    id_categoria: int

    model_config = {
        "from_attributes": True
    }