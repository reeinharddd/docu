<p align="center">
<strong>docu</strong><br>
<sub>Configuración 1 · Baja SterilPack · DOCU — Repositorio de Documentación Digital</sub><br>
<sub>Marca: <code>#5B2A86</code> · acento: <code>#B0215F</code> · texto: <code>#24172F</code></sub>
</p>

# Ingeniería: revisión del ER v1 por segmentos

Estado: instrumento de revisión manual del ER v1 (issue #58, PR #107 sin
fusionar). **Decide: Erik · Revisa: Emmanuel.** La revisión es a pequeña
escala primero y en orden: segmento a segmento, tabla a tabla. Este documento
es el instrumento; el estado avanzado se refleja en §3 y en el issue #58.

Fuentes que se revisan en cada segmento: `apps/api/prisma/schema.prisma`,
`apps/api/prisma/migrations/0_baseline/migration.sql`,
`apps/api/prisma/tests/*.sql`, `docs/ingenieria/DIAGRAMA-BD-v0.md` y
`docs/ingenieria/INVENTARIO-BD.md`.

## 0. Protocolo

1. **Orden estricto S0→S7.** Un segmento no inicia hasta que el anterior
   quede `Aprobado` (o con sus cambios locales ya aplicados y verificados).
2. **Unidad de revisión: tabla a tabla.** Cada tabla sale con un veredicto
   en el registro del segmento (§4).
3. Veredictos posibles por tabla:
   - **Aprobada** — no cambia nada.
   - **Cambio local** — ajusta la propia tabla (campos, índices, FK, CHECK
     propio): se propone, Erik dispone, se aplica en la misma rama, corre
     `db:test` + `verify` en verde y queda aprobada.
   - **Cambio global** — toca una estructura de §1: se registra con la
     etiqueta `GLOBAL`, **detiene la aprobación del segmento** hasta
     resolverse, y los segmentos ya aprobados que la heredan pasan a
     `Revisar de nuevo (parcial)`.
4. Agregar o eliminar tablas es **cambio global por definición**: altera el
   contrato estructural (25 tablas, 22 CHECK, 8 triggers), la matriz de
   clases del diagrama y las pruebas. Su commit es propio y actualiza todo
   lo anterior en el mismo cambio.
5. Si el cambio global implica una decisión de arquitectura (no solo
   estructura), se resuelve con enmienda o ADR nuevo — ADR-0019 es el
   candidato natural.
6. Un segmento queda `Aprobado` solo con: todas sus tablas con veredicto,
   `bun run db:test` verde, `bun run verify` verde y registro llenado.
7. El detalle de la conversación de revisión vive donde el equipo decida
   (PR #107 o issue #58); este documento guarda solo el veredicto y la
   decisión, no la discusión.

## 1. Estructuras globales (lo que cualquier segmento puede hacer cambiar)

| # | Estructura | Dónde vive | La heredan |
|---|---|---|---|
| G1 | Política de FK compuestas `(facility_id, id)` + `RESTRICT` | ADR-0019, `migration.sql` | Todos los esquemas |
| G2 | Vocabulario fijo del motor en CHECK (estados, severidades, colas, scopes, roles, permisos) | `migration.sql` | ingest, graph, config, platform |
| G3 | Conjunto append-only + 8 triggers (fila + TRUNCATE) | `migration.sql`, `schema-test.ts` | ingest, truth, platform |
| G4 | Modelo híbrido `graph.*` | ADR-0019, `schema.prisma` | graph y quien referencie `entity` |
| G5 | Contrato de vistas `official_record` / `entity_lineage` | `migration.sql` | S6, backend (#60) |
| G6 | Contrato `vector(768)` + HNSW coseno | `IA.md`, `migration.sql` | S7, pipeline IA (#85) |
| G7 | Aislamiento por instalación (RF-06) | S0, `tests/isolation.sql` | Todos |
| G8 | Confirmación humana (CHECKs de `confirmed_by_id`/`confirmed_at`) | S0/S5 | graph, backend |
| G9 | Contrato estructural (25 tablas, 22 CHECK, 8 triggers) | `schema-test.ts` | Todos |

## 2. ¿Los 6 esquemas alcanzan como segmentos?

Como **fronteras de almacenamiento**, sí: los 6 esquemas son cohesivos y no
hace falta crear más (truth y config son pequeños pero cada uno tiene una
responsabilidad única; partirlos sería ruido).

Como **sesiones de revisión**, no: `core` tiene 10 tablas (demasiado para
una sola pasada) y el orden de dependencias pide revisar `config` antes que
`ingest` (la ingesta depende de las familias). Por eso la revisión usa
**8 segmentos**: core se divide en identidad y autorización, y el orden
sigue las dependencias reales del modelo.

## 3. Segmentos y orden

| # | Segmento | Contenido | Esquema | Depende de | Estado |
|---|---|---|---|---|---|
| S0 | Invariantes transversales | G1–G9: FK compuestas, aislamiento, solo-insert, confirmación, snapshots, vocabulario | transversal | — | Pendiente |
| S1 | Identidad y organización | `facility`, `department`, `app_user` | core | S0 | Pendiente |
| S2 | Autorización | `role`, `user_role`, `permission`, `role_permission`, `domain`, `user_domain`, `access_grant` | core | S1 | Pendiente |
| S3 | Configuración y reglas | `family_config`, `validation_rule` | config | S1 | Pendiente |
| S4 | Ingesta | `source_file`, `parsed_record`, `quarantine`, `ocr_result` | ingest | S1, S3 | Pendiente |
| S5 | Dominio híbrido | `entity_type`, `entity`, `relation` + ADR-0019 | graph | S1, S4 | Pendiente |
| S6 | Verdad y auditoría | `origin_history`, `audit_log`, 2 vistas, 8 triggers | truth | S4, S5 | Pendiente |
| S7 | Plataforma y vectores | `session`, `job_run`, `memory_embedding`, `engram_ref` + externos (Redis, IA, filesystem, Engram) | platform | S1, S5, S6 | Pendiente |

Invitados sugeridos por segmento (además de Erik + Emmanuel): Kira en S7
(sesiones las consume el front), Carlos en S3 y S4 (el dataset genera
familias y archivos).

## 4. Fichas de revisión por segmento

### S0 — Invariantes transversales

No hay tablas: se revisan las reglas que todos heredan.

| Invariante | Preguntas de revisión |
|---|---|
| G1 FK compuestas | ¿Toda FK entre tablas con instalación es compuesta? ¿Las de atribución (`created_by_id`, `confirmed_by_id`, `actor_id`...) como FK simple es aceptable? ¿`RESTRICT` en vez de `SET NULL` está bien en todos los casos? |
| G7 Aislamiento | ¿Las 14 cruces de `tests/isolation.sql` cubren todo lo que importa? ¿Falta alguna relación sin prueba? |
| G3 Solo-insert | ¿Las 4 tablas blindadas son las correctas? ¿`parsed_record` debería serlo también? ¿La guardia TRUNCATE basta o falta revocar `TRUNCATE` al usuario de aplicación (nota: separación de cuentas, fuera de #58)? |
| G8 Confirmación | ¿`official ⇔ responsable Y fecha` + sin confirmación prematura es la invariante completa? ¿Faltan CHECKs de transición de `status`? |
| Snapshot | ¿`data_snapshot` en toda versión es suficiente para reconstruir lo publicado? ¿La vista de linaje expone lo necesario? |
| G2 Vocabulario | ¿Todos los valores de CHECK son del motor y no de un cliente? ¿Falta o sobra algún valor? |

| Registro S0 | Veredicto | Notas |
|---|---|---|
| G1 | | |
| G7 | | |
| G3 | | |
| G8 | | |
| Snapshot | | |
| G2 | | |

### S1 — Identidad y organización (core)

| Tabla | Papel | Preguntas de revisión |
|---|---|---|
| `facility` | Raíz única por instalación (ADR-0014); jerarquía `CORP`→`C1` | ¿`code` único global basta? ¿`timezone` por defecto `America/Mexico_City` está bien? ¿`is_active` alcanza para el ciclo de vida o hace falta más? |
| `department` | Departamentos con jerarquía propia | ¿`UNIQUE (facility_id, code)` basta? ¿Un usuario sin departamento (admin corporativo) es el único caso de nulo? |
| `app_user` | Usuarios; internos y externos con vigencia | ¿`relation_type` `interno/externo` + `valid_until` obligatorio para externos cubre el caso de la hermana proveedora? ¿`password_hash` nulo para quien no inicia sesión está bien? ¿`reports_to_id` con FK simple (misma instalación por convención) se queda así o sube a compuesta? ¿`status` `activo/suspendido/baja` alcanza? |

| Registro S1 | Veredicto | Notas |
|---|---|---|
| `facility` | | |
| `department` | | |
| `app_user` | | |

### S2 — Autorización (core)

| Tabla | Papel | Preguntas de revisión |
|---|---|---|
| `role` | Catálogo fijo: `admin`, `manager`, `member`, `guest` | ¿Bastan 4 roles para C1? Cambiarlos es G2 (global). |
| `user_role` | Puente usuario-rol | ¿Sin `facility_id` (roles globales) sigue siendo correcto? ¿`granted_by` como FK simple basta? |
| `permission` | 12 permisos fijos del motor | ¿La lista cubre los 5 flujos del caso? ¿Falta/sobra alguno (G2)? |
| `role_permission` | Matriz rol-permiso | ¿La matriz semilla se define en seeds y no en la migración? |
| `domain` | Dominio de negocio por instalación | ¿`UNIQUE (facility_id, code)` basta? ¿Necesita jerarquía como department? |
| `user_domain` | Dominios por defecto del usuario | ¿La PK `(app_user_id, domain_id)` sin `facility_id` basta para unicidad, con las FK compuestas ya puestas? |
| `access_grant` | Concesión puntual: scope, denegación, emergencia, delegación, vigencia, objetivo | ¿Falta revocación antes de `valid_until`? ¿`is_emergency` exige más registro? ¿`granted_by` con `RESTRICT` está bien? ¿El "permiso efectivo" (rol + grants − denegaciones) tiene todo lo que el motor de #5 necesita? |

| Registro S2 | Veredicto | Notas |
|---|---|---|
| `role` | | |
| `user_role` | | |
| `permission` | | |
| `role_permission` | | |
| `domain` | | |
| `user_domain` | | |
| `access_grant` | | |

### S3 — Configuración y reglas (config)

| Tabla | Papel | Preguntas de revisión |
|---|---|---|
| `family_config` | Familia documental declarada como dato; `schema_definition` tipa el payload; `parser_key` elige parser | ¿Qué pasa si `parser_key` no tiene parser registrado (auditoría §3.4)? ¿`schema_definition` alcanza para tipar el JSONB del payload o necesita versión? ¿Las 6 familias del caso caben como filas? |
| `validation_rule` | Regla como dato: `applies_to` (JSON), `expression` (JSON), severidad `BLOQUEO`/`AVISO`, mensaje | ¿El lenguaje de expresiones está delimitado y sin ejecución arbitraria (auditoría §3.4)? ¿`applies_to` por familia es suficiente o hace falta aplicar por campo? ¿Una regla puede desactivarse sin borrarse (`is_active`)? |

| Registro S3 | Veredicto | Notas |
|---|---|---|
| `family_config` | | |
| `validation_rule` | | |

### S4 — Ingesta (ingest)

| Tabla | Papel | Preguntas de revisión |
|---|---|---|
| `source_file` | Original: sha256 por instalación, storage_path, receptor | ¿La verificación de hash al recuperar del filesystem (A-18, fuera de #58) deja la BD completa? ¿`mimeType` y `byte_size` participan en lógica o son solo registro? |
| `parsed_record` | Registro extraído con `payload` JSONB y `status` | ¿Debe ser append-only (G3)? ¿`status` `parsed/validated/quarantined/accepted` cubre el flujo? ¿`UNIQUE (source_file_id, record_index)` basta? |
| `quarantine` | Cuarentena con regla visible y motivo | ¿Enlazar la regla por `rule_code` (sin FK) es suficiente, o hace falta FK a `validation_rule`? ¿El cierre (`resolved_by/at/note`) exige transición CHECK? |
| `ocr_result` | OCR por página con métricas | ¿Una fila por página con `UNIQUE (source_file_id, page_number)` basta? ¿`text_content` como TEXT sin límite está bien? |

| Registro S4 | Veredicto | Notas |
|---|---|---|
| `source_file` | | |
| `parsed_record` | | |
| `quarantine` | | |
| `ocr_result` | | |

### S5 — Dominio híbrido (graph) — revisar con ADR-0019 delante

| Tabla | Papel | Preguntas de revisión |
|---|---|---|
| `entity_type` | Tipo de entidad declarado por la instalación; `schema_definition` tipa el `data` | ¿`schema_definition` necesita versión para evolucionar sin romper entidades vigentes? ¿`is_system` se usa en C1? |
| `entity` | La entidad: `data` JSONB, `version`, `status`, confirmación humana | ¿`status` `draft/pending_confirmation/official/rejected/superseded` cubre el flujo real del caso? ¿`superseded` enlaza a la versión que la reemplaza o solo queda histórica? ¿El `code` único por `(facility, type)` alcanza? |
| `relation` | Relación dirigida entre entidades, `relation_type` como texto | ¿`relation_type` necesita catálogo cargable por instalación (hoy es texto libre — posible `GLOBAL`)? ¿La unicidad `(source, target, type)` basta? |

| Registro S5 | Veredicto | Notas |
|---|---|---|
| `entity_type` | | |
| `entity` | | |
| `relation` | | |

### S6 — Verdad y auditoría (truth) + vistas + triggers

| Elemento | Papel | Preguntas de revisión |
|---|---|---|
| `origin_history` | Una fila por versión publicada, con `data_snapshot`, regla, cálculo y responsable | ¿Quién asigna el `version` secuencial (worker en transacción única)? ¿Una fila por versión basta o hace falta una por intento de confirmación? |
| `audit_log` | Bitácora de acciones con actor, IP, target | ¿`action` es texto libre o vocabulario del motor (G2)? ¿`actor` nulo solo para acciones del sistema? |
| Vista `official_record` | Contrato de salida del dato oficial | ¿Expone todo lo que el backend de #60 necesita (paginación ADR-0022)? |
| Vista `entity_lineage` | Reconstrucción histórica por versión | ¿El snapshot en la vista alcanza para el Reporte? ¿Falta exponer algo? |
| 8 triggers | Solo-insert (fila + TRUNCATE) | ¿Alguna tabla más merece blindaje? ¿La función de rechazo da el error correcto al código? |

| Registro S6 | Veredicto | Notas |
|---|---|---|
| `origin_history` | | |
| `audit_log` | | |
| `official_record` | | |
| `entity_lineage` | | |
| Triggers | | |

### S7 — Plataforma y vectores (platform) + externos

| Elemento | Papel | Preguntas de revisión |
|---|---|---|
| `session` | Token opaco hasheado (ADR-0021), expiración, revocación | ¿La política de limpieza de sesiones expiradas es de #60 y no del esquema? ¿`ip_address`/`user_agent` alcanzan para la bitácora de acceso? |
| `job_run` | Rastro persistente de cada corrida de cola | ¿Las 4 colas fijas (`ingest`, `text`, `reports`, `alerts`) cubren el pipeline? ¿Dead-letter en BD o solo en Redis (decisión de #46)? |
| `memory_embedding` | Vector 768 por chunk de entidad o archivo | ¿Cardinalidad: ninguno/uno/ambos entre `entity_id` y `source_file_id` (auditoría §3.4)? ¿Hace falta CHECK o unique parcial? ¿El `model` guarda versión del modelo? |
| `engram_ref` | Referencia append-only a memoria del agente | ¿Solo referencias, nunca contenido de negocio? ¿Qué pasa si Engram no está disponible (A-16, fuera de #58)? |
| Externos | filesystem `originales/`, Redis, Ollama, Engram | ¿El hash del original se verifica al recuperar (A-18)? ¿El aislamiento de red de Redis/PG es del perfil de despliegue (A-05, fuera de #58)? |

| Registro S7 | Veredicto | Notas |
|---|---|---|
| `session` | | |
| `job_run` | | |
| `memory_embedding` | | |
| `engram_ref` | | |
| Externos | | |

## 5. Cómo se registra un cambio global

1. En el registro del segmento, la fila lleva veredicto `Cambio global` y
   nota con la etiqueta `GLOBAL(G#)` indicando qué estructura toca.
2. Erik dispone: se acepta o se rechaza en la misma sesión.
3. Si se acepta: commit propio con `db:test` + `verify` verdes; si implica
   decisión de arquitectura, enmienda o ADR nuevo; los segmentos aprobados
   que heredan la estructura pasan a `Revisar de nuevo (parcial)` en §3.
4. El contrato estructural de `schema-test.ts` (tablas/CHECK/triggers) se
   actualiza en el mismo commit del cambio.

## 5.1 Auditoría profunda 2026-11-10 (velocidad, carga, peso, seguridad, replicabilidad)

Revisión a conciencia previa al cierre de #58, ejecutada contra base limpia
(migración + semilla C1) en el Postgres 18 del carril. Herramienta
repetible: `bun run db:bench [escala]` (`apps/api/scripts/db-bench.ts`).

**Velocidad y carga (escala ×5 del contrato §8: 850 archivos, 300 turnos,
300 embeddings, 300 versiones de historial).**

| Medición | Resultado |
|---|---|
| Migración baseline en base limpia | 1.8 s |
| Semilla C1 (9 personas, 6 familias, 7 reglas, 11 tipos, 5 máquinas) | 28 ms |
| Inserción de 850 archivos | 225.8 ms |
| 300 turnos + 300 versiones de lineage | 12.1 ms / 163.2 ms |
| 300 embeddings de 768 (MRL pedido) | 46.5 ms |
| Bandeja: página 3 de 20 + total (`X-Total-Count`) | 1.9 ms / 0.5 ms |
| Página de `official_record` confirmado | 0.1 ms |
| Lineage: historial y ¿de qué rollo salió esta orden? | 0.1 ms |
| KNN 5 sobre 300 vectores | 1.2 ms |

Índices observados en los planes: `entity_facility_id_status_idx`,
`origin_history_entity_id_version_key`,
`relation_target_entity_id_relation_type_idx`,
`entity_facility_id_entity_type_id_code_key`. A volumen pequeño el
planificador puede elegir seq scan (por ejemplo en KNN); la garantía de ruta
indexada la prueban las specs con `enable_seqscan = OFF`
(`prisma/tests/*.spec.ts`). La bandeja prefiere
`source_file_facility_id_id_key` + top-N sort: correcto y medido; el índice
compuesto `(facility_id, received_at)` queda para filtros por ventana.

**Peso (×5 del mes).** Base completa 14 MB; la tabla mayor,
`ingest.source_file`, 2.4 MB con sus índices. Un mes real de C1 ≈ 3 MB: no
hay riesgo de tamaño en el cuatrimestre.

**Replicabilidad.** Dos bases creadas de forma independiente (migración +
semilla) producen esquemas idénticos: `pg_dump --schema-only` de ambas
difiere solo en el token `\restrict` aleatorio que pg_dump 18 emite por
volcado, no en ninguna estructura. La semilla es idempotente (corrida doble
sin duplicados) y el corpus del mes es territorio de #59.

**Seguridad — estado y 3 hallazgos.**

1. **El rol de la aplicación es superusuario.** Las 25 tablas son propiedad
   de `docu`, superusuario del contenedor. Cualquier descuido en el carril de
   backend (#12) tiene potencia total. Pendiente para despliegue: rol
   `docu_app` sin superusuario para la cadena de conexión.
2. **RLS = 0.** El aislamiento por instalación es de escritura (FK
   compuestas, probado en `isolation.sql`) y de lectura depende del filtro
   `facility_id` del backend (ADR-0019). Endurecimiento posible: RLS por
   `current_setting('app.facility_id')` — exige rol no superusuario primero.
   Decisión de arquitectura: enmienda de ADR-0019 o ADR nuevo; no se hace en
   silencio en este PR.
3. **`ssl off` en Postgres.** Aceptable en el contenedor local (puertos no
   estándar, red del host); para despliegue en LAN de la planta (E2/C2) hay
   que activar TLS en `pg_hba`.

**Lo que la BD ya le regala a backend y frontend (#12, #3, #4).** Vistas de
salida (`official_record` con responsable, `entity_lineage` con fuente y
regla por versión), estados con CHECK (`draft → pending_confirmation →
official → rejected → superseded`), cuarentena con quién/cuándo/porqué,
`job_run` para BullMQ con unique `(queue, job_id)`, `session` para el token
opaco de ADR-0021, permisos/roles como catálogo fijo y reglas como datos.
El backend solo añade filtros `facility_id` + paginación `limit/offset`
(ADR-0022): los índices ya están.

**Pendiente consciente (fuera de este PR).** Búsqueda textual en español
(búsqueda híbrida además del vector): decidir `tsvector` + índice GIN en el
carril de búsqueda (#3/E); validación JSON de `entity.data` contra
`schema_definition` es del backend, no de la base (ADR-0009); guardas RLS y
rol no superusuario para despliegue.

## 6. Definición de Hecho de la revisión

- Los 8 segmentos en `Aprobado`, sin cambios globales pendientes.
- `bun run db:test` y `bun run verify` en verde en la rama.
- Diagrama (`DIAGRAMA-BD-v0.drawio` + texto derivado) e inventario al día
  con el modelo final revisado.
- ADR-0019 pasa a `Aceptada` en el merge del PR #107.
- El estado de §3 se refleja en el issue #58.
