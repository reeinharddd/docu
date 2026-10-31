# Ingeniería: estándar de diagramas

Estado: vigente (2026-10-19). Dueño: Erik. Revisor: el equipo.
Decisiones que lo sostienen: `decisiones/ADR-0016-diagramas-como-texto-mermaid.md`
y `decisiones/ADR-0017-drawio-para-el-er.md`.

Regla base: **el ER de la base de datos vive en draw.io (`.drawio`) y el resto de
diagramas es texto Mermaid dentro de un `.md`**. Mermaid se revisa como diff y
GitHub lo pinta solo. draw.io se usa donde el layout manual importa: el ER.

## 1. Tipos permitidos y para qué

| Tipo | Herramienta | Cuándo | Dónde vive |
|---|---|---|---|
| ER de BD | **draw.io** | esquema de base de datos | `ingenieria/DIAGRAMA-BD-*.drawio` |
| `flowchart` | Mermaid | proceso, flujo, tubería | `ingenieria/*.md`, `proceso/` |
| `sequenceDiagram` | Mermaid | llamadas API → cola → worker | `ingenieria/API.md`, `COLAS.md` |
| `stateDiagram-v2` | Mermaid | ciclos de vida | `ingenieria/*.md` |
| `C4Context` / `C4Container` | Mermaid | arquitectura de alto nivel | `ingenieria/ARQUITECTURA.md` |
| `gantt` | Mermaid | plan por fechas | `gestion/PLAN-EPICAS.md` |
| `mindmap` | Mermaid | exploración, no entregable | spec/plan de la tarea |

Fuera de esta lista: se justifica en el PR y, si es recurrente, se suma aquí.

## 2. Estilo de casa

### Mermaid

Todo diagrama abre con el mismo bloque `init`, para que se vean igual:

```text
%%{init: {
  "theme": "base",
  "themeVariables": {
    "fontSize": "14px",
    "fontFamily": "system-ui, sans-serif",
    "lineColor": "#64748b",
    "primaryColor": "#eef2ff",
    "primaryBorderColor": "#6366f1",
    "primaryTextColor": "#1e293b"
  }
} }%%
```

### draw.io

- **Ids en inglés, etiquetas en español** (regla del repo: inglés en código,
  español en docs). Tablas y campos en inglés; los verbos de relación, en español.
- **Color por clase de dato**, el mismo del resto del repo: fija azul
  (`#dbeafe`/`#2563eb`), dinámica verde (`#dcfce7`/`#16a34a`), cargable violeta
  (`#ede9fe`/`#7c3aed`), manual ámbar (`#fef3c7`/`#d97706`), append-only rojo.
- **Una página por área** (`1a`, `1b`, …), nunca un lienzo gigante. Las tablas de
  otra página que hagan falta como contexto se dibujan punteadas.
- **Cada tabla muestra sus campos y su PK/FK**; el porqué de cada campo vive en la
  ficha del documento, no en el diagrama.

## 3. Cómo se ve

- **Mermaid en GitHub**, sin hacer nada: `.md`, issues, PR, wiki y discussions.
- **draw.io**: GitHub **no** renderiza `.drawio`; lo que se ve es el SVG exportado
  y embebido en el `.md`. El `.drawio` se abre en `app.diagrams.net` o en la
  extensión de VS Code / draw.io Desktop.
- **En VS Code / Neovim**: preview de Markdown (para Mermaid) y el editor de
  draw.io para el ER.

Para saber qué versión de Mermaid soporta GitHub, un bloque de una línea:

```mermaid
info
```

Escribir solo sintaxis de esa versión o inferior, para que no truene en la web.

## 4. Export del ER: `.drawio` + SVG por página

El ER se dibuja en un solo archivo `ingenieria/DIAGRAMA-BD-<v>.drawio` con una
página por vista. Por cada página se exporta un SVG:

```text
docs/ingenieria/DIAGRAMA-BD-v0.drawio
docs/ingenieria/diagramas/DIAGRAMA-BD-v0-1.svg   # página 1a
docs/ingenieria/diagramas/DIAGRAMA-BD-v0-2.svg   # página 1b
```

- **La fuente es el `.drawio`.** El SVG es derivado: se edita el diagrama y se
  re-exporta; nunca se edita el SVG a mano.
- **Export reproducible** (recomendado): `bun run diagramas:drawio` re-exporta
  todas las páginas con draw.io Desktop headless en Docker
  (`rlespinasse/drawio-desktop-headless`). Requiere Docker; no corre en `verify`.
- **Export manual**: en `app.diagrams.net`, *File → Export as → SVG* por página,
  y se sobreescribe el SVG correspondiente. No hay render automático en el repo.
- El `.md` embebe cada SVG con una imagen relativa a `diagramas/<archivo>.svg`.
- Si cambia una tabla o una FK, en el mismo PR van el `.drawio` y el SVG
  re-exportado.

## 5. Complementos (no fuente)

Cuando Mermaid no baste, se usa un complemento y se adjunta el resultado; el
diagrama fuente sigue siendo el Mermaid o el documento.

| Herramienta | Para qué | Nota |
|---|---|---|
| **Archify** (`tt-a1i/archify`) | HTML interactivo: zoom, búsqueda de nodos, before/after | arquitectura/flujo/secuencia, **no** ERD |
| **Kroki** | render bajo demanda | opcional, self-host |

## 6. Cómo se garantiza que no se rompan

Nada de diagramas Mermaid rotos llega al repo: `scripts/diagramas-check.ts`
extrae **cada bloque ` ```mermaid `** de los `.md` (y cada `.mmd`) y lo pasa por el
parser de Mermaid. Si alguno falla, corta con `archivo:línea` y el motivo.

- **Manda el repo, no la memoria**: es la misma verificación en local y en el
  servidor (como `doc-index`).
- **Local:** corre en `bun run verify` y en el hook `pre-commit` cuando cambia un
  `.md`/`.mmd`.
- **Servidor:** corre en CI (`.github/workflows/ci.yml`), así que un PR con un
  diagrama roto no pasa.
- **draw.io:** `diagramas:check` valida que cada `.drawio` sea XML válido, que
  tenga páginas y que **cada página tenga su SVG exportado** (y que no quede un
  SVG huérfano sin página). Que el SVG corresponda a la última edición se cierra
  con `bun run diagramas:drawio` antes de subir.
- **Qué detecta Mermaid:** sintaxis inválida, paréntesis/línea mal, tipo de
  diagrama desconocido. **Qué no detecta:** features nuevas que GitHub aún no
  soporta; para eso rige la lista de tipos permitidos (§1) y, si se duda, se
  prueba en GitHub antes del PR.

Comandos:

```sh
bun run diagramas:check    # Mermaid + páginas del .drawio ↔ SVG (sin Docker)
bun run diagramas:drawio   # re-exporta los SVG de todos los .drawio (Docker)
```

## 7. Checklist antes del PR

- [ ] El ER está en `.drawio` con una página por área y sus SVG re-exportados.
- [ ] Los flujos están en Mermaid dentro de un `.md` (o `.mmd`).
- [ ] Mermaid abre con el bloque `init` de la casa.
- [ ] Si no cabe, está partido por área con su índice.
- [ ] Ids en inglés, etiquetas en español.
- [ ] Cada tabla del ER muestra campos y PK/FK; el porqué está en la ficha.
- [ ] El SVG embebido existe y se ve (no es un archivo viejo).
