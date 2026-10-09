# BRIEF #30 + #36 — Aprobación de requerimientos y diagrama de casos de uso

## 0. Encabezado

- Issues: #30 (aprobación, crítica), #36 (diagrama, entregable)
- Dueño: Erik (propuesto; confirmar en sync del lunes 2026-10-12)
- Fechas: 2026-10-12 → **2026-10-23** · Sprint 1 · hito `Cierre de diseño` (2026-10-23)
- Prioridad / Tipo / Épica: crítica + entregable / QA-Documentación
- Requisitos: RNF-07 (#30); RF-04 (#36, pide el SRS #13)
- Bloqueado por: #13 SRS, REQUISITOS.md · Bloquea a: entregas, contrato #23

Replanificación 2026-10-09: #30 vencía 02-oct → 23-oct; #36 vencía 16-oct → 23-oct; se propone a Erik (dueño del SRS).

## 1. Contexto

RNF-07 exige que todo sea comprobable. #30 es la firma formal de RF-01..08 + RNF-01..07; #36 es el diagrama que el SRS pide y que en Drive no existe (solo hay arquitectura en capas).

## 2. Por qué importa tu parte

Sin firma no hay alcance cerrado: cualquier cambio posterior es discusión, no issue. Sin diagrama, el SRS queda sin la vista que el jurado espera. Ambos cierran el 23-oct con #13.

## 3. Objetivo y resultado esperado

| Entregable | Evidencia |
|---|---|
| Acta de aprobación RF-01..08 + RNF-01..07 | Comentario firmado en #30 (quién aprobó, cuándo, contra qué commit de `REQUISITOS.md`) |
| Diagrama de casos de uso versionado | Archivo en el repo (fuente + export) + incluido en el SRS #13 |

## 4. Actividades específicas

1. Cerrar #13 primero (ver BRIEF-13). Terminado: PDF con URL.
2. Circular `REQUISITOS.md` al equipo (1 h): cada RF con su prueba mínima (§Pruebas). Terminado: lista de objeciones o "aprobado".
3. Dibujar casos de uso desde RF-01..06 + actores (Planeación, Calidad, Almacén, Admin) (3 h). Terminado: diagrama + tabla actor→casos→RF.
4. Firmar #30 en el sync (15 min): constar commit + asistentes. Terminado: #30 cerrado con evidencia, no solo con "ok".

Total estimado: 4–6 h.

## 5. Entradas y salidas

- Recibe: `REQUISITOS.md`, `CASO.md` (actores y reglas), SRS #13.
- Entrega: firma en #30 y diagrama en el repo + SRS; se registra en `academico/ENTREGAS.md`.

## 6. Referencias y caja de herramientas

- `docs/proyecto/REQUISITOS.md` (§Pruebas que exige cada requisito), `TRAZABILIDAD.md` (sin `req:pendiente`).
- Herramienta de diagramas a elegir una sola: Mermaid https://mermaid.js.org (texto versionable, render en GitHub) o Draw.io https://app.diagrams.net (exportar fuente `.drawio` + PNG); fuente versionada, no solo PNG.
- `REQUISITOS.md` §Pruebas + `TRAZABILIDAD.md` para que cada caso apunte a su RF.
- Curaduría del equipo: https://excalidraw.com (boceto rápido actor→casos) y https://gitmind.com/es/ (mapa de actores) antes del diagrama final versionado.
- Editor en vivo: https://mermaid.live (probar el diagrama antes de commitear) y guía de alcance https://c4model.com (qué nivel dibujar: contexto vs contenedor).

## 7. Cómo trabajar

- ERIK NO DEBE: firmar lo que no leyó el equipo; cerrar #30 sin evidencia en el comentario (lo exige `GITHUB-GESTION.md`).
- ERIK SÍ DEBE: confirmar dueño de #36 en el sync del 12 (si se reasigna, se edita este brief y el `Cronograma` del issue).

## 8. Criterios de aceptación

- [ ] #30 tiene quién/cuándo/contra-qué-commit en el comentario de cierre.
- [ ] Diagrama versionado (fuente + imagen) y referenciado desde el SRS.
- [ ] `gh issue list --label req:pendiente` vacío en sprint cerrado.
- [ ] `bun run verify` en verde si tocó repo.

## 9. Riesgos nombrados

Firmar con RF ambiguos (caso R-S1/R-T1 pendiente). Mitigación: decidir nomenclatura antes de M1 (ver `CASO.md` pendiente); sin decisión al 23-oct, #30 no se firma.

## 10. Revisión

Viernes 2026-10-23 en el sync: firma + diagrama en 10 min. Después: E1 cerrado.
