# Herramientas del agente: catálogo, criterio de selección y reglas

Estado: **vigente como política de admisión**. Los siete criterios de la sección 1
son ejecutables: se aplican candidato por candidato y el veredicto se escribe en
la sección 7. Instalar algo que no los cumpla está prohibido.

Decisión de fondo en
[ADR-0007](../decisiones/ADR-0007-contrato-de-herramientas-del-agente.md):
las herramientas del agente son parte del repositorio, o se referencian a un
remoto con versión fijada. Este documento responde tres preguntas: qué
herramientas existen para lo que usamos, cómo se decide cuál entra, y qué
prohibimos para que el trabajo del agente no se degrade.

## 1. Criterio de selección

Se evalúa en orden. Una herramienta que falla el primero queda fuera.

| # | Criterio | Pregunta que responde |
|---|---|---|
| 1 | Oficialidad | ¿La publica quien mantiene la tecnología? Si sí, es la candidata por defecto |
| 2 | Mantenimiento | ¿Hay commits o releases recientes? Una herramienta abandonada no es documentación, es deuda |
| 3 | Licencia compatible | ¿Permite uso interno y modificación? |
| 4 | Sin dependencia de credenciales privadas | ¿Funciona con las variables que ya declaramos en `.env.example`? |
| 5 | Versionable | ¿Se puede fijar por commit, tag o versión? Una herramienta que solo se instala "a lo latest" no entra |
| 6 | Ancho de contexto | ¿Cuántas herramientas agrega al contexto del agente? Un servidor con 80 herramientas que solo se usan una vez es un coste permanente |
| 7 | Encaje con el stack | ¿Habla del runtime, el framework y la base que realmente usamos? |

Regla de desempate: si dos herramientas cumplen, gana la oficial. Si ninguna
cumple, se escribe la nuestra en el repositorio, y entonces sí hay que mantener
su versión.

## 2. Inventario de candidatas

Estado de cada una: **a evaluar**. Este documento no declara ninguna aprobada.

### Oficiales de la tecnología que ya usamos

| Tecnología | Herramienta oficial | Qué cubre | Enlace |
|---|---|---|---|
| Angular | Agent Skills | Prácticas de Angular aplicadas por un agente | <https://angular.dev/ai/agent-skills> |
| Angular | Angular CLI MCP Server | Consultas del CLI y del proyecto desde el agente | <https://angular.dev/ai/mcp> |
| Angular | AI Tutor y patrones de diseño | Guías de arquitectura | <https://angular.dev/ai/ai-tutor> |
| Prisma | Repositorio oficial de skills | CLI, API de cliente, migraciones, configuración y **implementación de driver adapters** | <https://github.com/prisma/skills> |

Skills concretas de Prisma que aplican a este proyecto: `prisma-cli`,
`prisma-orm-setup`, `prisma-postgres-setup`, `prisma-driver-adapter-implementation`,
`prisma-client-api`, `prisma-upgrade-v7`.

### De la comunidad o del ecosistema

| Herramienta | Qué resuelve | A revisar |
|---|---|---|
| Context7 (MCP remoto) | Documentación de librerías actualizada, sin fijar versión en el repo | Coste de contexto y disponibilidad |
| Engram (MCP) | Memoria persistente del proyecto | Qué se guarda y quién lo lee |
| Modelos locales (Ollama) | Clasificación y consulta sin salir de la máquina | Consumo de recursos en laptops del equipo |

### Harnesses de trabajo completos

Un harness agrupa muchas herramientas y reglas de flujo. Son candidatos, no
decisiones: hay que compararlos con criterio antes de instalar ninguno.

| Candidato | Qué trae | Preguntas obligatorias al evaluarlo |
|---|---|---|
| superpowers | Conjunto amplio de skills de proceso y calidad | ¿Se instala global o por proyecto? ¿Escribe en el repositorio? ¿Qué licencia? |
| gstack | Perfiles y flujos de trabajo para agentes | ¿Se versiona por commit? ¿Trae sus propias reglas que contradigan las del repo? |
| ECC y similares de la misma familia | Reglas de calidad y revisores automáticos | ¿Coincide con las reglas de este proyecto o las pisa? |

Regla dura con los harnesses: **las reglas del repositorio ganan**. Si un
harness trae reglas que contradicen `AGENTS.md`, no se instala. Un agente que
puede saltarse las reglas del equipo no es una ayuda, es un riesgo.

## 3. Dónde vive cada tipo de herramienta

| Tipo de herramienta | Dónde | Por qué |
|---|---|---|
| Reglas de trabajo y contrato | `AGENTS.md` y `docs/` | Aplican a cualquier cliente de agente |
| Configuración del cliente | Archivo de configuración versionado en el repo | Que todos ejecuten lo mismo |
| Credenciales | `.env` de cada máquina | Un secreto no se versiona nunca |
| Skills oficiales sin modificar | Enlace con versión fijada | No duplicamos lo que ya existe |
| Skills adaptadas al proyecto | Copiadas en el repositorio | Si divergen del original, el original ya no basta |
| Subagentes del equipo | `.opencode/agents/*.md` (frontmatter `mode: subagent`) | Delegación repetible: `explorador` (ola 1), `revisor` (antes de cerrar) |
| Scripts de verificación y arranque | `scripts/` con comando declarado | El comando es el contrato |
| Plantillas de documento | `docs/plantillas/` | Formato único, sin improvisar |

Criterio para copiar algo al repositorio: **cuando necesite modificación**. Si
solo se consume, un enlace con versión fijada es mejor: se actualiza con un PR y
no ocupa el repositorio con código ajeno.

### Vendorizar una sola skill (sin clonar el repo ajeno)

1. Solo si es autocontenida (prompt + referencias incluidas). Si necesita su
   runtime (`bin/`, paquetes), no se vendoriza: se referencia con trigger.
2. Destino: `.opencode/skills/vendor/<origen>-<skill>/SKILL.md` con cabecera
   de origen (repo, commit/tag, licencia, qué se adaptó).
3. Una por PR, con su disparador de uso. Ejemplo pendiente: `archify` (MIT,
   diagramas RF-04) en K1 — su `bin/` impide el vendor de un archivo.

### Skills vendorizadas (origen, pin, adaptación)

| Skill | Origen | Pin | Adaptación DOCU |
|---|---|---|---|
| `ecc-prisma-patterns` | `affaan-m/ECC` | `8384d60` (v2.2.3, MIT) | Prisma 7.10.0 + driver adapter; manda STACK.md |
| `ecc-nestjs-patterns` | `affaan-m/ECC` | `8384d60` (v2.2.3, MIT) | NestJS 12; providers inyectados como clase, nunca `import type` |
| `ecc-angular-developer` | `affaan-m/ECC` (+`references/`) | `8384d60` (v2.2.3, MIT) | Angular 22 zoneless, sin zone.js (ADR-0003) |
| `pp-code-reviewer` | `waybarrios/opencode-power-pack` | `9dccb6d` (v0.5.0, MIT/Apache) | Calibración bloqueador/importante/menor + evidencia (REGLAS.md) |

## 4. Anti-slop: qué no se permite en el trabajo del agente

Estas reglas se aplican al código, a la documentación y a las herramientas que
el propio agente escriba. Vienen de la práctica, no de la teoría.

### Código

| Prohibido | Por qué |
|---|---|
| Comentarios que repiten lo que hace la línea siguiente | Ruido; el código ya lo dice |
| Comprobaciones defensivas sobre lo que el tipo o el contrato ya garantizan | Código muerto que dice "no confío en nada" |
| Envoltorios,alias o abstracciones de un solo uso | Una capa que no simplifica nada |
| Fábricas que solo llaman al constructor | Indirección sin valor |
| Código muerto, importaciones sin usar, `console.log` de depuración | Se cuela en el PR y nadie lo quita |
| Suprimir tipos con `as any`, `ts-ignore` o `ts-expect-error` | El error se está escondiendo, no se está arreglando |
| Borrar o debilitar una prueba para que pase | Es la definición de trampa |
| Funciones muy largas y módulos muy grandes | Se dividen por responsabilidad |
| Comentarios que describen a una persona ("esto lo hizo Erik") | El código no necesita atribución |

### Documentación

| Prohibido | Por qué |
|---|---|
| Documento que repite el código línea por línea | Se desactualiza al primer cambio |
| Documento que promete lo que no existe | Un índice que miente pierde la confianza en todo el sistema |
| Sección de "pendientes" dentro de un documento de estado | Lo pendiente vive en el tablero |
| Ruta personal, carpeta personal o nombre de máquina | Quien lee el repositorio no tiene por qué conocer la estructura de nadie |
| Repetir el mismo concepto en tres archivos | Fuente única; los demás enlazan |

### Herramientas del agente

| Prohibido | Por qué |
|---|---|
| Instalar algo en la máquina sin decide dónde vive | Rompe la reproducibilidad entre integrantes |
| Usar "última versión" en algo que ejecuta código para todos | Un cambio de versión puede romper el trabajo de cuatro personas |
| Crear una skill propia sin buscar antes la oficial | Trabajo duplicado y divergente |
| Meter reglas del harness por encima de las del repositorio | El agente deja de seguir el contrato del equipo |

## 5. Responsabilidades

| Qué | Quién decide | Quién ejecuta | Quién revisa |
|---|---|---|---|
| Reglas del repositorio y `AGENTS.md` | El líder del equipo | Quien lo propone | Un integrante |
| Herramienta oficial que entra al proyecto | El dueño del área afectada | El responsable de la épica | El líder |
| Herramienta externa que se copia al repo | El líder | Quien la adapta | Un integrante |
| Credenciales de un servidor MCP | El líder | Quien la necesita | El líder |
| Habilidad de un agente para escribir en el tablero | El líder, con confirmación por tarea | El agente, previa confirmación | La persona responsable |

## 6. Flujo de adopción de una herramienta

1. ¿Existe oficial para esta tecnología? Si sí, empieza ahí.
2. ¿Cumple los siete criterios? Si no, se descarta y se anota por qué.
3. ¿Necesita adaptación para DOCU? Si no, se enlaza con versión fijada. Si sí,
   se copia al repositorio y se declara su origen y su versión base.
4. ¿Agrega herramientas al contexto? Se declara el coste y se revisa a los dos
   sprints.
5. PR con la decisión, el motivo y el coste. Nada se instala "porque sí".

## 7. Estado actual

Evaluado el 2026-10-05, ampliado el 2026-10-10 con el modelo core + extras.
La conclusión operativa está en [`MCP.md`](MCP.md): **core siempre activo
(Engram, Drive lectura, `gh`), extras delimitados y apagados (Playwright,
Firecrawl) hasta su disparador.** `.mcp.json` es el catálogo del equipo;
`opencode.json` trae los extras con `enabled false` (cero costo de contexto).

| Núcleo / extra | Piezas | Dónde vive |
|---|---|---|
| Core (obligatorio) | Engram, Drive lectura, GitHub vía `gh` | Binario + bloques por máquina (`BOOTSTRAP.md`), permisos en `opencode.json` |
| Extras (opt-in por tarea) | Playwright, Firecrawl, Angular CLI, PostgreSQL, Redis oficial | Delimitados en `.mcp.json` y `opencode.json` con `enabled false`; se activan en config global personal o cambio local sin commitear. Prisma y BullMQ no tienen MCP: skills y código |

| Herramienta | Criterios que pasa | Veredicto |
|---|---|---|
| Skills oficiales de Angular | 1, 2, 3, 5, 6, 7 | **Pendiente de instalar.** Revisa `angular/skills` (commit `2051adcd10bb`) sin archivo LICENSE: la licencia no está demostrada |
| Skills oficiales de Prisma | 1, 2, 3, 5, 6, 7 | **Pendiente de instalar.** `prisma/skills` (commit `be16a8740d013`), LICENSE MIT. Instalar con `@prisma/cli@7.10.0`, nunca `@latest` |
| MCP del CLI de Angular | 1, 2, 3, 5, 6, 7 | **Extra apagado.** Oficial del CLI (`angular.dev/ai/mcp`, comando presente en el 22.2.1 instalado), `--read-only --local-only`, pin `@angular/cli@22.2.1`, licencia MIT del CLI |
| Context7 | 2, 3, 7 | **Rechazado.** Criterio 5: no es versionable, se consulta "lo actual". Rompe ADR-0007 punto 5 |
| Engram | 1, 4, 7 | **En uso.** No es MCP del proyecto; política en [`ENGRAM.md`](ENGRAM.md) |
| Harnesses externos | ver ADR-0013 (propuesta) | **superpowers `v6.4.2` pineado como plugin del proyecto, subordinado a `AGENTS.md`.** gentle-ai en espera (escribe en `~/.config`, no es clon-listo). ECC/gstack sin fuente verificable. Detalle en [`INVESTIGACION-HERRAMIENTAS.md`](INVESTIGACION-HERRAMIENTAS.md) |
| Modelos locales (Ollama) | 7 | **Fuera de alcance hasta M1.** No hay `ValidationPipe` ni modelo que validar |

### Regla aplicada

Un candidato que falla un solo criterio queda fuera, y el motivo se escribe
aquí. Repetir la evaluación cada mes sin datos nuevos solo reabre el debate:
para reevaluar hay que aportar commit, licencia o credencial nueva.

## 8. Reglas duras de BD para el agente (no hay MCP de BD)

La BD se toca con `psql` y Prisma, nunca con un MCP. Lo que un MCP de lectura
daría (barandilla para novatos) lo dan estas reglas + los denies de
`opencode.json` (`DROP DATABASE`, `DROP SCHEMA` y `TRUNCATE` denegados,
`migrate reset` con confirmación):

1. Leer con `SELECT`, `psql` o Prisma. Nada más.
2. Escribir solo vía migraciones y seeds del repo (cuando existan, M1). Nunca
   `UPDATE` ni `DELETE` manuales contra datos compartidos.
3. `prisma migrate reset` solo con confirmación explícita y con backup previo
   si hay datos que importen.
4. `DATABASE_URL` es local (`.env`, nunca al repo); cada máquina responde por
   su propia base.

## 9. LSP por lenguaje (nativo, sin config)

opencode trae los servidores incluidos y los arranca solo; `opencode.json`
permite `lsp` sin confirmación (solo-lectura). Mapa verificado en su código:

| Lenguaje del proyecto | Servidor | Cobertura |
|---|---|---|
| TS/JS (`apps/`) | typescript, eslint, biome | Definición, referencias, símbolos, diagnóstico |
| Bash (`scripts/*.sh`) | bash | Navegación |
| YAML (CI, compose) | yaml-ls | Esquema y símbolos |
| Dockerfile | dockerfile | Básico |
| Python (evaluación OCR futura) | pyright | Requiere binario al llegar la etapa |
| SQL (migraciones) | — | Sin LSP: cubren `psql`, `prisma validate` y §8 |
| HTML de Angular, CSS/Tailwind | — | Sin LSP incluido: cubren `ng build` y tests |
| Markdown, Drawio | — | Cubren `doc-index`, `linkcheck` y revisión humana |