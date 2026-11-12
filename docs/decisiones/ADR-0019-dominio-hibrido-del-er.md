<p align="center">
<strong>docu</strong><br>
<sub>Configuración 1 · Baja SterilPack · DOCU — Repositorio de Documentación Digital</sub><br>
<sub>Marca: <code>#5B2A86</code> · acento: <code>#B0215F</code> · texto: <code>#24172F</code></sub>
</p>

# ADR 0019 — El dominio de negocio es híbrido: `graph.*` genérico con aislamiento por instalación garantizado por la base

Fecha: 2026-11-07 · Estado: Aceptada (PR #107 fusionada a main)
Decide: Erik · Revisa: Emmanuel

## Contexto

El ER v1 (#58) tenía que responder una pregunta que "rompe el modelo para
siempre": ¿cómo se guarda un dato de negocio cuya forma la declara cada
instalación? El caso C1 tiene 6 familias documentales y un vocabulario de
entidades de planta (lotes, turnos, programas) que la instalación declara
como datos (`docs/ingenieria/MODELO-DATOS.md` es contexto histórico v0; el
vocabulario canónico vive en `docs/proyecto/CASO.md`).

Las restricciones reales:

- Crear una tabla por familia o por tipo de entidad multiplicaría el esquema
  por cada cliente y cada familia nueva exigiría migración (ADR-0009 dice lo
  contrario: las reglas y familias son datos).
- Un JSONB puro sin tablas de dominio no puede sostener FK, unique ni CHECK:
  la integridad dependería 100 % del código (la auditoría del 2026-11-07
  marcó esa dependencia como crítica).
- El aislamiento por instalación (RF-06, ADR-0014) era responsabilidad solo
  del código: las FK simples (`entity_type_id → entity_type(id)`) validaban
  existencia, no pertenencia a la misma instalación.
- `truth.origin_history` no conservaba el valor publicado de cada versión:
  el linaje decía de dónde salió el dato, pero no permitía reconstruir qué
  valor se publicó y cuándo.
- `bun run db:test` ya fijaba contrato estructural, pero no probaba el
  aislamiento ni la reconstrucción histórica.

## Decisión

**El dominio de negocio es híbrido y el aislamiento por instalación lo
garantiza PostgreSQL, no el código.**

1. **`graph` genérico para lo declarado**: `entity_type`, `entity` (con
   `data` JSONB y `status`) y `relation` guardan cualquier tipo de entidad
   que la instalación declare como datos. Ninguna tabla del esquema menciona
   vocabulario de un cliente.
2. **Tablas especializadas para lo estable**: identidad y acceso (`core`),
   ingesta (`ingest`), verdad y auditoría (`truth`), configuración y reglas
   (`config`), plataforma (`platform`) siguen concretas: su forma no cambia
   por cliente.
3. **FK compuestas por instalación**: toda FK entre dos tablas que tienen
   instalación apunta a `(facility_id, id)` con `UNIQUE (facility_id, id)`
   en el padre y `ON DELETE RESTRICT`. Con `MATCH SIMPLE`, un par con un
   NULL no se aplica (los opcionales siguen permitidos); un par completo
   exige misma instalación. Cruzar instalaciones revienta con
   `foreign_key_violation` aunque el código se equivoque.
4. **Snapshot histórico**: `origin_history.data_snapshot` (JSONB, NOT NULL)
   guarda el valor confirmado de cada versión. El linaje
   (`truth.entity_lineage`) lo expone: se reconstruye qué se publicó y
   cuándo, no solo de dónde salió.
5. **Confirmación humana como invariante completa** (ADR-0006): CHECK
   `official ⇔ confirmed_by_id AND confirmed_at`, y un borrador no lleva
   confirmación prematura.
6. **Atribución con FK simple**: las referencias de "quién lo hizo"
   (`created_by_id`, `updated_by_id`, `confirmed_by_id`, `actor_id`,
   `received_by_id`, `resolved_by_id`, `granted_by_id`, `delegated_from_id`
   en `user_role`) apuntan a `app_user(id)` sin compuesta: registran un
   hecho, no dan acceso a datos. Quedan como limitación aceptada.
7. **`user_role` sin instalación**: los roles son vocabulario fijo del motor
   (global); la instalación llega a través del usuario. Limitación aceptada,
   revisable si RBAC necesita alcance por instalación.

## Alternativas consideradas

| Alternativa | Por qué no |
|---|---|
| Tabla por familia documental (6+ tablas) | Cada familia nueva es migración + código, contradice ADR-0009 y no escala a más instalaciones; reportes cruzados se vuelven UNION enormes |
| JSONB puro sin tablas de dominio | Sin FK/unique/CHECK la integridad depende solo del código; la auditoría 2026-11-07 la marcó como brecha crítica |
| Tabla por tipo de entidad (una tabla `lote`, `turno`, ...) | Misma explosión que tablas por familia, con esquemas casi idénticos entre sí; el `schema_definition` de `entity_type` ya tipa el JSONB |
| FK simple + filtros en NestJS | El aislamiento queda a merced de un `WHERE` olvidado; la base tiene que poder defenderse sola (principio de ADR-0010) |

## Consecuencias

- **A favor**: familias y tipos nuevos son filas, no migraciones; el
  aislamiento RF-06 lo garantiza la base; cada versión publicada es
  reconstruible; la confirmación humana es verificable con SQL, no con
  revision de código.
- **En contra**: las consultas sobre `entity.data` son JSONB sin tipos
  estáticos de Prisma; la validación del `data` contra
  `entity_type.schema_definition` vive en app/worker, no en la base; los
  índices sobre campos internos del JSONB se crean caso por caso cuando una
  consulta lo pida; `relation` pierde `ON DELETE SET NULL` a cambio de
  `RESTRICT` (un padre referenciado no se borra duro: el ciclo de vida lo
  maneja el `status`).
- **Riesgo residual**: que una familia necesite columnas propias indexadas
  (búsquedas pesadas, ML) y el JSONB se vuelva un cuello de botella. Blast
  radius: consultas lentas en esa familia, no corrupción de datos.

## Evidencia

`bun run db:test` en verde (2026-11-07) sobre la migración baseline:

- `tests/isolation.sql`: 14 cruces entre instalaciones rechazadas con
  `foreign_key_violation` (app_user→department, user_domain→domain,
  access_grant→usuario/entidad, session→usuario, entity→entity_type,
  relation→entidades, origin_history→archivo, parsed_record→archivo,
  quarantine→archivo, ocr_result→archivo, memory_embedding→entidad,
  engram_ref→entidad, source_file→familia).
- Snapshot: la versión 1 conserva `L-1` después de publicar la versión 2 con
  `L-1-v2`; `entity_lineage` expone ambos.
- Confirmación: oficial con responsable pero sin fecha y borrador con
  confirmación prematura, ambos rechazados por CHECK.
- Contrato estructural: 25 tablas, 2 vistas, 22 CHECK, 8 triggers
  solo-insert (4 fila + 4 TRUNCATE), extensión `vector`, índice HNSW.

## Qué nos haría revertirla

Si una familia concreta necesita columnas propias indexadas para funcionar
(búsquedas por campo interno con volumen real, o un requisito de reporte que
el JSONB no sostiene), se crea la tabla especializada **para esa entidad** y
esta decisión se marca `Reemplazada por` el ADR que la defina. El disparador
no es "el JSONB es incómodo": es "el JSONB no sostiene una consulta requerida
con el volumen real de la instalación".
