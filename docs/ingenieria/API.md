# Ingeniería: contrato de API

Estado: vigente. Describe el presente, no el deseo.
Base: NestJS 12, driver `pg` directo, `PORT_API` (3000 por defecto).

El contrato de C1 —la superficie prevista, con sus tablas y sus errores— está
en [ARQUITECTURA.md §3](ARQUITECTURA.md#3-contrato-de-endpoints). Este
archivo describe lo que **existe hoy**.

## Superficie actual (E1)

| Método | Ruta | Qué hace |
|---|---|---|
| `GET` | `/health` | `SELECT 1` en PostgreSQL y `PING` en Redis. Responde `{ status, postgres, redis }` |

Es toda la API que existe. `AppModule` declara un controlador.
No hay autenticación, no hay DTOs, no hay OpenAPI. Eso es correcto para E1
(`docs/REGLAS.md`: sin lógica de negocio antes de M1).

`GET /health` devuelve `200` solo si ambas dependencias responden. Es la puerta
que usa CI para no dar por buena una API a medio levantar.

## Cómo se abre la conexión

`/health` abre un cliente `pg` efímero con `DATABASE_URL`, ejecuta `SELECT 1` y
lo cierra; Redis se consulta igual con `ioredis`. La conexión no se cachea: es
una prueba de vida, no una capa de datos.

El ORM ya está instalado: `prisma` 7.10.0, `@prisma/client` 7.10.0 y
`@prisma/adapter-pg` 7.10.0 son dependencias de `apps/api` (`package.json`).
Lo que llega después es el **esquema**, con el ER de #58, y la **semilla**, con
#59. La API todavía no usa Prisma en ningún endpoint.

## Convenciones ya fijadas

1. **Un módulo por dominio**, y cada módulo declara lo que usa. Nada de imports
   cruzados entre dominios.
2. **Los DTOs viven en el módulo**, con Zod. No hay paquete
   compartido de contratos: `apps/web` y `apps/api` no comparten tipos todavía.
   Cuando lo necesiten, se crea `packages/contracts` y se registra aquí.
   Zod es la librería de validación de entrada y salida que fija
   [STACK.md](STACK.md) §1 y que exige [IA.md](IA.md) §2 para la salida de
   los modelos; hoy todavía **no está declarada** como dependencia de
   `apps/api` (en el lockfile solo llega de forma transitiva por Angular), y
   declararla es parte de #12.
3. **Nada de lógica de negocio en el controlador.** El controlador valida y
   delegue; la regla vive en el servicio.
4. **Append-only se respeta en servicio y en base.** `truth.audit_log`,
   `truth.origin_history` e `ingest.source_file` no se actualizan ni se borran
   (solo-insert, ADR-0010). La garantía la pone la base con disparadores
   (`core.reject_mutation`), no solo el código.

## Decisiones que ya están tomadas

Las seis preguntas que esta tabla tenía pendientes están cerradas. Ninguna se
vuelve a abrir aquí:

| Decisión | Dónde quedó |
|---|---|
| Autenticación y forma del token | [ADR-0021](../decisiones/ADR-0021-token-opaco-con-revocacion-inmediata.md): token opaco en `platform.session`, sin JWT |
| Versionado de la ruta | `/v1` para todo el producto; ya lo usa el front (`api-url.ts`) |
| Formato de error único | [ALCANCE-SOLUCION.md §2.1](ALCANCE-SOLUCION.md) (canónico), con 7 códigos |
| Paginación y filtrado de la bandeja | [ADR-0022](../decisiones/ADR-0022-paginacion-por-limit-y-offset.md): `limit` + `offset`, array plano |
| Contrato de ingesta e idempotencia | [ARQUITECTURA.md §3.2](ARQUITECTURA.md#32-idempotencia-de-la-ingesta): `sha256` único por instalación |
| OpenAPI como artefacto | Pendiente de #12; el requisito (SRS IEEE 830) sigue en pie |

## Pruebas

| Superficie | Estado |
|---|---|
| `apps/api` | 2 archivos, 21 casos (Bun test): motores IA (config, contratos, presupuesto, caché, reintentos) y reporte de salud. 20 en verde; 1 condicional corre solo con `IA_LIVE_TEST=1` |
| `apps/web` | 10 archivos, 54 pruebas (Vitest) |

Las pruebas de la API son unitarias y corren sin red. El hueco que sigue
abierto es la **integración del lado del servidor contra base de datos real**
(esquema, migración, aislamiento por instalación): eso lo cubre #45. Sin esa
capa, RNF-07 no se sostiene del todo.
