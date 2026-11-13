# Ingeniería: colas y trabajo pesado

Estado: vigente. Decisión: `docs/decisiones/ADR-0005-bullmq-para-trabajo-pesado.md`.

## Principio

Ninguna operación pesada ocurre en el hilo de la petición. Ingesta, OCR,
validación por lotes y reintentos van a una cola. La respuesta HTTP es
inmediata o es un error.

## Piezas instaladas

| Pieza | Versión | Estado |
|---|---|---|
| `bullmq` | `6.3.11` exacta fijada en `bun.lock` | Declarado |
| `ioredis` | `6.0.0` exacta fijada en `bun.lock` | Declarado |
| Redis 8 | Imagen `redis:8` | En Compose, vivo |

## Estado actual: la cola `ingest` existe y tiene worker

La API encola de verdad: al registrar un archivo escribe la fila de
`platform.job_run` (cola `ingest`, `job_id` = el id del archivo) y encola el
job en Redis con **ese mismo id**, para que una corrida tenga una fila y el
worker pueda reencolar lo que quedó a medias. BullMQ no admite `:` en el id
propio del job, y la cola ya está en su propia columna.

El worker es un proceso aparte (`bun run worker`): consume `ingest`, extrae el
texto del original, propone la familia con su confianza y deja el veredicto
—propuesta a la bandeja o cuarentena con motivo— (ARQUITECTURA.md §4).

| Pieza | Dónde |
|---|---|
| Nombres de cola | `apps/api/src/queues/queues.ts` (uno solo, el ER fija el CHECK) |
| Límites | `apps/api/src/queues/settings.ts`: `INGEST_ATTEMPTS`, `INGEST_BACKOFF_MS`, `WORKER_CONCURRENCY`, `WORKER_LOCK_MS` |
| Conexión | `apps/api/src/queues/redis.ts` (`maxRetriesPerRequest: null`, que BullMQ exige) |
| Worker | `apps/api/src/worker/worker.ts` |

Redis se usa en la cola `ingest` y en el `PING` de `/health`. Las colas
`text`, `reports` y `alerts` siguen sin consumidor (#46 y #39).

La API abre la conexión a Redis **la primera vez que encola**, no al
arrancar: tiene que poder servir `/health` y las lecturas sin Redis.

## Las cuatro colas y su salud

El worker declara las cuatro colas de C1 (`apps/api/src/queues/registry.ts`),
cada una con su conexión a Redis: BullMQ bloquea la conexión del worker
mientras un job corre, y una conexión por cola evita que una cola lenta
atasque a las demás. Solo `ingest` tiene procesador en este proceso; las otras
tres quedan con su profundidad visible y sus procesadores llegan con sus
issues.

| Pieza | Dónde |
|---|---|
| Las cuatro colas | `apps/api/src/queues/registry.ts` |
| Límites | `apps/api/src/queues/settings.ts`: `INGEST_ATTEMPTS`, `INGEST_BACKOFF_MS`, `INGEST_BACKOFF_JITTER`, `WORKER_CONCURRENCY`, `WORKER_LOCK_MS`, `WORKER_HEARTBEAT_MS`, `WORKER_HEARTBEAT_TTL_MS` |
| Conexión | `apps/api/src/queues/redis.ts` (`maxRetriesPerRequest: null`, que BullMQ exige) |
| Latido | `apps/api/src/queues/heartbeat.ts` y `heartbeat-loop.ts` |
| Worker | `apps/api/src/worker/worker.ts` |

El worker publica su latido en Redis (con TTL) y la API lo lee en `/health`:
`worker.alive` y `worker.queues.<cola>` con la profundidad de cada cola. Si el
worker muere, la clave expira y la salud lo dice en vez de fingir que todo está
bien.

## Reintentos y cuarentena

El backoff es exponencial **con jitter** (`INGEST_BACKOFF_JITTER`, 0.2 por
defecto): sin dispersión, todos los jobs que fallan juntos vuelven a fallar
juntos. Cuando un job agota sus intentos, el archivo se detiene con motivo
visible en `ingest.quarantine` (`rule_code = SYS.JOB_FAILED`) y su
`parsed_record` queda en `quarantined`: un job fallido nunca se pierde en
silencio (BRIEF #46, RF-02).

## Las cuatro colas de C1

El ER v1 (#58) fija los nombres de cola en `platform.job_run.queue`, con un
`CHECK` que solo admite estos cuatro:

| Cola | Qué procesa | Issue |
|---|---|---|
| `ingest` | Parseo, OCR y validación de lo que entra | #3, #46 |
| `text` | Texto limpio y embeddings para la búsqueda | #46 |
| `reports` | Reportes recurrentes | #39 |
| `alerts` | Alertas por umbral | #39 |

El nombre de la cola es **dato**: lo escribe el que encola, no una constante
dispersa en el código.

## Trabajo pesado previsto

| Trabajo | Notas |
|---|---|
| OCR por lotes | El más caro. Exige `originales/` intacto y `parsed_record.status` de `parsed` a `validated` |
| Validación por familia | Reglas declarativas de `config.validation_rule`, `BLOQUEO` frena |
| Reintentos | Un fallo no puede frenar las pantallas; cada corrida queda en `platform.job_run` |

`docs/decisiones/ADR-0005` fija BullMQ. Redis está en su lugar y en su versión,
así que la decisión no necesita revisiting.

## Lo que el worker todavía no hace

- **La cadena de reglas**: el worker extrae y propone, pero no evalúa
  `config.validation_rule.expression` porque su formato lo fija #5 (ADR-0009)
  y la semilla lo trae como marcador (`{"seeded":"c1","version":1}`). Por eso
  `parsed_record.status` queda en `parsed`: `validated` y `accepted` son de la
  cadena de reglas.
- **La medición**: la precisión de clasificación (≥ 80 %) y el OCR (≥ 90 %) se
  miden sobre el dataset de #61/#86, que va en paralelo.

## Riesgo conocido

El `worker` comparte imagen con la `api`. Eso significa que un trabajo pesado
puede agotar la memoria de la instancia que también sirve el tráfico. Cuando se
escriba, los límites de memoria y de concurrencia del worker se fijan
explícitamente, no se heredan del proceso de la API.
