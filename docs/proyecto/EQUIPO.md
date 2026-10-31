# Equipo, responsabilidades y propiedad de la documentación

Estado: vigente. Última actualización: 2026-10-31. Plan vigente:
`gestion/REPLAN-2026-10-30.md` (v2, ocho carriles en paralelo). Hitos: modelo y
BD 12-nov · vertical completa 19-nov · demo con el profesor 24-nov · final
3-dic.

## Personas

| Persona | Rol en DOCU | Áreas del sistema | Usuario GitHub |
|---|---|---|---|
| Erik Alfonso Beltrán Ramírez | Líder, caso, infra y pipeline | Caso (#83), plataforma frontend (#84), IA (#85), BD/ER (#58, #62), arquitectura (#60), CI y entorno, ADRs de infraestructura, revisión de todos los PRs | `reeinharddd` |
| Emmanuel Valenzuela Cruz | Backend | API NestJS, ingesta, dato oficial, RBAC, reglas declarativas, worker y seed | `Agent3835` |
| Kira Llizara Garfias González | Frontend y UX | Angular, Tailwind, captura, bandeja, programa, búsqueda, diseño de pantallas | `kirxllix` |
| Carlos Ariel Martín Rojas | Dataset y QA | Dataset sintético, replicabilidad, plan de pruebas, evidencias | `WearyBerry` |

Materias: **Yakko Olivo Nájera** (Desarrollo web integral) es dueño del
producto y sus entregas viven en DOCU. **Resffa Elizabeth Fierro García**
(Extracción de Conocimiento de BD) también. **MIGUEL ANGEL CARDONA CONTRERAS**
(Desarrollo para Dispositivos Inteligentes).

## Responsabilidades y entregables en C1

Plan vigente: `gestion/REPLAN-2026-10-30.md` (ocho carriles en paralelo, del
lunes 2-nov al 3-dic). Esto es lo que cada persona entrega; el detalle está en
su brief y el estado en su issue.

| Persona | Carril | Entregables | Cierra | Brief |
|---|---|---|---|---|
| Erik | A. Caso | Diseño del caso cerrado con mapa de derivación (#83) | 6-nov | `briefs/BRIEF-83-caso-c1.md` |
| Erik | B. Plataforma frontend | Base del frontend en `main`: atomic, routing, kit, tests, CI (#84) | 10-nov | `briefs/BRIEF-84-plataforma-frontend.md` |
| Erik | C/D. Infra IA y BD | Motores de IA montados (#85) y ER híbrido con DDL, vistas, triggers y migración (#58, #60, #62, #23) | 12-nov | `briefs/BRIEF-58-diagrama-v0.md`, `briefs/BRIEF-60-arquitectura-modelo.md`, `briefs/BRIEF-62-modelo-datos.md` |
| Erik | E. Integración IA | OCR híbrido, embeddings 768, LLM consultable con citas (#85) | 18-nov | `briefs/BRIEF-85-integracion-ia.md` |
| Erik | Método y gestión | SDD/TDD con guardas (#87), limpieza documental (#88), demo del 24-nov (#89), final (#6), revisión de todos los PR | 20-nov / 3-dic | `briefs/BRIEF-87-sdd-tdd.md`, `briefs/BRIEF-89-demo-24-nov.md` |
| Emmanuel | G. Backend | Pruebas de API (#45), ingesta (#12), pipeline (#3), worker (#46), solo-insert (#44), RBAC y reglas (#5), seed (#59), verificación de punta a punta (#7) | 19-nov | `briefs/BRIEF-45-pruebas-api.md`, `briefs/BRIEF-12-api-nestjs.md`, `briefs/BRIEF-03-pipeline-ingesta.md` |
| Kira | H. Frontend | Mockups funcionales con datos reales (#11) y pantallas del caso contra la API real (#4) | 18-nov | `briefs/BRIEF-11-prototipos-ui-ux.md`, `briefs/BRIEF-04-frontend-angular.md` |
| Carlos | F. Dataset | Generador determinista y dataset del mes con manifiesto SHA-256 (#61), replicabilidad (#86), reglas y evidencias (#5) | 19-nov | `briefs/BRIEF-61-generador-dataset.md`, `briefs/BRIEF-86-replicabilidad.md` |

Erik lleva el caso, la plataforma, la IA y la BD, y además revisa todos los
PRs: es el cuello de botella declarado del plan, con orden interno
A → B → C → D → E y guardarraíl de des-recorte (`gestion/REPLAN-2026-10-30.md`
§7).

#39 (reporte y alerta, RF-05) sigue con Emmanuel (`Agent3835`), después de #7.
Kira (`kirxllix`) y Carlos (`WearyBerry`) tienen sus issues asignados. #36 se
cerró como no planificado (el diagrama de casos de uso no se hará). #34
(manuales) se cerró como no planificado; los manuales se absorben en #6.

Cómo empieza cualquiera: `bash scripts/setup.sh`, `opencode`, `/inicio`
(`operacion/BOOTSTRAP.md`).

## Quién escribe qué documento

Regla: si eres el dueño del tema, escribes el documento; si no, lo pides. Nadie
edita un documento de otro sin avisar en el PR.

| Documento | Dueño | Revisor mínimo |
|---|---|---|
| `proyecto/VISION.md` | Erik | Todo el equipo en el PR |
| `proyecto/CASO.md` | Erik + equipo | Quien trabaje el dominio |
| `proyecto/REQUISITOS.md` | Erik | Quien va a construir el requisito |
| `proyecto/EQUIPO.md` | Erik | Quien cambia de rol |
| `decisiones/ADR-*.md` | Quien decide | Erik (infra) o el dueño del módulo |
| `ingenieria/ARQUITECTURA.md` | Erik | Emmanuel |
| `ingenieria/MODELO-DATOS.md` | Emmanuel | Erik |
| `ingenieria/ALCANCE-SOLUCION.md` | Erik | Emmanuel |
| `ingenieria/fichas/*.md` (contrato de documentos, #61) | Carlos | Emmanuel |
| `ingenieria/API.md`, `ingenieria/COLAS.md` | Emmanuel | Erik |
| `ingenieria/ENTORNO.md` | Erik | Erik (bloqueante en PR) |
| `diseno/*.md` | Kira | Erik (coherencia de alcance) |
| `operacion/*.md` | Erik | Quien lo vaya a sufrir |
| `integraciones/GITHUB-GESTION.md` | Erik | Erik (cambios de estructura requieren su OK) |
| `integraciones/DRIVE.md`, `GITHUB.md`, `MCP.md` | Erik | — |
| `integraciones/ENGRAM.md` | Erik | — |
| `gestion/*` | Erik | Todo el equipo en el PR |

La memoria de sesión (bitácora, descubrimientos, contexto de conversación) vive
en Engram, no se commitea (`docu-memoria`, `integraciones/ENGRAM.md`).

## Propiedad de las herramientas del harness

Regla: cada pieza del harness declara su dueño en el frontmatter (`dueno`), y ese
valor debe existir en este archivo. `scripts/harness-check.sh` lo verifica en CI.
El índice vivo está en `integraciones/CAPACIDADES.md`; el mapa, en `HARNESS.md`.

| Herramienta | Dueño |
|---|---|
| Comandos `.opencode/commands/*` (6) | Erik |
| Subagentes `.opencode/agents/*` (2) | Erik |
| Skills propias `.opencode/skills/docu-*` (3) | Erik |
| Skills vendorizadas `.opencode/skills/vendor/*` (4) | Erik |
| Catálogo MCP (`opencode.json`) | Erik |
| Scripts del harness (`scripts/*`) | Erik |

Cambiar de dueño una herramienta es un PR que toca su `dueno` y esta tabla a la
vez. Detalle del proceso en `HARNESS.md` §5.

## Forma de trabajo

- Ramas: `feat/<issue>-<slug>` desde `main` (`gh issue develop N`); nada directo a `main`.
- PR pequeño, un cambio lógico, 1 revisor, CI en verde, evidencia adjunta.
- Definición de hecho: PR aprobado + pruebas del RF en verde + evidencia +
  issue etiquetado con su RF y cerrado por el PR.
- 1 issue `En progreso` por persona. Bloqueo > 24 h se escala con etiqueta.
- Sync lunes y viernes: qué moví, en qué estoy, qué me bloquea.
- Toda delegación usa `plantillas/BRIEF.md` y se enlaza desde su issue.

## Sobre las credenciales

Cada máquina tiene su `.env` local con las credenciales de Google. La gestión
usa la cuenta de GitHub de cada quien, sin tokens extra. **Nunca al repositorio.** `.env.example` documenta cada variable
existente; el líder reparte los valores. Ver `integraciones/` para qué se usa
cada una y con qué permiso.

## Project Management

GitHub es el centro único de operación del equipo: issues, milestones y Project
del repositorio (`decisiones/ADR-0008-github-como-gestor-del-equipo.md`). El
repositorio es también la fuente de verdad técnica; Google Drive es el espejo
administrativo de las entregas. Monday se dio de baja tras migrar todo su contenido.
Detalle en `integraciones/GITHUB-GESTION.md`.

## Referencias

- Visión: `proyecto/VISION.md`
- Plan con fechas: `gestion/PLAN-EPICAS.md`
- Ritmo y proceso: `gestion/RITMO-SEMANAL.md`
