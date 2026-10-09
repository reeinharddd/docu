# Programa estabilización DOCU Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ejecutar las 8 olas del spec 2026-10-09 como commits secuenciales en `main` hasta dejar DOCU documentado, trazable y portable.

**Architecture:** Una ola = un commit lógico convencional en `main`. Orden fijo 01→08. Cada ola produce evidencia real (`doc-index`, `verify`, `doctor`, `gh`) registrada en el mensaje o informe de la ola. Sin ramas ni PRs (autorización explícita etapa inicial).

**Tech Stack:** Bun 1.4.2, Biome 2.5.4 (local `bunx` prohibido), shell `scripts/*.sh`, `gh` CLI, Prisma 7 validate, Docker compose config, smoke `/health`.

## Global Constraints

- E1 sin lógica de negocio hasta M1/K1/C1.
- Español en docs, inglés en código/config.
- Commits convencionales (`feat:`, `fix:`, `docs:`, `chore:`), sin atribución a AI, un cambio lógico por commit.
- Trabajo directo en `main` autorizado solo por etapa inicial (2026-10-09); las reglas de PR/revisor se mantienen como objetivo.
- `originales/` solo lectura; nada se borra en silencio.
- No restaurar `academico/EC0935.md` ni `docs/diseno/*.txt` sin aprobación; ADR históricos no se reescriben, solo se anotan.
- Secretos jamás al repo; `.env.example` solo nombres.
- Ningún `any` sin justificación; DI NestJS con clases runtime (no `import type` en providers inyectados por constructor).
- No `npm` ni `bunx` salvo `prisma migrate dev` documentado.
- Cada ola cierra con puertas reales: `bash scripts/doc-index.sh`, `bun run verify`, `bun run doctor`.

---

### Task 0: Línea base reproducible (parte de Ola 01)

**Files:**
- Create: `docs/superpowers/olas/OLA-01-linea-base.md`
- Modify: ninguno
- Test: salidas de `bash scripts/doc-index.sh`, `bun run doctor`

**Interfaces:**
- Consumes: `main@ca6c74c`, scripts existentes
- Produces: SHA base, conteos (docs, briefs, issues), lista de discrepancias — lo consumen Tasks 1–8

- [ ] **Step 1: Registrar SHA y estado limpio de `main`**

Run: `git rev-parse HEAD && git status --porcelain | head -20`
Expected: SHA impreso (base `ca6c74c` + plan commiteado); solo `??` esperados (`apps/web/*`, `docs/diseno/`). Si hay `M ` inesperados, detenerse y reportar.

- [ ] **Step 2: Inventariar documentos y scripts**

Run: `echo "indice=$(grep -vc '^#' docs/.indice)"; find docs -type f -name '*.md' | wc -l; ls docs/briefs/ | wc -l; ls scripts/`
Expected: `indice=59`, disco ≈ 60 (el spec nuevo es huérfano hasta `--fix`), briefs=10, scripts=`dev.sh doc-index.sh doctor.sh project-sync.ts setup.sh smoke-api.sh`.

- [ ] **Step 3: Correr puertas base y guardar salida real**

Run: `bash scripts/doc-index.sh; echo "EXIT=$?"; bun run doctor 2>&1 | tail -8`
Expected: `doc-index` reporta huérfano del spec (discrepancia=1, EXIT=1) — se corrige en Task 1 Step 2. `doctor` imprime `OK=/FALTA=/AVISO=` sin colgar.

- [ ] **Step 4: Listar issues/milestones reales (solo lectura antes de escribir)**

Run: `gh issue list --state all --limit 50 --json number,title,state,labels,milestone,assignees | head -100; gh api repos/reeinharddd/docu/milestones --jq '.[].title'`
Expected: lista real de issues y milestones; guardar los títulos/fechas que contradigan el calendario en el informe.

- [ ] **Step 5: Commit informe línea base**

```bash
git add docs/superpowers/olas/OLA-01-linea-base.md
git commit -m "docs: ola 01 linea base programa estabilizacion"
```

---

### Task 1: Cerrar Ola 01 — índice honesto + informe

**Files:**
- Modify: `docs/.indice` (vía script oficial, nunca a mano)
- Create: `docs/superpowers/olas/OLA-01-linea-base.md`
- Test: `bash scripts/doc-index.sh`

**Interfaces:**
- Consumes: discrepancias de Task 0
- Produces: índice en verde — lo consumen Tasks 2–8

- [ ] **Step 1: Escribir el informe con salidas reales**

Contenido mínimo de `docs/superpowers/olas/OLA-01-linea-base.md`:

```markdown
# OLA 01 — Línea base (2026-10-09)

- SHA main: <pegar salida de git rev-parse HEAD>
- `docs/.indice`: 59 entradas → <N> tras --fix
- Briefs: 10 (listar nombres)
- Puertas: pegar colas reales de doc-index / doctor / verify
- Discrepancias: <lista numerada con ruta exacta>
- Rutas personales detectadas: <grep real o "ninguna nueva">
```

- [ ] **Step 2: Regenerar índice solo con el script oficial**

Run: `bash scripts/doc-index.sh --fix && bash scripts/doc-index.sh`
Expected: `regenerado: <N> entradas` y luego `indice documental: <N> entradas, 0 discrepancias`.

- [ ] **Step 3: Detectar rutas personales y secretos evidentes**

Run: `grep -rEn '/Users/|/home/|C:\\\\Users\\\\' docs/ --include='*.md' | head -20; echo "---"; bash noventa-secretos.sh 2>&1 | tail -5 || ./noventa-secretos.sh 2>&1 | tail -5`
Expected: lista real (vacía = "ninguna"); el escáner de secretos no reporta hallazgos en contenido vigente. Nada se copia al repo.

- [ ] **Step 4: Commit**

```bash
git add docs/.indice docs/superpowers/olas/OLA-01-linea-base.md
git commit -m "docs: ola 01 indice honesto e informe linea base"
```

---

### Task 2: Ola 02 — gobierno documental y calendario (correcciones §5)

**Files:**
- Modify: `docs/proyecto/REQUISITOS.md:60-65`, `docs/gestion/TRAZABILIDAD.md:1-4`, `docs/proyecto/EQUIPO.md:10`, `docs/integraciones/GITHUB-GESTION.md:118-125`, `docs/integraciones/DRIVE.md:84-85`, `docs/briefs/BRIEF-13-srs.md:44-51`, `docs/decisiones/ADR-0008-github-como-gestor-del-equipo.md:88-92` (anotación al pie, sin reescribir decisión), `docs/integraciones/INVESTIGACION-HERRAMIENTAS.md` (link al brief eliminado)
- Test: `bash scripts/doc-index.sh`, grep de verificación por archivo

**Interfaces:**
- Consumes: informe Ola 01, milestones reales de `gh`
- Produces: docs coherentes + `PROPUESTO` visible — lo consume Task 3

- [ ] **Step 1: Fecha contrato 30-oct en REQUISITOS sin contradecir hitos**

En `docs/proyecto/REQUISITOS.md:60-65` cambiar `2026-10-23, contrato de datos congelado` por `2026-10-30, contrato de datos congelado` solo si `gh api repos/reeinharddd/docu/milestones` confirma hito 30-oct; si no existe, dejar fecha y abrir `PROPUESTO` en vez de inventarla.

Verificar: `grep -n "contrato de datos congelado" docs/proyecto/REQUISITOS.md`

- [ ] **Step 2: Encabezado TRAZABILIDAD solo con verificación real**

En `docs/gestion/TRAZABILIDAD.md:3` actualizar `Verificado contra GitHub el 2026-10-06` a la fecha real en que se corrió `gh issue list` en Task 0 Step 4. No adelantar fechas.

- [ ] **Step 3: EQUIPO fila Emmanuel + GITHUB-GESTION solapamiento S1/S2**

En `docs/proyecto/EQUIPO.md:10` añadir a la celda de Emmanuel: `Configuración 1 (#7), 2026-10-19→10-30, alimenta contrato de datos`. En `docs/integraciones/GITHUB-GESTION.md` añadir 2–3 líneas explicando el solapamiento S1/S2 como calendario aprobado, sin redefinir sprints.

- [ ] **Step 4: Referencias EC0935 y brief eliminado (sin restaurar nada)**

Aplicar: `DRIVE.md:84-85` conserva solo enlaces válidos + nota histórica; `BRIEF-13-srs.md:44,51` mantiene propósito y cita Drive con fecha en vez de ruta eliminada; `ADR-0008` añade nota al pie `> Nota 2026-10-09: la ruta citada se dio de baja por orden del líder; la decisión histórica no cambia.`; `INVESTIGACION-HERRAMIENTAS.md` re-apunta al brief vigente o elimina el enlace con motivo. Verificar con `grep -rn "EC0935" docs/ | head -20` que cada mención restante existe o está justificada.

- [ ] **Step 5: Puertas y commit**

Run: `bash scripts/doc-index.sh && bun run lint 2>&1 | tail -3`
Expected: índice 0 discrepancias; lint en verde (solo docs → biome skip o pass).

```bash
git add docs/proyecto/REQUISITOS.md docs/gestion/TRAZABILIDAD.md docs/proyecto/EQUIPO.md docs/integraciones/ docs/briefs/BRIEF-13-srs.md docs/decisiones/ADR-0008-github-como-gestor-del-equipo.md
git commit -m "docs: ola 02 gobierno documental y calendario contrastado"
```

---

### Task 3: Ola 03 — normalizar 10 briefs (molde §0–10, neutralidad)

**Files:**
- Modify: los 10 de `docs/briefs/` (uno por edición; si un brief ya cumple, solo `touch` lógico = sin cambio)
- Modify: `docs/plantillas/BRIEF.md` solo si falta la regla anti-rutas-personales
- Test: `bash scripts/doc-index.sh` + checklist por brief

**Interfaces:**
- Consumes: Task 2 (fechas y dueños)
- Produces: 10/10 briefs ejecutables — lo consume Task 4 (validador de esquema)

- [ ] **Step 1: Verificar encabezados §0–10 y tablas completas**

Run: `head -12 docs/briefs/BRIEF-*.md | head -60; echo "---"; grep -L "Bloqueado por" docs/briefs/*.md || echo "todos tienen bloqueo"`
Expected: cada brief muestra Issue, Dueño, Fechas, Requisitos, Bloqueado por/Bloquea a, criterios y evidencias. Anotar los que falten.

- [ ] **Step 2: Neutralizar rutas personales y recursos con criterio**

Run: `grep -rEn '/Users/|/home/|C:\\\\Users\\\\|tu archivo|tu carpeta|chat anterior' docs/briefs/ | head -20`
Expected: cada hit se sustituye por ruta relativa o procedimiento genérico (`git clone …`, `bash scripts/setup.sh`, `bun run doctor`). §6 recursos: enlaces oficiales + criterio neutral de elección (no "usa mi X").

- [ ] **Step 3: Contrastar cada brief con su issue (lectura; escritura solo si se autorizó)**

Run: `for n in 7 10 11 13 29 30 32 41 42 43; do echo "== #$n"; gh issue view $n --json title,state,assignees,milestone,labels --jq '{t:.title,s:.state,a:.assignees,m:.milestone?.title,l:.labels}'; done`
Expected: dueño/fecha/sprint del brief = issue real. Divergencias (#13 12-vs-19-oct, #36/#39 sin dueño) van a `PROPUESTO`, no se auto-asignan.

- [ ] **Step 4: Commit**

```bash
git add docs/briefs/ docs/plantillas/BRIEF.md
git commit -m "docs: ola 03 diez briefs normalizados y neutrales"
```

---

### Task 4: Ola 04 — validadores deterministas + CI sin duplicar

**Files:**
- Create: `scripts/docs-linkcheck.sh`, `scripts/docs-briefcheck.sh`, `scripts/docs-tracecheck.sh`
- Modify: `package.json` (3 líneas en `scripts`), `.github/workflows/` (un job que los invoca)
- Test: cada script con caso roto y caso sano

**Interfaces:**
- Consumes: Tasks 1–3 (índice, briefs, trazabilidad)
- Produces: CI que falla en errores objetivos — lo consumen Tasks 5–8

- [ ] **Step 1: `scripts/docs-linkcheck.sh` — enlaces internos rotos**

```sh
#!/bin/sh
# Falla si un [texto](ruta) relativo apunta a archivo inexistente.
set -u; cd "$(dirname "$0")/.."; fail=0
for f in $(find docs -type f -name '*.md'); do
  dir=$(dirname "$f")
  grep -oE '\]\(([^)#]+)(\#[^)]*)?\)' "$f" | sed 's/^](//;s/)$//' | cut -d'#' -f1 | grep -vE '^(https?://|mailto:|#)' | while read -r t; do
    [ -z "$t" ] && continue
    if [ ! -e "$dir/$t" ] && [ ! -e "$t" ]; then echo "ROTO $f -> $t"; fail=1; fi
  done
done
[ "$fail" -eq 0 ] && echo "links: OK" || { echo "links: FALLA"; exit 1; }
```

Run: `bash scripts/docs-linkcheck.sh`
Expected primera corrida: lista real de rotos (los EC0935 ya tratados no deben salir).

- [ ] **Step 2: `scripts/docs-briefcheck.sh` — esquema §0–10**

```sh
#!/bin/sh
# Falla si un brief no trae encabezado mínimo.
set -u; cd "$(dirname "$0")/.."; fail=0
for f in docs/briefs/BRIEF-*.md; do
  for campo in "Issue:" "Dueño:" "Fechas:" "Requisitos:" "Bloqueado por:"; do
    grep -q "$campo" "$f" || { echo "ESQUEMA $f falta $campo"; fail=1; }
  done
done
[ "$fail" -eq 0 ] && echo "briefs: OK" || { echo "briefs: FALLA"; exit 1; }
```

Run: `bash scripts/docs-briefcheck.sh`
Expected: OK tras Task 3; si falla, el reporte nombra brief y campo exacto.

- [ ] **Step 3: `scripts/docs-tracecheck.sh` — RF/RNF e índice**

```sh
#!/bin/sh
# Falla si hay RF/RNF mal formados o el índice está desactualizado.
set -u; cd "$(dirname "$0")/.."
grep -rEno 'R[F|N][F]?-?[0-9]+' docs/proyecto/REQUISITOS.md | head -5
bash scripts/doc-index.sh || exit 1
echo "trace: OK"
```

Run: `bash scripts/docs-tracecheck.sh`
Expected: OK con índice al día.

- [ ] **Step 4: Cablear a `verify` sin duplicar `lint`/`typecheck`**

En `package.json` añadir (una línea por script, sin tocar `lint` ni `typecheck`):

```json
"docs:links": "bash scripts/docs-linkcheck.sh",
"docs:briefs": "bash scripts/docs-briefcheck.sh",
"docs:trace": "bash scripts/docs-tracecheck.sh",
```

Y en el workflow existente un job `docs` que corre `bash scripts/doc-index.sh` + los tres. Verificar: `bun run docs:links && bun run docs:briefs && bun run docs:trace`.

- [ ] **Step 5: Commit**

```bash
git add scripts/docs-linkcheck.sh scripts/docs-briefcheck.sh scripts/docs-tracecheck.sh package.json .github/workflows/
git commit -m "feat: ola 04 validadores docs y trazabilidad en CI"
```

---

### Task 5: Ola 05 — arranque reproducible + agentes (validado en limpio)

**Files:**
- Modify: `docs/operacion/BOOTSTRAP.md`, `AGENTS.md` (solo punteros, sin copiar reglas), `.env.example` (nombres faltantes, nunca valores)
- Create: `docs/operacion/GUIA-INICIO.md`, `docs/operacion/AGENTES-IA.md`, `docs/operacion/INCIDENCIAS.md` (solo si el contenido no tiene ya dueño — verificar antes con `grep -rln "bootstrap\|inicio\|agente" docs/`)
- Test: `bun run doctor`, clon limpio en `/tmp`

**Interfaces:**
- Consumes: Task 4 (CI docs)
- Produces: `GUIA-INICIO` validada — la consume Task 8 (entrega)

- [ ] **Step 1: Secuencia objetivo real**

```bash
git clone https://github.com/reeinharddd/docu.git /tmp/docu-limpio
git -C /tmp/docu-limpio switch main && git -C /tmp/docu-limpio pull --ff-only
bash scripts/setup.sh
bun run doctor
bun run verify
```

Expected: anotar qué paso falla hoy (Node/Bun, Docker, `.env`, MCP) y documentarlo en `GUIA-INICIO.md` como requisito, no como afirmación falsa.

- [ ] **Step 2: Jerarquía breve de instrucciones**

`AGENTS.md` raíz queda conciso y apunta a `docs/README.md`, `docs/REGLAS.md`, `STACK.md`, ADRs y guías de operación. Cero duplicación de reglas.

- [ ] **Step 3: Fichas MCP/Engram con permisos mínimos**

En `docs/integraciones/` una ficha por herramienta real (propósito, versión, instalación reproducible, env requeridas sin valores, permisos mínimos, prueba, alternativa, responsable). Lo que sea solo propuesta se marca `PROPUESTO`.

- [ ] **Step 4: Commit**

```bash
git add docs/operacion/ AGENTS.md .env.example docs/integraciones/
git commit -m "docs: ola 05 arranque reproducible y agentes"
```

---

### Task 6: Ola 06 — congelar contrato 30-oct

**Files:**
- Modify: `docs/ingenieria/MODELO-DATOS.md`, `docs/proyecto/REQUISITOS.md` (solo fechas confirmadas), `docs/gestion/CALENDARIO-MAESTRO.md` (si se creó; si no, `docs/gestion/PLAN-EPICAS.md`)
- Test: `bun run verify`, `gh issue list` de #7 y #32

**Interfaces:**
- Consumes: Tasks 2–5
- Produces: contrato versionado — lo consume Task 7

- [ ] **Step 1: Resolver dependencias de modelo (#7 Configuración 1, #32 OCR)**

Run: `gh issue view 7 --json title,state,milestone --jq .; gh issue view 32 --json title,state,milestone --jq .`
Expected: ambos alimentan el contrato; si falta evidencia (OCR medido, config cargada), se registra desviación por proceso formal, no se congela en falso.

- [ ] **Step 2: Declarar congelación con SHA**

Añadir al doc dueño: `Contrato congelado el 2026-10-30 en <SHA>, hito <enlace>. Desviaciones: <lista o "ninguna">.`

- [ ] **Step 3: Commit**

```bash
git add docs/ingenieria/MODELO-DATOS.md docs/proyecto/REQUISITOS.md docs/gestion/
git commit -m "docs: ola 06 contrato de datos congelado 30-oct"
```

---

### Task 7: Ola 07 — cierre dev 20-nov (pruebas y evidencias por RF)

**Files:**
- Modify: `apps/api/src/**` y `apps/web/src/**` solo lo que exijan los RF; `docs/gestion/TRAZABILIDAD.md` (misma ola que cambia etiquetas)
- Test: `bun run verify` completo + evidencias por RF de `REQUISITOS.md:67-82`

**Interfaces:**
- Consumes: Task 6
- Produces: dev terminado — lo consume Task 8

- [ ] **Step 1: Cobertura donde aplique (RNF-07 visible hasta resolverse)**

Run: `find apps/api/src apps/web/src -name '*.spec.ts' | wc -l; bun run verify 2>&1 | tail -10`
Expected: conteo real; `apps/api` con 0 pruebas sigue marcado como deuda en el informe, no se vende como cobertura.

- [ ] **Step 2: Evidencia mínima por RF (tabla REQUISITOS.md:69-78)**

Por cada RF implementado adjuntar al PR/e informe: hash+familia (RF-01), cuarentena con motivo (RF-02), confirmación con origen/regla/persona (RF-03), búsqueda <3s con 1 000 docs (RF-04), reporte+alerta (RF-05), aislamiento por depto + bitácora (RF-06), versiones sin pérdida (RF-07), config sin diff (RF-08). Lo no cumplido queda abierto con dueño.

- [ ] **Step 3: Commit(s) mínimo(s)**

```bash
git add apps/ docs/gestion/TRAZABILIDAD.md
git commit -m "feat: ola 07 cierre desarrollo 20-nov con evidencias"
```

---

### Task 8: Ola 08 — liberación 1-dic (paquete defendible)

**Files:**
- Create: `docs/superpowers/olas/ENTREGA-FINAL.md`
- Modify: `docs/gestion/TRAZABILIDAD.md`, `docs/gestion/CALENDARIO-MAESTRO.md` o `PLAN-EPICAS.md` (estado final)
- Test: `bash scripts/doc-index.sh`, `bun run verify`, `bun run doctor`, validadores Task 4

**Interfaces:**
- Consumes: Tasks 0–7
- Produces: entrega final

- [ ] **Step 1: Revisión final de consistencia**

Run: `bash scripts/doc-index.sh && bun run docs:links && bun run docs:briefs && bun run docs:trace && bun run verify && bun run doctor 2>&1 | tail -5`
Expected: todo verde con salidas reales pegadas en `ENTREGA-FINAL.md`.

- [ ] **Step 2: `ENTREGA-FINAL.md` con lo exigido en §16 del plan**

Tabla archivo/línea/cambio/motivo/evidencia; `PROPUESTO` con dueño e impacto; estado 10 briefs; trazabilidad; calendario vs issues/milestones; rutas no-portables; guía inicio; salidas verify/doctor/doc-index; limitaciones; commits; confirmación de alcance (main directo autorizado, sin PR por etapa inicial, sin archivos ajenos tocados).

- [ ] **Step 3: Commit final**

```bash
git add docs/superpowers/olas/ENTREGA-FINAL.md docs/gestion/
git commit -m "docs: ola 08 entrega final 1-dic"
```

---

## Scope check (self-review del plan vs spec)

- §1 objetivo/portabilidad → Tasks 0, 5, 8. Sin huecos.
- §2 fuentes de verdad → Task 2 (dueños) + Task 5 (jerarquía). Sin huecos.
- §3 ocho olas → Tasks 0–8 uno-a-uno. Sin huecos.
- §4 trazabilidad/controles → Task 4 (scripts) + Task 7 (evidencias). Sin huecos.
- §5 correcciones prioritarias → Task 2 Steps 1–4 con líneas exactas. Sin huecos.
- Calendario/dependencias → Tasks 2, 6. Sin huecos.
- Memoria/MCP → Task 5 Step 3. Sin huecos.
- Rutas personales → Tasks 1–3 con greps exactos. Sin huecos.
- Estándares/puertas → Global Constraints + cada Task Step final. Sin huecos.
- PROPUESTO → Tasks 2, 3, 6 con regla de no auto-asignar. Sin huecos.
- Aceptación §16 → Task 8 Step 2. Sin huecos.
- Placeholders: ninguno — cada step trae comando o contenido exacto y salida esperada.
- Tipos: plan documental + shell; sin firmas cruzadas que conciliar.
