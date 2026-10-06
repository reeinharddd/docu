# Ingeniería: colas y trabajo pesado

Estado: vigente. Decisión: `docs/decisiones/ADR-0005-bullmq-para-trabajo-pesado.md`.

## Principio

Ninguna operación pesada ocurre en el hilo de la petición. Ingesta, OCR,
validación por lotes y reintentos van a una cola. La respuesta HTTP es
inmediata o es un error.

## Piezas instaladas

| Pieza | Versión | Estado |
|---|---|---|
| `bullmq` | `6.3.11` exacta, igual a la última publicada | Declarado |
| `ioredis` | `6.0.0` exacta, igual a la última publicada | Declarado |
| Redis 8 | Imagen `redis:8` | En Compose, vivo |

## Estado actual: cola declarada, worker inexistente

No hayBullMQ en el código. Hoy Redis se usa en un solo lugar: el `PING` de
`/health`. `infra/docker-compose.yml` tiene comentados los servicios `api` y
`worker`, que llegan en M1 y E2.

Por eso `apps/api/scripts/queue-ping.ts` existe y CI lo ejecuta: verifica que
Redis acepta el patrón de cola antes de que haya un worker que dependa de él.

## Trabajo pesado previsto (E2)

| Trabajo | Notas |
|---|---|
| OCR por lotes | El mas caro. Exige `originales/` intacto y `RECIBIDO → VALIDADO` |
| Validación por familia | Reglas declarativas de `ReglaValidacion`, `BLOQUEO` frena |
| Reintentos | Un fallo no puede frenar las pantallas |

`docs/decisiones/ADR-0005` fija BullMQ. Redis está en su lugar y en su versión,
así que la decisión no necesita revisiting.

## Riesgo conocido

El `worker` comparte imagen con la `api`. Eso significa que un trabajo pesado
puede agotar la memoria de la instancia que también sirve el tráfico. Cuando se
escriba, los límites de memoria y de concurrencia del worker se fijan de
explicitado, no se heredan del proceso de la API.
