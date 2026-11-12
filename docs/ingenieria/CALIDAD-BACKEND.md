# Estándar de respuesta y calidad del backend

Estado: vigente. Es el estándar que el backend cumple hoy y el que debe
cumplir cada función que se escriba encima. No es trivial: el apartado final
declara, sin adornos, lo que esta demo **todavía no cumple**, para que nadie
lo descubra en producción.

La referencia de implementación está en
[BACKEND-BASE.md](BACKEND-BASE.md); aquí está el *por qué* de cada regla.

## 1. Respuesta predecible

El cliente (web, IA, script) debe poder predecir la respuesta sin conocer la
implementación. Tres garantías, y solo tres:

| Garantía | Regla |
|---|---|
| **Forma** | Todo 2xx devuelve el recurso o un **array plano** de recursos. Nada de envoltorios `{ items, total }` |
| **Total** | El total de filas va en la cabecera `X-Total-Count`, nunca en el cuerpo (ADR-0022) |
| **Orden** | Orden estable y explícito por endpoint, con desempate por `id`. Dos filas con la misma fecha nunca se pisen |

Y una cuarta, transversal: **el DTO es el contrato**. Lo que sale de la API es
exactamente el DTO; la fila de la base (con `facility_id` y demás internos) no
sale nunca.

```ts
// Sí: el cliente lee un array y ya sabe qué esperar.
GET /v1/families → 200, [ { id, familyCode, name, parserKey, isOcrRequired } ]
X-Total-Count: 6

// No: cada endpoint inventa su envoltorio.
GET /v1/families → 200, { items: [...], total: 6 }
```

## 2. Errores: un sobre, sin verbosidad

Todo no-2xx devuelve el mismo sobre (`ALCANCE-SOLUCION.md` §2.1):

```json
{ "code": "VALIDATION_ERROR", "message": "El rollo no tiene certificado.", "details": {} }
```

| `code` | HTTP | Cuándo |
|---|---|---|
| `VALIDATION_ERROR` | 422 | Una regla o el esquema de la familia no pasa |
| `UNAUTHENTICATED` | 401 | Sin sesión, sesión vencida o revocada, credenciales incorrectas |
| `FORBIDDEN` | 403 | Con sesión, sin permiso, o usuario inactivo |
| `NOT_FOUND` | 404 | El recurso no existe en la instalación de la sesión |
| `CONFLICT` | 409 | La petición choca con el estado actual (idempotencia, duplicado) |
| `RATE_LIMITED` | 429 | Demasiadas peticiones |
| `INTERNAL` | 500 | Fallo no previsto |

Reglas que no se saltan:

1. **`code` es estable**: es lo que consume el front. El `message` es para
   personas y puede cambiar sin romper a nadie.
2. **Sin verbosidad**: el mensaje dice qué pasa, en español, en una frase.
   No repite el campo, no da contexto que el cliente ya sabe, no pide
   "contacta al administrador".
3. **Sin fuga de internals**: `details` lleva datos de la validación (campo,
   valor esperado), nunca una traza, SQL, ruta de archivo o mensaje del
   motor. Lo crudo se registra en el servidor, nunca sale.
4. **Un error, un código**: si son dos causas distintas, son dos códigos.
   "400 genérico" no existe aquí.
5. **La enumeración de usuarios se evita**: usuario inexistente y contraseña
   incorrecta devuelven el mismo `401` con el mismo mensaje.

## 3. Manejo de errores: dónde se decide cada cosa

| Capa | Qué hace con los errores |
|---|---|
| **Controlador** | Nada: traduce HTTP y deja que el filtro global formatee |
| **Servicio** | Decide el `ApiError` (código + mensaje + detalles). Es el único que conoce las reglas del dominio |
| **Filtro global** | Formatea cualquier excepción no-`ApiError` como `INTERNAL` y registra el original en el servidor |
| **Adaptador (Prisma)** | Traduce el error técnico al `ApiError` del dominio si tiene traducción clara; si no, lo deja subir y lo captura el filtro |

Nunca: `try { ... } catch { return [] }` para "no romper". Un fallo de base
de datos es `INTERNAL`, no una lista vacía. Una lista vacía significa "no
hay datos"; un fallo significa "no se pudo saber".

## 4. Separación de capas y una responsabilidad

```
HTTP  →  controlador  →  servicio  →  puerto  →  adaptador (Prisma)  →  PostgreSQL
        (traduce)      (reglas)     (contrato)   (SQL)
```

- El **controlador** no consulta la base ni decide reglas: traduce HTTP a
  entradas del servicio y pone `X-Total-Count`.
- El **servicio** no sabe qué es HTTP ni qué es Prisma: recibe datos, devuelve
  datos y lanza `ApiError`. Por eso se prueba sin base y sin Nest.
- El **puerto** (`x.store.ts`) es la interfaz mínima que el servicio necesita.
  Pocos métodos, sin tipos de Prisma.
- El **adaptador** (`x.prisma-store.ts`) es el único archivo que sabe SQL.

Una responsabilidad por archivo: un servicio, un propósito. Si un servicio
tiene que "consultar y además notificar y además transformar", son tres
servicios o tres puertos.

## 5. Reutilización

Lo que ya existe y se reusa (no se reimplementa):

| Pieza | Para qué |
|---|---|
| `common/api-error.ts` | Todos los errores de la API, un solo lugar |
| `common/http-exception.filter.ts` | El sobre §2.1 en toda respuesta no-2xx |
| `common/pagination.ts` | `limit`/`offset` con validación (422) y límites (50/200) |
| `auth/session.guard.ts` | Quién es el que llama; adjunta roles y permisos |
| `auth/permissions.guard.ts` | `@RequirePermission('confirm')` sobre la ruta |
| `prisma/prisma.service.ts` | Un solo cliente de base para toda la API |

Regla: si el patrón se repite por tercera vez, se extrae a `common/`. Por
segunda vez, se copia y se anota.

## 6. Eficiencia

- **Filtro antes que paginación**: el filtro se aplica en la base y la
  paginación se aplica al resultado filtrado (ADR-0022). Paginar primero y
  filtrar después cambia el total y miente.
- **Conteo en la misma vuelta**: el total y las filas salen juntos (dos
  consultas paralelas, no una por fila).
- **Sin N+1**: lo que se necesita de varias filas se trae en la consulta
  (`include`), no preguntando fila por fila.
- **Índices**: toda columna por la que se filtra u ordena tiene índice. La BD
  ya trae 101 índices y HNSW para búsqueda vectorial; el plan se mide con
  `bun run db:bench`, no se supone.
- **Límite de páginas**: máximo 200 filas por petición. La bandeja crece sin
  límite y sin paginación la API se cae.
- **Sin trabajo pesado en el request**: OCR, LLM, embeddings y el pipeline
  son del worker (#46), no del hilo de la petición.

## 7. Seguridad de tipos

- TypeScript estricto, sin excepciones: `strict`, `noUncheckedIndexedAccess`,
  `exactOptionalPropertyTypes` (ya activos en `apps/api/tsconfig.json`).
- **Prohibido** `any`, `as any`, `@ts-ignore` y `!` como atajo. Si el tipo no
  cabe, el modelo está mal: se corrige el modelo.
- **El dominio habla el idioma del dominio**: `facilityId`, `familyCode`,
  `quarantine`, no `row1`, `col2`, `temp`.
- **Los proveedores inyectados se importan como valor** (regla 8 de
  `AGENTS.md`): NestJS los resuelve con `emitDecoratorMetadata` y necesita la
  clase en runtime. `import type` en un constructor rompe la inyección en
  producción y no en el typecheck.
- **Los secretos no se escriben**: nada de `.env` en el repo, nada de tokens
  en el código, ni en los logs, ni en los mensajes de error.

## 8. Lo que esta demo todavía NO cumple

Anotado aquí para que sea deuda visible, no sorpresa. Nada de esto bloquea
C1 local; todo esto bloquea producción.

| Área | Estado actual | Qué falta |
|---|---|---|
| **Aislamiento de datos** | RLS = 0: el aislamiento depende del backend (toda consulta filtra por `facilityId` de la sesión) | Activar RLS por instalación y probar que el backend no puede saltársela |
| **Rol de aplicación** | El rol `docu` es superusuario de la base | Rol con privilegios mínimos: la API no debería poder crear extensiones ni drop |
| **Transporte** | `ssl off` en Postgres local | TLS entre API y base; certificados en despliegue |
| **Motor de scoring** | `IA_SCORING_URL` (SystemOne/Laya) no responde: la cascada de decisión no se puede ejecutar | Levantar el motor o decidir el paquete equivalente |
| **Embeddings** | El cliente valida 768 dimensiones pero no las pide: el proveedor devuelve 1024 | Enviar `"dimensions": 768` en `api-embedding.engine.ts` |
| **Worker y colas** | No existe el worker BullMQ (#46): ingesta, OCR, LLM y embeddings no tienen proceso propio | Worker con reintentos, lotes y DLQ (COLAS.md) |
| **Pipeline** | No existe la cascada de scoring→OCR→LLM→embeddings (#3) | Pipeline con presupuesto, caché y trazabilidad |
| **Reglas** | R-P1..R-T1 están sembradas como dato, sin evaluador | Evaluador de reglas por familia (el backend lo implementa) |
| **Búsqueda textual** | No hay búsqueda en español (`tsvector` + GIN) | Índice de texto y endpoint de consulta |
| **Consulta con citas** | No hay endpoint de consulta con citas (carril E) | Endpoint que cite origen y versión |
| **Confirmación humana** | No hay UI ni flujo de confirmación | Pantalla y flujo de revisión |
| **Rate limit distribuido** | El login se limita en memoria por instancia: ip+usuario (5 en 15 min) e IP (10×), configurable con `LOGIN_MAX_ATTEMPTS`/`LOGIN_WINDOW_MINUTES` | Mover los contadores a Redis para despliegues con varias instancias |
| **Observabilidad** | Logs de arranque y de errores no controlados; sin trazas ni métricas por request | Traza por request (id en logs), métricas y alertas |
| **Pruebas de integración** | Las reglas se prueban con store falso; la BD tiene sus specs TDD | Suite de integración API↔BD en CI (el patrón lo pide el brief de #45) |
| **OpenAPI** | El artefacto existe y CI lo verifica | Descripción por DTO (esquemas, ejemplos) y deprecation de contratos |

Cada fila dice qué falta, no quién lo hace. El reparto por carril vive en
[gestion/TRAZABILIDAD.md](../gestion/TRAZABILIDAD.md).
