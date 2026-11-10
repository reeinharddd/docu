# BRIEF #88 — Limpieza de la documentación: barrido, vigencia y índice

## 0. Encabezado

- Issue: #88 — https://github.com/reeinharddd/docu/issues/88
- Dueño: Erik Alfonso Beltrán Ramírez (`reeinharddd`)
- Fechas: 2026-11-02 → 2026-11-06 · Sprint 2 · hito `C1 modelo y BD` (12-nov)
- Prioridad / Tipo / Épica / Módulo: media / tarea / Infraestructura / documentación
- Requisitos: RNF-05
- Bloqueado por: #87 · Bloquea a: #89

## 1. Contexto

El repositorio acumuló material de trabajo que ya no es vigente: los planes de
`docs/superpowers/`, notas de replanificación y documentos que describen un
plan viejo. Sin barrido, un integrante nuevo lee tres documentos contradictorios
y pierde un día. El barrido no borra historia: la archiva o la marca.

## 2. Por qué importa tu parte

La demo del 24-nov y la revisión de Erik dependen de que el repo sea legible.
Además, este brief es el que deja el **barrido automático** que se repite:
`scripts/doc-index.sh` mantiene el índice, y el criterio de barrido de este
brief es el que se ejecuta en cada cambio grande de documentación.

## 3. Objetivo y resultado esperado

| Entregable | Evidencia |
|---|---|
| Material viejo archivado o borrado | `docs/superpowers/` sale del árbol (su contenido ya está en Git) o queda en `docs/briefs/historico/` con motivo |
| Vigencia en los ADR | Una línea de vigencia en los ADR que el plan v2 sustituye, sin reescribir la decisión |
| Índice al día | `docs/.indice` regenerado y `docs/README.md` con la estructura real |
| Barrido repetible | El comando de barrido documentado en `AGENTS.md` o en `docs/README.md` |

## 4. Actividades específicas

1. Listar el material de trabajo en `docs/` y clasificarlo: vigente,
   histórico o basura. Terminado: la lista tiene una decisión por archivo.
2. Archivar lo que vale como historia y borrar lo que no vale nada.
   Terminado: `docs/` sin material de trabajo suelto, con el motivo escrito en
   el PR.
3. Añadir la línea de vigencia a los ADR que el plan v2 sustituye. Terminado:
   cada ADR dice si su decisión sigue vigente.
4. Regenerar el índice y corregir `docs/README.md`. Terminado: el índice
   coincide con el árbol.
5. Dejar el barrido como comando documentado. Terminado: otra persona puede
   correrlo y entender qué espera.

## 5. Entradas y salidas

- Recibe: `docs/gestion/REPLAN-2026-10-30.md` §12 (qué se borra y qué no) y el
  árbol actual de `docs/`.
- Entrega: el árbol limpio, por PR con `Closes #88`.

## 6. Referencias y caja de herramientas

- `docs/gestion/REPLAN-2026-10-30.md` §12: el alcance exacto del barrido.
- `docs/decisiones/README.md`: por qué no se reescribe un ADR.
- `docs/README.md`: el índice del mapa de documentación.
- `scripts/doc-index.sh`: regenera `docs/.indice`.
- Skill `docu-documentar`: taxonomía y capas de autoridad.
- `docs/briefs/historico/`: dónde vive lo que se archiva.

## 7. Cómo trabajar

- Nada se borra en silencio: cada borrado lleva su motivo en el PR, y lo que
  tiene valor de historia se archiva en vez de eliminarse.
- Un ADR no se reescribe: se le añade una línea de vigencia.
- PR único para el barrido, con la lista completa de archivos tocados.

## 8. Criterios de aceptación

- [ ] `docs/superpowers/` no está en el árbol.
- [ ] Los ADR del plan v2 tienen su línea de vigencia.
- [ ] `docs/.indice` regenerado y `docs/README.md` coincide con el árbol.
- [ ] El PR lista cada archivo borrado con su motivo.
- [ ] El comando de barrido está documentado y corre.

### 8.1 Contrato, pruebas y criterio de listo

**Contrato.** Un lector nuevo encuentra un solo documento vigente por tema, y
la historia queda archivada con su motivo.

**Criterios (Given/When/Then).**

1. **Given** el árbol de `docs/` después del barrido, **when** un lector nuevo
   busca un tema, **then** encuentra un documento vigente y none contradicts.
2. **Given** un ADR que el plan v2 sustituyó, **when** alguien lo lee, **then**
   su decisión sigue intacta y una línea dice que los hitos fueron sustituidos.
3. **Given** el comando de barrido, **when** se corre, **then** el índice queda
   igual y el comando sale en verde.

**Plan de pruebas.** `bash scripts/doc-index.sh --fix` y luego el diff vacío;
`bash scripts/docs-linkcheck.sh`, `docs-briefcheck.sh` y `docs-tracecheck.sh`
en verde; y la búsqueda de tokens viejos del plan anterior.

**Evidencia.** La salida de los cuatro comandos, la lista de archivos del PR y
el índice regenerado.

**Listo cuando.** El árbol está limpio, el índice cuadra y el barrido se puede
repetir.

## 9. Riesgos nombrados

Borrar algo que sí era vigente: la mitigación es archivar en vez de borrar y
revisar el PR con el segundo ojo del líder.

## 10. Revisión

Viernes 6-nov en el sync: se recorre la lista de archivos y se afirma o se devuelve
con motivos. Después: #89 (demo) puede leer el repo sin ruido.

## Versión corta (descripción del issue)

> [88] Limpieza de docs — reeinharddd, 2→6-nov. Barrido del material viejo, línea de vigencia en los ADR e índice al día. Entradas recibidas de docs/gestion/REPLAN-2026-10-30.md §12. Entregable: árbol limpio con el motivo de cada borrado, ADRs con vigencia e índice regenerado. Revisión el 6-nov. Detalle: `docs/briefs/BRIEF-88-limpieza.md`.
