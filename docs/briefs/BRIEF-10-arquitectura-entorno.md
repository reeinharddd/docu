# BRIEF #10 — Conocimiento experto por tarea + entorno y CI

## 0. Encabezado

- Issue: #10
- Dueño: Erik.
- Fechas: 2026-10-12 → 2026-10-13 · Sprint 1
- Prioridad / Tipo / Épica / Módulo: alta / tarea / Infraestructura / entorno.
- Requisitos: RF-06, RNF-05, RNF-06
- Bloqueado por: nada · Bloquea a: todo el equipo
- Nota: arquitectura y modelo documentados viven en #60 (→16-oct) y #62 (→23-oct).

## 1. Contexto

Cada tarea exige su conocimiento experto, y el agente debe traerlo puesto. Cuando Emmanuel diagrama, su opencode ya sabe normalización (1FN–3FN), buenas prácticas de Postgres, tipos PG18 y las decisiones del repo: eso lo hace experto sin configurar nada. Cuando Carlos escribe en el repo, el agente ya trae los estándares de Markdown, plantillas y validación con herramientas. Igual Kira y cada quien. Y sobre todo: si algo se construye de una manera, todo lo igual o relevante se sigue construyendo de la misma manera siempre — los paquetes fijan el patrón, no la memoria de cada quien. Este brief deja esos paquetes para las tareas de esta semana, más entorno y CI.

## 2. Por qué importa tu parte

Sin paquetes, cada persona enseña a mano a su agente y cada entrega sale con otro estilo. Si sale bien, pedir la tarea en texto normal basta: el agente responde como experto alineado al repo, y lo construido una vez marca cómo se construye siempre.

## 3. Objetivo y resultado esperado

| Entregable | Evidencia |
|---|---|
| Pack Emmanuel (diagramar #58) | Normalización, tipos PG18, naming, ADR-0009/0010, brief #58 y memorias cargados al pedir en texto normal |
| Pack Carlos (matriz #29) | CASO/RF-06, estándares MD del repo, plantilla ROLES, validación con herramientas |
| Pack Kira (playground) | Skills de diseño, tokens, WCAG, regla de no-merge |
| Pack Erik (tablero/SRS) | Comandos `gh`, reglas de gestión, Drive solo-lectura |
| Regla de consistencia | Escrito: lo construido de una manera se sigue construyendo igual; el patrón vive en STACK/plantillas, con ejemplo |
| Entorno + CI | `compose up` limpio + `/health` ok + `guardas`/`smoke` verdes (local/offline) |

## 4. Actividades específicas

1. Entorno (2 h): `infra/docker-compose.yml` + `scripts/dev.sh`. Terminado: `compose up` limpio el 13-oct.
2. Pack por persona (4 h): por cada tarea activa, fijar skills + reglas + estándares + ejemplos del repo que el agente debe traer. Terminado: prueba en vivo con cada uno el 13-oct (piden en texto normal, el agente responde como experto).
3. Regla de consistencia (1 h): escribirla con ejemplo (ej. naming de tablas, formato de briefs). Terminado: párrafo en §7 + referencia en `STACK.md` o plantillas.
4. Cuentas, reglas y CI (2 h): invitaciones GitHub (o motivo), `REGLAS.md`/`AGENTS.md`/`EQUIPO.md` al día, workflows + lefthook. Terminado: push corre guardas.

## 5. Entradas y salidas

- Recibe: `STACK.md`, briefs activos de la semana, decisiones en Engram.
- Entrega: al equipo, packs verificados en vivo el 13-oct. Comenta en #58, #29 y #43.

## 6. Referencias y caja de herramientas

- `BOOTSTRAP.md` (receta verificada 12-oct en clon limpio), `STACK.md` (`bun.lock` manda), `opencode.json`, `.opencode/`, `.github/workflows/`, `lefthook.yml`.

## 7. Cómo trabajar (incluye consistencia y re-enfoque)

- Todo reproducible en local/offline; versiones fijadas; prohibido `@latest`.
- **Consistencia:** lo construido de una manera se sigue construyendo igual siempre; el patrón vive en el repo (STACK, plantillas, skills), no en la cabeza de nadie.
- **Re-enfoque semanal:** cuando un brief cierra o cambia de fase, se revisan los packs de esa persona y se ajustan en el mismo PR del cambio (ej. Emmanuel pasa de diagramar a convertir a Prisma).

## 8. Criterios de aceptación

- [ ] `compose up` + `/health` ok + `doctor` sin FALTA el 13-oct.
- [ ] Prueba en vivo 13-oct por persona: texto normal → respuesta experta alineada.
- [ ] Regla de consistencia escrita con ejemplo.
- [ ] Cuentas invitadas o motivo; CI verde.

No es done si: alguien configura a mano lo que el pack debió traer; dos entregas iguales usan patrones distintos.

## 9. Riesgos nombrados

Puertos ocupados o Docker ausente. Mitigación: `PG_PORT`/`REDIS_PORT` en `.env`; `doctor` lo detecta. Sin entorno el 13-oct es bloqueo del equipo.

## 10. Revisión

Martes 13-oct en el sync: prueba en vivo con los 4. Después: #60 documenta; los packs se re-enfocan por semana.

## Versión corta (descripción del issue)

> [10] Packs experto 13-oct — Erik. Conocimiento por tarea + consistencia + entorno + CI, verificados en vivo. Arquitectura en #60. Detalle: `docs/briefs/BRIEF-10-arquitectura-entorno.md`.
