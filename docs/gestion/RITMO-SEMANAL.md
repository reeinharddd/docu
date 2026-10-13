# Gestión: ritmo semanal

Estado: vigente. Aplicado por Erik. Fuente de verdad del **estado**: GitHub
Issues y Project (`integraciones/GITHUB-GESTION.md`).

## Lunes, 15 min

1. `bun run doctor` en local para quien toque código.
2. Revisar el Project: ¿lo que está `En progreso` sigue en progreso? Máximo uno
   por persona.
3. `gh issue list --assignee @me` cada quien; mover a `En progreso` lo que se
   empieza.
4. Revisar fechas `Fin`. Una fecha vencida se re-planifica aquí o se dice por
   qué no.

## Miércoles, 10 min

- Bloqueos. Un bloqueo de más de 24 h lleva la etiqueta `bloqueado` y se escala
  el mismo día.
- Las dependencias *blocked by* reflejan la realidad. Si algo espera a otra
  cosa, se registra en el issue.

## Viernes, 20 min

1. `bun run verify` en verde en la rama de cada persona.
2. Cerrar con PR fusionado (`Closes #N`) lo que tenga evidencia.
3. `gh issue list --label req:pendiente`: ningún issue de sprint sin requisito.
4. Actualizar `gestion/TRAZABILIDAD.md` si cambió el mapeo.

## Fin de sprint

- Se revisan los issues del sprint que quedaron abiertos: re-planifican
  (cambia `sprint:N`) o se cierran como `not planned` con motivo. Nunca se
  borran (`docs/REGLAS.md`).
- Las decisiones que otro necesite entender en tres meses se guardan en Engram
  (`docu-memoria`) y, si son de ingeniería, en su ADR o documento canónico.
  Nada de memoria de sesión se commitea.

## Fechas fijadas

Sprints (`GITHUB-GESTION.md`, no se redefinen): S1 diseño 12–23 oct, S2 19 oct–6 nov, S3 9–20 nov, S4 23 nov–4 dic. S1/S2 se solapan 19–23 oct por replan aprobado. Semanas de lunes a domingo (12→18, 19→25…): un brief puede durar días o varias semanas; mandan sus fechas, la semana solo marca el ritmo de syncs.

| Fecha | Qué | Dónde |
|---|---|---|
| 2026-10-13 | Elección de marca + firma SRS + entorno y tablero listos; arrancan v0 y matriz | #41-fase1, #13/#30/#36, #10, #43, #58, #29 |
| 2026-10-16 | Matriz (Carlos), diagrama v0 (Emmanuel) | #29, #58 |
| 2026-10-23 | Cierre de diseño y fin de la arquitectura (Erik, Sprint 1) | Milestone `Cierre de diseño` |
| **2026-10-30** | **Contrato de datos para maquetas (objetivo flexible)** | Milestone `Contrato de datos congelado`, #23 |
| 2026-11-20 | Fin del desarrollo | Milestone |
| 2026-11-27 | Listos para presentar | Milestone |
| 2026-12-01 | Presentación de diciembre | Milestone |
