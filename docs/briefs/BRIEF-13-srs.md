# BRIEF #13 — SRS DOCU IEEE 830: redacción, validación y PDF

## 0. Encabezado

- Issue: #13
- Dueño: Erik
- Fechas: 2026-10-12 → **2026-10-23** · Sprint 1 · hito `Cierre de diseño` (2026-10-23)
- Prioridad / Tipo / Épica / Módulo: alta / tarea / QA-Documentación / académico
- Requisitos: RNF-07 (verificabilidad); cubre RF-01..08 + RNF-01..07
- Bloqueado por: REQUISITOS.md, CASO.md, Etapa-2-v2 · Bloquea a: #30 aprobación, entregas

Replanificación 2026-10-09: fechas 06→16-oct a 12→23-oct.

## 1. Contexto

La materia exige SRS IEEE 830 firmado. Hay base (Etapa-2-v2, caso, Monday migrado) y un `.docx` local con 7 `[[FALTA]]` heredados. Sin SRS validado no hay aprobación (#30) ni entregas.

## 2. Por qué importa tu parte

El SRS es el contrato académico del alcance: si dice algo que el repo no sostiene, la auditoría lo caza (precedente: 5 afirmaciones refutadas). Si sale bien, #30 se firma en minutos y el cierre tiene PDF + URL en Drive.

## 3. Objetivo y resultado esperado

SRS validado, exportado y enlazado.

| Entregable | Evidencia |
|---|---|
| Portada + §1–§3 validados contra RF-01..08/RNF-01..07 | `.docx` local sin `[[FALTA]]` pendientes salvo declarados |
| 7 faltantes resueltos | h/sem, RAM, fecha 2.º parcial, festivos, escáner, Kanban, nube — cada uno con valor o "no aplica" motivado |
| Apéndices A (RF→prueba), B (Gantt/tablero), C (dataset) | Tablas coherentes con `TRAZABILIDAD.md` y `PLAN-EPICAS.md` |
| PDF en Drive | URL pegada en columna Enlace + comentario en #13 |

## 4. Actividades específicas

1. Validar portada + §1–§3 contra `REQUISITOS.md` y `CASO.md` (3 h). Terminado: matriz de cobertura RF→sección.
2. Resolver los 7 `[[FALTA]]` (3 h): dato o descarte motivado, nunca suposición. Terminado: 0 `[[FALTA]]` sin motivo.
3. Armar apéndices (2 h): A desde `TRAZABILIDAD.md`, B desde milestones 23/30-oct, C desde dataset #9. Terminado: apéndices cruzados.
4. Exportar PDF + subir a Drive + pegar URL (1 h). Terminado: enlace verificable por un tercero.

Total estimado: 8–10 h.

## 5. Entradas y salidas

- Recibe: Etapa-2-v2, caso-bajasterilpack, Monday 18432808588 (ya migrado a `EC0935.md`), `REQUISITOS.md`, `CASO.md`.
- Entrega: a #30 (aprobación) y a `academico/ENTREGAS.md`, PDF + URL.

## 6. Referencias y caja de herramientas

- `docs/proyecto/REQUISITOS.md`, `CASO.md`, `VISION.md`, `integraciones/DRIVE.md` (dónde subir, solo lectura en vivo lo demás).
- Plantilla IEEE 830 del Drive (Etapa 0/1/2): portada + §1 introducción, §2 descripción general, §3 requisitos específicos + apéndices A/B/C.
- Nota: `academico/EC0935.md` se dio de baja del repo por orden del líder; si el SRS la cita, conseguir la copia vigente en Drive y citar fecha.

Recursos y método (sin links externos inventados):

| Para | Recurso | Cuándo usarlo |
|---|---|---|
| Estructura IEEE 830 | La plantilla del Drive manda; cada § del SRS referencia su RF/RNF de `REQUISITOS.md` | Al validar portada + §1–§3 |
| Trazabilidad | `gestion/TRAZABILIDAD.md` (RF→épica→issue→PR→evidencia) | Al armar el apéndice A |
| Fechas reales | Milestones de GitHub (`Cierre` 23-oct, `Contrato` 30-oct) | Al armar el apéndice B (Gantt) |
| Datos de prueba | Dataset de Carlos (#9) | Al armar el apéndice C |
| Bocetar apéndices (curaduría del equipo) | https://excalidraw.com (Gantt/tablero antes del formato final) | Al armar el apéndice B |

## 7. Cómo trabajar

- ERIK NO DEBE: afirmar en el SRS lo que el repo no sostiene; subir secretos; escribir en Drive más allá del PDF acordado.
- ERIK SÍ DEBE: cada afirmación con fuente (archivo + línea o issue); versiones = `package.json` reales; español, sin emojis.
- Duda de alcance = issue, no suposición.

## 8. Criterios de aceptación

- [ ] 0 `[[FALTA]]` sin motivo; cada faltante tiene valor o descarte.
- [ ] Apéndice A cubre RF-01..08 con su prueba (cruza con `TRAZABILIDAD.md`).
- [ ] PDF en Drive con URL verificable en #13.
- [ ] `bun run verify` en verde (si tocó repo).

No es done si: el SRS promete fechas que GitHub no tiene; hay versiones recordadas en vez de confirmadas.

## 9. Riesgos nombrados

Drive con plantilla vieja o vacíos de arquitectura. Mitigación: `DRIVE.md` §Vacíos como lista explícita; desde el 2026-10-19 sin base es bloqueo.

## 10. Revisión

Viernes 2026-10-23 con el equipo: lectura de 15 min + firma de #30. Después: entregas.
