# ADR 0016 — Los diagramas son texto (Mermaid) y viven en el repositorio

Fecha: 2026-10-18 · Estado: Reemplazada por ADR-0017 (2026-10-19) · Decide: Erik · Revisa: el equipo

> Reemplazada: el ER de la base de datos se pasó a draw.io (ADR-0017). Mermaid
> sigue vigente para flujos, secuencias, estados y arquitectura.

## Contexto

#58 fijó como forma de diagramar el modelo de datos **DBML + PNG** generado desde
dbdiagram.io, con validación en postgres.new y jsoncrack. Al empezar a trabajar
ese entregable aparecieron tres problemas concretos:

1. **GitHub no renderiza DBML.** Para ver el diagrama hay que salir a
   dbdiagram.io (nube) o instalar tooling aparte; y el `PNG` no es diffeable, así
   que en un PR nadie ve *qué* cambió, solo que cambió.
2. **No hay un estándar.** El repo va a necesitar diagramas en varios frentes:
   esquema de BD (#58/#59), arquitectura (#60), flujo de ingesta, secuencia de
   API y worker, ciclos de vida (cuarentena, confirmación), plan. Hoy cada quien
   dibujaría donde pueda y con la herramienta que tenga.
3. **Restricciones reales.** Local/offline, PCs en la misma red, mínimos
   recursos; equipo de 4 personas; GitHub es el centro de operación (ADR-0008) y
   el repositorio la fuente técnica. Todo diagrama debería verse y revisarse
   **sin salir del repo**.

Mermaid cubre esto sin build, sin nube y sin servicio: **GitHub lo renderiza
nativo** en `.md`, issues, PR y wiki (desde 2022).

## Decisión

**Los diagramas del repositorio son texto: Mermaid.** Concretos:

1. **Fuente única.** El diagrama vive como bloque ` ```mermaid ` dentro de un
   `.md` (o como `.mmd` si es solo diagrama). Se edita como código; la fuente de
   verdad es el documento. Nada de binarios ni de archivos generados como origen.
2. **Render nativo.** GitHub los pinta en `.md`, issues, PR y wiki, sin build ni
   nube. **La evidencia normal es el diagrama renderizado en el PR**, no un PNG.
3. **Tipos permitidos y su uso.** `erDiagram` (esquema de BD), `flowchart`
   (procesos y flujos), `sequenceDiagram` (llamadas API/worker), `stateDiagram-v2`
   (ciclos de vida), `C4Context` (arquitectura de alto nivel), `gantt` (plan),
   `mindmap` (exploración). Fuera de esta lista se justifica en el PR.
4. **Una vista por área.** Si un diagrama no cabe, se parte por área
   (`core`, `ingest`, `graph`, `truth`, `config`, `platform`) con un índice;
   nunca un diagrama gigante ilegible. Los subgrafos/entidades se agrupan por
   área.
5. **Estilo de casa.** Un bloque `init` fijo (tema base, 14px), **ids en inglés,
   etiquetas en español** (regla del repo), y color por clase de dato
   (fija/dinámica/manual/append-only). El estándar completo vive en
   `docs/ingenieria/DIAGRAMAS.md`.
6. **Export opcional.** SVG/PNG vía `mmdc` o Kroki es **a demanda**; nunca es la
   fuente ni requisito de "done". El PNG del brief deja de ser entregable.
7. **Complementos, no fuente.** Archify (HTML interactivo con zoom y
   before/after) y `@drawio/mcp` (edición manual) se usan como *plus*; lo que se
   adjunte al repo se exporta y se nombra. Siguen a Mermaid, no lo reemplazan.
8. **Cumplimiento verificable.** `scripts/diagramas-check.ts` extrae cada bloque
   Mermaid de los `.md` y `.mmd` y lo pasa por el parser; un diagrama roto corta
   con `archivo:línea`. Corre en `bun run verify`, en el hook `pre-commit` y en
   CI, para que no se suba contenido inválido. No renderiza a imagen (eso es a
   demanda, §6).

Esta decisión **reemplaza el entregable de diagrama de #58 y #59**: donde decía
`.dbml + PNG` (dbdiagram.io/postgres.new), dice **Mermaid en el `.md`**.

## Alternativas consideradas

| Alternativa | Por qué no |
|---|---|
| DBML + dbdiagram.io (lo de #58) | GitHub no lo renderiza; exige nube o tooling extra; el PNG no es diffeable y el diagrama no se revisa en el PR. |
| PNG/SVG a mano (draw.io, Excalidraw) | Fuente binaria o XML opaco, no diffeable, se desincroniza del texto en cuanto alguien edita por fuera. |
| Solo Archify | HTML interactivo excelente, pero no cubre ERD ni se renderiza en GitHub; sin diff textual. |
| Kroki como **fuente** | Buen render multi-formato, pero añade un servicio que hay que levantar; se conserva solo como backend de export. |
| Mermaid como base + Archify/drawio como complemento (elegida) | Cubre ERD y todos los tipos, nativo en GitHub, diffeable y offline; los complementos aportan lo que Mermaid no da sin volverse fuente. |

## Consecuencias

- **A favor:** un solo lenguaje para todos los diagramas; cualquiera los ve y
  los revisa **en GitHub**, con el diff textual del PR como revisión.
- **A favor:** cero infraestructura, offline, y el diagrama evoluciona junto con
  el código en el mismo PR.
- **En contra:** Mermaid no permite acomodar cajas a mano ni controla del todo
  el layout; en ERD grandes puede quedar apretado. Se mitiga partiendo por área.
- **En contra:** se abandona el `.dbml` ya iniciado en #58; hay que migrarlo y
  avisar a Emmanuel (dueño) y Erik (revisor). Migración hecha en
  `DIAGRAMA-BD-v0.md`.
- **Riesgo residual:** que GitHub cambie la versión de Mermaid soportada y algún
  diagrama deje de pintar. Se mitiga verificando con el bloque `mermaid info` y
  con export local si hace falta.

## Evidencia

- `docs/ingenieria/DIAGRAMA-BD-v0.md` — el ER de la Fase 1 escrito en Mermaid
  (`erDiagram` por área); el `DIAGRAMA-BD-v0.dbml` se retira en el mismo PR.
- `docs/ingenieria/DIAGRAMAS.md` — el estándar de casa (tipos, estilo, vistas,
  export, complementos) y cómo se verifica que no se rompan.
- `scripts/diagramas-check.ts` — valida los bloques Mermaid; en `verify`, en
  `pre-commit` y en CI. Corrida: `diagramas: 4 bloques, 0 rotos`.
- Pendiente de verificar: render nativo en el PR de #58.

## Qué nos haría revertirla

Si Mermaid no alcanza de forma recurrente para un diagrama que el equipo **tiene
que revisar** (p. ej. un ERD grande que exige layout curado), se reevalúa: o
Kroki pasa a ser la fuente de ese diagrama, o se reintroduce DBML **solo** para
el ERD, sin tocar el resto de los diagramas.
