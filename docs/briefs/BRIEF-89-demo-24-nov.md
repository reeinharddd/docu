# BRIEF #89 — Demo del 24-nov: guion, evidencia y ensayo

## 0. Encabezado

- Issue: #89 — https://github.com/reeinharddd/docu/issues/89
- Dueño: Erik Alfonso Beltrán Ramírez (`reeinharddd`)
- Fechas: 2026-11-18 → 2026-11-20 · Sprint 4 · hito `Avances profesor` (24-nov)
- Prioridad / Tipo / Épica / Módulo: crítica / tarea / QA-Documentación / demo
- Requisitos: RF-01, RF-02, RF-03, RF-04
- Bloqueado por: #7, #4, #11 · Bloquea a: #6

## 1. Contexto

El 24-nov se muestran avances al profesor. La demo no es un showcase: es la
prueba de que el sistema hace lo que el caso dice, con los datos reales del
mes. Este brief fija el guion, la evidencia que hay que tener lista y el
ensayo del 20-nov, dos días después del freeze del 18-nov.

## 2. Por qué importa tu parte

Si el guion se arma el 24-nov por la mañana, la demo se improvisa y se resumen
las partes flojas. Si está listo el 20-nov, el 20-nov se ensaya, el 21 y 22 se
arregla lo que salió mal y el 24 se ejecuta. #6 (demo final) depende
de que esta sea creíble.

## 3. Objetivo y resultado esperado

| Entregable | Evidencia |
|---|---|
| Guion de la demo | `docs/gestion/DEMO-2026-11-24.md`: minuto a minuto, qué se ve, quién habla y qué se comprueba |
| Evidencia lista | Capturas, video corto del flujo y salida de las verificaciones, antes del 22-nov |
| Ensayo | Corrida del 20-nov con el resultado anotado: qué falló y quién lo arregla |
| Checklist de demo | Lista de comprobación del día: entorno arriba, datos cargados, plan B por si falla algo |

## 4. Actividades específicas

1. Escribir el guion minuto a minuto con la pantalla o la respuesta que se ve
   en cada paso. Terminado: no hay paso sin pantalla, cifra o documento.
2. Preparar la evidencia: capturas de las cuatro pantallas con datos reales,
   video del flujo y la salida de `bun run verify`. Terminado: todo está en el
   PR de demo y en un Drive con acceso.
3. Ensayar el 20-nov con el equipo. Terminado: el acta del ensayo dice qué
   falló, con responsable y fecha.
4. Arreglar lo que salió mal el 21 y 22. Terminado: checklist verde.
5. Ejecutar la demo el 24-nov. Terminado: acta con lo que se mostró y lo que
   pidió el profesor.

## 5. Entradas y salidas

- Recibe: la vertical completa (#7), el frontend real (#4), los mockups (#11)
  y el dataset del mes (#61).
- Entrega: guion, evidencia, ensayo y acta, en el repo y en el issue #89.

## 6. Referencias y caja de herramientas

- `docs/gestion/REPLAN-2026-10-30.md` §4: las fechas (ensayo 20-nov, demo
  24-nov, freeze 18-nov).
- `docs/proyecto/CASO.md` (#83): el guion sigue el caso, no las features.
- `docs/proyecto/REQUISITOS.md`: los RF que la demo debe comprobar.
- `docs/integraciones/GITHUB-GESTION.md`: cómo se registra la evidencia.
- `docs/gestion/TRAZABILIDAD.md`: para no prometer lo que no está.

## 7. Cómo trabajar

- La demo muestra el caso, no la arquitectura: cada paso tiene un efecto
  visible para quien no conoce el sistema.
- Plan B obligatorio: si el entorno falla, hay una captura y un video.
- La IA propone el guion; el líder lo afirma.

## 8. Criterios de aceptación

- [ ] El guion tiene paso, pantalla y comprobación para cada minuto.
- [ ] La evidencia está completa antes del 22-nov.
- [ ] El ensayo del 20-nov quedó con acta, responsables y fechas.
- [ ] El checklist del día está verde.
- [ ] El acta del 24-nov dice qué se mostró y qué pidió el profesor.

### 8.1 Contrato, pruebas y criterio de listo

**Contrato.** La demo es la ejecución del caso con datos reales, con evidencia
previa y plan B.

**Criterios (Given/When/Then).**

1. **Given** el guion, **when** una persona que no conoce el proyecto lo sigue,
   **then** sabe qué pantalla mostrar y qué comprobar en cada paso.
2. **Given** el entorno caído el 24-nov, **when** se activa el plan B, **then**
   la demo continúa con la evidencia grabada.
3. **Given** la lista de requisitos, **when** termina la demo, **then** cada RF
   demostrado tiene su comprobación anotada.

**Plan de pruebas.** Ensayo completo del 20-nov con cronómetro, verificación
del entorno el 23-nov (`bun run doctor` y base levantada) y prueba del plan B
con la red caída.

**Evidencia.** Guion, capturas, video, acta del ensayo, checklist verde y
acta del 24-nov.

**Listo cuando.** El ensayo pasó, el checklist está verde y la evidencia no
depende de que el entorno funcione.

## 9. Riesgos nombrados

Que el sistema se degrade por el freeze del 18-nov: la mitigación es que
después del freeze solo se arreglan bloqueos, y el plan B cubre el entorno.

## 10. Revisión

Ensayo el jueves 20-nov; checklist el lunes 23-nov; demo el martes 24-nov con
acta en el issue.

## Versión corta (descripción del issue)

> [89] Demo del 24-nov — reeinharddd, 18→20-nov. Guion de la demo, evidencia lista y ensayo previo. Entradas recibidas de la vertical completa (#7), del frontend (#4) y de los mockups (#11). Entregable: guion, evidencia, acta del ensayo y demo ejecutada. La demo se presenta el 24-nov y el acta queda en este issue. Revisión el 20-nov. Detalle: `docs/briefs/BRIEF-89-demo-24-nov.md`.
