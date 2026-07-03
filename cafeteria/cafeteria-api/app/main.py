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

app = FastAPI(
    title="CoffeeAdmin API",
    version="1.0.0"
)

app.include_router(roles.router)
app.include_router(usuarios.router)
app.include_router(auth.router)
app.include_router(categorias.router)
app.include_router(productos.router)
app.include_router(mesas.router)
app.include_router(pedidos.router)
app.include_router(detalle_pedido.router)

@app.get("/")
def inicio():
    return {
        "mensaje": "API Cafetería funcionando"
    }