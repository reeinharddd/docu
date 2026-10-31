# Reconciliar GitHub y la documentación con la replanificación de C1 (v2)

## 0. Encabezado

- Issue (`#90`) / enlace: `https://github.com/reeinharddd/docu/issues/90` (se crea en la actividad 2)
- Dueño: Erik Alfonso Beltrán Ramírez (`reeinharddd`)
- Fechas (inicio-fin) / Sprint: 2026-10-31 → 2026-11-01 / `sprint:2`
- Prioridad / Tipo / Épica / Módulo: `alta` / `tarea` / `infraestructura` / gestión del proyecto
- Requisitos asociados (RF-/RNF-): `RNF-07` (calidad transversal)
- Bloqueado por (`#N`): — / Bloquea a (`#N`): #83, #84, #85, #86, #87, #88, #89, #90 y a los 18 issues que se reescriben en la actividad 3

## 1. Contexto

La replanificación de C1 v2 está escrita y aprobada en
`docs/gestion/REPLAN-2026-10-30.md` (PR #82), pero GitHub y los documentos de
gestión siguen con el plan viejo: los milestones son los de octubre, 18 issues
tienen otro título, fecha y responsable, no existe ninguno de los 8 issues
nuevos y el tablero tiene los Sprint del plan anterior. Esta tarea alinea
GitHub, el tablero y los documentos de gestión con la v2, y deja cada
delegación con su brief, que es lo que permite a Carlos, Emmanuel y Kira
trabajar sin depender de una conversación.

## 2. Por qué importa tu parte

Si esto no pasa, **los tres compañeros arrancan sin destino**: sin issue con
fecha, sin milestone, sin brief actualizado y sin brief nuevo. El freeze del
18-nov seatea sin planning y el 24-nov se llega sin saber qué se entregó.
Además, `docs/gestion/PLAN-EPICAS.md` y `TRAZABILIDAD.md` seguirían
describiendo el plan que ya no manda, y el índice documental mentiría sobre lo
que existe.

## 3. Objetivo y resultado esperado

**Objetivo:** que GitHub, el tablero y los documentos de gestión reflejen
exactamente la v2 del plan, con cada issue con dueño, fecha, milestone,
dependencias y brief.

| Entregable | Evidencia concreta |
|---|---|
| 5 milestones nuevos creados, 4 viejos cerrados con sus issues movidos | Salida de `gh api repos/{owner}/{repo}/milestones` |
| 8 issues nuevos (#83–#90) con título, cuerpo, etiquetas, responsable, milestone y dependencias | `gh issue list --state open` con las 8 filas |
| 18 issues reescritos con el título, la fecha y el responsable de la v2 | `gh issue list --state all` + `gh issue view N` de una muestra |
| Dependencias nativas `blocked by` entre los 26 issues | `gh api repos/{owner}/{repo}/issues/N/dependencies/blocked_by` |
| Tablero sincronizado, sin `En progreso` fantasma | `bun run project:sync` + `gh project item-list 1 --owner reeinharddd --format json` |
| `PLAN-EPICAS.md` reescrito con la secuencia de carriles | Diff del PR |
| `TRAZABILIDAD.md` re-verificado contra GitHub | Diff del PR con el conteo real de issues |
| `docs/README.md` con el índice al día | `bash scripts/doc-index.sh` sin discrepancias |
| 8 briefs nuevos y 18 reescritos, 7 al histórico | Árbol de `docs/briefs/` + `docs/.indice` |
| `bun run verify` en verde | Salida del comando |

## 4. Actividades específicas

### Actividad 1 — Crear los 5 milestones nuevos

**Entregable:** 5 milestones con fecha. **Terminado cuando** `gh api
repos/{owner}/{repo}/milestones` los lista con `state=open` y su `due_on`.

```bash
gh api repos/{owner}/{repo}/milestones -f title='C1 modelo y BD' \
  -f due_on='2026-11-12T00:00:00Z' \
  -f description='ER, migracion, modelo, contrato congelado y plataforma base.'
gh api repos/{owner}/{repo}/milestones -f title='C1 vertical completa' \
  -f due_on='2026-11-19T00:00:00Z' \
  -f description='Backend, IA, dataset, permisos y frontend corriendo de punta a punta.'
gh api repos/{owner}/{repo}/milestones -f title='Avances profesor' \
  -f due_on='2026-11-24T00:00:00Z' \
  -f description='Presentacion de avances con el profesor Yakko.'
gh api repos/{owner}/{repo}/milestones -f title='C1 final' \
  -f due_on='2026-12-03T00:00:00Z' \
  -f description='Presentacion final para todo el publico.'
gh api repos/{owner}/{repo}/milestones -f title='Post-C1' \
  -f description='Trabajo posterior a la presentacion final, sin fecha.'
```

### Actividad 2 — Crear los 8 issues nuevos

**Entregable:** #83–#90 creados. **Terminado cuando** los 8 aparecen en
`gh issue list --state open` con su responsable, su milestone y sus etiquetas.

| # | Título | Dueño | Fecha | Milestone | Etiquetas |
|---|---|---|---|---|---|
| 83 | Caso C1: involucrados, responsabilidades, flujos y conversaciones | reeinharddd | 6-nov | C1 modelo y BD | `tipo:tarea,prioridad:alta,sprint:2,epica:qa-documentacion,RNF-07` |
| 84 | Plataforma frontend: atomic, routing, kit, tests y CI | reeinharddd | 10-nov | C1 modelo y BD | `tipo:tarea,prioridad:alta,sprint:3,epica:frontend,RNF-01` |
| 85 | Integración IA: OCR, embeddings y LLM consultable | reeinharddd | 18-nov | C1 vertical completa | `tipo:tarea,prioridad:alta,sprint:3,epica:backend,RF-02,RF-04` |
| 86 | Replicabilidad: una orden reproduce dataset, seed y demo | WearyBerry | 19-nov | C1 vertical completa | `tipo:tarea,prioridad:media,sprint:3,epica:qa-documentacion,RNF-07` |
| 87 | SDD y TDD como método (ADR-0018, spec, guardas) | reeinharddd | 6-nov | C1 modelo y BD | `tipo:tarea,prioridad:alta,sprint:2,epica:infraestructura,RNF-07` |
| 88 | Limpieza documental: briefs, índices, verify, históricos | reeinharddd | 6-nov | C1 modelo y BD | `tipo:tarea,prioridad:media,sprint:2,epica:qa-documentacion,RNF-07` |
| 89 | Demo del 24-nov: guion, ensayo, video de respaldo y evidencias | reeinharddd | 20-nov | Avances profesor | `tipo:tarea,prioridad:critica,sprint:4,epica:qa-documentacion,RNF-07` |
| 90 | Reconciliar GitHub y la documentación con la replanificación v2 | reeinharddd | 1-nov | C1 modelo y BD | `tipo:tarea,prioridad:alta,sprint:2,epica:infraestructura,RNF-07` |

El cuerpo de cada issue lleva la versión corta de la plantilla de brief
(`docs/plantillas/BRIEF.md` §"Versión corta"), con el detalle apuntando a
`docs/briefs/BRIEF-<n>-<slug>.md`:

```bash
gh issue create --title 'Caso C1: involucrados, responsabilidades, flujos y conversaciones' \
  --body '> [83] Caso C1 - Erik, 6-nov. Cerrar el diseno del caso: personas, flujos, conversaciones, que falla, como se resuelve y por que afecta. Entrada: docs/proyecto/CASO.md. Entregable: CASO.md ampliado con mapa de derivacion. Detalle: docs/briefs/BRIEF-83-caso-c1.md' \
  --label 'tipo:tarea,prioridad:alta,sprint:2,epica:qa-documentacion,RNF-07' \
  --assignee reeinharddd --milestone 'C1 modelo y BD'
```

**Los 8 se crean con este patrón**, uno por uno, con el cuerpo de su fila.

### Actividad 3 — Reescribir los 18 issues existentes

**Entregable:** cada issue con el título, el responsable, las etiquetas y el
milestone de la v2. **Terminado cuando** `gh issue view N` de cada uno muestra
esos valores. `gh issue edit --label` **reemplaza** el juego completo de
etiquetas: hay que pasar todas.

| # | Título nuevo | Dueño | Fecha | Sprint | Milestone | Etiquetas |
|---|---|---|---|---|---|---|
| 58 | ER v1 de C1: draw.io fuente + texto derivado, DDL, vistas, triggers y migración | reeinharddd | 12-nov | 3 | C1 modelo y BD | `tipo:tarea,prioridad:alta,sprint:3,epica:base-de-datos,RF-08` |
| 59 | Seed reproducible desde el dataset | Agent3835 | 18-nov | 3 | C1 vertical completa | `tipo:tarea,prioridad:alta,sprint:3,epica:base-de-datos,RF-08` |
| 60 | Arquitectura y API de C1 | reeinharddd | 12-nov | 3 | C1 modelo y BD | `tipo:tarea,prioridad:alta,sprint:3,epica:infraestructura,RF-08` |
| 62 | Modelo de datos documentado + contrato congelado (SHA) | reeinharddd | 12-nov | 3 | C1 modelo y BD | `tipo:tarea,prioridad:alta,sprint:3,epica:infraestructura,RF-08` |
| 23 | Contrato de datos de C1 congelado | reeinharddd | 12-nov | 3 | C1 modelo y BD | `tipo:tarea,prioridad:alta,sprint:3,epica:infraestructura,RNF-07` |
| 45 | Primeras pruebas de la API en CI (puerta TDD) | Agent3835 | 12-nov | 3 | C1 modelo y BD | `tipo:tarea,prioridad:alta,sprint:3,epica:backend,RNF-07` |
| 61 | Dataset genérico y comprobable del mes | WearyBerry | 17-nov | 3 | C1 vertical completa | `tipo:tarea,prioridad:alta,sprint:3,epica:qa-documentacion,RNF-02,RNF-07` |
| 12 | API de ingesta y validación | Agent3835 | 18-nov | 3 | C1 vertical completa | `tipo:tarea,prioridad:alta,sprint:3,epica:backend,RF-01,RF-03` |
| 3 | Pipeline: archivo → reglas → oficial | Agent3835 | 18-nov | 3 | C1 vertical completa | `tipo:tarea,prioridad:critica,sprint:3,epica:backend,RF-01,RF-02` |
| 46 | Worker de BullMQ con colas por tipo de trabajo | Agent3835 | 18-nov | 3 | C1 vertical completa | `tipo:tarea,prioridad:critica,sprint:3,epica:backend,RF-01,RNF-04` |
| 44 | Garantía solo-insert en la base | Agent3835 | 18-nov | 3 | C1 vertical completa | `tipo:tarea,prioridad:alta,sprint:3,epica:backend,RF-03,RF-06` |
| 5 | RBAC en servidor, bitácora y reglas | Agent3835, WearyBerry | 18-nov | 3 | C1 vertical completa | `tipo:tarea,prioridad:alta,sprint:3,epica:autenticacion,RF-02,RF-06,RNF-03` |
| 7 | C1: carga del dataset y verificación de punta a punta | Agent3835 | 19-nov | 3 | C1 vertical completa | `tipo:historia,prioridad:media,sprint:3,epica:base-de-datos,RF-08` |
| 11 | Mockups funcionales: flujo del caso con datos reales | kirxllix | 16-nov | 3 | C1 vertical completa | `tipo:tarea,prioridad:alta,sprint:3,epica:diseno,RNF-01` |
| 4 | Frontend del caso contra la API real, con tokens, tests y estilos | kirxllix | 18-nov | 3 | C1 vertical completa | `tipo:tarea,prioridad:alta,sprint:3,epica:frontend,RF-01,RF-03,RF-04` |
| 6 | Demo final: guion, evidencia y replicabilidad | reeinharddd, WearyBerry | 3-dic | 4 | C1 final | `tipo:tarea,prioridad:alta,sprint:4,epica:qa-documentacion,RNF-07` |
| 8 | C2: segunda instalación, se reprograma después del 3-dic | — | post-3-dic | — | Post-C1 | `tipo:historia,prioridad:media,epica:infraestructura,RF-08,RNF-03,RNF-07` |

```bash
gh issue edit 58 --title 'ER v1 de C1: draw.io fuente + texto derivado, DDL, vistas, triggers y migración' \
  --body '> [58] ER v1 - Erik, 12-nov. Diseno completo de la base: ER hibrido, DDL, enums, vistas, triggers y migracion aplicada. Entrada: docs/gestion/REPLAN-2026-10-30.md S3 y docs/ingenieria/DIAGRAMA-BD-v0.md. Entregable: draw.io fuente + texto derivado + migracion + contrato con SHA. Detalle: docs/briefs/BRIEF-58-diagrama-v0.md' \
  --label 'tipo:tarea,prioridad:alta,sprint:3,epica:base-de-datos,RF-08' \
  --assignee reeinharddd --milestone 'C1 modelo y BD'
```

**Los 18 se editan con este patrón.** #23 se reabre (`gh issue reopen 23`)
antes de editar. #8 pierde la etiqueta `sprint` y su responsable, porque su
fecha se reprograma.

### Actividad 4 — Registrar las dependencias nativas

**Entregable:** grafo `blocked by` en GitHub. **Terminado cuando** cada
`blocked_by` responde con la lista esperada.

| Issue bloqueado | Bloqueado por | Por qué |
|---|---|---|
| 58 | 83 | El ER deriva del caso cerrado |
| 60 | 58 | La arquitectura describe el modelo ya decidido |
| 62 | 58 | El modelo documentado describe el ER ya cerrado |
| 23 | 62, 61 | El contrato congelado necesita modelo y dataset |
| 59 | 58, 61 | El seed necesita el DDL y los archivos del dataset |
| 44 | 58 | El solo-insert se instala sobre el esquema |
| 45 | 87 | La puerta TDD necesita el método definido |
| 12 | 45 | La API se construye con la suite primero |
| 3 | 12 | El pipeline usa la API de ingesta |
| 46 | 3 | El worker procesa lo que el pipeline encola |
| 5 | 58 | Los permisos se calculan sobre el modelo |
| 61 | 83, 58 | El dataset sale del caso y respeta el DDL |
| 84 | 87 | La plataforma se construye con el método y las guardas |
| 85 | 58, 61 | La IA corre sobre el DDL y se mide con el corpus |
| 86 | 61, 59 | La replicabilidad encadena dataset y seed |
| 7 | 12, 3, 59, 85 | La verificación de punta a punta necesita todo |
| 11 | 83, 84 | Los mockups salen del caso y de la plataforma |
| 4 | 11, 12 | Las pantallas reales consumen la API |
| 89 | 7, 4, 85 | La demo necesita la vertical completa |
| 6 | 89 | La final se apoya en la demo de avances |

```bash
gh api repos/{owner}/{repo}/issues/58/dependencies/blocked_by -X POST -F dependency_issue_id=83
```

**Una llamada por fila.** Verificar con:

```bash
gh api repos/{owner}/{repo}/issues/89/dependencies/blocked_by --jq '.[].number'
```

### Actividad 5 — Mover los issues y cerrar los milestones viejos

**Entregable:** 0 issues en los milestones cerrados. **Terminado cuando**
`gh api repos/{owner}/{repo}/milestones` marca los 4 viejos como `closed` y
los 5 nuevos como `open`.

```bash
gh api repos/{owner}/{repo}/milestones --jq '.[]|"\(.number) \(.title) \(.state)"'
gh api repos/{owner}/{repo}/milestones/1 -X PATCH -f state=closed   # Cierre de diseño
gh api repos/{owner}/{repo}/milestones/3 -X PATCH -f state=closed   # Fin del desarrollo
gh api repos/{owner}/{repo}/milestones/4 -X PATCH -f state=closed   # Listos para presentar
gh api repos/{owner}/{repo}/milestones/5 -X PATCH -f state=closed   # Presentación de diciembre
```

El milestone 2 (`Contrato de datos congelado`) queda **abierto** hasta que #23
se cierre con evidencia; su fecha se actualiza a 12-nov.

### Actividad 6 — Sincronizar el tablero

**Entregable:** el Project #1 refleja las etiquetas nuevas y no tiene
`En progreso` fantasma. **Terminado cuando** `gh project item-list` muestra
`Status` coherente y `Inicio`/`Fin` con las fechas de la v2.

```bash
GH_TOKEN=$(env -u GITHUB_TOKEN gh auth token) bun run project:sync
gh project item-list 1 --owner reeinharddd --format json --limit 100 \
  --jq '.items[]|select(.content.number>=58)|"\(.content.number) \(.status) \(.content.title)"'
```

Después de la sincronización, **solo #58** queda `En progreso` (es el trabajo
que Erik tiene abierto). Si el Project no acepta la etiqueta de estado por
API, se deja `En progreso` en #58 desde la interfaz, como se documenta en
`docs/integraciones/GITHUB-GESTION.md`.

### Actividad 7 — Reescribir los documentos de gestión

**Entregable:** tres documentos alineados con la v2. **Terminado cuando**
`PLAN-EPICAS.md` tiene la tabla de carriles de `REPLAN-2026-10-30.md` §5,
`TRAZABILIDAD.md` refleja el conteo real de issues y el índice lista lo que
existe.

- `docs/gestion/PLAN-EPICAS.md`: la tabla de órdenes pasa a ser la de los 8
  carriles con su fecha, su dueño y su bloque; se borra la tabla de 18 filas
  del plan viejo.
- `docs/gestion/TRAZABILIDAD.md`: re-verificar contra `gh issue list --state
  all` (el conteo real tras esta tarea), cerrar el hueco de RF-07/RF-08
  declarándolos transversales, y añadir las filas de los issues nuevos.
- `docs/README.md`: `gestion/` pasa a "plan por carriles, trazabilidad,
  replanificación"; `diseno/` sigue vacío y se dice por qué; `ingenieria/`
  refleja el diagrama de BD y los estudios de mercado nuevos.

```bash
bash scripts/doc-index.sh --fix
bash scripts/doc-index.sh
```

### Actividad 8 — Dejar los briefs al día

**Entregable:** 8 briefs nuevos, 18 reescritos, 7 archivados. **Terminado
cuando** cada issue abierto tiene un brief que coincide con su título, su
fecha y su responsable, y `docs/.indice` no tiene discrepancias.

1. **Archivar al histórico** (issues cerrados): `BRIEF-10-arquitectura-entorno.md`,
   `BRIEF-13-srs.md`, `BRIEF-32-evaluacion-ocr.md`, `BRIEF-41-marca-fase1.md`,
   `BRIEF-41-fase2-design-system.md`, `BRIEF-42-playground-diseno.md` y
   `BRIEF-43-gestion-project.md` → `docs/briefs/historico/`.
2. **Reescribir** los briefs de los issues que cambian de título o fecha:
   `BRIEF-58`, `BRIEF-59`, `BRIEF-60`, `BRIEF-61`, `BRIEF-62`, `BRIEF-03`,
   `BRIEF-04`, `BRIEF-05`, `BRIEF-07`, `BRIEF-11` y `BRIEF-12`. Cada uno
   adopta el formato de spec de `docs/plantillas/BRIEF.md` (criterios
   Given/When/Then, contrato, plan de pruebas, evidencia, criterio de listo).
3. **Crear** los briefs que no existen: `BRIEF-45-pruebas-api.md`,
   `BRIEF-46-worker-bullmq.md`, `BRIEF-44-solo-insert.md`,
   `BRIEF-06-demo-final.md`, `BRIEF-83-caso-c1.md`,
   `BRIEF-84-plataforma-frontend.md`, `BRIEF-85-integracion-ia.md`,
   `BRIEF-86-replicabilidad.md`, `BRIEF-87-sdd-tdd.md`,
   `BRIEF-88-limpieza.md`, `BRIEF-89-demo-24-nov.md`.
   `BRIEF-08` se crea cuando #8 se reprograme, no ahora.

### Actividad 9 — Verificar y abrir los PRs

**Entregable:** 4 PRs con evidencia. **Terminado cuando** `bun run verify` está
verde y cada PR cita su resultado.

| PR | Contenido | Rama |
|---|---|---|
| C1 | GitHub: milestones, issues, dependencias, tablero | `docs/reconciliacion-github` |
| C2 | Briefs nuevos de #83–#90 | `docs/briefs-nuevos` |
| C3 | Briefs reescritos de los issues existentes | `docs/briefs-v2` |
| C4 | `PLAN-EPICAS.md`, `TRAZABILIDAD.md`, `docs/README.md` | `docs/gestion-v2` |

```bash
bun run verify
```

Los PRs de docs llevan la etiqueta `sin-issue`; los de código llevan
`Closes #N`.

## 5. Entradas y salidas

- **Recibe:** `docs/gestion/REPLAN-2026-10-30.md` (la v2), el estado real de
  GitHub (`gh issue list --state all`, `gh api .../milestones`), los briefs
  existentes en `docs/briefs/` y `docs/plantillas/BRIEF.md`.
- **Entrega:** GitHub alineado con la v2 (milestones, issues, dependencias,
  tablero), tres documentos de gestión reescritos, 26 briefs al día y 4 PRs
  con evidencia de `bun run verify`.

## 6. Referencias y caja de herramientas

| Para qué | Qué usar |
|---|---|
| Crear milestones | `gh api repos/{owner}/{repo}/milestones -f title=... -f due_on=...` |
| Crear y editar issues | `gh issue create` / `gh issue edit` (el `--label` reemplaza el juego completo) |
| Dependencias nativas | `gh api repos/{owner}/{repo}/issues/N/dependencies/blocked_by -X POST -F dependency_issue_id=M` |
| Tablero | `GH_TOKEN=$(env -u GITHUB_TOKEN gh auth token) bun run project:sync` |
| Índice documental | `bash scripts/doc-index.sh --fix` (obligatorio: CI falla si el índice miente) |
| Verificación | `bun run verify` |
| Normas | `docs/REGLAS.md`, `docs/integraciones/GITHUB-GESTION.md`, `docs/proyecto/EQUIPO.md` |
| Plantillas | `docs/plantillas/BRIEF.md`, `docs/plantillas/ADR.md` |

**Alternativa automatizable obligatoria:** los milestones, los títulos, las
etiquetas y las dependencias salen de las tablas de este brief: se ejecutan con
`gh`, no a mano en la interfaz, y la salida de cada comando se pega como
evidencia.

## 7. Cómo trabajar

- La IA genera y varía; no decide reglas, permisos, dato oficial ni diseño
  final.
- Todo lo generado lleva seed o versión: reproducible o no existe.
- Duda de 30 minutos = preguntar al equipo. Bloqueo de 24 horas = escalar al
  líder con etiqueta.
- PRs pequeños, 1 revisor, evidencia adjunta.
- Nada de commit ni push sin verificación previa del líder (regla 10).

## 8. Criterios de aceptación

- [ ] `gh api repos/{owner}/{repo}/milestones` muestra 5 milestones abiertos
      con las fechas 12-nov, 19-nov, 24-nov y 3-dic, y `Post-C1` sin fecha.
- [ ] Los 4 milestones viejos están cerrados y sin issues abiertos dentro.
- [ ] Existen #83–#90 con el título, el responsable, el milestone y las
      etiquetas de la tabla de la actividad 2.
- [ ] Los 18 issues de la actividad 3 muestran el título, la fecha, el
      responsable y el milestone nuevos.
- [ ] `gh api repos/{owner}/{repo}/issues/89/dependencies/blocked_by` devuelve
      7, 4 y 85.
- [ ] El tablero no tiene `En progreso` fantasma: solo #58.
- [ ] `PLAN-EPICAS.md`, `TRAZABILIDAD.md` y `docs/README.md` reflejan la v2.
- [ ] `docs/briefs/historico/` tiene los 7 briefs archivados y cada issue
      abierto tiene su brief con fecha y responsable actualizados.
- [ ] `bash scripts/doc-index.sh` reporta 0 discrepancias.
- [ ] `bun run verify` en verde, con la salida pegada en los PRs.

## 9. Riesgos nombrados

| Riesgo | Mitigación | Bloqueo desde |
|---|---|---|
| Un número de issue se aparta de la tabla porque otro issue se creó mientras tanto | Crear los 8 en el orden de la tabla y verificar el número real antes de escribir el cuerpo; si difiere, se ajusta la tabla, no el plan | 1-nov |
| El tablero no acepta el estado por API | Dejar `En progreso` manual solo en #58, como ya está documentado | 1-nov |
| Los 26 briefs se escriben de más rápido y quedan como contexto repetido | Cada brief apunta al documento del repo que lo sostiene y no repite lo que ya está escrito | 6-nov |
| Los documentos de gestión divergen otra vez del plan | `PLAN-EPICAS.md` y `TRAZABILIDAD.md` se corrigen en el mismo PR que cambia las etiquetas (regla 6 de la skill de gestión) | 1-nov |

## 10. Revisión

El líder (Erik) revisa los 4 PRs antes de fusionar. La revisión es contra la
v2 del plan, no contra criterio propio: si una tabla del brief y la v2 se
discrepan, **manda la v2** y se corrige el brief.

---

> [90] Reconciliar GitHub y la documentación con la replanificación v2 — Erik,
> 31-oct → 1-nov. Objetivo: que GitHub, el tablero y los documentos de gestión
> digan lo mismo que el plan. Entrada: `docs/gestion/REPLAN-2026-10-30.md`.
> Entregable: 5 milestones, 26 issues, 20 dependencias, 26 briefs y 3
> documentos reescritos, con evidencia de `bun run verify`. Revisión el
> 1-nov. Detalle: `docs/briefs/BRIEF-90-reconciliacion-github.md`.

## Review Focus

Cinco formas de falla que la spec implica y que ninguna prueba cubre:

1. **Un issue queda sin brief o con el brief viejo.** Una persona abre el
   issue, ve la fecha nueva y el brief con la fecha anterior, y arranca
   confundido. Pin: cada issue abierto tiene brief cuyo encabezado coincide
   con su título, su responsable y su fecha.
2. **El tablero y GitHub discrepan.** El Project dice "En progreso" en un
   issue cerrado o la fecha del tablero es la vieja. Pin: después del
   `project:sync`, el `Status` y las fechas del tablero coinciden con las
   etiquetas de los 26 issues.
3. **Un milestone se cierra con issues dentro.** Alguien sigue trabajando con
   la fecha de un milestone muerto. Pin: los 4 milestones viejos cerrados
   tienen 0 issues abiertos.
4. **Una etiqueta de requisito se pierde al reescribir.** `gh issue edit
   --label` reemplaza el juego completo: un `RF-` que se olvide rompe la
   trazabilidad sin que nada falle. Pin: los 26 issues tienen al menos un
   `RF-`/`RNF-`, verificado con `gh issue list --label req:pendiente` vacío.
5. **Un número de issue se aparta de la tabla** porque se creó otro issue
   mientras tanto y el brief apunta al número equivocado. Pin: cada issue
   creado se verifica con `gh issue view N` antes de seguir al siguiente.
