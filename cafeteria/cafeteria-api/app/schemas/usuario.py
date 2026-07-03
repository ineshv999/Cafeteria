from pydantic import BaseModel, EmailStr


class UsuarioBase(BaseModel):
    nombre_completo: str
    email: EmailStr
    id_rol: int


class UsuarioCreate(UsuarioBase):
    password: str


class UsuarioUpdate(BaseModel):
    nombre_completo: str
    email: EmailStr
    id_rol: int
    activo: bool
    password: str | None = None


class UsuarioResponse(UsuarioBase):
    id_usuario: int
    activo: bool

    model_config = {
        "from_attributes": True
    }