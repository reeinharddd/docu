# ADR 0005 — BullMQ y Redis para el trabajo asíncrono

Fecha: 2026-10-05 · Estado: Aceptada · Decide: Erik + Emmanuel · Revisa: Erik

## Contexto

El flujo de ingesta de DOCU tiene trabajo lento y costoso: lectura de texto de
escaneados con OCR, clasificación inicial de familias y, en el futuro,
cálculo de reportes recurrentes con alertas (RF-05). El caso exige que:

1. La subida del archivo responda rápido, sin esperar al OCR.
2. El trabajo sobreviva al reinicio del proceso, sin perder el archivo
   pendiente.
3. Haya un solo contrato de reintento y de error, para poder explicar por qué
   un archivo terminó en cuarentena (RF-02).
4. Las alertas no bloqueen la lectura de datos (RNF-04).

BullMQ no se había ejercido en el proyecto y había que confirmar que corre
efectivamente sobre Bun, que era el riesgo abierto tras decidir el runtime en
[ADR-0002](ADR-0002-bun-como-runtime-y-gestor.md).

## Decisión

**BullMQ 6** sobre **Redis 8** es el mecanismo de cola y de trabajo asíncrono.
El worker de OCR vive en proceso aparte, no dentro del proceso HTTP.

Consecuencias de diseño:

- La API encola; el worker procesa. La API nunca ejecuta OCR.
- Cada job lleva el identificador del archivo original (`sha256`) y el
  `id` del registro, de modo que el resultado sea trazable en `HistorialOrigen`.
- El pipeline de validación en cadena (tipo → esquema → reglas declarativas)
  corre dentro del job; una regla en estado `BLOQUEO` detiene la cadena y deja
  el motivo en `Cuarentena`.
- Redis se usa también como cache de consultas de búsqueda repetidas, con TTL
  explícito para que un dato oficial nuevo invalide lo cacheado.
- El arranque local levanta Redis por Docker Compose con healthcheck
  `redis-cli ping`.

## Evidencia previa obligatoria

La decisión no se toma sin prueba. Antes de aceptarla se ejecutó
`apps/api/scripts/queue-ping.ts`, que levanta `Queue`, `Worker` y `QueueEvents`
sobre Redis, encola un job `ping`, lo espera con `waitUntilFinished` y cierra
todo. Salida real en la CI:

```
queue-ping OK: {"pong":"hola-cola"}
```

Además `GET /health` reporta `redis: up` después de hacer `PING` real, no solo
de leer una variable de entorno.

## Alternativas consideradas

| Alternativa | Por qué no |
|---|---|
| Hacer el OCR dentro de la API | Bloquea la petición HTTP, no sobrevive reinicios y no escala; contradice RNF-04 |
| BullMQ sobre el Redis de la aplicación de Nest sin adaptador | Se añadió `ioredis` 6 con import nombrado porque BullMQ requiere conexiones separadas para `Queue`, `Worker` y `QueueEvents`, y el cliente nativo de Bun no cumple el contrato en la versión fijada |
| Temporal, o un orquestador de workflows | Excessivo para el MVP: añade un servicio y operación que cuatro personas no van a sostener en un cuatrimestre |

## Consecuencias

- **A favor**: reintentos, seguimiento de jobs, y `QueueEvents` dan la
  trazabilidad que RNF-02 exige sobre por qué un archivo no llegó a oficial.
- **A favor**: el smoke de `queue-ping` es una prueba de humo real en cada push
  que evita que se rompa en silencio.
- **En contra**: Redis es un punto único de fallo local. Si Redis está caído, la
  ingesta se detiene; `/health` lo reporta, y el `doctor` falla el entorno.
- **En contra**: Redis en desarrollo no pide autenticación y solo escucha en
  localhost. La política de los tres entornos (local, demo en red, producción) se
  documenta en `operacion/ENTORNOS.md`; no se mete complejidad de producción en
  este cuatrimestre.
- **En contra**: Redis es solo un almacén de claves en memoria con
  `maxmemory-policy` por defecto. Las colas BullMQ necesitan `noeviction`; si
  alguien configura Redis para cache genérico y cambia la política, la cola se
  rompe. Queda como verificación del `doctor`.

## Qué nos haría revertirla

Que BullMQ deje de soportar el cliente de Redis elegido en una versión mayor, o
que los reintentos y el seguimiento de jobs resulten más pesados que el problema:
si la única cola fuera "extraer texto de un PDF", una tabla de trabajos en
Postgres sería más simple. Para el alcance actual (OCR, clasificación, reportes
recurrentes, alertas) la cola es el menor de los problemas.