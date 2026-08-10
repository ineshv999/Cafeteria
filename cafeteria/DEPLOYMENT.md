# Despliegue

## Render

Los servicios de producción se construyen desde la rama `main` de
`https://github.com/ineshv999/Cafeteria.git`:

- API: https://cafeteria-api-tqv4.onrender.com
- Web: https://cafeteria-web-zu30.onrender.com

`render.yaml` documenta y permite recrear ambos servicios. `DATABASE_URL` debe
guardarse como secreto en Render y nunca incorporarse al repositorio. La API
ejecuta las migraciones Alembic antes de iniciar.

## Android con EAS

Los perfiles de `eas.json` ya incorporan la URL HTTPS pública de la API:

```bash
npx eas-cli@latest build --platform android --profile preview
npx eas-cli@latest build --platform android --profile production
```

`preview` genera un APK instalable. `production` genera el AAB para Google Play.
Antes del primer build se requiere iniciar sesión y vincular el proyecto con
`npx eas-cli@latest init` para obtener el `projectId` de la cuenta Expo.
