# ADR 0017 — El ER de la base de datos se dibuja en draw.io; los flujos siguen en Mermaid

Fecha: 2026-10-19 · Estado: Propuesta · Decide: Erik · Revisa: el equipo

## Contexto

ADR-0016 estandarizó los diagramas como Mermaid, con `erDiagram` para la base de
datos. Al dibujar `core` (10 tablas, 22 FKs y todos sus campos) el ER de Mermaid
quedó ilegible:

1. **Sin layout manual.** Mermaid decide las posiciones; con tablas grandes el
   resultado es un muro y las aristas se cruzan. No se pueden agrupar por área ni
   acomodar a mano.
2. **El SVG unión se encoge.** Un ER de 10 tablas ronda los 1 800 px de ancho;
   GitHub lo escala al ancho de la columna y el texto deja de leerse.
3. **El equipo ya usa draw.io.** diagrams.net es la herramienta que el equipo
   conoce y no requiere cuenta ni build para editar.
4. **GitHub no renderiza `.drawio`.** Lo que se ve en el repo es el SVG
   exportado; el `.drawio` es la fuente editable.

## Decisión

**El ER de la BD se dibuja en draw.io; los demás diagramas siguen en Mermaid.**

1. **Fuente del ER.** Un solo archivo `ingenieria/DIAGRAMA-BD-<v>.drawio`, con una
   página por vista (`1a`, `1b`, …). Se versiona en el repositorio.
2. **Export por página.** Cada página se exporta a
   `ingenieria/diagramas/<documento>-<página>.svg` y el `.md` embebe ese SVG. El
   SVG es **derivado**: no se edita a mano.
3. **Export manual.** Se hace en `app.diagrams.net` (*File → Export as → SVG*) o
   en draw.io Desktop. No hay render automático ni hook de pre-commit para el ER.
4. **Mermaid sigue vigente** para flujos, secuencias, estados, C4 y gantt. El
   check `diagramas:check` y su regla de CI se mantienen.
5. **Se retira** el generador `diagramas:svg` y la dependencia
   `@mermaid-js/mermaid-cli`.

## Consecuencias

- **A favor:** layout manual legible, todos los campos visibles, edición con una
  herramienta conocida y sin build.
- **En contra:** GitHub no muestra el `.drawio`; el SVG puede quedar viejo si no
  se re-exporta (lo revisa el PR). Los diffs del `.drawio` y del SVG son XML
  ruidoso, no texto limpio.
- **Costo aceptado:** editar el ER exige draw.io; no se puede hacer desde el
  editor de texto solo.

## Alternativas descartadas

- **Mermaid `erDiagram`** (ADR-0016): sin layout manual y ilegible a esta escala.
- **DBML + PNG**: GitHub no renderiza DBML y el PNG no es diffeable.
- **Solo SVG dibujado a mano**: pierde la edición gráfica; el equipo no lo
  mantiene.
- **Kroki / render automático**: resuelve el render, no el layout.

## Evidencia

- `docs/ingenieria/DIAGRAMA-BD-v0.drawio` — dos páginas con las 10 tablas y sus
  campos.
- `docs/ingenieria/diagramas/DIAGRAMA-BD-v0-1.svg` y `-2.svg` — export de cada
  página, embebidos en `DIAGRAMA-BD-v0.md`.
