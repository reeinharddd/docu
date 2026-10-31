# ADR 0017 — El ER de la base de datos se dibuja en draw.io; los flujos siguen en Mermaid

Fecha: 2026-10-19 · Estado: Aceptada · Decide: Erik · Revisa: el equipo

> Aceptada 2026-10-31 por el líder, con el principio de **docs as code**:
> todo diagrama vive dentro del repositorio, en texto, visible, modificable
> y trazable. La fuente del ER sigue siendo el `.drawio`; lo que hace
> trazable el par es el SHA-256 de la fuente declarado en el texto derivado y
> el gate `bun run diagramas:check`.

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

**El ER de la BD se dibuja en draw.io; los demás diagramas siguen en Mermaid.
Todo diagrama vive dentro del repositorio, en texto, visible, modificable y
trazable.**

1. **Fuente del ER.** Un solo archivo `ingenieria/DIAGRAMA-BD-<v>.drawio`, con una
   página por vista (`1a`, `1b`, …). Se versiona en el repositorio: es XML, se
   diffea y se versiona como texto.
2. **Export por página.** Cada página se exporta a
   `ingenieria/diagramas/<documento>-<página>.svg` y el `.md` embebe ese SVG. El
   SVG es **derivado**: no se edita a mano.
3. **Export manual.** Se hace en `app.diagrams.net` (*File → Export as → SVG*) o
   en draw.io Desktop. No hay render automático ni hook de pre-commit para el ER.
4. **Mermaid sigue vigente** para flujos, secuencias, estados, C4 y gantt. El
   check `diagramas:check` y su regla de CI se mantienen.
5. **Se retira** el generador `diagramas:svg` y la dependencia
   `@mermaid-js/mermaid-cli`.
6. **Docs as code: nada fuera del repositorio.** El `.drawio`, el texto derivado
   y los SVG exportados están en el repo. No hay copia en Drive, ni en una
   cuenta de draw.io, ni en un wiki: el diagrama se lee y se modifica con el
   repo abierto.
7. **Trazabilidad verificada, no confiada.** El texto derivado declara el
   SHA-256 de la fuente (`SHA-256 de la fuente: …`) y el gate comprueba tres
   cosas: que el hash siga vigente, que toda tabla del diagrama esté en la
   matriz de clases del texto, y que toda tabla del texto exista en el
   diagrama. Editar el `.drawio` sin actualizar el texto **rompe la CI**: la
   fuente y su lectura no se pueden desincronizar en silencio.
8. **El texto derivado es la lectura, no un resumen.** Las fichas de tabla, las
   clases, los constraints y la trazabilidad regla→constraint viven en el
   `.md`; el `.drawio` solo aporta el layout y las relaciones. Quien lee sin
   draw.io entiende igual el modelo.

## Consecuencias

- **A favor:** layout manual legible, todos los campos visibles, edición con una
  herramienta conocida y sin build.
- **En contra:** GitHub no muestra el `.drawio`; el SVG puede quedar viejo si no
  se re-exporta. Los diffs del `.drawio` y del SVG son XML ruidoso, no texto
  limpio.
- **Mitigación del SVG viejo:** el hash de la fuente es el disparador: si el
  `.drawio` cambia, el gate falla hasta que el texto se actualiza, y la
  re-exportación del SVG es parte de ese mismo cambio.
- **Costo aceptado:** el **layout** exige draw.io; el **modelo** (tablas, campos,
  clases, constraints, trazabilidad) se edita como texto en el `.md` y se
  comprueba contra la fuente.

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
- `docs/ingenieria/DIAGRAMA-BD-v0.md` — texto derivado: convenciones, matriz de
  clases, fichas por tabla, trazabilidad regla→constraint y el SHA-256 de la
  fuente.
- `bun run diagramas:check` — gate: Mermaid válido, XML válido, SVG por página y
  correspondencia fuente↔texto por hash y por tablas.
- `docs/ingenieria/DIAGRAMAS.md` — el estándar de casa para diagramas.
