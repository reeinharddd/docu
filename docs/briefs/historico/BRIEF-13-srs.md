# BRIEF #13 + #30 + #36 — SRS completo, diagrama y firma

## 0. Encabezado

- Issues: #13 (SRS), #30 (aprobación), #36 (diagrama).
- Dueño: Erik.
- Fechas: 2026-10-12 → **2026-10-13** · Sprint 1 · firma con profesores el martes 13-oct.
- Prioridad / Tipo / Épica: crítica / tarea / QA-Documentación.
- Requisitos: RNF-07; cubre RF-01..08 + RNF-01..07.
- Bloqueado por: REQUISITOS.md, CASO.md · Bloquea a: entregas.
- Un solo entregable: SRS firmado con diagrama incluido. (Antes en dos briefs; se unifican aquí.)

## 1. Contexto

La materia exige SRS IEEE 830 firmado. Hay base (Etapa-2-v2, caso, Monday migrado), plantilla en Drive y un `.docx` local con 7 `[[FALTA]]`. El SRS pide el diagrama de casos de uso y en Drive no existe: se dibuja aquí mismo, vía rápida en Mermaid. Sin firma no hay alcance cerrado.

## 2. Por qué importa tu parte

Si el SRS dice algo que el repo no sostiene, la auditoría lo caza. Si sale bien mañana, el alcance queda firmado y E1 respira.

## 3. Objetivo y resultado esperado

| Entregable | Evidencia |
|---|---|
| Plantilla Drive completa | Portada + §1–§3 + apéndices A/B/C; 0 `[[FALTA]]` sin motivo (7 faltantes: h/sem, RAM, fecha 2.º parcial, festivos, escáner, Kanban, nube) |
| Diagrama de casos de uso | Mermaid versionado en el repo + exportado al SRS; tabla actor→casos→RF |
| Firma 13-oct | Comentario firmado en #30 (quién aprobó, cuándo, contra qué commit de `REQUISITOS.md`) + PDF con URL en Drive |

## 4. Actividades específicas

1. Validar portada + §1–§3 contra `REQUISITOS.md` y `CASO.md`. Terminado: matriz RF→sección.
2. Resolver los 7 `[[FALTA]]`: dato o descarte motivado, nunca suposición. Terminado: 0 pendientes sin motivo.
3. Dibujar casos de uso en Mermaid desde RF-01..06 + actores (3 h). Terminado: diagrama + tabla el 13-oct.
4. Armar apéndices A (desde `TRAZABILIDAD.md`), B (milestones 23/30-oct), C (dataset #9/#61: lo que haya + supuestos fechados). Terminado: apéndices cruzados.
5. Circular `REQUISITOS.md` al equipo hoy: objeciones o "aprobado". Terminado: lista cerrada.
6. Exportar PDF + subir a Drive + firmar mañana con profesores. Terminado: URL verificable + #30 cerrado con evidencia.

## 5. Entradas y salidas

- Recibe: Etapa-2-v2, caso, Monday migrado (copia vigente en Drive, citar fecha), `REQUISITOS.md`, `CASO.md`.
- Entrega: PDF + URL + firma en #30; se registra en Drive con fecha.

## 6. Referencias y caja de herramientas

- Plantilla IEEE 830 del Drive; `REQUISITOS.md`, `CASO.md`, `VISION.md`, `TRAZABILIDAD.md`; `DRIVE.md` (dónde subir; §Vacíos como lista explícita).
- https://mermaid.js.org + https://mermaid.live (diagrama versionable) · https://languagetool.org (redacción) · https://pandoc.org (tablas al DOCX).

## 7. Cómo trabajar

- ERIK NO DEBE: afirmar lo que el repo no sostiene; subir secretos; escribir en Drive más allá del PDF.
- ERIK SÍ DEBE: cada afirmación con fuente; versiones = `package.json` reales; español, sin emojis.
- Duda de alcance = issue, no suposición.

## 8. Criterios de aceptación

- [ ] 0 `[[FALTA]]` sin motivo; apéndices A/B/C cruzados.
- [ ] Diagrama versionado y referenciado desde el SRS.
- [ ] PDF en Drive con URL en #13; #30 con quién/cuándo/contra-qué-commit.
- [ ] `bun run verify` en verde (si tocó repo).

No es done si: el SRS promete fechas que GitHub no tiene; hay versiones recordadas.

## 9. Riesgos nombrados

Drive sin base hoy es bloqueo hoy. Mitigación: supuestos fechados, nunca invento. `CASO.md` (nomenclatura R-P1..T1 decidida 12-oct) es la versión contra la que se firma.

## 10. Revisión

Martes 13-oct: firma con profesores (Resffa, Mike, Yakko). Después: entregas.

## Versión corta

> [13+30+36] SRS firmado — Erik, 12→13-oct. Plantilla completa + diagrama Mermaid + firma profesores. Detalle: `docs/briefs/BRIEF-13-srs.md` (absorbe al brief de #30/#36, por borrar).
