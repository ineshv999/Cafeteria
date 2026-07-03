from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.usuario import UsuarioCreate, UsuarioResponse
from app.services.usuario_service import UsuarioService

from app.auth.roles import solo_administrador

router = APIRouter(
    prefix="/usuarios",
    tags=["Usuarios"]
)


@router.post("/", response_model=UsuarioResponse)
def crear_usuario(
    datos: UsuarioCreate,
    usuario=Depends(solo_administrador),
    db: Session = Depends(get_db)
):
    return UsuarioService.crear(db, datos)


@router.get("/", response_model=list[UsuarioResponse])
def listar_usuarios(
    usuario=Depends(solo_administrador),
    db: Session = Depends(get_db)
):
    return UsuarioService.listar(db)


@router.get("/{id_usuario}", response_model=UsuarioResponse)
def obtener_usuario(
    id_usuario: int,
    usuario=Depends(solo_administrador),
    db: Session = Depends(get_db)
):
    return UsuarioService.obtener(db, id_usuario)


@router.delete("/{id_usuario}")
def eliminar_usuario(
    id_usuario: int,
    usuario=Depends(solo_administrador),
    db: Session = Depends(get_db)
):
    UsuarioService.eliminar(db, id_usuario)

    return {
        "mensaje": "Usuario eliminado correctamente"
    }