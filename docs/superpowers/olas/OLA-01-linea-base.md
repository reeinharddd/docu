# OLA 01 — Línea base (2026-10-09)

- SHA main: `90d547a60de2a5ced3df4e1620ffe7d3ddf3217a`
- `docs/.indice`: 58 entradas, 0 discrepancias (`bash scripts/doc-index.sh`, EXIT=0)
- Briefs: 10 en `docs/briefs/`
- Scripts: `dev.sh doc-index.sh doctor.sh project-sync.ts setup.sh smoke-api.sh`
- `bun run doctor`: OK=16 FALTA=0 AVISO=2 → entorno operable.
  Avisos: `apps/api` sin pruebas (deuda RNF-07 conocida); 6 rutas sin commitear
  (los `??` esperados: `apps/web/.editorconfig`, `.gitignore`, `.vscode/`,
  `README.md`, `src/app/features/`, `docs/diseno/`).

## GitHub real (2026-10-09, `gh issue list --state all`, 46 issues)

Milestones (coinciden con hitos duros del plan):

| Milestone | Due | Open | Closed |
|---|---|---|---|
| Cierre de diseño | 2026-10-23 | 13 | 4 |
| Contrato de datos congelado | 2026-10-30 | 2 (#41, #23) | 0 |
| Fin del desarrollo | 2026-11-20 | 10 | 0 |
| Listos para presentar | 2026-11-27 | 1 (#6) | 0 |
| Presentación de diciembre | 2026-12-01 | 0 | 0 |

## Discrepancias priorizadas (entran a Ola 02)

1. `docs/proyecto/REQUISITOS.md:65` dice contrato 23-oct; el milestone real es
   30-oct. Confirmado contra GitHub → corregir a 30-oct.
2. Issue #23 titula "Contrato de datos congelado el 23 de octubre para
   maquetas" (abierto, sin etiquetas). Contradice el hito 30-oct. No se toca
   sin decisión del líder → `PROPUESTO`.
3. Issues #18–#26 (9 issues) sin etiqueta de requisito, sin épica y sin
   milestone. Si entran a un sprint violan TRAZABILIDAD regla 1 → `PROPUESTO`
   (etiquetar o declarar exentos).
4. #7 (Configuración 1, alimenta el contrato) está en "Fin del desarrollo"
   (20-nov), no en "Contrato de datos congelado" (30-oct). Desalineación de
   dependencia → `PROPUESTO`.
5. Sin assignee real salvo #43 (reeinharddd): #7, #10, #13, #29, #32, #36,
   #39, #41, #42 figuran con dueño solo en docs (`EQUIPO.md`, briefs), no en
   GitHub. No se auto-asigna → `PROPUESTO` con verificación humana.
6. Referencias EC0935.md: `GITHUB-GESTION.md:121`, `DRIVE.md:85`,
   `BRIEF-13-srs.md:44,51`, `ADR-0008:90`, `INVESTIGACION-HERRAMIENTAS.md`
   (link a brief eliminado). Tratamiento en Ola 02 sin restaurar nada.

## Rutas personales y secretos

- Ruta personal real en docs del proyecto: ninguna. El grep solo devuelve las
  menciones del propio patrón de búsqueda en spec/plan/informe (meta-texto,
  no rutas de máquina).
- `noventa-secretos.sh`: hook `no-secretos` en verde en los últimos 2 commits;
  sin hallazgos en contenido vigente.
