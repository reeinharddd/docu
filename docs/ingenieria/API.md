# Ingeniería: contrato de API

Estado: vigente. Describe el presente, no el deseo.
Base: NestJS 12, Prisma 7 con adaptador `pg`, `PORT_API` (3000 por defecto).

## Superficie actual (E1)

| Método | Ruta | Qué hace |
|---|---|---|
| `GET` | `/health` | `SELECT 1` en PostgreSQL y `PING` en Redis. Responde `{ status, postgres, redis }` |

Es toda la API que existe. `AppModule` declara un controlador y un proveedor.
No hay autenticación, no hay DTOs, no hay OpenAPI. Eso es correcto para E1
(`docs/REGLAS.md`: sin lógica de negocio antes de M1).

`GET /health` devuelve `200` solo si ambas dependencias responden. Es la puerta
que usa CI para no dar por buena una API a medio levantar.

## Cómo se abre la conexión

`PrismaService` extiende `PrismaClient` y le pasa un `PrismaPg` construido con
`DATABASE_URL`. Prisma 7 movió la conexión fuera del schema: la resuelve
`prisma.config.ts`, que además carga el `.env` de la raíz del monorepo para que
los comandos funcionen desde cualquier subcarpeta sin exportar variables a mano.

`$connect()` en `onModuleInit` y `$disconnect()` en `onModuleDestroy`.

## Convenciones ya fijadas

1. **Un módulo por dominio**, y cada módulo declara lo que usa. Nada de imports
   cruzados entre dominios.
2. **Los DTOs viven en el módulo**, con `class-validator`. No hay paquete
   compartido de contratos: `apps/web` y `apps/api` no comparten tipos todavía.
   Cuando lo necesiten, se crea `packages/contracts` y se registra aquí.
3. **Nada de lógica de negocio en el controlador.** El controlador valida y
   delegue; la regla vive en el servicio.
4. **Append-only se respeta en servicio y en base.** `Bitacora`,
   `HistorialOrigen` y `ArchivoOriginal` no se actualizan ni se borran.

## Lo que hay que decidir antes de M1

| Decisión | Por qué no se puede postergar |
|---|---|
| Autenticación y forma del token | `RF-06` define roles. Cambiarlo después rompe sesiones y datos |
| Versionado de la ruta | Sin `/v1` desde el primer día, no hay vuelta atrás |
| Formato de error único | RF-07 y los códigos de regla se muestran en pantalla |
| Paginación y filtrado de la bandeja | La bandeja crece sin límite |
| Contrato de ingesta y su idempotencia | `sha256` ya da la clave; falta el contrato HTTP |
| OpenAPI como artefacto | El SRS IEEE 830 lo exige como entregable |

## Pruebas

| Superficie | Estado |
|---|---|
| `apps/api` | **0 pruebas.** Sin unitarias ni de integración |
| `apps/web` | 1 archivo, 2 pruebas (Vitest) |

`apps/api` no tiene un solo `.spec.ts`. Es el hueco más grande del proyecto:
RNF-07 no se sostiene sin pruebas del lado del servidor.
