# POSNEX · Frontend

POSNEX es una aplicación Angular standalone, móvil primero, para comercio electrónico y restaurantes. El repositorio frontend se mantiene separado de la API .NET en [BACK-END-POSNEX](https://github.com/carlosmelendrez31/BACK-END-POSNEX).

## Requisitos y ejecución

- Node.js compatible con Angular 20.
- API POSNEX disponible en `http://localhost:5071` para crear una cuenta y registrar el negocio.

```powershell
npm install
npm start
```

Angular sirve la aplicación en `http://localhost:4200`.

## Flujo actual

1. `/login` permite iniciar sesión o crear una cuenta (ASP.NET Core Identity, `POST /api/v1/auth/login` y `/register`).
2. `/businesses` lista los negocios de la cuenta (`GET /api/v1/businesses`, filtrado por propietario en el servidor). Una cuenta puede tener varios comercios y restaurantes.
3. `/new` elige el tipo de negocio y `/onboarding` lo registra con `POST /api/v1/businesses` en la cuenta activa.
4. Al elegir un negocio se abre su espacio de trabajo; desde el sidebar se puede cambiar de negocio o crear otro, y desde el encabezado cerrar sesión.
5. Las rutas operativas exigen sesión y un negocio activo.

La sesión (access y refresh token) y el negocio activo se guardan en `sessionStorage`: sobreviven a recargas y se descartan al cerrar la pestaña. `authInterceptor` agrega el bearer token a la API y, ante un 401, intenta renovarlo una vez con `/auth/refresh` antes de enviar al login. Acento, tema, logotipo y subtipo de cada negocio todavía no se guardan en la API; se conservan en `localStorage` del dispositivo por negocio.

## Organización Angular

- `src/app/core/business-api.models.ts`: contratos TypeScript para las solicitudes y respuestas de la API.
- `src/app/core/api.config.ts`: URL base de la API.
- `src/app/core/auth-api.service.ts`: registro, inicio de sesión, renovación y cierre de sesión.
- `src/app/core/auth.interceptor.ts`: bearer token y renovación ante 401.
- `src/app/core/business-api.service.ts`: listado y creación de negocios de la cuenta.
- `src/app/core/posnex-store.ts`: Signals para el contexto del negocio y estado de sesión de las pantallas.
- `src/app/pages/`: pantallas de comercio, restaurante y onboarding.
- `src/app/app.routes.ts`: rutas públicas y guardas para rutas operativas.
- `src/main.ts`: configuración standalone de Router, HttpClient y service worker.

## Estado de los módulos

El alta del negocio se conecta a la API. Las vistas de inventario, ventas, pedidos, menú y meseros conservan su diseño y flujos, pero todavía no tienen endpoints en el backend; sus registros parten vacíos y los cambios operativos aún no se persisten en PostgreSQL.

La aplicación incluye manifiesto PWA y configuración de Angular Service Worker. El service worker se registra en builds de producción, no en modo desarrollo.
