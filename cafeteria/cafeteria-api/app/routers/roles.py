from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.rol import RolCreate
from app.schemas.rol import RolResponse

from app.services.rol_service import RolService

router = APIRouter(
    prefix="/roles",
    tags=["Roles"]
)


@router.get("/", response_model=list[RolResponse])
def listar_roles(
    db: Session = Depends(get_db)
):
    return RolService.obtener_roles(db)


@router.post("/", response_model=RolResponse)
def crear_rol(
    datos: RolCreate,
    db: Session = Depends(get_db)
):
    return RolService.crear(
        db,
        datos.nombre,
        datos.descripcion
    )