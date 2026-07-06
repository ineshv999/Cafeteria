from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth.permissions import requiere_roles

from app.services.reporte_service import ReporteService

router = APIRouter(
    prefix="/reportes",
    tags=["Reportes"]
)


@router.get("/")
def obtener_reporte(
    usuario=Depends(requiere_roles("administrador")),
    db: Session = Depends(get_db)
):

    return ReporteService.obtener(db)