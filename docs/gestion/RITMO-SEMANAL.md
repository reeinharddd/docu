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

Sprints (`GITHUB-GESTION.md`, no se redefinen): S2 diseño y método 31 oct–6 nov,
S3 modelo e implementación 7–19 nov, S4 demo y final 20 nov–3 dic. Semanas de
lunes a domingo: un brief puede durar días o varias semanas; mandan sus fechas,
la semana solo marca el ritmo de syncs.

| Fecha | Qué | Dónde |
|---|---|---|
| 2026-10-31 | Arrancan el caso, la plataforma frontend y el generador del dataset | #83, #84, #61 |
| 2026-11-06 | Caso cerrado, método (SDD/TDD) y limpieza documental | #83, #87, #88 |
| 2026-11-10 | Plataforma frontend en `main` | #84 |
| **2026-11-12** | **Modelo y base de datos congelados; contrato con SHA** | Milestone `C1 modelo y BD`, #58, #60, #62, #23 |
| 2026-11-17 | Dataset del mes completo, con manifiesto SHA-256 | #61 |
| 2026-11-18 | Freeze de la vertical: backend, IA, dataset, permisos y frontend de punta a punta | Milestone `C1 vertical completa`, #85, #4, #7 |
| 2026-11-19 | Verificación de punta a punta y replicabilidad | #7, #86 |
| 2026-11-20 | Ensayo de la demo, con video de respaldo | #89 |
| **2026-11-24** | **Demo de avances con el profesor** | Milestone `Avances profesor`, #89 |
| **2026-12-03** | **Presentación final** | Milestone `C1 final`, #6 |

Las fechas de los hitos son las de los milestones en GitHub
(`integraciones/GITHUB-GESTION.md`). Si un milestone se mueve, se corrige esta
tabla en el mismo PR.
