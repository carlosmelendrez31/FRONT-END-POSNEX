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

1. La bienvenida permite elegir comercio electrónico o restaurante.
2. El onboarding captura los datos de cuenta y la identidad del negocio.
3. `AuthApiService` registra e inicia sesión mediante ASP.NET Core Identity.
4. `BusinessApiService` envía el negocio autenticado a `POST /api/v1/businesses`.
5. Las rutas operativas se habilitan cuando existe un negocio registrado.

El token vive en memoria. El resumen del negocio registrado se conserva en almacenamiento local del navegador para mantener el espacio después de recargar.

## Organización Angular

- `src/app/core/business-api.models.ts`: contratos TypeScript para las solicitudes y respuestas de la API.
- `src/app/core/auth-api.service.ts`: comunicación de registro e inicio de sesión.
- `src/app/core/business-api.service.ts`: creación de negocios autenticada.
- `src/app/core/posnex-store.ts`: Signals para el contexto del negocio y estado de sesión de las pantallas.
- `src/app/pages/`: pantallas de comercio, restaurante y onboarding.
- `src/app/app.routes.ts`: rutas públicas y guardas para rutas operativas.
- `src/main.ts`: configuración standalone de Router, HttpClient y service worker.

## Estado de los módulos

El alta del negocio se conecta a la API. Las vistas de inventario, ventas, pedidos, menú y meseros conservan su diseño y flujos, pero todavía no tienen endpoints en el backend; sus registros parten vacíos y los cambios operativos aún no se persisten en PostgreSQL.

La aplicación incluye manifiesto PWA y configuración de Angular Service Worker. El service worker se registra en builds de producción, no en modo desarrollo.
