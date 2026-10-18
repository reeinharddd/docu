# Core del harness de DOCU — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dar a DOCU el core del harness —la capa que da conocimiento (mapa único + índice vivo de herramientas) y cumplimiento (verificación en cliente y CI)— sin reescribir los documentos vigentes.

**Architecture:** Enfoque A. La metadata vive en la cabecera de cada pieza del harness (`dueno`, `disparador`, `proposito`); un script POSIX (`scripts/harness-check.sh`) la cruza contra `docs/proyecto/EQUIPO.md` y contra `docs/integraciones/CAPACIDADES.md`, y falla en CI. `docs/HARNESS.md` es el mapa de entrada. Nada se duplica entre clientes: paridad = puente documentado.

**Tech Stack:** POSIX `sh`, Bun 1.4.2 (scripts de `package.json`), GitHub Actions, lefthook, Biome.

**Spec:** `docs/superpowers/specs/2026-10-17-harness-core-design.md`

## Global Constraints

- Idioma: docs y comentarios en **español**; código, identificadores y nombres de archivo en **inglés** (AGENTS.md §Reglas 3).
- Sin secretos; solo nombres de variables.
- Commits convencionales, **sin atribución a IA**; lefthook exige `^(feat|fix|docs|chore|refactor|test|ci): .{10,}` (sin scope).
- Un cambio lógico por commit. Nada directo a `main`; rama + PR.
- No se reescriben ADR aceptados ni `README`, `REGLAS`, `HERRAMIENTAS-AGENTE`.
- **Todo doc nuevo en `docs/` debe estar en `docs/.indice`**; regenerar con `bash scripts/doc-index.sh --fix`. Verificar con `bash scripts/doc-index.sh`.
- `dueno` de toda pieza del harness = `reeinharddd` (Erik, dueño del harness según `EQUIPO.md`).
- Campos de metadata, exactos: `dueno`, `disparador`, `proposito`; en vendorizadas además `origen` y `version`.
- `scripts/harness-check.sh`: `#!/bin/sh`, `set -u`, `cd` a la raíz del repo (patrón de `scripts/doc-index.sh`), exit ≠ 0 si hay hallazgos.

## Review Focus

Fallos que el spec implica y que ningún test de tarea cubre por defecto; cada uno recibe su test en la tarea dueña:

1. Pieza **sin** delimitador `---` de frontmatter: el check debe reportarla, no abortar.
2. `dueno:` con un valor que **no** aparece en `EQUIPO.md`: debe fallar.
3. Pieza que existe en disco pero **no** en `CAPACIDADES.md` (huérfana), y entrada del índice **sin** pieza (fantasma): ambas deben fallar.
4. `harness-check.sh` ejecutado **desde otro cwd**: debe funcionar igual (usa `cd "$(dirname "$0")/.."`).
5. Pieza de **vendor** con `origen`/`version` pero sin `dueno` propio distinto: el check exige los mismos 3 campos, sin relajar por vendor.

---

### Task 1: `scripts/harness-check.sh` — verificador de metadata

**Files:**
- Create: `scripts/harness-check.sh`

**Interfaces:**
- Produces: ejecutable `scripts/harness-check.sh`. Salida a stdout con líneas `HALLAZGO: <ruta>: <motivo>`; exit 0 si no hay hallazgos, 1 si hay. Sin argumentos. Descubre piezas con `find` sobre: `.opencode/commands/*.md`, `.opencode/agents/*.md`, `.opencode/skills/*/SKILL.md`, `.opencode/skills/vendor/*/SKILL.md`.
- Consumes (en esta tarea): `docs/proyecto/EQUIPO.md` (para validar `dueno`).

- [ ] **Step 1: Escribir el script (versión que solo valida metadata)**

Contenido funcional: recorrer las rutas con `find`; para cada archivo, leer el bloque entre la primera y la segunda línea `---`; verificar que existan `dueno:`, `disparador:`, `proposito:` (y en vendor `origen:`, `version:`); verificar que el valor de `dueno:` aparezca como subcadena en `EQUIPO.md`. Acumular hallazgos, imprimirlos y salir con 1 si hay alguno; si no, imprimir `harness: N piezas, 0 hallazgos` y salir 0.

- [ ] **Step 2: Ejecutarlo y ver el rojo esperado**

Run: `bash scripts/harness-check.sh`
Expected: exit 1 con `HALLAZGO:` por cada pieza sin `dueno/disparador/proposito` (todas hoy).

Prueba de Review Focus #4 (otro cwd):
Run: `cd /tmp && bash /home/reeinharrrd/projects/personal/docu/scripts/harness-check.sh`
Expected: mismo resultado que desde la raíz (comprueba el `cd` interno).

Prueba de Review Focus #1 (sin frontmatter): crear temporal `printf 'sin frontmatter\n' > .opencode/commands/_tmp.md`, correr el check y confirmar `HALLAZGO: .opencode/commands/_tmp.md`; luego borrarlo con `mv .opencode/commands/_tmp.md /tmp/`.

- [ ] **Step 3: Commit**

```bash
git add scripts/harness-check.sh
git commit -m "chore: agrega harness-check para verificar metadata del harness"
```

---

### Task 2: Metadata viva en todas las piezas del harness

**Files:**
- Modify: `.opencode/commands/adr.md`, `brief.md`, `cerrar.md`, `estado.md`, `inicio.md`, `tarea.md`
- Modify: `.opencode/agents/explorador.md`, `.opencode/agents/revisor.md`
- Modify: `.opencode/skills/docu-documentar/SKILL.md`, `docu-gestion/SKILL.md`, `docu-memoria/SKILL.md`
- Modify: `.opencode/skills/vendor/ecc-angular-developer/SKILL.md`, `ecc-nestjs-patterns/SKILL.md`, `ecc-prisma-patterns/SKILL.md`, `pp-code-reviewer/SKILL.md`

**Interfaces:**
- Consumes: `scripts/harness-check.sh` (Task 1).
- Produces: cada pieza con `dueno: reeinharddd`, `disparador: <cuándo>`, `proposito: <una frase>` en su frontmatter; en vendor además `origen: <repo + commit>` (tomado de `.opencode/skills/vendor/UPSTREAMS.json`) y `version: <tag/commit>`.

- [ ] **Step 1: Añadir los campos a las 15 piezas**

En cada archivo, insertar dentro del bloque `---` existente (no crear un segundo bloque) los campos nuevos. `dueno` siempre `reeinharddd`. `disparador` en una línea corta (ej. para `cerrar.md`: "al cerrar el trabajo de la rama"). `proposito` una frase. En vendor, copiar `origen`/`version` desde `UPSTREAMS.json`.

- [ ] **Step 2: Verificar en verde**

Run: `bash scripts/harness-check.sh`
Expected: `harness: 15 piezas, 0 hallazgos`, exit 0.

Prueba de Review Focus #2 (dueño inexistente): editar temporalmente `dueno: reeinharddd` → `dueno: nadie` en un comando, correr el check y confirmar que falla; revertir.

Prueba de Review Focus #5 (vendor): confirmar que un `SKILL.md` de vendor es reportado si se le quita `disparador`; revertir.

- [ ] **Step 3: Commit**

```bash
git add .opencode
git commit -m "chore: declara dueno, disparador y proposito en las piezas del harness"
```

---

### Task 3: `docs/integraciones/CAPACIDADES.md` — índice vivo + cruce

**Files:**
- Create: `docs/integraciones/CAPACIDADES.md`
- Modify: `scripts/harness-check.sh`
- Modify: `docs/.indice` (regenerar)

**Interfaces:**
- Consumes: piezas de Task 2.
- Produces: tabla(s) con encabezado fijo `| Pieza | Tipo | Dueño | Disparador | Propósito | Origen/Versión | Estado |`. `Pieza` = ruta repo-relativa de la pieza. El check gana un segundo bloque: toda pieza descubierta debe aparecer en esa columna (huérfana) y toda fila debe existir en disco (fantasma).

- [ ] **Step 1: Escribir `CAPACIDADES.md`**

Una tabla por tipo: comandos, skills propias, skills vendorizadas, subagentes, MCP, scripts. Una fila por pieza con los datos reales. Encabezado con estado/última actualización y la nota: "Índice vivo; si falta una pieza, gana el archivo y se corrige el índice".

- [ ] **Step 2: Extender `harness-check.sh` con el cruce**

Leer la columna 1 de `CAPACIDADES.md` (líneas que empiezan con `| ` y no son encabezado/separador); comparar con el conjunto de piezas de disco. Reportar huérfanas y fantasmas.

- [ ] **Step 3: Verificar verde y rojos de Review Focus #3**

Run: `bash scripts/harness-check.sh` → `harness: N piezas, 0 hallazgos`.
Quitar temporalmente una fila de `CAPACIDADES.md` → debe salir `HALLAZGO: ... huérfana`; revertir. Añadir una fila con ruta inexistente → `HALLAZGO: ... fantasma`; revertir.

- [ ] **Step 4: Regenerar índice y commit**

Run: `bash scripts/doc-index.sh --fix && bash scripts/doc-index.sh`
```bash
git add docs/integraciones/CAPACIDADES.md docs/.indice scripts/harness-check.sh
git commit -m "docs: agrega CAPACIDADES.md como indice vivo del harness"
```

---

### Task 4: `docs/HARNESS.md` — el mapa

**Files:**
- Create: `docs/HARNESS.md`
- Modify: `AGENTS.md` (raíz) — enlace en la iniciación
- Modify: `docs/README.md` — ruta en la tabla
- Modify: `docs/.indice`

**Interfaces:**
- Consumes: `CAPACIDADES.md` (Task 3), `EQUIPO.md`, `PLAN-EPICAS.md`, `README.md`.
- Produces: documento con secciones 1–6 de `spec §6` (propósito y las dos lecturas, cuadro rol→flujo→herramienta→dueño→cadencia, los dos ciclos, puntos de autoridad —enlace a `README.md`—, runbook de evolución, puente multi-cliente).

- [ ] **Step 1: Escribir `HARNESS.md`**

Cumplir las 6 secciones del spec. El cuadro de roles incluye una fila por persona de `EQUIPO.md` y por subagente. Los ciclos enlazan `gestion/PLAN-EPICAS.md`. El runbook da, por cada operación (alta/baja/bump/deprecación), quién aprueba, cómo se documenta y cómo se verifica.

- [ ] **Step 2: Enlazar y verificar**

Añadir la ruta a la tabla de `docs/README.md` y una línea en `AGENTS.md` (§Iniciación: "empieza por `docs/HARNESS.md`").
Run: `bash scripts/doc-index.sh --fix && bash scripts/doc-index.sh && bash scripts/docs-linkcheck.sh`
Expected: índice sin discrepancias; links en verde.

- [ ] **Step 3: Commit**

```bash
git add docs/HARNESS.md AGENTS.md docs/README.md docs/.indice
git commit -m "docs: agrega HARNESS.md como mapa del harness y punto de entrada"
```

---

### Task 5: ADR del core del harness

**Files:**
- Create: `docs/decisiones/ADR-00NN-core-del-harness.md` (NN = siguiente libre)
- Modify: `docs/decisiones/README.md` (fila del índice)
- Modify: `docs/README.md` (conteo de ADRs)
- Modify: `docs/.indice`

**Interfaces:**
- Consumes: `docs/plantillas/ADR.md` (formato), `spec`.
- Produces: ADR con `Estado: Aceptada`, que fija: core de conocimiento + cumplimiento; enforcement a la par (cliente + CI); paridad = puente documentado; metadata viva; enfoque A con B como upgrade.

- [ ] **Step 1: Verificar el número libre**

Run: `bash scripts/doc-index.sh` y revisar `docs/decisiones/` para el siguiente `NNNN` libre.

- [ ] **Step 2: Escribir la ADR desde la plantilla**

`Estado: Aceptada`; cuerpo según `plantillas/ADR.md`; enuncia alternativas descartadas (B manifest, C mínimo) y el costo aceptado (mantener metadata).

- [ ] **Step 3: Actualizar índices y verificar**

Añadir la fila en `docs/decisiones/README.md` y ajustar el conteo en `docs/README.md`.
Run: `bash scripts/doc-index.sh --fix && bash scripts/doc-index.sh && bash scripts/docs-linkcheck.sh`
Expected: verde.

- [ ] **Step 4: Commit**

```bash
git add docs/decisiones docs/README.md docs/.indice
git commit -m "docs: acepta ADR del core del harness (conocimiento y cumplimiento)"
```

---

### Task 6: `EQUIPO.md` — dueños de herramientas

**Files:**
- Modify: `docs/proyecto/EQUIPO.md`

**Interfaces:**
- Produces: sección "Propiedad de las herramientas del harness" con la misma forma que la tabla de documentos (Herramienta | Dueño), cubriendo comandos, skills, subagentes, MCP y scripts; y la nota de que el valor de `dueno:` en cada pieza debe existir aquí.

- [ ] **Step 1: Añadir la sección**

Tabla con las piezas del harness (mismo conjunto que `CAPACIDADES.md`) y dueño `Erik` para todas, coherente con `dueno: reeinharddd`.

- [ ] **Step 2: Verificar**

Run: `bash scripts/harness-check.sh && bash scripts/docs-linkcheck.sh`
Expected: verde.

- [ ] **Step 3: Commit**

```bash
git add docs/proyecto/EQUIPO.md
git commit -m "docs: declara los duenos de las herramientas del harness"
```

---

### Task 7: Cumplimiento en CI y en `verify`/`doctor`

**Files:**
- Modify: `.github/workflows/ci.yml`
- Modify: `package.json`
- Modify: `scripts/doctor.sh`

**Interfaces:**
- Consumes: `scripts/harness-check.sh`.
- Produces: `harness-check` corre en CI y en `bun run verify` (y se reporta en `doctor`).

- [ ] **Step 1: Añadir a `package.json`**

Agregar script `"harness:check": "bash scripts/harness-check.sh"` y encadenarlo en `verify` (al inicio, junto a `doc-index.sh`).

- [ ] **Step 2: Enchufar en `ci.yml`**

Añadir el paso que corre `bun run harness:check` en el job que ya ejecuta la verificación de docs (reusa el runner y el checkout existentes).

- [ ] **Step 3: Reportar en `doctor.sh`**

Añadir la invocación de `harness-check` al diagnóstico, con su resultado.

- [ ] **Step 4: Verificar**

Run: `bun run verify`
Expected: verde, incluyendo `harness: N piezas, 0 hallazgos`.
Run: `bun run doctor` → reporta el check.

- [ ] **Step 5: Commit**

```bash
git add package.json .github/workflows/ci.yml scripts/doctor.sh
git commit -m "ci: exige harness-check en verify y en el flujo de integracion"
```

---

### Task 8: Cumplimiento en el cliente (comandos)

**Files:**
- Modify: `.opencode/commands/inicio.md`
- Modify: `.opencode/commands/cerrar.md`

**Interfaces:**
- Consumes: `HARNESS.md` (Task 4), `harness-check` (Task 7).
- Produces: `/inicio` manda leer `HARNESS.md`; `/cerrar` añade `bun run harness:check` antes de commitear.

- [ ] **Step 1: Editar `/inicio`**

Insertar paso: leer `docs/HARNESS.md` como mapa (además de `README.md`).

- [ ] **Step 2: Editar `/cerrar`**

En el paso de verificación, añadir `bash scripts/harness-check.sh` junto a `doc-index.sh`.

- [ ] **Step 3: Verificar y commit**

Run: `bash scripts/harness-check.sh`
```bash
git add .opencode/commands/inicio.md .opencode/commands/cerrar.md
git commit -m "chore: ata los comandos de inicio y cierre al core del harness"
```

---

### Task 9: Catálogo puntual de capacidades

**Files:**
- Create: `docs/integraciones/CATALOGO-2026-10-17.md`
- Modify: `docs/.indice`

**Interfaces:**
- Consumes: `.opencode/skills/vendor/UPSTREAMS.json`, `docs/integraciones/HERRAMIENTAS-AGENTE.md` (los 7 criterios), fuente de stars/bookmarks del usuario, búsqueda online.
- Produces: tabla candidato→repo, licencia, commit, tarea del ciclo que cubre, veredicto (adoptar / esperar / rechazar) y motivo.

- [ ] **Step 1: Reunir candidatos**

`gh api user/starred --paginate` (solo lectura); ubicación de bookmarks (confirmar con el usuario: archivo local, export del navegador o solo stars+online); búsqueda online para huecos del ciclo sin candidato.

- [ ] **Step 2: Evaluar con los 7 criterios**

Aplicar los criterios de `HERRAMIENTAS-AGENTE.md` a cada candidato; escribir veredicto y, si "adoptar", la tarea del ciclo que cubre. Los candidatos no adoptados **no** entran al índice central.

- [ ] **Step 3: Registrar y verificar**

Run: `bash scripts/doc-index.sh --fix && bash scripts/doc-index.sh && bash scripts/docs-linkcheck.sh`
Expected: verde.

- [ ] **Step 4: Commit**

```bash
git add docs/integraciones/CATALOGO-2026-10-17.md docs/.indice
git commit -m "docs: catalogo puntual de herramientas candidatas para el harness"
```

---

## Verificación final

- [ ] `bun run verify` en verde (incluye `harness:check`, `doc-index`, links, trace, smoke).
- [ ] **Prueba a ciegas:** un agente sin contexto resuelve una tarea real usando solo `docs/HARNESS.md` + `docs/integraciones/CAPACIDADES.md`.
- [ ] `.indice` regenerado y sin discrepancias.
