# Pruebas Postman - API Movil

Este paquete cubre los endpoints principales para probar los modulos moviles:

- Mesero
- Cocina
- Caja

## Archivos

- `cafeteria-api-movil.postman_collection.json`: coleccion Postman.
- `cafeteria-api-movil.postman_environment.json`: variables del entorno.

## Requisitos previos

1. Tener corriendo el API:

```powershell
cd cafeteria-api
uvicorn app.main:app --reload
```

2. Tener datos base en PostgreSQL/Neon:

- Roles con nombres exactos: `mesero`, `cocina`, `caja`.
- Un usuario activo para cada rol.
- Al menos una mesa libre.
- Al menos un producto activo con stock disponible.
- Al menos un suministro activo para compras de caja.

Para Neon ya se dejo un proyecto `cafeteria` configurado en `.env` con
`DATABASE_URL`. Tambien se agrego un seed de datos demo:

```powershell
cd cafeteria-api
.\.venv\Scripts\python.exe scripts\seed_mobile_demo.py
```

Usuarios demo:

| Rol | Email | Password |
| --- | --- | --- |
| Mesero | `mesero@cafeteria.local` | `Mesero123!` |
| Cocina | `cocina@cafeteria.local` | `Cocina123!` |
| Caja | `caja@cafeteria.local` | `Caja123!` |
| Administrador | `admin@cafeteria.local` | `Admin123!` |

Variables demo:

| Variable | Valor |
| --- | --- |
| `id_mesa` | `3` |
| `id_producto` | `3` |
| `id_ingrediente` | `1` |

3. Importar en Postman:

- La coleccion.
- El environment.

4. Editar las variables del environment:

- `email_mesero`
- `password_mesero`
- `email_cocina`
- `password_cocina`
- `email_caja`
- `password_caja`
- `id_mesa`
- `id_producto`
- `id_ingrediente`

## Flujo recomendado

1. Ejecutar `Auth / Login Mesero`.
2. Ejecutar `Auth / Login Cocina`.
3. Ejecutar `Auth / Login Caja`.
4. Ejecutar carpeta `Mesero` en orden:
   - Listar mesas.
   - Listar productos activos.
   - Crear pedido.
   - Agregar producto al pedido.
   - Ver detalle del pedido.
   - Ver pedido.
5. Ejecutar carpeta `Cocina` en orden:
   - Listar pedidos para cocina.
   - Ver detalle del pedido.
   - Marcar pedido en preparacion.
   - Marcar pedido listo.
   - Listar menu productos.
   - Listar categorias de menu.
   - Listar suministros.
   - Crear suministro.
6. Ejecutar carpeta `Caja` en orden:
   - Listar pedidos listos.
   - Ver detalle del pedido.
   - Cobrar pedido.
   - Listar suministros para compra.
   - Registrar compra de suministro.
   - Listar compras.
   - Registrar gasto.
   - Listar gastos.

La coleccion guarda automaticamente `token_mesero`, `token_cocina`, `token_caja`,
`id_pedido`, `id_detalle`, `id_ingrediente`, `id_compra` e `id_gasto` cuando las
respuestas son correctas.
