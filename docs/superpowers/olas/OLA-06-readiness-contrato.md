# OLA 06 — Readiness del contrato (2026-10-09, NO congelado)

La congelación efectiva es el 2026-10-30 (milestone `Contrato de datos
congelado`, due 2026-10-30). Declararla hoy sería falso. Este informe deja las
precondiciones verificadas y lo que falta.

## Estado real de dependencias (GitHub, 2026-10-09)

| Dependencia | Estado | Bloqueo |
|---|---|---|
| #7 Configuración 1 (familias → contrato) | OPEN, sin assignee, milestone `Fin del desarrollo` (20-nov), labels `sprint:2, RF-08` | Mal alineado: alimenta el contrato del 30-oct pero vence el 20-nov. `PROPUESTO`: mover a milestone `Contrato de datos congelado` o declarar excepción. Dueño docs: Emmanuel; en GitHub sin asignar. |
| #32 Evaluación OCR con números | OPEN, sin assignee, milestone `Cierre de diseño` | Sin resultados medidos aún. Dueño docs: Erik; en GitHub sin asignar. |
| #23 (título "contrato … 23 de octubre") | OPEN, sin etiquetas | Título contradice el hito 30-oct. `PROPUESTO`: renombrar o cerrar con motivo. Requiere líder. |
| #41 Design system (Fase marca) | OPEN, milestone `Contrato de datos congelado` | En su hito correcto. Sin assignee (docs: Kira). |

## Decisiones del líder aplicadas el 2026-10-09

- #23 renombrado a "…30 de octubre…" (`gh issue edit`, verificado).
- #7 movido al milestone `Contrato de datos congelado` (`gh issue edit`, verificado).
- Assignees (#7, #32, #41, #36, #39): pendientes hasta el sync del lunes 2026-10-12 (usuarios GitHub por confirmar).
- #13 inicia el 10-oct (brief actualizado).
- UI kit y decisiones UI/UX: Kira decide; el equipo provee herramientas (BRIEF-42 anotado).
- Secreto Docker Hub para CI: lo configura el líder en Settings → Secrets (pendiente).

## Condiciones de desbloqueo (para el 30-oct)

1. #7 con evidencia (configuración cargada) y milestone corregido.
2. #32 con resultados medidos y evidencia adjunta.
3. #23 resuelto (renombrado o cerrado por el líder).
4. Assignees reales en #7, #32, #41 (hoy solo existen en docs, no en GitHub).
5. Declaración de congelación con SHA en el doc dueño
   (`ingenieria/MODELO-DATOS.md`): "Contrato congelado el 2026-10-30 en
   `<SHA>`, hito `<enlace>`. Desviaciones: `<lista o ninguna>`."

## Olas 07–08

Bloqueadas por calendario: Ola 07 (cierre dev 20-nov) exige RF implementados
con pruebas y evidencias; Ola 08 (liberación 1-dic) exige las anteriores en
verde. Reactivar al cumplirse sus fechas y precondiciones.
