<p align="center">
<strong>docu</strong><br>
<sub>Configuración 1 · Baja SterilPack · DOCU — Repositorio de Documentación Digital</sub><br>
<sub>Marca: <code>#5B2A86</code> · acento: <code>#B0215F</code> · texto: <code>#24172F</code></sub>
</p>

# Ingeniería: modelo de datos de C1 (ER v1)

Estado: vigente. Describe el modelo híbrido del ER v1 de #58 (25 tablas en 6
esquemas, PR #107) y explica **por qué** es así. Este documento es la lectura
conceptual del modelo; las autoridades del dato son, en orden:

1. `apps/api/prisma/schema.prisma` — el modelo Prisma.
2. `apps/api/prisma/migrations/0_baseline/migration.sql` — el DDL real.
3. [INVENTARIO-BD.md](INVENTARIO-BD.md) — el retrato completo de tablas,
   vistas, triggers, índices y pruebas.
4. [DIAGRAMA-BD-v0.md](DIAGRAMA-BD-v0.md) — el ER dibujado (draw.io, ADR-0017).

Aquí no se repiten sus tablas ni sus columnas: se citan.

## 1. Un modelo híbrido, no un modelo de entidades de negocio

El ER v1 no tiene tablas por entidad de negocio (no existen `Orden`, `Rollo`
ni `Programa` como tablas). Es **híbrido**
([ADR-0019](../decisiones/ADR-0019-dominio-hibrido-del-er.md)):

- **Lo que el caso anticipa y es estable** vive en tablas concretas: identidad
  y acceso (`core`), ingesta (`ingest`), reglas (`config`), verdad
  (`truth`), plataforma (`platform`).
- **Lo que el caso no anticipa** vive en un dominio genérico de grafo
  (`graph`): `entity_type`, `entity`, `relation`. Una familia nueva, un hecho
  de planta no previsto o una relación nueva se registran como **filas**,
  no como migración ([ADR-0009](../decisiones/ADR-0009-reglas-del-caso-como-datos.md)).

La consecuencia práctica: agregar una familia o una regla es un `INSERT`;
agregar un tipo de entidad es una fila en `graph.entity_type` con su
`schema_definition`; tocar el DDL solo queda para cambiar el sistema, no el
negocio.

## 2. Las tres clases de datos

Cada tabla guarda una clase de dato y eso decide qué garantías lleva:

| Clase | Qué significa | Tablas | Garantía |
|---|---|---|---|
| **Fija** | Catálogos del motor; no cambian con el uso | `core.facility` (raíz única, ADR-0014), `core.role`, `core.permission`, `config.family_config`, `config.validation_rule` | Vocabulario en `CHECK` (G2 del ER); cambiar un valor de `CHECK` es cambio global de revisión |
| **Dinámica** | Lo que la operación consume y produce | `ingest.source_file`, `ingest.parsed_record`, `ingest.quarantine`, `ingest.ocr_result`, `graph.entity_type`, `graph.entity`, `graph.relation`, `platform.session`, `platform.job_run`, `platform.memory_embedding` | Estados con `CHECK`, aislamiento por instalación, ciclo de vida definido |
| **Manual** | Lo que una persona (o el agente, registrado) agrega y no se reescribe | `truth.origin_history`, `truth.audit_log`, `platform.engram_ref`, `core.access_grant`, confirmaciones en `graph.entity` | **Solo-insert** por triggers (fila + `TRUNCATE`) en las 4 tablas blindadas; la confirmación es un `CHECK` completo |

Los orígenes (`ingest.source_file`) son dinámicos en vida pero **append-only**
en hecho: un archivo se registra una vez y para siempre
([ADR-0010](../decisiones/ADR-0010-bitacora-e-historial-solo-insert.md)).

## 3. El dominio híbrido: `graph.*`

- `entity_type` declara un tipo de entidad y **tipa su `data`** con
  `schema_definition` (JSON). `is_system` distingue lo que trae el sistema de
  lo que declara la instalación.
- `entity` es el hecho de negocio: `data` JSONB, `version`, `status` y la
  confirmación humana. Estados fijados por el DDL:
  `draft`, `pending_confirmation`, `official`, `rejected`, `superseded`.
- `relation` es la arista dirigida entre entidades, con `relation_type`.

**La confirmación es un estado completo**, garantizado por tres `CHECK` del
DDL: `official` exige `confirmed_by_id` **y** `confirmed_at`; responsable sin
fecha (o viceversa) se rechaza; y ningún borrador lleva confirmación prematura
([ADR-0006](../decisiones/ADR-0006-ia-propone-humano-dispone.md): la IA
propone, el humano dispone).

Las reglas de disposición (quién escribe `origin_history`, qué pasa al
rechazar, cómo se corrige un oficial) están fijadas en
[ARQUITECTURA.md §4](ARQUITECTURA.md) y no se duplican aquí.

## 4. Ingesta: del archivo al registro

| Tabla | Qué guarda | Vocabulario |
|---|---|---|
| `source_file` | El original: `sha256` único por instalación, `storage_path`, familia declarada | Sin columna de estado: nunca se modifica |
| `parsed_record` | Lo extraído: `payload` JSONB, `record_index` | `parsed`, `validated`, `quarantined`, `accepted` |
| `quarantine` | Lo detenido: regla visible (`rule_code`), severidad y motivo | `pending`, `resolved`, `dismissed`; severidad `BLOQUEO`/`AVISO` |
| `ocr_result` | OCR por página con métricas | Una fila por `(source_file, page_number)` |

La deduplicación es de base: subir dos veces el mismo archivo no crea dos
filas (`UNIQUE (facility_id, sha256)`), y la idempotencia de la API se apoya
en eso ([ARQUITECTURA.md §3.2](ARQUITECTURA.md)).

## 5. Verdad y auditoría

- `origin_history`: una fila por **versión publicada**, con `data_snapshot`
  del valor publicado, la regla que la validó, el cálculo y el responsable.
  Solo-insert: una corrección es una fila nueva, nunca una edición.
- `audit_log`: bitácora de acciones con actor, objetivo y momento. Solo-insert.
- Dos vistas como contrato de salida: `official_record` (todo lo confirmado,
  con su responsable) y `entity_lineage` (el encadenamiento completo por
  versión, incluido el snapshot). Nada escribe contra las vistas.
- Ocho triggers garantizan el solo-insert: función `core.reject_mutation()` +
  trigger por fila y trigger `BEFORE TRUNCATE` sobre las 4 tablas blindadas
  (`source_file`, `origin_history`, `audit_log`, `engram_ref`).

## 6. Configuración como datos

- `family_config`: la familia documental declarada (`parser_key`,
  `is_ocr_required`, `schema_definition` que tipa el `payload`). Las 6
  familias del caso son filas; una familia nueva es un `INSERT`.
- `validation_rule`: la regla declarativa (`applies_to` por familia, `expression`
  JSON evaluable sin ejecución arbitraria, mensaje, severidad `BLOQUEO`/`AVISO`).

## 7. Plataforma

- `session`: token opaco hasheado (SHA-256), `issued_at`, `expires_at` (el
  `CHECK` obliga a que expire después de emitirse), `revoked_at`
  ([ADR-0021](../decisiones/ADR-0021-token-opaco-con-revocacion-inmediata.md)).
- `job_run`: rastro persistente de cada corrida de cola; colas fijas
  `ingest`, `text`, `reports`, `alerts` (el `CHECK` las fija) con estado
  `queued`, `running`, `done`, `failed`
  ([ADR-0011](../decisiones/ADR-0011-api-encola-worker-procesa.md)).
- `memory_embedding`: `vector(768)` opcional por entidad o por archivo.
- `engram_ref`: referencia append-only a memoria del agente; nunca contenido
  de negocio.

## 8. Aislamiento por instalación

La instalación es el límite duro
([ADR-0014](../decisiones/ADR-0014-instalacion-single-company.md)) y lo
sostiene la base, no el código: toda FK entre dos tablas con instalación es
**compuesta** — `UNIQUE (facility_id, id)` en el padre y
`FOREIGN KEY (facility_id, otro_id) REFERENCES padre(facility_id, id)` — así
que cruzar instalaciones revienta con `foreign_key_violation` aunque el
código se equivoque. Las FK simples que quedan apuntan a catálogos globales
(`facility`, `role`, `permission`) o a columnas de atribución
(`created_by_id`, `confirmed_by_id`, `actor_id`): registran quién hizo algo,
no dan acceso a datos. Probado con 14 cruces en `apps/api/prisma/tests/isolation.sql`.

## 9. Vectores

`platform.memory_embedding.embedding` es `vector(768)` opcional, declarado en
Prisma como `Unsupported("vector(768)")` (el vector lo escribe el worker, no
el cliente, ADR-0004). Índice HNSW con distancia coseno. **768 es contrato de
[IA.md](IA.md) §6** y se fija antes de producción: cambiarlo exige migrar los
vectores existentes. La búsqueda semántica es *Should* (MoSCoW): el índice ya
está, "listo para cuando se encienda". La elección del motor es de #85 con el
ADR-0020 (motores como configuración, aún reservado).

## 10. Cómo se verifica

`bun run db:test` aplica la migración a una base scratch y corre las pruebas
SQL: contrato estructural (25 tablas, 2 vistas, 20 `CHECK`, 8 triggers),
solo-insert (UPDATE/DELETE/TRUNCATE rechazados), familia nueva como dato,
confirmación completa y aislamiento por instalación. Verde al 2026-11-07;
detalle en [INVENTARIO-BD.md §8](INVENTARIO-BD.md).

## 11. Qué falta y quién lo debe

| Vacío | Responsable |
|---|---|
| Semillas de `config` (familias y reglas) y del caso C1 | #59 (Emmanuel), sobre el dataset de #61 |
| Backend sobre este contrato | #12, #3, #46, #5 (Emmanuel) |
| Motores de IA configurables y medidos (ADR-0020) | #85 (Erik) |
| Dataset del mes | #61 (WearyBerry) |
| Separación de cuentas de BD y revocación de `TRUNCATE` al usuario de aplicación | Backend, fuera de #58 |
