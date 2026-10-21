# osi-front

Frontend del **Lab Modernización**: gestión de requerimientos de modernización tecnológica (registro, estimación, aprobación, auditoría y reportes).

- Angular 22 (componentes standalone, signals) · TypeScript 6 · Tailwind CSS 4
- Consume la API de [`osi-back`](../osi-back)
- Adaptativo para móvil y escritorio

---

## Requisitos

| Herramienta | Versión |
|---|---|
| Node.js | 22 o superior |
| npm | 11 |
| Backend | `osi-back` corriendo en `http://localhost:8091` |

## Puesta en marcha

```bash
npm install
npm start
```

Abrir **http://localhost:4200**. La página inicial es el login.

El backend debe estar levantado: sin él, el login muestra *"No se pudo conectar con el servidor"*. Para obtener un usuario, ver *Primer usuario* en el README de [`osi-back`](../osi-back/README.md).

### Proxy de desarrollo

[`proxy.conf.json`](proxy.conf.json) reenvía todo lo que empieza con `/api` a `http://localhost:8091`. Así el front y el back comparten origen, la cookie de sesión funciona y no hay problemas de CORS.

- El código siempre llama a rutas relativas (`/api/...`), nunca a `http://localhost:8091`.
- El proxy solo se lee al arrancar: si cambias el archivo, reinicia `npm start`.
- En producción, el servidor web debe servir el front y enrutar `/api` al backend en el mismo dominio.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm start` | Servidor de desarrollo con recarga automática |
| `npm run build` | Build de producción en `dist/frontend` |
| `npm run watch` | Build de desarrollo en modo observación |
| `npm test` | Tests unitarios (Vitest) |

## Estructura

```
src/app/
├── core/
│   ├── auth/        AuthService, interceptor, guards y modelos de sesión
│   ├── config/      Menú lateral (menu.config.ts) y nombre de la app
│   ├── models/      Tipos de datos del backend (usuario, rol, permiso, requerimiento, ...)
│   ├── services/    Llamadas HTTP por recurso (aplicaciones, requerimientos, ...)
│   └── utils/       Utilidades (errores de la API, cálculo de estimación)
├── layout/
│   └── main-layout/ Menú superior + menú lateral + contenido
├── pages/           Una carpeta por pantalla
└── shared/
    ├── components/  Componentes reutilizables
    └── directives/  *appCan
```

### Pantallas

| Ruta | Pantalla | Acceso |
|---|---|---|
| `/login` | Inicio de sesión | Público (con sesión iniciada redirige a `/dashboard`) |
| `/dashboard` | Indicadores y gráficos | Autenticado |
| `/aplicaciones` | Catálogo de aplicaciones | Autenticado; crear/editar/eliminar con `CATALOGO_GESTIONAR` |
| `/requerimientos` | Listado de requerimientos | Autenticado |
| `/requerimientos/nuevo` | Registro de requerimiento | `REQUERIMIENTO_CREAR` |
| `/requerimientos/:id` | Detalle y edición | Autenticado; editar con `REQUERIMIENTO_MODIFICAR` |
| `/estimaciones` | Estimación de horas | Autenticado; guardar con `ESTIMACION_GUARDAR` |
| `/aprobaciones` | Bandeja de aprobación | Autenticado; aprobar/rechazar con `REQUERIMIENTO_APROBAR` |
| `/reportes` | Reporte de seguimiento | Autenticado |
| `/administracion` | Historial de operaciones (auditoría) | `AUDITORIA_VER` |

## Sesión y autenticación

| Pieza | Responsabilidad |
|---|---|
| [`AuthService`](src/app/core/auth/auth.service.ts) | Login, logout, refresh y estado de la sesión (`usuario`, `isAuthenticated`, `can()`) |
| [`authInterceptor`](src/app/core/auth/auth.interceptor.ts) | Agrega `Authorization: Bearer <token>` a las llamadas `/api`; ante un 401 renueva el token y repite la petición; si no puede, vuelve al login |
| [`auth.guards.ts`](src/app/core/auth/auth.guards.ts) | `authGuard` (exige sesión), `guestGuard` (oculta el login con sesión), `permisoGuard` (exige `data.permiso`) |

- El **access token** (15 min) vive **solo en memoria**, nunca en `localStorage`, para que un script malicioso no pueda robarlo.
- El **refresh token** es una cookie `HttpOnly` que maneja el navegador; JavaScript no puede leerla.
- Al recargar la página, la app recupera la sesión con esa cookie antes de evaluar las rutas (`provideAppInitializer` en [`app.config.ts`](src/app/app.config.ts)).
- Si varias peticiones reciben 401 a la vez, comparten un solo refresh.
- Si se pide una ruta sin sesión, después del login se vuelve a esa ruta (`?returnUrl=`).

## Permisos en la interfaz

El backend devuelve la lista de `permisos` del usuario en el login. El front **no tiene copia de la matriz** rol → permisos: solo pregunta si el permiso está en esa lista. La matriz está en [`osi-back`](../osi-back/README.md#roles-y-permisos).

```html
<!-- Mostrar u ocultar un elemento -->
<button *appCan="'REQUERIMIENTO_CREAR'" app-button>Nuevo</button>
```

```ts
// En un componente
protected readonly puedeGuardar = computed(() => this.auth.can('ESTIMACION_GUARDAR'));
```

```ts
// En una ruta
{ path: 'administracion', canActivate: [permisoGuard], data: { permiso: 'AUDITORIA_VER' }, ... }

// En el menú lateral (core/config/menu.config.ts)
{ label: 'Administración', path: '/administracion', icon: 'settings', permiso: 'AUDITORIA_VER' }
```

Ocultar algo en el front **solo mejora la experiencia**: quien protege de verdad es el backend, que responde 403 si se llama al endpoint sin permiso.

**Agregar un permiso nuevo:** primero en el backend (`Permiso.java` y `Rol.java`), luego en el tipo `Permiso` de [`user.ts`](src/app/core/models/user.ts). TypeScript marcará como error cualquier permiso mal escrito.

## Componentes compartidos

En [`src/app/shared/components/`](src/app/shared/components). Usarlos antes de escribir HTML nuevo:

| Componente | Uso |
|---|---|
| `app-icon` | `<app-icon name="home" class="h-5 w-5" />` — íconos de línea; el tamaño va por clase |
| `app-logo` | Logo y nombre de la app (`size`, `theme`, `hideTextOnMobile`) |
| `button[app-button]` | `<button app-button variant="primary">` (`primary` / `secondary`) |
| `button[app-icon-button]` | `<button app-icon-button icon="trash" tone="danger" aria-label="Eliminar">` |
| `app-page-header` | Título y subtítulo de página; los botones de acción van como contenido |
| `app-search-input` | `<app-search-input [(value)]="texto" placeholder="Buscar..." />` |
| `app-select` | `<app-select [options]="opciones" [(value)]="filtro" />` |
| `app-status-badge` | `<app-status-badge label="Activa" tone="success" />` |
| `app-pagination` | `<app-pagination [total]="n" [pageSize]="10" [(page)]="pagina" />` |
| `app-empty-state` | Mensaje de "sin datos" con ícono |
| `app-stepper` | Pasos de un formulario (registro de requerimiento) |
| `app-approval-flow` | Flujo de estados del requerimiento |
| `app-header`, `app-sidebar`, `app-user-menu` | Piezas del layout principal |

## Convenciones

- **Componentes standalone** con `input()`, `output()`, `model()` y `signal()`/`computed()` para el estado.
- **Estilos con Tailwind** en la plantilla. CSS propio solo cuando Tailwind no alcanza (por ejemplo, el fondo del login).
- **Llamadas HTTP solo en `core/services`**: las páginas no usan `HttpClient` directamente.
- **Tipos del backend en `core/models`**, con los mismos valores que la base (por ejemplo, `Rol` = `'ANALISTA' | 'COORDINADOR' | 'APROBADOR'`).
- **Diseño adaptativo**: en móvil las tablas pasan a tarjetas (`md:hidden` / `hidden md:block`) y el menú lateral es un panel superpuesto.

### Agregar una pantalla

1. Crear la carpeta en `src/app/pages/<nombre>/` con su componente.
2. Registrar la ruta (con `loadComponent`) dentro del layout en [`app.routes.ts`](src/app/app.routes.ts); si requiere permiso, agregar `canActivate: [permisoGuard]` y `data: { permiso: ... }`.
3. Agregar la opción en [`menu.config.ts`](src/app/core/config/menu.config.ts) (con `permiso` si corresponde).

## Problemas comunes

| Síntoma | Causa / solución |
|---|---|
| Login: *"No se pudo conectar con el servidor"* | El backend no está corriendo en el 8091, o `npm start` se levantó antes de existir el proxy (reiniciarlo) |
| Al recargar vuelve al login | El refresh falla en el backend: revisar su log. En Safari, arrancar el backend con `REFRESH_COOKIE_SECURE=false` |
| No aparece una opción del menú o un botón | El usuario no tiene el permiso: revisar `permisos` en la respuesta de `/api/auth/me` |
| Cambios de permisos no se reflejan | Cerrar sesión y volver a entrar para recibir la lista actualizada |
