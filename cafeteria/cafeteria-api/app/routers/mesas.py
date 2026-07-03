from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.mesa import (
    MesaCreate,
    MesaResponse
)
from app.services.mesa_service import MesaService

from app.auth.permissions import requiere_roles

router = APIRouter(
    prefix="/mesas",
    tags=["Mesas"]
)


@router.get("/", response_model=list[MesaResponse])
def listar_mesas(
    usuario=Depends(
        requiere_roles(
            "administrador",
            "mesero"
        )
    ),
    db: Session = Depends(get_db)
):
    return MesaService.listar(db)


@router.get("/{id_mesa}", response_model=MesaResponse)
def obtener_mesa(
    id_mesa: int,
    usuario=Depends(
        requiere_roles(
            "administrador",
            "mesero"
        )
    ),
    db: Session = Depends(get_db)
):
    return MesaService.obtener(db, id_mesa)


@router.post("/", response_model=MesaResponse)
def crear_mesa(
    datos: MesaCreate,
    usuario=Depends(
        requiere_roles("administrador")
    ),
    db: Session = Depends(get_db)
):
    return MesaService.crear(db, datos)


@router.delete("/{id_mesa}")
def eliminar_mesa(
    id_mesa: int,
    usuario=Depends(
        requiere_roles("administrador")
    ),
    db: Session = Depends(get_db)
):
    MesaService.eliminar(db, id_mesa)

    return {
        "mensaje": "Mesa eliminada correctamente"
    }