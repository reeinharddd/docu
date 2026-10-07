# Sistema documental de DOCU

Este archivo es el índice y la ley del sistema documental. Si un dato no está
catalogado aquí, no está documentado; si está en el lugar equivocado, está mal.

## Regla de oro

> Si es verdad para los cuatro integrantes, puede escribirse como archivo y
> cambia con el código, entonces **va en el repositorio**. La memoria indexa,
> no reemplaza. GitHub Issues ejecuta el trabajo. Drive entrega.

Nada de conocimiento que solo viva en la cabeza de alguien, en un chat, en
Drive o en una memoria local de una sola máquina.

## Taxonomía por tipo de documento

Cada tipo tiene propósito, autor, momento de escritura y forma propios. No se
documenta igual un diseño que una decisión de ingeniería.

| Tipo | Responde a | Escribe | Se actualiza | Dónde vive | Plantilla |
|---|---|---|---|---|---|
| Visión y alcance | Qué es y qué no es DOCU | Erik | Cambia el rumbo del producto | `proyecto/VISION.md` | — |
| Caso de negocio | Cómo es la planta real y qué duele | Erik + equipo | Cambia el dominio | `proyecto/CASO.md` | — |
| Requisitos | Qué debe hacer el sistema | Equipo | Cambio aprobado en un issue | `proyecto/REQUISITOS.md` | — |
| Equipo | Quién hace qué | Erik | Reasignación de tarea | `proyecto/EQUIPO.md` | — |
| **Decisión de ingeniería** | Por qué se eligió X sobre Y | Quien decide, con revisor | Nunca se reescribe: se marca `Reemplazada` | `decisiones/ADR-NNNN-*.md` | `plantillas/ADR.md` |
| Arquitectura | Cómo está construido hoy | Backend/infra | Cada cambio estructural | `ingenieria/*.md` | — |
| **Diseño (UX)** | Cómo se usa y se ve | Kira | Cada iteración de pantalla | `diseno/*.md` | — |
| Operación | Cómo se levanta y se rompe | Infra | Cada comando nuevo | `operacion/*.md` | — |
| Integración | Cómo se habla con un sistema externo | Quien lo integra | Cambio de API o de permiso | `integraciones/*.md` | — |
| Gestión | Quién hace qué, cuándo, con qué riesgo | Erik | Cada semana | `gestion/*.md` | — |
| Académico | Qué se entrega a la materia | Responsable de la entrega | Fecha de entrega | `academico/*.md` | — |
| Plantillas | Formatos obligatorios de brief, ADR y evidencia | Dueño del tipo | Cuando cambia el proceso | `plantillas/*.md` | — |

Regla de ubicación que evita ruido en el repositorio:

- **En el repo**: lo que debe ser verdad en el tiempo y versionarse. Decisiones,
  arquitectura, requisitos, contratos.
- **En la memoria del proyecto**: lo que cambia todos los días. Bitácora de
  sesión, descubrimientos, estado de una conversación. Se consulta cuando hace
  falta y no se commitea.
- **En GitHub Issues/Projects**: lo que está pasando ahora. Estado, responsable, fecha.

Reglas que hacen funcional la separación:

1. **Una decisión de ingeniería es una ADR, no un párrafo en un README.** Las
   alternativas descartadas y las consecuencias van dentro, siempre.
2. **Un ADR no se reescribe.** Si cambió, se escribe el siguiente con
   `Estado: Reemplazada por ADR-NNNN`. El historial es evidencia (REGLAS.md 7).
3. **El diseño describe la experiencia, no el código.** Pantallas, estados,
   mensajes y flujos. Si necesita nombrar un archivo `.ts`, no es diseño.
4. **La arquitectura describe el presente, no el deseo.** El futuro va como
   ADR o como issue, nunca como descripción del sistema actual.
5. **Requisito, épica, PR y evidencia son la misma cadena.** Se verifica con
   `gestion/TRAZABILIDAD.md`.
6. **Nada de documento sin dueño.** Cada archivo de arriba tiene un responsable
   nominal en `proyecto/EQUIPO.md`.

## Capas de autoridad (no se contradicen: cada una responde algo distinto)

| Fuente | Autoridad sobre | Nunca es autoridad para |
|---|---|---|
| Repositorio (`docs/`) | Código, reglas, decisiones, contrato operativo | Estado de una tarea |
| ADR (`decisiones/`) | Por qué el sistema es como es | Cómo se usa hoy |
| GitHub Issues, milestones y Project | Estado, responsable, fechas, sprint, dependencia | Decisiones técnicas |
| Drive (carpeta viva) | Entregas y documentos académicos firmados | Reglas del equipo |
| GitHub (código) | Historial, PR, CI, protección de `main` | Requisitos y diseño |
| Engram (memoria) | Contexto de sesión, descubrimientos, índice | Nada canónico |

Cuando dos fuentes discrepan, gana la de la tabla para ese tema y se corrige la
otra en el mismo PR.

## Índice

Este índice se verifica. `docs/.indice` es la lista canónica de archivos y
`bash scripts/doc-index.sh` falla si lo listado no existe o si queda un archivo
sin listar. Corre en CI y en `bun run doctor`.

| Ruta | Contenido | Estado |
|---|---|---|
| `proyecto/` | Visión, caso, requisitos, equipo | completo |
| `decisiones/` | ADRs de ingeniería, 12 aceptadas | en progreso |
| `ingenieria/` | Stack verificado, modelo de datos, API, colas, entorno, estrategia de IA | en progreso |
| `diseno/` | Experiencia de uso: modelo operativo, pantallas, flujos, identidad | pendiente |
| `operacion/` | Bootstrap, diagnóstico, entornos, troubleshooting | completo |
| `integraciones/` | Accesos, gestión en GitHub, Drive, Engram, MCP, herramientas del agente, investigación | completo |
| `gestion/` | Plan por épicas, ritmo semanal, trazabilidad | completo |
| `academico/` | Plan académico EC0935 y entregas de la materia | en progreso |
| `briefs/` | Delegaciones con el formato obligatorio, auditoría externa | activo |
| `plantillas/` | BRIEF, ADR, evidencia, RFC, contrato de módulos | completo |

Los directorios marcados `pendiente` están vacíos a propósito: no hay
diseño de pantallas ni entregable académico todavía. Se crean cuando la
materia o el producto los necesiten, y hasta entonces el índice dice la verdad
en vez de prometer archivos que no existen.

## Fuentes fuera del repositorio

Estas rutas alimentan lo anterior; al escribir aquí se copian, no se enlazan.

| Origen | Qué aporta | Cómo se lee |
|---|---|---|
| Especificación de la arquitectura (documento de la materia, en Drive) | Stack decidido, módulos, acuerdos de equipo | `integraciones/DRIVE.md` (solo lectura) |
| Issues, milestones y Project de GitHub | Estado real del trabajo | `integraciones/GITHUB-GESTION.md` |
| Drive `/Desarrollo web integral` | Etapas 0/1/2, plantilla IEEE 830, diagramas | `integraciones/DRIVE.md` |
| Engram | Memoria de sesión | `integraciones/ENGRAM.md` |

Nada de esto se lee desde cache: Drive y GitHub se consultan en vivo.

## Documentos heredados que este sistema reemplaza

| Antes | Ahora |
|---|---|
| `docs/CONTEXTO.md` | `proyecto/VISION.md` + `proyecto/CASO.md` + `proyecto/EQUIPO.md` |
| `docs/ACCESOS.md` (promesas no cumplidas) | `integraciones/*.md` con matriz de permisos real |
| `README.md` (arranque) | `operacion/BOOTSTRAP.md` |
| `.opencode/PROJECT_CONTEXT.md` (documento de contexto que vivía fuera del repo) | `proyecto/EQUIPO.md` + `integraciones/MCP.md` |
| Memoria de Engram como fuente de decisiones | `decisiones/*.md` |
| Monday como gestor del equipo | `decisiones/ADR-0008-github-como-gestor-del-equipo.md` |
| Herramientas de agente en configuración personal de cada máquina | `decisiones/ADR-0007-contrato-de-herramientas-del-agente.md` |