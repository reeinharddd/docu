# BRIEF #62 — Modelo de datos documentado

## 0. Encabezado

- Issue: #62
- Dueño: Erik.
- Fechas: 2026-10-19 → 2026-10-23 · Sprint 1 · hito `Cierre de diseño` (2026-10-23).
- Prioridad / Tipo / Épica: alta / tarea / Infraestructura.
- Requisitos: RNF-05 (mantenibilidad).
- Bloqueado por: #59 · Bloquea a: #12, #3

## 1. Contexto

Con el v1 afirmado, este brief reescribe `MODELO-DATOS.md` desde él: cada tabla con su constraint y su porqué, sin placeholder, con versiones reales. Es el documento que el backend obedece.

## 2. Por qué importa tu parte

Sin modelo cerrado, #12 y #3 interpretan cada uno por su lado. Si sale bien, S2 construye sin discusiones.

## 3. Objetivo y resultado esperado

| Entregable | Evidencia |
|---|---|
| `MODELO-DATOS.md` reescrito desde v1 | Cero referencias al placeholder como verdad; trazabilidad regla→constraint |
| Versiones reales | `bun.lock` manda; `verify` verde |

## 4. Actividades específicas

1. Reescribir desde el v1 afirmado (22–23-oct, no antes). Terminado: cada tabla con clase (fija/dinámica/manual) y porqué.
2. Fijar versiones reales. Terminado: `verify` verde.

## 5. Entradas y salidas

- Recibe: v1 (#59), ADRs, `STACK.md`.
- Entrega: al equipo por PR; alimenta #12/#3 y SRS.

## 6. Referencias

- `decisiones/` (todas), diagrama v1, `STACK.md`.

## 7. Cómo trabajar

- `/tarea 62`. Español, sin emojis. Cada afirmación con fuente.

## 8. Criterios de aceptación

- [ ] Sin placeholder; trazabilidad completa; `verify` verde.

## 9. Riesgos nombrados

v1 se mueve el 23-oct. Mitigación: se escribe contra el v1 afirmado, no antes.

## 10. Revisión

Viernes 23-oct en el sync. Después: S2 construye.

## Versión corta

> [62] Modelo documentado — Erik, 19→23-oct. MODELO-DATOS desde v1. Requiere #59. Detalle: `docs/briefs/BRIEF-62-modelo-datos.md`.
