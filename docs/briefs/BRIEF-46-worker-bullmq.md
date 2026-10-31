# BRIEF #46 — Worker BullMQ con colas por tipo de trabajo

## 0. Encabezado

- Issue: #46
- Dueño: Emmanuel Valenzuela Cruz (Backend).
- Fechas: 2026-11-13 → 2026-11-18 · Sprint 3 · hito `C1 vertical completa` (19-nov)
- Prioridad / Tipo / Épica / Módulo: alta / tarea / Backend / worker.
- Requisitos: RF-01, RNF-04
- Bloqueado por: #3 (el pipeline encola) · Bloquea a: #39, #7

## 1. Contexto

ADR-0011: la API encola, el worker procesa. Sin worker, ingesta, OCR y reportes bloquearían las pantallas. Este brief deja el worker corriendo con las 4 colas y sus garantías antes de que #3 lo use en serio.

## 2. Por qué importa tu parte

Todo lo pesado (OCR, ingesta, reportes, alertas) pasa por aquí. Si sale bien, #3, #32 y #39 solo encolan y consultan estado. Si sale mal, nada async funciona en noviembre.

## 3. Objetivo y resultado esperado

| Entregable | Evidencia |
|---|---|
| Worker con 4 colas | `apps/api/src/worker.ts`: `ingesta`, `texto`, `reportes`, `alertas`; conexiones Redis separadas |
| Reintentos + cuarentena | Backoff con jitter; al agotarse, cuarentena con motivo (nunca se pierde el job en silencio) |
| Salud visible | `/health` reporta si el worker vive y profundidad por cola |

## 4. Actividades específicas

1. Escribir el worker con conexiones Redis separadas por cola. Terminado: arranca con `compose up`.
2. Reintentos con backoff + cuarentena motivada al agotarse. Terminado: job fallido termina en cuarentena, no en el vacío.
3. Exponer salud en `/health` (vive + profundidad por cola). Terminado: smoke lo consulta.

## 5. Entradas y salidas

- Recibe: entorno con Redis (#10), ADR-0011.
- Entrega: worker a #3, #32, #39, por PR desde `feat/46-worker`.

## 6. Referencias y caja de herramientas (tú eliges cuáles usar)

Principio: contexto y criterio, no código hecho. Tú decides la forma; la revisión afirma o devuelve con motivos.

- ADR-0011 (`docs/decisiones/ADR-0011-api-encola-worker-procesa.md`) — la API encola, el worker procesa, la IA propone dentro del worker.
- Colas y garantías: https://docs.bullmq.io (reintentos, backoff, `obliterate` jamás en prod).
- `docs/ingenieria/STACK.md` (BullMQ 6 + Redis 8, versiones reales).
- Comandos: `bun run dev` (API + worker), `bun run verify`.

Lo que NO te limitamos: estructura interna, orden de arranque. Lo que sí se devuelve: job perdido en silencio, una sola conexión Redis para todo, `/health` sin worker.

## 7. Cómo trabajar

- `/tarea 46`, rama `feat/46-worker`. TypeScript estricto.
- ERIK NO DEBE: lógica de negocio del dominio en el worker (solo orquesta); exponer Redis fuera de compose.

## 8. Criterios de aceptación

- [ ] 4 colas corriendo con conexiones separadas.
- [ ] Reintento con backoff + cuarentena motivada, verificado con 1 job que falla.
- [ ] `/health` con estado del worker; `bun run verify` verde.

No es done si: un job se pierde sin motivo; el worker frena una pantalla.

### 8.1 Contrato, pruebas y criterio de listo

**Contrato.** La API encola y el worker procesa (ADR-0011): el trabajo pesado
nunca bloquea una pantalla, y ningún job se pierde en silencio.

**Criterios (Given/When/Then).**

1. **Given** un job de ingesta encolado, **when** el worker lo toma, **then**
   termina en estado final (hecho o cuarentena con motivo) y se puede consultar
   desde la API.
2. **Given** un job que falla tres veces, **when** se agotan los reintentos,
   **then** va a cuarentena con el motivo y el último error, no desaparece.
3. **Given** el worker detenido, **when** se consulta `/health`, **then** dice
   que no vive, con la profundidad de cada cola.

**Plan de pruebas.** Tests del worker con un job que falla y uno que pasa, la
suite de la API en verde (#45) y `bun run verify` con el worker levantado.

**Evidencia.** Salida de los tests, `/health` con las colas y el log de un job
que terminó en cuarentena.

**Listo cuando.** El worker procesa las colas con reintentos y cuarentena, y
su salud es visible.

## 9. Riesgos nombrados

Redis caído en local frena todo. Mitigación: `REDIS_PORT` en `.env`, `doctor` lo detecta; compose con healthcheck.

## 10. Revisión

6-nov con el equipo: demo encolando 1 job por cola. Después: #3 lo usa, #39 su cola.

## Versión corta (descripción del issue)


> [46] Worker BullMQ — Agent3835, 13→18-nov. Worker con colas por tipo de trabajo, para que el trabajo pesado no bloquee las pantallas. Entradas recibidas de la arquitectura (#60), del pipeline (#3) y de docs/ingenieria/OCR.md. Entregable: worker con sus colas y reintentos, probado. Revisión el 18-nov. Detalle: `docs/briefs/BRIEF-46-worker-bullmq.md`.

