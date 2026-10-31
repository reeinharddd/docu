# BRIEF #62 — Modelo de datos documentado + contrato congelado (SHA)

## 0. Encabezado

- Issue: #62
- Dueño: Erik.
- Fechas: 2026-11-02 → 2026-11-12 · Sprint 3 · hito `C1 modelo y BD` (12-nov).
- Prioridad / Tipo / Épica: alta / tarea / Infraestructura.
- Requisitos: RNF-05 (mantenibilidad).
- Bloqueado por: #59 · Bloquea a: #12, #3

## 1. Contexto

Con el v1 afirmado, este brief reescribe `MODELO-DATOS.md` desde él: cada tabla con su constraint y su porqué, sin referencias a un esquema inexistente, con versiones reales. Es el documento que el backend obedece.

## 2. Por qué importa tu parte

Sin modelo cerrado, #12 y #3 interpretan cada uno por su lado. Si sale bien, S2 construye sin discusiones.

## 3. Objetivo y resultado esperado

| Entregable | Evidencia |
|---|---|
| `MODELO-DATOS.md` reescrito desde v1 | Cero referencias a un esquema inexistente como verdad; trazabilidad regla→constraint |
| Versiones reales | `bun.lock` manda; `verify` verde |

## 4. Actividades específicas

1. Reescribir desde el ER afirmado (no antes del 12-nov). Terminado: cada tabla con su clase (fija, dinámica, manual o genérica) y su porqué.
2. Fijar versiones reales. Terminado: `verify` verde.

## 5. Entradas y salidas

- Recibe: v1 (#59), ADRs, `STACK.md`.
- Entrega: al equipo por PR; alimenta #12/#3 y SRS.

## 6. Referencias

- `decisiones/` (todas), diagrama v1, `STACK.md`.

## 7. Cómo trabajar

- `/tarea 62`. Español, sin emojis. Cada afirmación con fuente.

## 8. Criterios de aceptación

- [ ] Sin referencias a un esquema inexistente; trazabilidad completa; `verify` verde.

### 8.1 Contrato, pruebas y criterio de listo

**Contrato.** `docs/ingenieria/MODELO-DATOS.md` describe el modelo que el ER
define, sin contradecirlo, y el **contrato de datos** queda congelado con su
SHA: dataset, seed y API hablan el mismo idioma.

**Criterios (Given/When/Then).**

1. **Given** el ER afirmado (#58), **when** alguien compara el modelo
   documentado con el texto derivado del ER, **then** coinciden tabla por
   tabla, sin columnas ni tipos que no existan.
2. **Given** el contrato congelado con su SHA, **when** el dataset se regenera
   con otra semilla, **then** la estructura del contrato se sostiene y solo
   cambian los valores.
3. **Given** una familia nueva, **when** se registra en el corpus, **then** el
   contrato no cambia: el modelo la absorbe sin migración.

**Plan de pruebas.** Comparación automática entre el modelo y el ER (la misma
que usa `diagramas:check`), verificación del SHA del contrato y la prueba de
la familia nueva sobre la base.

**Evidencia.** El documento, el SHA registrado en el issue #23 y la salida de
las comparaciones.

**Listo cuando.** El modelo no contradice al ER, el contrato tiene SHA y #23
se puede cerrar con esa evidencia.

## 9. Riesgos nombrados

El ER se mueve el 12-nov. Mitigación: se escribe contra el ER afirmado, no antes.

## 10. Revisión

Jueves 12-nov en el sync. Después: el backend y la IA construyen.

## Versión corta


> [62] Modelo de datos — reeinharddd, 2→12-nov. Documentar el modelo híbrido y congelar el contrato de datos con su SHA. Entradas recibidas de docs/ingenieria/DIAGRAMA-BD-v0.md y de docs/proyecto/REQUISITOS.md. Entregable: modelo documentado, coherente con el ER, y contrato con SHA. Revisión el 12-nov. Detalle: `docs/briefs/BRIEF-62-modelo-datos.md`.

