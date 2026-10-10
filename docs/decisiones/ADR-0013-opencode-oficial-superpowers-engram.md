# ADR 0013 — OpenCode es el entorno oficial, con superpowers pineado y Engram como memoria

Fecha: 2026-10-10 · Estado: Propuesta · Decide: Erik · Revisa: el equipo

## Contexto

El equipo acordó usar opencode en las cuatro máquinas y que todo lo necesario
viva en el repositorio desde la primera clonada. ADR-0007 fijó que el contrato
vive en el repo y ADR-0001 fijó los flujos (brainstorming, planes, TDD,
verificación, revisión), pero esas skills hoy viven fuera del repo y cada
máquina puede derivar. Se necesita un entorno único, reproducible y revisable
por PR.

## Decisión

El puesto de trabajo oficial del agente es **opencode**, con **superpowers
`v6.4.2` pineado** como implementación de los flujos de ADR-0001 y **Engram
(`ENGRAM_PROJECT=docu`)** como memoria de sesión. Concretos:

- `opencode.json` de la raíz declara el plugin pineado (opencode V1, clave
  `plugin` singular; la 1.18.32 es la instalada por `scripts/setup.sh`):
  `superpowers@git+https://github.com/obra/superpowers.git#v6.4.2`.
  Es la única configuración versionada: `.opencode/opencode.jsonc` es local,
  está en `.gitignore` y no debe divergir del contrato (`bun run doctor`
  avisa si existe).
- Manda el repo: ante contradicción entre una skill de superpowers y
  `AGENTS.md` o `docs/`, gana el repo.
- Engram indexa contexto de sesión según `integraciones/ENGRAM.md`; nunca
  reemplaza a `docs/` ni a GitHub Issues.
- Actualizar superpowers es un PR que cambia el pin, nunca un `latest` ni un
  `sync` por máquina.

## Alternativas consideradas

| Alternativa | Por qué no |
|---|---|
| gentle-ai completo como contrato (`gentle-orchestrator` + 10 subagentes + perfiles) | Escribe en `~/.config/opencode/` y `.atl/`, exige instalador y `sync` por máquina y modelo de perfiles con `Tab`. No es clon-listo ni PR atómico; segunda curva sobre Bun/Nest/Angular para un equipo con poca experiencia. Queda como re-evaluación futura. |
| Propio ligero total, sin harness externo | Máximo control y cero dependencia, pero obliga a escribir desde cero TDD, debugging y revisión que superpowers ya trae probados (MIT). Se acepta como complemento (comandos `docu-*`), no como sustituto inmediato. |
| ECC / gstack como contrato | Sin fuente oficial verificable (licencia, commit, mantenimiento) al 2026-10-05. Sin eso no hay candidato evaluable con los siete criterios. |
| Dejar superpowers solo como configuración personal fuera del repo | Reproduce el problema de ADR-0007: reglas distintas por máquina y fallos inexplicables. Es lo que se quiere eliminar. |

## Consecuencias

- **A favor**: las cuatro máquinas ejecutan los mismos flujos con la misma
  versión; actualizar es un diff revisable.
- **A favor**: se reutilizan skills probadas (planes, TDD,
  verification-before-completion, revisión) en vez de reimplementarlas.
- **A favor**: Engram conserva contexto entre fases sin convertir la memoria
  en fuente de verdad.
- **En contra**: el repo asume un plugin externo pineado; hay que seguir sus
  releases y bumpsear el pin a propósito.
- **En contra**: superpowers inyecta bootstrap cada sesión (costo de contexto
  medio). Se mitiga con nombres distintos (cero colisión) y skills propias
  `docu-*`; ante contradicción de contenido mandan `AGENTS.md` y `docs/`.
- **Riesgo residual**: una skill del harness que encode una mala práctica se
  multiplica por cuatro. Se mitiga con revisión en PR y la regla repo-gana.

## Evidencia

- superpowers MIT, release `v6.4.2`, instalable en opencode por spec git con
  pin `#v6.4.2` (docs `README.opencode.md` del proyecto upstream).
- `opencode.json` versionado con `instructions` a `AGENTS.md`, `docs/REGLAS.md`
  y `docs/decisiones/README.md`; permisos por comando ya declarados; LSP nativo
  permitido (navegación solo-lectura: definición, referencias, símbolos).
- `scripts/setup.sh` instala opencode y deja la máquina lista; `.env.example`
  ya declara `ENGRAM_PROJECT=docu`, y el MCP del repo lleva `--project=docu`
  (pisa la entrada global: la identidad no depende de la carpeta ni de config
  personal).
- Pendiente de verificar en este PR: apertura limpia con el pin y `bun run doctor`.

## Qué nos haría revertirla

Si el pin impide arrancar en una máquina del equipo, si el costo de contexto
bloquea sesiones reales, o si una skill del harness contradice `AGENTS.md` de
forma no adaptable. En ese caso se quita el pin y se vuelve a propio ligero,
sin reescribir esta ADR.
