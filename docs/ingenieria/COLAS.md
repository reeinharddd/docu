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

## Estado actual: cola declarada, worker inexistente

BullMQ está en el código en un solo lugar: `apps/api/scripts/queue-ping.ts`, el
script de humo que CI ejecuta para verificar que Redis acepta el patrón de
cola antes de que haya un worker que dependa de él. En la API que corre no hay
ninguna cola: hoy Redis se usa solo en el `PING` de `/health`.
`infra/docker-compose.yml` tiene comentados los servicios `api` y `worker`.

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

## Riesgo conocido

El `worker` comparte imagen con la `api`. Eso significa que un trabajo pesado
puede agotar la memoria de la instancia que también sirve el tráfico. Cuando se
escriba, los límites de memoria y de concurrencia del worker se fijan
explícitamente, no se heredan del proceso de la API.
