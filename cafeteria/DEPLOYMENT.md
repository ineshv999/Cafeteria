# Despliegue de CoffeeAdmin

## Render

El archivo `render.yaml` crea tres recursos:

- PostgreSQL (`cafeteria-db`).
- FastAPI (`cafeteria-api`), con migraciones Alembic antes de arrancar.
- Flask (`cafeteria-web`), conectado internamente a la API.

En Render, crea un **Blueprint** desde este repositorio y selecciona la rama que
se usará para producción. Render leerá `cafeteria/render.yaml` si se indica esa
ruta como Blueprint Path. Tras el primer despliegue, verifica:

- `https://<api>.onrender.com/health`
- `https://<api>.onrender.com/docs`
- `https://<web>.onrender.com/`

Para cargar datos demostrativos una sola vez, abre el Shell del servicio API y
ejecuta `python scripts/seed_mobile_demo.py`.

## App móvil y EAS Build

La dirección pública de la API se configura una sola vez mediante
`EXPO_PUBLIC_API_URL`. En desarrollo puede copiarse `.env.example` a `.env` y
reemplazar el valor. Para EAS, crea la variable en el proyecto:

```bash
eas env:create --name EXPO_PUBLIC_API_URL --value https://cafeteria-api-tqv4.onrender.com --environment preview --visibility plaintext
eas env:create --name EXPO_PUBLIC_API_URL --value https://cafeteria-api-tqv4.onrender.com --environment production --visibility plaintext
```

Después de iniciar sesión con Expo y vincular el proyecto (`eas init`):

```bash
npm run build:apk
npm run build:aab
```

`build:apk` genera un APK instalable para pruebas. `build:aab` genera el Android
App Bundle recomendado para Google Play.

La app ya autentica contra FastAPI, toma el rol de la sesión y sincroniza los
pedidos, productos, inventario, gastos y compras permitidos para ese rol. Los
flujos de crear pedido, preparar, marcar listo y cobrar también escriben en la
API. Algunas funciones secundarias de edición/eliminación siguen siendo locales
porque todavía no existe un endpoint equivalente en el backend.
