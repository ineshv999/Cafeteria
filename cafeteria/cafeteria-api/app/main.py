from fastapi import FastAPI
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

from fastapi.staticfiles import StaticFiles
import os

app = FastAPI(
    title="CoffeeAdmin API",
    version="1.0.0"
)

os.makedirs("uploads", exist_ok=True)

app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)

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

@app.get("/")
def inicio():
    return {
        "mensaje": "API Cafetería funcionando"
    }