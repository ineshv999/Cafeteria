from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.config import CORS_ORIGINS
from app.database import get_db
from app.routers import usuarios

import app.models
from app.routers import roles
from app.routers import auth
from app.routers import categorias
from app.routers import productos
from app.routers import mesas
from app.routers import pedidos
from app.routers import detalle_pedido
from app.routers import cocina
from app.routers import caja
from app.routers import estadisticas
from app.routers import dashboard
from app.routers import reportes
from app.routers import insumos
from app.routers import compras
from app.routers import gastos
from app.routers import promociones
from app.routers import notificaciones
from app.routers import actividad
from app.routers import preferencias_negocio

from pathlib import Path

from fastapi.responses import FileResponse

app = FastAPI(
    title="CoffeeAdmin API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOADS_DIR = Path("uploads").resolve()
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".gif", ".webp"}


@app.get("/uploads/{filename}", include_in_schema=False)
def obtener_imagen_producto(filename: str):
    ruta = (UPLOADS_DIR / filename).resolve()
    if (
        ruta.parent != UPLOADS_DIR
        or ruta.suffix.lower() not in IMAGE_EXTENSIONS
        or not ruta.is_file()
    ):
        raise HTTPException(status_code=404, detail="Imagen no encontrada.")
    return FileResponse(ruta)

app.include_router(roles.router)
app.include_router(usuarios.router)
app.include_router(auth.router)
app.include_router(categorias.router)
app.include_router(productos.router)
app.include_router(mesas.router)
app.include_router(pedidos.router)
app.include_router(detalle_pedido.router)
app.include_router(cocina.router)
app.include_router(caja.router)
app.include_router(estadisticas.router)
app.include_router(dashboard.router)
app.include_router(reportes.router)
app.include_router(insumos.router)
app.include_router(compras.router)
app.include_router(gastos.router)
app.include_router(promociones.router)
app.include_router(notificaciones.router)
app.include_router(actividad.router)
app.include_router(preferencias_negocio.router)

@app.get("/")
def inicio():
    return {
        "mensaje": "API Cafetería funcionando"
    }


@app.get("/health", tags=["Sistema"])
def health(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
    except SQLAlchemyError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="La base de datos no está disponible.",
        ) from exc

    return {
        "status": "ok",
        "database": "ok",
    }
