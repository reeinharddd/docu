# BRIEF #3 — Pipeline de ingesta, OCR y clasificación

## 0. Encabezado

- Issue: #3
- Dueño: Erik (ejecuta), Emmanuel (revisa).
- Fechas: propuesto 2026-10-26 → 2026-11-13 · Sprint 2
- Prioridad / Tipo / Épica / Módulo: crítica / tarea / Backend / ingesta.
- Requisitos: RF-01, RF-02, RNF-04
- Bloqueado por: #59, #32, #10 · Bloquea a: #4, #39

## 1. Contexto

El pipeline es la cadena archivo → clasificación por familia → validación con reglas como datos → cuarentena con motivo o dato oficial. Corre en el worker BullMQ/Redis, nunca en la API (ADR-0011). Sin la evaluación OCR (#32) y sin C1 cargada (#7), diseñarlo es adivinar.

## 2. Por qué importa tu parte

Es el corazón de RF-01/RF-02 y el riesgo técnico mayor: si el worker no escala o el OCR no da el 90 %, el proyecto se rehace en noviembre. Si sale bien, subir→revisar→consultar funciona de punta a punta para la demo.

## 3. Objetivo y resultado esperado

Pipeline corriendo en worker con OCR medido y clasificación ≥ 80 % sobre el dataset.

| Entregable | Evidencia |
|---|---|
| Colas por tipo (ingesta, OCR, validación) | BullMQ dashboard o logs: jobs entran y salen sin frenar pantallas |
| Clasificación por familia ≥ 80 % | Corrida sobre 200 sintéticos con matriz de confusión |
| OCR con el motor de #32 | Campos clave ≥ 90 %, CER ≤ 10 % en la corrida |
| Cadena con cuarentena motivada | 1 caso por regla R-P1..T1: pasa o cae con motivo visible |
| Integración con #12 y #4 | Subir desde captura → ver en bandeja → confirmar → consultar |

Fase A (diseño worker + colas, tras #32): estructura sin OCR final. Fase B (integración, tras #7v1): cadena completa.

## 4. Actividades específicas

1. Definir colas y reintentos (sin frenar pantallas, RNF-04). Terminado: job lento no bloquea API.
2. Conectar motor OCR elegido en #32 con versiones fijadas. Terminado: misma corrida, mismo CSV.
3. Implementar clasificación por familia con confianza + umbral a humano. Terminado: ≥ 80 % medido, resto a cuarentena con motivo.
4. Implementar validación en cadena con `ReglaValidacion` como datos. Terminado: 1 caso por regla.
5. Integrar con ingesta (#12) y bandeja (#4). Terminado: flujo subir→confirmar→consultar en vivo.

## 5. Entradas y salidas

- Recibe: C1 cargada (#7), motor decidido (#32), endpoints (#12), reglas (ADR-0009).
- Entrega: a Kira (#4) flujo vivo; a #39 datos ingeridos. Comenta en #4 y #39.

## 6. Referencias y caja de herramientas

- ADR-0011 (API encola, worker procesa), ADR-0005 (BullMQ/Redis: `maxmemory-policy noeviction`, sin `keyPrefix`), `ingenieria/COLAS.md`, `ingenieria/OCR.md` (de #32), `STACK.md` §2.5.
- Docs: https://docs.bullmq.io (conexiones, compatibilidad Redis), https://redis.io/docs.
- Comandos: `bun run verify` (smoke incluye cola), `docker compose ... up -d --wait`.

## 7. Cómo trabajar

- Rama `feat/3-<slug>`; `/tarea 3` y `/cerrar`.
- OCR y lotes siempre en worker; nada pesado en API. Todo con versión/semilla.
- `.env` fuera del repo. 1 issue En progreso; bloqueo >24 h con `bloqueado`.

## 8. Criterios de aceptación

- [ ] Clasificación ≥ 80 % medida; OCR ≥ 90 % campos, CER ≤ 10 %.
- [ ] Cada regla R-P1..T1 con 1 caso que pasa o va a cuarentena motivada.
- [ ] Flujo subir→confirmar→consultar en vivo con #4.
- [ ] `bun run verify` en verde; PR con `Closes #3` (fase correspondiente).

No es done si: OCR corre en la API; un inválido se borra en silencio; la demo usa datos a mano.

## 9. Riesgos nombrados

OCR no alcanza el 90 % (#32). Mitigación: pipeline por fases (reglas primero, Tesseract después); si ningún motor da, se recorta a reglas + humano con motivo, con ADR.

## 10. Revisión

Syncs con Emmanuel (revisor) y Carlos (dataset). Demo de cadena al cerrar fase B.

## Versión corta (descripción del issue)

> [3] Pipeline ingesta/OCR — Erik, propuesto 26-oct → 13-nov. Worker BullMQ + OCR de #32 + C1 de #7, cadena motivada. Detalle: `docs/briefs/BRIEF-03-pipeline-ingesta.md`.
