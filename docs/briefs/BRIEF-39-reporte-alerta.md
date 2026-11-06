<p align="center">
<strong>docu</strong><br>
<sub>Configuración 1 · Baja SterilPack · DOCU — Repositorio de Documentación Digital</sub><br>
<sub>Marca: <code>#5B2A86</code> · acento: <code>#B0215F</code> · texto: <code>#24172F</code></sub>
</p>

# BRIEF #39 — Reporte recurrente y alerta (RF-05)

## 0. Encabezado

- Issue: #39
- Dueño: Emmanuel Valenzuela Cruz (Backend).
- Fechas: 2026-11-13 → 2026-11-19 · Sprint 3 · hito `C1 vertical completa` (20-nov)
- Prioridad / Tipo / Épica / Módulo: alta / tarea / Backend / reportes y alertas.
- Requisitos: RF-05, RNF-04
- Bloqueado por: #3 (pipeline), #46 (colas `reports`/`alerts`) · Bloquea a: #7 (verificación punta a punta)

## 1. Contexto

RF-05 pide que la operación deje de depender de que alguien se acuerde de
revisar: **1 reporte recurrente + 1 alerta** sobre la Configuración 1, en el
recorte Must. El reporte se pausa si el formato de la fuente cambia (mejor
detenedos que cifras falsas). Corre en las colas `reports`/`alerts` del worker
(ADR-0011).

## 2. Por qué importa tu parte

El demo del 24-nov no solo enseña pantallas: enseña que DOCU **avisa**. Sin
este RF la historia queda incompleta (datos que entran, nada que sale). Si
sale bien, #7 puede verificar el flujo completo con la alerta disparada; si
sale mal, el demo muestra captura y confirmación, pero no el valor operativo.

## 3. Objetivo y resultado esperado

| Entregable | Evidencia |
|---|---|
| Reporte recurrente configurable | Definido como dato (métrica, frecuencia, destinatarios), no como código |
| Alerta con umbral | Se dispara al cruzar el umbral; evidencia del disparo en el PR |
| Pausado por cambio de formato | Si la fuente cambia, el reporte se detiene y avisa, no sigue con basura |
| Ejecución en worker | Colas `reports` y `alerts` del worker (#46), tipo de job propio |

## 4. Actividades específicas

1. Definir el reporte y la alerta como **datos** (config de report definition: métrica, umbral, destinatarios, mensaje, frecuencia). Terminado: cambiar la config es un PR de datos, no de código.
2. Registrar el job recurrente (BullMQ repeat) en la cola `reports`. Terminado: el reporte se genera solo en la cadencia configurada.
3. Implementar el cruce de umbral → job en `alerts` con mensaje y destinatarios. Terminado: prueba con un valor que cruza el umbral y queda registrado el envío.
4. Cortafuegos de formato: si la fuente no matchea el esquema esperado, el reporte se pausa y deja motivo. Terminado: 1 corrida con fuente corrupta termina pausada, con motivo.
5. Ajustar `/health` o el dashboard de colas para que se vea la profundidad de `reports`/`alerts`. Terminado: smoke lo reporta.

## 5. Entradas y salidas

- Recibe: worker con colas (#46), pipeline completo (#3), seed/dataset de C1 (#59, para datos con qué mostrar), ADR-0011, RF-05 (`docs/proyecto/REQUISITOS.md`).
- Entrega: reporte + alerta a #7 (verificación) por PR desde `feat/39-reporte-alerta`.

## 6. Referencias y caja de herramientas

Principio: contexto y criterio, no código hecho. Tú decides la forma; la revisión afirma o devuelve con motivos.

- RF-05 y RNF-04: `docs/proyecto/REQUISITOS.md`.
- ADR-0011 (`docs/decisiones/ADR-0011-api-encola-worker-procesa.md`) — API encola, el worker procesa.
- Colas y repeat jobs: https://docs.bullmq.io (Repeatable jobs, backoff, `removeOnComplete`).
- `docs/ingenieria/STACK.md` (BullMQ 6.3.11 fijada, Redis 8).
- Publicación de dato: la alerta **propone** destinatarios y mensaje; el envío real queda auditado en bitácora. La alerta nunca cambia un dato oficial.

Lo que NO te limitamos: qué métrica concreta use el reporte base (turno/día vs. avance de programa), siempre que esté justificada con el caso. Lo que sí se devuelve: reporte "a mano" en el controlador, alerta sin umbral configurable, pausado sin motivo registrado.

## 7. Cómo trabajar

- `/tarea 39`, rama `feat/39-reporte-alerta`. TypeScript estricto.
- La IA genera el mensaje de la alerta; **una persona aprueba** mensaje y destinatarios antes de la primera carga real.

## 8. Criterios de aceptación

- [ ] Reporte recurrente generado solo con la cadencia configurada; evidencia de 2 corridas.
- [ ] Alerta disparada al cruzar el umbral; log/bitácora del disparo.
- [ ] Fuente con formato cambiado → reporte pausado con motivo, sin corridas basadas en basura.
- [ ] Colas `reports`/`alerts` visibles en salud del worker.
- [ ] `bun run verify` verde; evidencia adjunta en el PR; issue etiquetado RF-05 y cerrado por el PR.

## 9. Riesgos nombrados

| Riesgo | Mitigación | Desde |
|---|---|---|
| El reporte depende del dataset que aún no llega | Entregar con seed (#59) y, si el dataset llega 13–17 nov, validar con él antes de cerrar | 2026-11-13 |
| La alerta notifica a alguien equivocado | Destinatarios como dato configurable + confirmación humana en la primera carga | 2026-11-13 |
| Pausar "en silencio" confunde a operación | Toda pausa queda en bitácora con motivo y aviso | 2026-11-15 |

## 10. Revisión

- Revisión con Erik el 2026-11-18 (PR en revisión); evidencia en el PR y `bun run verify` verde.
- Ensayo del 2026-11-20: la alerta se dispara en vivo durante la demo de ensayo.
