from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.estadisticas_service import EstadisticasService
from app.auth.dependencies import obtener_usuario_actual

router = APIRouter(
    prefix="/estadisticas",
    tags=["Estadísticas"]
)

@router.get("/")
def dashboard(
    usuario=Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):

    return EstadisticasService.resumen(db)