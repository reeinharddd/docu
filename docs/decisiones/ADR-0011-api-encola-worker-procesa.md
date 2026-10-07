# ADR 0011 — La API encola, el worker procesa y la IA propone dentro del worker

Fecha: 2026-10-06 · Estado: Aceptada
Decide: Erik · Revisa: Emmanuel

## Contexto

La ingesta incluye OCR de escaneados, clasificación por familia, embeddings y
reportes. El OCR de una página tarda segundos y consume CPU; si corre dentro del
proceso HTTP, la API deja de responder mientras procesa (RNF-04 pide demo
fluida y lectura en segundo plano). ADR-0005 ya eligió BullMQ con Redis como
cola; falta fijar quién hace qué.

## Decisión

Dos procesos del mismo código NestJS, con fronteras estrictas:

1. **API** (`apps/api/src/main.ts`): recibe, valida la entrada, guarda
   `ArchivoOriginal` y **encola** `{ archivoId, sha256, familia }`. Nunca ejecuta
   OCR, clasificación ni llamadas a modelos.
2. **Worker** (`apps/api/src/worker.ts`): consume la cola y ejecuta la cadena
   de validación (ADR-0009), OCR, clasificación y embeddings.
3. **La IA vive dentro del worker** y solo devuelve JSON validado contra un
   esquema. El worker decide: cuarentena o pendiente de confirmación. El modelo
   nunca escribe en la base (ADR-0006).
4. Colas por tipo de trabajo: `ingesta`, `texto`, `reportes`, `alertas`.
   Conexiones Redis separadas para `Queue`, `Worker` y `QueueEvents`.
5. Fallo de un job: reintentos con backoff y, agotados, `Cuarentena` con motivo.
   Ningún error queda solo en un log.

## Alternativas consideradas

| Alternativa | Por qué no |
|---|---|
| Todo síncrono en la API | El OCR bloquea las peticiones; RNF-04 falla con el primer lote |
| Microservicio de OCR aparte (Python) | Otro lenguaje, otro despliegue y otro contrato para un equipo de 4 en un semestre; el monolito modular es la decisión vigente (RNF-05) |
| IA llamada desde la API para responder rápido | Mezcla latencia de modelo con HTTP y abre la puerta a que el modelo escriba sin pasar por la cadena |

## Consecuencias

- **A favor**: la API responde en milisegundos aunque haya un lote de 200
  archivos en proceso.
- **A favor**: el worker se escala o reinicia sin tocar la API.
- **En contra**: dos procesos que levantar y vigilar; `/health` hoy no detecta
  si el worker está vivo.
- **Riesgo residual**: el worker no existe todavía (`ingenieria/ARQUITECTURA.md`
  §6). Es el riesgo técnico mayor del proyecto y depende de #32 (evaluación OCR).

## Evidencia

- El smoke de E1 prueba BullMQ con un job `ping` (`scripts/smoke-api.sh`).
- Mapa de procesos y fronteras en `ingenieria/ARQUITECTURA.md`.
- Pendiente de verificar en #3 (pipeline) con un lote del dataset de #9.

## Qué nos haría revertirla

Que la evaluación de OCR (#32) concluya que la única herramienta que alcanza
RF-02 no corre en Node/Bun. Entonces el OCR, y solo el OCR, pasa a un proceso
aparte con ADR propia.
