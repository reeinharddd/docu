# Stack tecnológico

Estado: vigente. Versiones verificadas contra `bun.lock` el 2026-10-05 y de
nuevo contra los manifiestos el 2026-11-07. Lo que no está instalado hoy está
marcado como pendiente; nada aquí promete lo que no existe todavía.

Este archivo es la ficha técnica. Dos cosas y solo dos:

1. Una **lista rápida** de lo que está instalado, con versión confirmada y el
   sitio oficial de cada cosa.
2. El **detalle por tecnología**: por qué se eligió, enlaces fijos de
   documentación, configuraciones modernas que aplican al proyecto y
   herramientas oficiales para agentes.

Las secciones que terminan en "remarcas" son **propuestas, no cambios
aplicados**. Nadie las da por hechas hasta que exista un PR y una decisión
registrada.

---

## 1. Lista rápida del stack

Versiones confirmadas en el lockfile. "Fijada" significa versión exacta en el
`package.json`; "rango" significa que el lockfile fija la resolución pero el
manifiesto permite moverse dentro del rango. Las imágenes de Docker usan tags
flotantes a propósito (desarrollo) y son un punto a fijar antes de un
despliegue compartido.

### Base de ejecución

| Pieza | Versión | Fijada | Sitio oficial | Repositorio |
|---|---|---|---|---|
| Bun (runtime, gestor, ejecutor) | 1.4.3 | sí | <https://bun.sh> | <https://github.com/oven-sh/bun> |
| TypeScript (API) | 5.9.3 | sí | <https://www.typescriptlang.org> | <https://github.com/microsoft/TypeScript> |
| TypeScript (web) | 6.0.3 | rango `~6.0.2` | <https://www.typescriptlang.org> | <https://github.com/microsoft/TypeScript> |
| Zod (validación de entrada y salida) | 4.6.5 | no (transitiva) | <https://zod.dev> | <https://github.com/colinhacks/zod> |

Zod es la librería de validación de entrada y salida que el proyecto usa:
[IA.md](IA.md) §2 exige validar con Zod la salida de los modelos, y
[API.md](API.md) lo fija para los DTOs. **Hoy no es una dependencia
declarada** de `apps/api` ni de `apps/web`: la versión 4.6.5 del lockfile
llega de forma transitiva por `@angular/forms` y `@angular/cli`. Declararla
como dependencia directa de `apps/api` es parte de #12.

### Frontend

| Pieza | Versión | Fijada | Sitio oficial | Repositorio |
|---|---|---|---|---|
| Angular (core, common, router, forms) | 22.2.1 | rango `^22.2.0` | <https://angular.dev> | <https://github.com/angular/angular> |
| Angular CLI | 22.2.1 | rango `^22.2.1` | <https://angular.dev/cli> | <https://github.com/angular/angular-cli> |
| Angular build (`@angular/build`) | 22.2.1 | rango `^22.2.1` | <https://angular.dev/tools/cli/build> | <https://github.com/angular/angular-cli> |
| angular-eslint | 22.5.0 | sí | <https://github.com/angular/angular-eslint> | <https://github.com/angular/angular-eslint> |
| ESLint | 10.12.0 | rango `^10.12.0` | <https://eslint.org> | <https://github.com/eslint/eslint> |
| Tailwind CSS | 4.3.3 | sí | <https://tailwindcss.com> | <https://github.com/tailwindlabs/tailwindcss> |
| `@tailwindcss/postcss` | 4.3.3 | rango `^4.3.3` | <https://tailwindcss.com/docs/installation/framework-guides/angular> | <https://github.com/tailwindlabs/tailwindcss> |
| PostCSS | 8.5.x | rango `^8.5.29` | <https://postcss.org> | <https://github.com/postcss/postcss> |
| Vitest | 5.0.3 | rango `^5.0.0` | <https://vitest.dev> | <https://github.com/vitest-dev/vitest> |
| jsdom | 30.1.2 | rango `^30.0.0` | <https://github.com/jsdom/jsdom> | <https://github.com/jsdom/jsdom> |
| zone.js | **no instalado** | — | <https://github.com/angular/angular> | — |

### Backend

| Pieza | Versión | Fijada | Sitio oficial | Repositorio |
|---|---|---|---|---|
| NestJS (common, core, platform-express) | 12.1.2 | sí | <https://nestjs.com> | <https://github.com/nestjs/nest> |
| `@nestjs/testing` (pruebas de endpoint) | 12.1.2 | sí | <https://docs.nestjs.com/fundamentals/testing> | <https://github.com/nestjs/nest> |
| supertest | 7.3.2 | rango `^7.1.1` | <https://github.com/ladjs/supertest> | mismo |
| `@types/supertest` | 6.0.3 | rango `^6.0.3` | <https://github.com/DefinitelyTyped/DefinitelyTyped> | mismo |
| reflect-metadata | 0.2.2 | rango `^0.2.2` | <https://github.com/reflect-metadata/reflect-metadata> | mismo |
| RxJS | 7.8.2 | rango `^7.8.2` | <https://rxjs.dev> | <https://github.com/ReactiveX/rxjs> |
| BullMQ | 6.3.11 | sí | <https://docs.bullmq.io> | <https://github.com/taskforcesh/bullmq> |
| ioredis | 6.0.0 | sí | <https://github.com/redis/ioredis> | mismo |
| bcryptjs | 3.0.3 | rango `^3.0.2` | <https://github.com/dcodeIO/bcrypt.js> | mismo |

### Datos

| Pieza | Versión | Fijada | Sitio oficial | Repositorio |
|---|---|---|---|---|
| PostgreSQL | 18 (parche vigente 18.4) | imagen con tag flotante | <https://www.postgresql.org> | <https://github.com/postgres/postgres> |
| pgvector | la que traiga la imagen | tag flotante | <https://github.com/pgvector/pgvector> | mismo |
| Prisma CLI | 7.10.0 | sí | <https://www.prisma.io> | <https://github.com/prisma/prisma> |
| `@prisma/client` | 7.10.0 | sí | <https://www.prisma.io> | mismo |
| `@prisma/adapter-pg` | 7.10.0 | sí | <https://www.prisma.io/docs/orm/v7> | mismo |
| `pg` (driver) | 8.23.1 | rango `^8.23.1` | <https://node-postgres.com> | <https://github.com/brianc/node-postgres> |

PostgreSQL 18 y pgvector corren en Docker Compose con la imagen
`pgvector/pgvector:pg18`, y el CLI de Prisma y sus dos paquetes ya son
dependencias de `apps/api`. Lo que falta es el **esquema**: lo traen #58 y
#59.

### Caché y cola

| Pieza | Versión | Fijada | Sitio oficial | Repositorio |
|---|---|---|---|---|
| Redis | 8.x | imagen con tag flotante | <https://redis.io> | <https://github.com/redis/redis> |
| Feature sets documentados | hasta 8.10 | — | <https://redis.io/docs/latest/develop/whats-new/redis-feature-sets> | — |

### Calidad e infraestructura

| Pieza | Versión | Fijada | Sitio oficial | Repositorio |
|---|---|---|---|---|
| Biome | 2.5.4 | exacta | <https://biomejs.dev> | <https://github.com/biomejs/biome> |
| Lefthook (`@evilmartians/lefthook`) | 2.1.x | rango `^2.1.17` | <https://lefthook.dev> | <https://github.com/evilmartians/lefthook> |
| dotenv | 16.6.1 | sí | <https://github.com/motdotla/dotenv> | mismo |
| Gitleaks (solo CI) | v2 de la acción | por acción | <https://github.com/gitleaks/gitleaks> | mismo |
| Renovate | `config:recommended` | por configuración | <https://docs.renovatebot.com> | <https://github.com/renovatebot/renovate> |

### Entorno de desarrollo

| Pieza | Versión | Sitio oficial |
|---|---|---|
| Docker Engine y Compose | los del sistema o del Dev Container | <https://docs.docker.com> |
| Dev Container | imagen base Ubuntu de Microsoft | <https://containers.dev> |
| VS Code y extensiones recomendadas | sin versión fijada | <https://code.visualstudio.com> |

### Remarca 1: Biome declarado y fijado (resuelto)

**Era**: `biome` no aparecía en `bun.lock` ni en `node_modules/.bin`. Los scripts
`bun run lint` y el hook de pre-commit lo invocaban con `bunx`, así que cada
corrida descargaba la última versión del registro. La configuración declara el
esquema 2.5.4 y una versión más nueva puede rechazar esa configuración. El
resultado del lint dependía del día, no del repositorio.

**Ahora**: `@biomejs/biome@2.5.4` está declarado como dependencia de desarrollo
con versión exacta. `bun run lint` y el hook usan el binario local. `bun run
doctor` comprueba que la versión instalada coincide con el `$schema` de
`biome.json`, así que la deriva vuelve a ser detectable si alguien la introduce.

La 2.5.4 es exacta y no un rango a propósito: el esquema de `biome.json` es
`2.5.4`, y la última publicada al verificar (2026-10-05) era 2.5.15. Subir la
configuración y la dependencia en el mismo PR, nunca una sin la otra.

Además el linter pasó de `preset: "none"` a `preset: "recommended"` y el script
usa `--error-on-warnings`: un aviso es fallo.

### Remarca 2: dos herramientas sin versión exacta

Las imágenes del Compose usan tags flotantes (`redis:8`,
`pgvector/pgvector:pg18`). Renovate ya observa esas imágenes, así que el
cambio llega, pero llega cuando la etiqueta cambia y no cuando alguien lo
pide. *Remarca, no aplicado*: fijar el parche o registrar la versión resuelta.

---

## 2. Detalle por tecnología

### 2.1 Bun

Documentación: <https://bun.sh/docs>

Runtime, gestor, ejecutor de scripts y orquestador del entorno local. Elegido
para que exista un solo comando y una sola cadena de herramientas.
Justificación completa en [ADR-0002](../decisiones/ADR-0002-bun-como-runtime-y-gestor.md).

### 2.2 Angular 22

Documentación:
- Guía general: <https://angular.dev>
- Zoneless: <https://angular.dev/guide/zoneless>
- Señales: <https://angular.dev/guide/signals>
- Rendimiento y carga diferida: <https://angular.dev/best-practices/performance>
- Tailwind con Angular: <https://angular.dev/guide/tailwind>
- Novedades de la versión: <https://angular.dev/events/v22>

Configuraciones modernas de la versión y su estado en el proyecto:

| Configuración | Estado | Remarca |
|---|---|---|
| Zoneless por defecto desde la v21 | Adoptado: `zone.js` no está instalado | No reintroducir `provideZoneChangeDetection` |
| `ChangeDetectionStrategy.OnPush` | No adoptado en los componentes de página | Angular lo recomienda como paso hacia zoneless; reduce trabajo de detección |
| Componentes `standalone` | Adoptado | — |
| Señales (`input()`, `output()`, `model()`, `computed`, `linkedSignal`) | Parcial | Migrar entradas y salidas a funciones de señal |
| Control de flujo `@if` y `@for` | Adoptado | — |
| `@defer` para carga diferida | No usado | Aplicar en bandeja y búsqueda: es el mayor peso de la demo |
| `httpResource` para datos remotos | No usado | Candidato natural para búsqueda con filtros |
| Quitar `zone.js` de `polyfills` en `build` y en `test` | `angular.json` no declara `polyfills` | Revisar si se agrega SSR o el runner antiguo |
| Vitest como runner | Adoptado | 54 pruebas en 10 archivos, en verde |
| Componentes Aria para accesibilidad | No usado | Evaluar en bandeja: la usabilidad pide accesibilidad |

### 2.3 NestJS 12

Documentación:
- Guía: <https://docs.nestjs.com>
- Guía de migración (ESM y NodeNext): <https://docs.nestjs.com/migration-guide>
- Health checks: <https://docs.nestjs.com/recipes/terminus>
- Configuración: <https://docs.nestjs.com/fundamentals/configuration>

| Configuración | Estado | Remarca |
|---|---|---|
| ESM con `nodenext` | Adoptado | — |
| Validación de entrada global | Ausente | Sin esto no hay validación de entrada; es la base del requisito de seguridad. Se hará con Zod ([API.md](API.md)), no con `class-validator`: el `ValidationPipe` de NestJS trabaja con `class-validator`, así que el pipe global se escribe con `zod` en #12 |
| `enableShutdownHooks()` | Ausente | Para cerrar conexiones al recibir `SIGTERM` |
| Health checks con `@nestjs/terminus` y `withTimeout` | Controller propio | Evolución natural: separar liveness de readiness cuando haya dependencias |
| Módulos por dominio | Solo un módulo con un controller | El esqueleto de la siguiente etapa es un módulo por área |
| `@nestjs/bull` | No usado | Evaluar si conviene más que cablear BullMQ a mano |

### 2.4 Prisma 7 y PostgreSQL 18

Documentación:
- Prisma: <https://www.prisma.io/docs/orm/v7>
- Referencia de `prisma.config.ts`: <https://www.prisma.io/docs/orm/reference/prisma-config-reference>
- PostgreSQL 18: <https://www.postgresql.org/docs/18/release-18.html>
- pgvector: <https://github.com/pgvector/pgvector>

Novedades de PostgreSQL 18 (lanzada el 2025-09-25) que tocan al proyecto:

| Novedad | Utilidad | Remarca |
|---|---|---|
| `uuidv7()` | El ER v1 (#58) usa `uuid()` (v4) como clave primaria; v4 aleatorio dispersa las inserciones en los índices | Value en las tablas que solo crecen; se puede cambiar mientras no haya datos de producción |
| `skip scan` en índices multicolumna | Búsqueda por fecha y área donde la primera columna puede faltar | Beneficio directo, sin configurar |
| E/S asíncrona | Lecturas secuenciales y vaciado más rápidos | Beneficio directo, se debe medir en la prueba de volumen |
| `OLD` y `NEW` en `RETURNING` | Registrar valor anterior y nuevo en una sola sentencia | Mejora la trazabilidad del historial |
| Columnas generadas virtuales por defecto | Columnas derivadas sin costo de escritura | Candidato para el índice de búsqueda |
| Compilación paralela de índices GIN | Beneficia la búsqueda de texto completo | Aplicar si la búsqueda usa `tsvector` |

Herramientas oficiales de Prisma para agentes:

| Recurso | Enlace |
|---|---|
| Repositorio oficial de skills | <https://github.com/prisma/skills> |
| Instalación con el CLI oficial | `bunx @prisma/cli@7.10.0 agent install` |
| Instalación de una skill concreta | `bunx skills add prisma/skills --skill prisma-driver-adapter-implementation` |
| Estado de lo instalado | `bunx @prisma/cli@7.10.0 agent status --json` |

El CLI se fija a `7.10.0` y no a `latest`: al verificar el 2026-10-05,
`@prisma/cli@latest` era `8.0.0-rc.20` y `prisma@latest` también. Un comando con
`@latest` instalaría una release candidate sobre un proyecto en Prisma 7.

Skills relevantes para este proyecto: `prisma-postgres-setup`,
`prisma-driver-adapter-implementation`, `prisma-client-api`, `prisma-cli`,
`prisma-upgrade-v7`. *Remarca: instalar y evaluar cuando exista el contrato de
herramientas del agente* (ver
[ADR-0007](../decisiones/ADR-0007-contrato-de-herramientas-del-agente.md)).

### 2.5 BullMQ y Redis 8

Documentación:
- Conexiones y adaptadores: <https://docs.bullmq.io/guide/connections>
- Compatibilidad de Redis: <https://docs.bullmq.io/guide/redis-compatibility>
- Novedades de Redis 8: <https://redis.io/docs/latest/develop/whats-new/8-0/>

| Hallazgo | Remarca |
|---|---|
| Redis 8 integra los módulos en una sola imagen: ya no se instalan ni versionan por separado | Simplifica el Compose y elimina una clase de conflictos |
| BullMQ incluye adaptadores oficiales para ioredis, node-redis y el cliente nativo de Bun | El proyecto usa ioredis; la alternativa queda registrada |
| BullMQ requiere `maxmemory-policy noeviction` | Configurar o los jobs se descartan |
| La opción `keyPrefix` de ioredis es incompatible con BullMQ | No usarla |
| Redis 8 trae Vector Set en beta y búsqueda híbrida en 8.8 | Los embeddings se quedan en la base de datos del proyecto: una sola fuente de verdad |

### 2.6 Biome

Documentación: <https://biomejs.dev>

El formateador está activado y el linter corre con `preset: "recommended"`,
aplicado por `bun run lint` (`biome check --error-on-warnings`): un aviso es
fallo. `bun run doctor` comprueba que la versión instalada coincide con el
`$schema` de `biome.json`, así que la deriva vuelve a ser detectable. La
combinación exacta es la de la Remarca 1: `@biomejs/biome@2.5.4` fijado como
dependencia, schema `2.5.4`, y subir ambos en el mismo PR o ninguno.

### 2.7 CI

| Job | Qué hace hoy |
|---|---|
| `guardas` | Instala, verifica que `.env` no esté en el repo, gitleaks, Biome, tipos, valida el Compose, `doc-index`, `harness:check`, `diagramas:check`, `docs-linkcheck`, `docs-briefcheck`, `docs-tracecheck`, pruebas web y unitarias de la API |
| `diagramas` | Re-exporta los SVG del ER y falla si el `.drawio` cambió y el texto/SVG no (digest de la imagen) |
| `smoke` | Arranca la API contra Postgres y Redis de servicio, prueba la cola y corre `db:test`, `db:spec` y la suite de endpoint `test:e2e` |

Las pruebas de la API corren en dos capas: unitarias y de endpoint sin red en
`guardas` (`bun --filter @docu/api test`), y la suite de endpoint contra base
real en `smoke` (`bun run test:e2e`). La puerta TDD es #45.

---

## 3. Resumen de marcas de investigación

Ninguna de estas está aplicada. Todas son propuestas para PR con revisión.

| # | Remarca | Área | Estado |
|---|---|---|---|
| 1 | Declarar Biome como dependencia fijada y quitarlo del `bunx` del hook | Calidad | **Aplicada.** Ver Remarca 1 |
| 2 | Fijar la versión de las imágenes del Compose | Infraestructura | Pendiente |
| 3 | `maxmemory-policy noeviction` en Redis | Infraestructura | Pendiente |
| 4 | `uuidv7()` en el esquema | Datos | Pendiente |
| 5 | Pipe global de validación de entrada con Zod | Backend | Pendiente |
| 6 | `enableShutdownHooks()` | Backend | Pendiente |
| 7 | Migrar el health check a Terminus con liveness y readiness | Backend | Pendiente |
| 8 | `OnPush` en componentes de página | Frontend | Pendiente |
| 9 | `@defer` en bandeja y búsqueda | Frontend | Pendiente |
| 10 | Señales en entradas y salidas de componentes | Frontend | Pendiente |
| 11 | Instalar y evaluar las skills oficiales de Angular y Prisma | Agente | Pendiente |
| 12 | Probar el front y el lint de plantillas en CI | Calidad | **Parcial.** Las pruebas web y el índice documental ya corren en CI. El front completo, no |
| 13 | Fijar el modelo de embeddings y su dimensión | Datos | Pendiente |