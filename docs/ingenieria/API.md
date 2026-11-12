# Ingeniería: contrato de API

Estado: vigente. Describe el presente, no el deseo.
Base: NestJS 12, Prisma 7 con `PrismaService` (ADR-0004), `PORT_API`
(3000 por defecto).

El contrato de C1 —la superficie prevista, con sus tablas y sus errores— está
en [ARQUITECTURA.md §3](ARQUITECTURA.md#3-contrato-de-endpoints). Este
archivo describe lo que **existe hoy**.

## Superficie actual

| Método | Ruta | Qué hace | Acceso |
|---|---|---|---|
| `GET` | `/health` | `SELECT 1` en PostgreSQL y `PING` en Redis. Responde `{ status, postgres, redis }` | pública |
| `POST` | `/v1/auth/login` | Inicia sesión; devuelve el token opaco + usuario | pública, con límite de intentos |
| `POST` | `/v1/auth/logout` | Revoca la sesión actual (204) | sesión |
| `GET` | `/v1/auth/me` | Perfil, roles, permisos y dominios de la sesión | sesión |
| `GET` | `/v1/families` | Catálogo de familias de la instalación (paginado, total en `X-Total-Count`) | sesión |
| `GET` | `/v1/families/:familyCode` | Una familia de la instalación | sesión |
| `POST` | `/v1/files` | Registra un archivo (`multipart/form-data`, campo `file` + `familyCode`). El servidor calcula `sha256` y responde `201 { sourceFileId, sha256 }` | sesión + `create` y `submit` |

`POST /v1/files` es idempotente por `(facility_id, sha256)` (ER v1): repetir
el mismo archivo responde `409 CONFLICT` con `details.sourceFileId` del
original, sin crear fila ni job segunda vez. El servidor valida familia
activa, tipo (pdf, png, jpg, tiff, Excel) y tamaño (`UPLOAD_MAX_BYTES`,
50 MB por defecto); guarda los bytes intactos en `ORIGINALS_DIR` (REGLAS.md 5)
y deja el trabajo en cola `ingest` (`platform.job_run`, estado `queued`).
El worker que lo procesa llega con #46; el hueco "registrado sin encolar" de
[ARQUITECTURA.md §3.2](ARQUITECTURA.md#32-idempotencia-de-la-ingesta) sigue
abierto hasta entonces.

Es toda la API que existe (base del backend, PR #122; ingesta con #12).

`GET /health` devuelve `200` solo si ambas dependencias responden. Es la puerta
que usa CI para no dar por buena una API a medio levantar.

## Seguridad en la entrada

| Control | Dónde | Regla |
|---|---|---|
| Sobre de error | `common/api-error.ts` + filtro global | Todo no-2xx sale como `{ code, message, details }` (ALCANCE-SOLUCION §2.1) |
| Validación de DTOs | `ValidationPipe` global en `main.ts` | `whitelist` + `forbidNonWhitelisted`: un campo extra no se cuela en silencio |
| Sesión | `auth/session.guard.ts` | Token opaco; valida sesión (revocación, expiración) **y revalida estado y vigencia del usuario en cada petición** (SEC-03) |
| Permisos | `auth/permissions.guard.ts` | RBAC por rol→permiso, que son datos (ADR-0009); la ruta declara `@RequirePermission` |
| Límite de login | `auth/login-throttle.ts` | Ventana por IP+usuario (5 en 15 min) y por IP (10×); bloqueado responde `429 RATE_LIMITED` con `retryAfterSec` (SEC-02) |
| CORS | `common/cors.ts` | Lista explícita en `CORS_ORIGINS`; sin ella no se refleja ningún origen cross-origin (SEC-01) |

## Cómo se abre la conexión

`/health` abre un cliente `pg` efímero con `DATABASE_URL`, ejecuta `SELECT 1` y
lo cierra; Redis se consulta igual con `ioredis`. La conexión no se cachea: es
una prueba de vida, no una capa de datos.

Los endpoints de dominio usan **Prisma 7.10.0** (`@prisma/client` +
`@prisma/adapter-pg`) a través del `PrismaService` único (ADR-0004), sobre el
ER v1 de #58 ya fusionado (`apps/api/prisma/schema.prisma`, migración
`0_baseline`). El acceso vive en adaptadores (`*.prisma-store.ts`): los
servicios dependen de puertos y se prueban sin base.

## Convenciones ya fijadas

1. **Un módulo por dominio**, y cada módulo declara lo que usa. Nada de imports
   cruzados entre dominios.
2. **Los DTOs viven en el módulo**, con `class-validator` (así está escrito
   `LoginDto`). No hay paquete compartido de contratos: `apps/web` y `apps/api`
   no comparten tipos todavía. Cuando lo necesiten, se crea
   `packages/contracts` y se registra aquí. Zod sigue siendo la librería de
   validación de salida de los modelos de IA que fija
   [STACK.md](STACK.md) §1 y [IA.md](IA.md) §2.
3. **Nada de lógica de negocio en el controlador.** El controlador valida y
   delega; la regla vive en el servicio.
4. **Append-only se respeta en servicio y en base.** `truth.audit_log`,
   `truth.origin_history` e `ingest.source_file` no se actualizan ni se borran
   (solo-insert, ADR-0010). La garantía la pone la base con disparadores
   (`core.reject_mutation`), no solo el código.

## Decisiones que ya están tomadas

| Decisión | Dónde quedó |
|---|---|
| Autenticación y forma del token | [ADR-0021](../decisiones/ADR-0021-token-opaco-con-revocacion-inmediata.md): token opaco en `platform.session`, sin JWT |
| Versionado de la ruta | `/v1` para todo el producto; ya lo usa el front (`api-url.ts`) |
| Formato de error único | [ALCANCE-SOLUCION.md §2.1](ALCANCE-SOLUCION.md) (canónico), con 7 códigos |
| Paginación y filtrado de la bandeja | [ADR-0022](../decisiones/ADR-0022-paginacion-por-limit-y-offset.md): `limit` + `offset`, array plano |
| Contrato de ingesta e idempotencia | [ARQUITECTURA.md §3.2](ARQUITECTURA.md#32-idempotencia-de-la-ingesta): `sha256` único por instalación |
| OpenAPI como artefacto | Hecho: documento vivo en `/v1/openapi.json` y `/v1/docs`; artefacto versionado en `docs/api/openapi.json`, verificado por CI |

## Pruebas

| Superficie | Estado |
|---|---|
| `apps/api/src` | 8 archivos, 58 casos unitarios en verde sin red: sesión y throttle, guard, CORS, paginación, familias, salud y motores IA (1 condicional corre solo con `IA_LIVE_TEST=1`) |
| `apps/api/prisma/tests` | 6 archivos de specs contra PostgreSQL real (aislamiento, solo-insert, idempotencia, volumen, reglas, vector): corren en CI con base; sin BD local quedan en `skip` |
| `apps/web` | 10 archivos, 54 pruebas (Vitest) |

El hueco que sigue abierto es la **integración del lado del servidor contra
base de datos real dentro de la suite de la API** (login→guard→endpoint→fila):
eso lo cubre #45. Sin esa capa, RNF-07 no se sostiene del todo.
