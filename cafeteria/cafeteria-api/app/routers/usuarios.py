from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.usuario import UsuarioCreate, UsuarioResponse
from app.services.usuario_service import UsuarioService

from app.auth.permissions import requiere_roles

from app.schemas.usuario import UsuarioUpdate

router = APIRouter(
    prefix="/usuarios",
    tags=["Usuarios"]
)


@router.post("/", response_model=UsuarioResponse)
def crear_usuario(
    datos: UsuarioCreate,
    usuario=Depends(
        requiere_roles("administrador")
    ),
    db: Session = Depends(get_db)
):
    return UsuarioService.crear(db, datos)


@router.get("/")
def listar_usuarios(
    usuario=Depends(
        requiere_roles("administrador")
    ),
    db: Session = Depends(get_db)
):
    return UsuarioService.listar(db)


@router.get("/{id_usuario}")
def obtener_usuario(
    id_usuario: int,
    usuario=Depends(
        requiere_roles("administrador")
    ),
    db: Session = Depends(get_db)
):
    return UsuarioService.obtener(db, id_usuario)


@router.delete("/{id_usuario}")
def eliminar_usuario(
    id_usuario: int,
    usuario=Depends(
        requiere_roles("administrador")
    ),
    db: Session = Depends(get_db)
):
    UsuarioService.eliminar(db, id_usuario)

    return {
        "mensaje": "Usuario eliminado correctamente"
    }

@router.put(
    "/{id_usuario}",
    response_model=UsuarioResponse
)
def actualizar_usuario(
    id_usuario: int,
    datos: UsuarioUpdate,
    usuario=Depends(
        requiere_roles("administrador")
    ),
    db: Session = Depends(get_db)
):

    return UsuarioService.actualizar(
        db,
        id_usuario,
        datos
    )