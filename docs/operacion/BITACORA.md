<p align="center">
<strong>docu</strong><br>
<sub>Configuración 1 · Baja SterilPack · DOCU — Repositorio de Documentación Digital</sub><br>
<sub>Marca: <code>#5B2A86</code> · acento: <code>#B0215F</code> · texto: <code>#24172F</code></sub>
</p>

# Bitácora del repositorio

Log de trabajo sobre el **repositorio y la gestión** (no del producto: eso es
la `Bitacora` de la base, solo-insert). Append-only: cada entrada lleva fecha,
qué, por qué y cómo verificarlo. Nada se edita ni se borra; si algo cambia de
verdad, la entrada siguiente lo dice.

---

## 2026-11-03 — Auditoría total y alineación del repo

**Quién:** Erik (`reeinharddd`) con el agente, a petición del líder.
**Qué:** auditoría de los 282 archivos del repo (docs, código, config) más el
estado en vivo de GitHub; luego ejecución de las correcciones aprobadas.

### Hallazgos principales (auditoría, solo lectura)

| # | Hallazgo | Severidad |
|---|---|---|
| 1 | Milestone `C1 modelo y BD` (12-nov) inalcanzable tal como estaba cableada: #62 y #23 bloqueados por #59 (18-nov); #60 y #62 también ← #59; #23 ← #61 (17-nov) | Crítica |
| 2 | `apps/web` es el esqueleto Angular sin tocar: `app.html` placeholder, routes vacías, 4 features stub | Alta (esperada: el front no ha empezado) |
| 3 | Sub-issues auto de #3 (#18, #19, #20) abiertos, asignados al líder, cronograma heredado de octubre | Alta |
| 4 | #90 abierto con fechas vencidas aunque la reconciliación (#92–#99) ya estaba fusionada | Media |
| 5 | Milestone fantasma `Contrato de datos congelado` (0 ítems, reliquia de Monday) | Media |
| 6 | Dependencias sobre issues cerrados (#9, #10, #17, #32, #41) y aristas invertidas | Media |
| 7 | Docs que mentían: README raíz (verify/dev con prisma inexistente), STACK (lockfile, linter, CI), BOOTSTRAP (2 jobs vs 3), GITHUB-GESTION (sprints del plan viejo), RITMO (31-oct vs 2-nov), RIESGOS (tabla rota), docs/README (conteo de ADRs), IA.md (ADR-0015 equivocada) | Media |
| 8 | CODEOWNERS inválido en `/infra/`; etiqueta `seguridad` exigida por SECURITY.md no existía | Media |
| 9 | Frontmatter con claves no documentadas (`dueno`, `disparador`, `proposito`) en agentes, comandos y skills: opencode las manda como `options` al proveedor y la llamada falla (subagentes rotos) | Alta |
| 10 | ~~Épica del Project vacía~~ **Falso hallazgo**: artefacto de lectura (`gh project item-list --format json` corrompe la "É"); vía GraphQL está llena en 62/62 | — |

### Acciones en GitHub (todas registradas en el issue/milestone)

- Cerrados **#18, #19, #20** como *not planned* (sub-issues auto de #3; el
  alcance real vive en #12/#3/#46).
- Cerrado **#90** como *completed* con evidencia (PRs #92–#99 fusionados).
- Cerrado el milestone **`Contrato de datos congelado`** (vacío; motivo en su
  descripción). Nunca se borra: queda el registro.
- Creada la etiqueta **`seguridad`** (SECURITY.md ya es ejecutable).
- Dependencias corregidas: retiradas 12 aristas (5 a issues cerrados, 3
  invertidas, 4 ruido); añadidas **#61 ← #23** (el dataset se emite contra el
  contrato) y **#39 ← #46** (el reporte corre en la cola del worker).
- **#39** alineado: cronograma 2026-11-13 → 2026-11-18 (issue = tablero =
  EQUIPO.md), brief enlazado y comentario fijado.
- Repo: descripción y topics actualizados (branding).

### Acciones en el repo

- **Idioma por capa (decisión del líder):** todo lo que consume el agente en
  inglés — `AGENTS.md`, `CLAUDE.md`, 6 comandos, 2 subagentes, 3 skills
  propias, adaptaciones vendor, `.mcp.json`, comentarios de scripts/config.
  Lo humano sigue en español (`docs/`, README, plantillas). Claves de metadata
  normalizadas a `owner` / `trigger` / `purpose`.
- **Subagentes reparados:** las claves desconocidas del frontmatter se movieron
  a un bloque `<!-- -->` (opencode enruta campos desconocidos al proveedor como
  `options` y la API los rechaza). `harness-check.sh` ahora lee ambas formas.
- **Branding documental:** encabezado DOCU + paleta en las 10 plantillas
  (`docs/plantillas/`) y nuevo `docs/plantillas/MARCA.md` con la regla.
- **Docs en verdad:** README raíz reescrito; STACK honesto (Prisma/Postgres
  marcados M1, no instalados; linter y CI descritos como son); BOOTSTRAP,
  ENTORNO, GITHUB-GESTION, RITMO, RIESGOS, TRAZABILIDAD, PLAN-EPICAS
  (dependencias = GitHub), IA.md, ADR-0008/0015 (notas de vigencia),
  ARQUITECTURA (#12-A → #12).
- **BRIEF-39** creado (RF-05, Emmanuel) e indexado.

### Cómo verificar

```bash
bun run verify                       # puertas en verde
gh issue list --state closed --reason "not planned"   # #18 #19 #20
gh api repos/reeinharddd/docu/milestones --jq '.[] | select(.title=="Contrato de datos congelado") | .state'  # closed
gh label list | grep seguridad
gh api repos/reeinharddd/docu/issues/39/dependencies/blocked_by --jq '[.[].number]'  # 3, 46
```

### Pendiente (explícito, no olvidado)

- Commit de todo este trabajo: **pendiente de aprobación del líder** (REGLAS 10).
- BD (#58/#60/#62/#23), frontend (#84/#11) y backend (#45/#12/#3) **no han
  empezado** — cada issue ya tiene su brief y dependencias limpias para
  arrancar.
- Pruebas de API (#45/#87) siguen siendo el hueco de calidad #1.

---

## 2026-11-08 — #23 y #85 cerrados, orquestación probada de punta a punta

**Quién:** Erik (`reeinharddd`) con el agente, a petición del líder.
**Qué:** el contrato de datos quedó congelado con SHA verificable y la IA entró
al repo como configuración (motores intercambiables por variable de entorno).
De paso se probó la orquestación real de los servicios, y esa prueba encontró
tres defectos que ninguna otra forma de revisar los había visto.

### Cerrados

| Issue | Entregable | PR |
|---|---|---|
| #23 | Contrato de datos de C1 congelado: SHA de los 8 archivos, puerta `contrato:check`, `esperado.json` atado al caso real | #110 |
| #85 | Integración IA: cliente compatible OpenAI centralizado, motores GLM-OCR / Llama 3.2 / Qwen3-Embedding / Laya, presupuesto, caché, traza y scoring con confianza | #111 |

Ambos con ADR-0020 aceptada (los motores de IA son configuración, no código)
y con el ER (#58) intacto: la revisión por segmentos S0–S7 sigue pendiente y
#62 no se toca.

### Defectos que encontró el drill de orquestación

El drill levantó Postgres, Redis y la API de verdad (no simulados) y los
apagó uno por uno. Tres cosas estaban mal:

1. **`/health` mentía con un 500 sin diagnóstico.** Con un segmento caído
   respondía error genérico en vez de decir *cuál* había caído. Ahora devuelve
   503 con `{status: degraded, postgres, redis}`.
2. **El smoke chequeaba otro puerto que el de la API.** `smoke-api.sh` leía
   `PORT_API` del entorno mientras la API lo lee del `.env`: la puerta
   interrogaba un proceso distinto al que acababa de arrancar. Corregido en
   #109.
3. **El manifiesto del contrato nunca se versionó.** `.gitignore` excluía
   `dataset/config1/*` salvo excepciones puntuales, así que el archivo con el
   SHA del contrato no entró al repo y `bun run verify` falló en `main` tras
   el merge de #110. Versionado en #112.

Además, la CI **nunca ejecutó los tests de la API**: la puerta TDD comprueba
que el diff traiga un spec, pero no lo corre. Un spec puede fallar y la CI
seguir en verde. Ahora `ci.yml` corre `bun --filter @docu/api test` y
`verify` también (#112).

### Verificar

```bash
bun run verify                                    # incluye los tests de la API
bun --filter @docu/api test                       # 21 tests, 1 skip (live)
bun run contrato:check                            # SHA congelado
git grep -n 'The API has 0 tests' AGENTS.md       # sin resultados
```

---

## 2026-11-03 (vuelta 3) — #83 y #87 cerrados, reparto de carriles y briefs alineados

**Quién:** Erik (`reeinharddd`) con el agente.
**Qué:** los dos interruptores del camino crítico quedaron cerrados y el
reparto se ajustó a la forma de trabajar (rama por persona, el líder ayuda).

### Cerrados

- **#83** (caso C1): PR #101 fusionada — `CASO.md` con personas ve/hace/
  no-puede, flujos F1–F7, fallo→resolución→efecto, **mapa de derivación**
  (flujo→pantalla→endpoint→dato→regla→guion) con vocabulario canónico en
  inglés y guiones G1–G6, criterios de Hecho. Libera #58, #61, #11.
- **#87** (SDD/TDD): PR #102 fusionada — ADR-0018 aceptada, reglas
  (`docs/gestion/SDD-TDD.md`), plantilla `SPEC.md`, PR template con spec +
  test rojo, workflow `sdd-tdd` (puertas spec/tdd, demostradas en vivo contra
  su propia PR), `scripts/tdd-gate.sh`, hook `tdd-aviso`, etiquetas
  `sin-spec`/`sin-test`. Libera #45 y #84.

### Reparto ajustado (cambio de dueño, decisión del líder)

- **#84 (plataforma frontend): Erik** lo construye hoy (infraestructura y
  arquitectura) para que **Kira arranque #11 hoy/mañana**; BRIEF-84 alineado
  (dueño Erik; Kira colabora en estética y hereda la base).
- **#58 (ER v1): Emmanuel conduce**, Erik apoya y revisa; BRIEF-58 y
  EQUIPO.md/PLAN-EPICAS alineados. Punto de partida documentado: el borrador
  v0 ya está en `main` (ADR-0017) y el vocabulario en inglés vive en el mapa
  de derivación de `CASO.md`.
- **#58 asignado a `Agent3835` en GitHub** (antes `reeinharddd`).
- Secuencia de backend confirmada: #45 (suite = "mockup" del backend, tests
  primero) → #12 (API completa) → #3 (pipeline).

### Cómo verificar

```bash
gh issue view 83 --json state -q .state   # CLOSED
gh issue view 87 --json state -q .state   # CLOSED
gh issue view 58 --json assignees -q '[.assignees[].login] | join(",")'  # Agent3835
gh api repos/reeinharddd/docu/commits/8cddf85 --jq .commit.message | head -1
```

*Bitácora iniciada el 2026-11-03. Entrada nueva = fecha nueva al final.*

## 2026-11-03 (vuelta 2) — Verificación total, fixes de texto y configs de rama

**Quién:** Erik (`reeinharddd`) con el agente.
**Qué:** segunda vuelta de verificación (reporte puro) y luego aplicación de
los fixes aprobados, más la metodología de rama.

### Verificación

`bun run verify` completo en verde (lint 61, typecheck ×2, compose, harness 15,
diagramas 5+2+10, índice, pruebas web 2/2, smoke `/health`). Los 6 gates de
docs en verde. Conclusión: sin basura documental — cada doc tiene función; el
caso Baja SterilPack es consistente (6 familias = 6 fichas = 18 esquemas,
7 reglas con cobertura, 60 turnos, incidente 26-oct, ~205 archivos ≈ los 200
de IA.md).

### Fixes aplicados

1. `MCP.md`: ya no dice "`.mcp.json` sigue vacío"; describe el catálogo real
   (core + extras con `trigger`).
2. `ACCESOS.md`: sección MCP corregida (core activo, extras apagados) y
   `FIRECRAWL_API_KEY` añadida a la tabla.
3. Las 7 fichas: `Estado: aprobada 2026-10-17 (issue #9 cerrado)` (eran
   "propuesta").
4. `INVESTIGACION-HERRAMIENTAS.md`: 3 manchas de texto corrupto reparadas.
5. `CONTRATO.md`: referencias a la rama `feat/29-...` → al issue #29 (ya
   fusionado); los briefs históricos conservan sus ramas por diseño.
6. `REPLAN`: "generador desde el 31-oct" → "desde el arranque del plan (2-nov)".
7. Skill `docu-documentar`: la regla de idioma incluye la capa agente.
8. `/cerrar`: paso nuevo — guardar memoria al cerrar sesión (`docu-memoria`).

### Metodología de rama (nuevo)

- `scripts/rama-env.sh <issue>`: crea la rama con `gh issue develop` y arma
  `.docu/rama/<slug>/` (gitignored) con overrides locales y notas.
- Regla escrita en `GITHUB-GESTION.md` §Configs de rama: el entregable viaja
  en el merge; la config local nunca (está en `.gitignore`, un PR no puede
  llevarla); al cerrar la rama, la config muere con ella.
- Fila nueva en `HARNESS.md` (operación, cómo se documenta, cómo se verifica).

### Cómo verificar

```bash
git grep -n 'sigue vacío' docs/integraciones/MCP.md      # sin resultados
git grep -n 'Estado: propuesta para aprobación' docs/    # sin resultados
git grep -n 'es_replace' docs/                            # sin resultados
bash -n scripts/rama-env.sh                               # sintaxis OK
```

### Descubrimiento posterior (mismo día): arista foránea corrupta en el grafo

Al auditar #83 se encontró que **#58 tenía una arista *blocked by* hacia un
issue de OTRO repositorio** (`davglass/yui-examples#17`, 2009): basura real
en el grafo, invisible porque el endpoint REST de dependencias la devuelve
mezclada y mi primer DELETE fue un no-op (usé el id de nuestro #17, no el de
la arista foránea, cuyo id de base de datos es `58`). Retirada con
`DELETE .../issues/58/dependencies/blocked_by/58`. Lección operativa:
**verificar el grafo con GraphQL (`blockedBy`), no con el REST de
dependencias**; el REST puede devolver issues foráneos. Barrido final:
39 aristas, 0 foráneas, 0 hacia cerrados. También se retiró #83 ← #2 (PR
fusionado hacía semanas) — #83 queda sin bloqueos.
