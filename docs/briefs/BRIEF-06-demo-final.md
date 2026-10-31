# BRIEF #06 — Demo final del 3-dic: cierre de C1

## 0. Encabezado

- Issue: #06 — https://github.com/reeinharddd/docu/issues/6
- Dueño: Erik Alfonso Beltrán Ramírez (`reeinharddd`)
- Fechas: 2026-12-01 → 2026-12-03 · Sprint 4 → post-C1 · hito `C1 final` (3-dic)
- Prioridad / Tipo / Épica / Módulo: crítica / tarea / QA-Documentación / demo
- Requisitos: RF-01, RF-02, RF-03, RF-04; RNF-01, RNF-02
- Bloqueado por: #89 · Bloquea a: —

## 1. Contexto

La demo del 24-nov es de avances; la del 3-dic es de cierre de C1. Entre una
y otra hay dos semanas: el freeze del 18-nov, la verificación del 19-nov y el
ensayo del 20-nov ya pasaron. Este brief cierra el ciclo: qué se demuestra,
qué se arregla, qué queda para la siguiente etapa y qué significa "C1
completo".

## 2. Por qué importa tu parte

El proyecto tiene una definición de Hecho, y esta es su última pieza: la
evidencia de que el RF del caso está cumplido. Sin ella, C1 no se cierra y el
trabajo de las dos semanas siguientes no tiene punto de partida.

## 3. Objetivo y resultado esperado

| Entregable | Evidencia |
|---|---|
| Alcance de C1 | La lista de requisitos que C1 cumple, con la evidencia de cada uno |
| Demo final | Ejecución del caso completo, con el guion y la evidencia |
| Acta de cierre | Qué se demostró, qué pidió el profesor, qué queda pendiente y con qué dueño |
| Trazabilidad al día | `docs/gestion/TRAZABILIDAD.md` con cada RF enlazado a su evidencia |

## 4. Actividades específicas

1. Cerrar la lista de requisitos de C1 con su evidencia. Terminado: cada RF
   tiene su prueba o su captura, o está marcado como fuera de alcance con
   motivo.
2. Actualizar la trazabilidad. Terminado: la matriz RF→evidencia está completa
   y no tiene celdas vacías sin explicación.
3. Ejecutar la demo final el 3-dic. Terminado: acta con lo demostrado y lo
   pedido.
4. Escribir el acta de cierre y el plan de lo que sigue. Terminado: cada
   pendiente tiene dueño y fecha.
5. Cerrar los issues de C1 con su evidencia. Terminado: cada issue lleva la
   evidencia que lo demuestra.

## 5. Entradas y salidas

- Recibe: la demo del 24-nov (#89), la vertical completa (#7), el frontend
  real (#4), el dataset (#61) y la trazabilidad.
- Entrega: acta de cierre, trazabilidad actualizada e issues cerrados, en el
  repo y en GitHub.

## 6. Referencias y caja de herramientas

- `docs/gestion/REPLAN-2026-10-30.md` §4: el calendario de C1.
- `docs/gestion/TRAZABILIDAD.md`: la matriz que hay que cerrar.
- `docs/proyecto/REQUISITOS.md`: la lista de RF.
- `docs/decisiones/ADR-0006-ia-propone-humano-dispone.md`: en la demo se ve
  que la persona dispone.
- `docs/integraciones/GITHUB-GESTION.md`: cómo se cierra un issue con su
  evidencia.

## 7. Cómo trabajar

- Se demuestra lo que el caso dice, no lo que el sistema tiene de más.
- Cada pendiente sale con dueño y fecha; "lo vemos luego" no es un plan.
- La IA prepara el acta; el líder la firma.

## 8. Criterios de aceptación

- [ ] Cada RF de C1 tiene evidencia o está marcado fuera de alcance con
  motivo.
- [ ] La trazabilidad no tiene celdas vacías sin explicación.
- [ ] La demo final se ejecutó y hay acta.
- [ ] Cada pendiente del acta tiene dueño y fecha.
- [ ] Los issues de C1 se cerraron con su evidencia.

### 8.1 Contrato, pruebas y criterio de listo

**Contrato.** C1 se cierra cuando cada requisito tiene evidencia y el profesor
lo acepta.

**Criterios (Given/When/Then).**

1. **Given** la matriz de trazabilidad, **when** se busca un RF, **then** su
   evidencia está enlazada y es reproducible.
2. **Given** la demo final, **when** termina, **then** cada pendiente del
   acta tiene dueño y fecha.
3. **Given** el acta de cierre, **when** alguien la lee, **then** sabe qué
   quedó hecho, qué no y por qué.

**Plan de pruebas.** `bun run verify` completo el 2-dic, verificación de cada
enlace de evidencia de la trazabilidad y revisión del acta con el equipo.

**Evidencia.** El acta, la trazabilidad actualizada, la salida de `verify` y
el enlace a cada issue cerrado.

**Listo cuando.** El acta está firmada y los issues de C1 cerrados con
evidencia.

## 9. Riesgos nombrados

Que el 3-dic aparezcan pendientes que nadie toma: la mitigación es el
ensayo del 20-nov y la demo del 24-nov, que son dos cortes previos.

## 10. Revisión

Lunes 2-dic: verificación previa. Jueves 3-dic: demo final y acta de cierre.

## Versión corta (descripción del issue)

> [6] Demo final — reeinharddd, 1→3-dic. Cierre de C1: alcance con evidencia, trazabilidad completa, demo final y acta de cierre. Entradas recibidas de la demo del 24-nov (#89), de la vertical completa (#7) y de la trazabilidad. Entregable: acta de cierre firmada y C1 cerrado con evidencia por requisito. Revisión el 3-dic. Detalle: `docs/briefs/BRIEF-06-demo-final.md`.
