# ADR 0004 — Prisma 7 con driver adapter sobre PostgreSQL 18 y pgvector

Fecha: 2026-10-05 · Estado: Aceptada · Decide: Emmanuel + Erik · Revisa: Erik

## Contexto

El modelo canónico de DOCU es relacional con dos requisitos que estiran un
ORM generalista:

1. **JSONB** para el payload variable de cada familia (`datos`, `esquema`,
   `expresion` de regla, `detalle` de bitácora). Un modelo por entidad obligaría
   a crear una tabla por formato y contradice RF-08.
2. **pgvector** para el embedding de 768 dimensiones en `DatoOficial`, que hoy
   es `Should` en el recorte MoSCoW.

Además, el proyecto exige ESM de punta a punta (`"type": "module"` y
`moduleResolution: nodenext`), y Prisma 7 exige que la conexión viva fuera del
schema. El error de esto en un entorno nuevo es que `prisma generate` y
`prisma migrate` se ejecutan en el directorio equivocado con la variable
`DATABASE_URL` sin cargar.

## Decisión

- **Prisma 7.10.0** como ORM, con **`@prisma/adapter-pg` + `pg`** como driver
  adapter nativo. No se usa el motor binario clásico.
- **PostgreSQL 18** con extensión **pgvector** (`pgvector/pgvector:pg18`) como
  única base de datos del proyecto.
- La conexión se configura en `apps/api/prisma.config.ts` con
  `defineConfig({ datasource: { url: env('DATABASE_URL') } })` y carga
  `.env` de la raíz del monorepo con `dotenv`, de modo que cualquier comando
  `prisma` funcione desde cualquier carpeta sin exportar variables a mano.
- El `datasource` del schema **no** lleva `url`; lleva solo `provider`. La URL
  vive en `prisma.config.ts`. Esto es lo que exige Prisma 7 y evita tener la
  credencial en dos lugares.
- `generator client` usa `provider = "prisma-client-js"`.
- La columna de embedding se declara `embedding Unsupported("vector(768)")?`
  porque Prisma no tiene tipo nativo para vectores; Prisma no la escribe ni la
  lee, se accede por SQL.
- El esquema se crea y se aplica con migraciones versionadas: la migración
  inicial es `apps/api/prisma/migrations/0_baseline/migration.sql` e incluye
  `CREATE EXTENSION IF NOT EXISTS vector`.

## Alternativas consideradas

| Alternativa | Por qué no |
|---|---|
| TypeORM o Kysely | TypeORM no modela bien pgvector y con ESM hay fricción. Kysely es más cercano a SQL pero obliga a escribir a mano el mapeo que Prisma ya da, sin ganar nada en el alcance del MVP |
| MongoDB | El modelo de DOCU es relacional con integridad fuerte (bitácora, historial, foreign keys RESTRICT). Relajar esas reglas contradice RNF-02 y RNF-05 |
| Motor clásico de Prisma | No es el camino soportado en Prisma 7 con ESM; se elimina la fuente de "no funciona en Bun" |

## Consecuencias

- **A favor**: una sola base relacional con JSONB cubre las familias variables
  sin multiplicar el número de tablas; pgvector disponible para el embedding;
  el cliente se genera con tipos y el TS estricto lo aprovecha.
- **A favor**: la URL de la base vive en un solo archivo, `prisma.config.ts`, y
  las migraciones se ejecutan desde la CI con un solo `DATABASE_URL`.
- **En contra**: pgvector es una dependencia del servidor: si el Postgres no
  tiene la extensión instalada, la migración inicial falla. El `doctor` verifica
  que la extensión esté activa antes de dar el entorno por listo.
- **En contra**: `Unsupported("vector(768)")` implica que el campo no aparece en
  el cliente tipado. Cualquier lectura del embedding se hace con `$queryRaw`.
  Es aceptable: el embedding es dato, no regla de negocio.
- **En contra**: el contenedor oficial `pgvector/pgvector:pg18` es una imagen
  fija; cuando pgvector publique una versión estable para Postgres 18 se debe
  evaluar subir, y eso sería un ADR nuevo.

## Evidencia

- `apps/api/prisma.config.ts` con `defineConfig` y `env('DATABASE_URL')`.
- `apps/api/src/prisma.service.ts` instancia `PrismaPg` y extiende
  `PrismaClient`.
- `apps/api/prisma/schema.prisma`: `datasource db { provider = "postgresql" }`
  sin `url`, y `embedding Unsupported("vector(768)")?`.
- `apps/api/prisma/migrations/0_baseline/migration.sql` con
  `CREATE EXTENSION IF NOT EXISTS vector`.
- CI: `prisma generate`, `prisma validate`, `prisma migrate deploy` y `seed`
  sobre el servicio `pgvector/pgvector:pg18`.

## Qué nos haría revertirla

Perder el soporte de `pgvector` en Postgres 18, o que `prisma-client-js` no
generara tipos utilizables bajo Bun en una actualización mayor. Revertir
significaría o bien migrar la columna de embedding a una tabla propia, o bien
volver al SQL crudo para el modelo canónico.