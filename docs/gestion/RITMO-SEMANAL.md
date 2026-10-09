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
- Se escribe el resumen en `docs/diario/` cuando haya una decisión que otro
  necesite entender en tres meses.

## Fechas fijadas

| Fecha | Qué | Dónde |
|---|---|---|
| 2026-10-16 | Cierre de marca Fase 1 (Kira) + matriz de roles (Carlos) | #41-fase1, #29 |
| 2026-10-23 | Cierre de diseño y fin de la arquitectura (Erik, Sprint 1) | Milestone `Cierre de diseño` |
| **2026-10-30** | **Contrato de datos congelado para maquetas** | Milestone `Contrato de datos congelado`, #23 |
| 2026-11-20 | Fin del desarrollo | Milestone |
| 2026-11-27 | Listos para presentar | Milestone |
| 2026-12-01 | Presentación de diciembre | Milestone |
