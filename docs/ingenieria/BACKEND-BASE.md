# Base del backend: lo que ya está listo

Estado: vigente. Describe la base que el carril de backend (#12) construye
encima: la API arranca, la base está sembrada y los contratos transversales
están resueltos. No es un manual de la API completa: es el punto de partida
para escribir funciones sin volver a decidir las reglas de cada capa.

## Arrancar (un comando)

```
bun run bootstrap
```

Deja arriba: Postgres, Redis y Ollama (docker compose), el cliente Prisma
generado, la migración base aplicada, la semilla de las tres capas, los
modelos de IA descargados y verificados, y el artefacto OpenAPI al día.
Es idempotente y no usa `sudo`. Detalle en
[operacion/BOOTSTRAP.md](../operacion/BOOTSTRAP.md).

Después:

```
bun run dev            # levanta la API (foreground)
curl -s localhost:3000/health
```

La semilla imprime **una sola vez** la contraseña inicial del usuario
`andres` (Administrador de la instalación C1). Si ya corriste la semilla y
no la guardaste:

```
bun run db:password andres
```

## Qué hay montado

| Pieza | Dónde | Qué resuelve |
|---|---|---|
| Cliente de base | `apps/api/src/prisma/` | Un solo `PrismaService` (ADR-0004). Falla al arrancar sin `DATABASE_URL` |
| Sobre de error | `apps/api/src/common/api-error.ts` + `http-exception.filter.ts` | Todo no-2xx sale como `{ code, message, details }` (ALCANCE-SOLUCION §2.1) |
| Paginación | `apps/api/src/common/pagination.ts` | `limit`/`offset`, cuerpo como array plano, total en `X-Total-Count` (ADR-0022) |
| Sesión | `apps/api/src/auth/` | Token opaco, SHA-256 en `platform.session`, revocación inmediata (ADR-0021) |
| Permisos | `apps/api/src/auth/permissions.guard.ts` | RBAC por rol→permiso, que son datos (ADR-0009) |
| Patrón puerto/adaptador | `*.store.ts` + `*.prisma-store.ts` | El servicio no sabe Prisma; las reglas se prueban sin base |
| Módulo de referencia | `apps/api/src/config/families/` | Un GET paginado completo: controlador fino, servicio con las reglas, DTO público |
| OpenAPI | `apps/api/src/openapi.ts`, `docs/api/openapi.json` | Documento vivo en `/v1/docs` y `/v1/openapi.json`, artefacto versionado |
| Validación de entrada | `apps/api/src/main.ts` | `ValidationPipe` global: lo que no pasa el DTO no llega al servicio |

### Endpoints disponibles

| Método | Ruta | Qué hace |
|---|---|---|
| `GET` | `/health` | Puerta operacional: Postgres y Redis, honesto y degradado |
| `POST` | `/v1/auth/login` | Inicia sesión y devuelve el token opaco + usuario |
| `POST` | `/v1/auth/logout` | Revoca la sesión actual (204) |
| `GET` | `/v1/auth/me` | Perfil, roles, permisos y dominios de la sesión |
| `GET` | `/v1/families` | Catálogo de familias de la instalación (paginado) |
| `GET` | `/v1/families/:familyCode` | Una familia |

## Las tres capas de la semilla

La base se siembra en tres capas, con reglas de propiedad distintas:

| Capa | Archivo | Qué contiene | Quién decide sus cambios |
|---|---|---|---|
| **Motor** | `apps/api/prisma/seed/engine.sql` | Vocabulario fijo: 12 permisos, 4 roles y su matriz | Cambia con el motor, nunca con el caso |
| **Caso C1** | `apps/api/prisma/seed/c1.sql` | Lo del caso que sigue siendo fijo: instalación, 6 departamentos, 9 personas, sus roles y dominios, 6 familias, 7 reglas, 11 tipos de entidad, 5 máquinas | Cambia con el caso, no con el mes |
| **Corpus del mes** | lo emite #59 | Archivos, turnos, líneas, embeddings | Cambia cada mes, lo genera el dataset (#61) |

La semilla es idempotente (UUID fijos + `ON CONFLICT DO NOTHING`): correrla
dos veces no duplica nada. El corpus **no** está en el repo a propósito.

## Cómo agregar una función (el patrón)

1. **Puerto** (`x.store.ts`): la interfaz mínima que el servicio necesita.
   Sin tipos de Prisma, sin `any`.
2. **Adaptador** (`x.prisma-store.ts`): la implementación con Prisma. Es el
   único archivo que sabe SQL.
3. **Servicio** (`x.service.ts`): las reglas. Lanza `ApiError` (§2.1) y no
   conoce ni Nest ni Prisma.
4. **Controlador** (`x.controller.ts`): delgado. Traduce HTTP a entradas del
   servicio y pone `X-Total-Count`.
5. **Prueba** (`x.service.spec.ts`): con un store falso, sin base. Corre en CI
   y en `bun run verify`.

El módulo de referencia es `apps/api/src/config/families/`: cópialo.

Reglas que no se negocian:

- **La instalación viene de la sesión**, nunca de un parámetro de la consulta:
  `sessionUserOf(request).facilityId`.
- **Orden estable** con desempate por `id` (ADR-0022), para que dos filas con
  la misma fecha no se pisen.
- **El DTO es el contrato**: el servicio devuelve el DTO, la fila interna no
  sale nunca.
- **Un proveedor inyectado por constructor se importa como valor**, no con
  `import type`: NestJS lo resuelve con `emitDecoratorMetadata` y necesita la
  clase en runtime (regla 8 de `AGENTS.md`).

## Pruebas y puertas

| Puerta | Qué cubre | Cuándo corre |
|---|---|---|
| `bun --filter @docu/api test` | Reglas de los servicios (sin base) | `verify` y CI |
| `bun run db:test` | Contrato estructural del ER (22 CHECK, FKs, vistas, triggers) | `verify` y CI |
| `bun run db:spec` | 36 specs TDD por función de la base | `verify` y CI |
| `bun run db:bench 5` | Velocidad, carga y peso con 850 archivos/300 turnos/300 lineage/300 embeddings | A demanda |
| `bun run api:openapi:check` | El artefacto OpenAPI está al día | CI |
| `bun run verify` | Todo lo anterior + lint, tipos, docs y smoke de la API | Antes de cerrar cualquier cosa |

## Lo que NO está hecho (y le toca a cada quien)

- Ingesta desde Drive y **worker BullMQ** (#46): cola, reintentos, lotes.
- **Pipeline de IA**: cascada de scoring, OCR, LLM y embeddings (#3), que
  además espera el motor SystemOne/Laya en `IA_SCORING_URL`.
- **Evaluador de reglas** R-P1..R-T1: la semilla deja la expresión como dato;
  el evaluador es del carril de backend.
- **API de consulta con citas**, búsqueda textual en español (`tsvector`+GIN)
  y la UI de confirmación humana.
- **Zod/esquemas por familia**: hoy la semilla deja `schema_definition` como
  marcador.

Cada uno de esos carriles entra por el mismo patrón (puerto, servicio,
controlador, prueba) y respeta los mismos contratos transversales.
