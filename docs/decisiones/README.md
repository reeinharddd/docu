# Decisiones de ingeniería (ADR)

Un ADR registra **una** decisión de ingeniería: por qué se eligió algo sobre sus
alternativas y qué se acepta a cambio. No es un changelog, no es una nota de
tarea y no se reescribe.

## Cuándo abrir un ADR

Obligatorio cuando la decisión:

- cambia una dependencia de primer nivel (framework, base de datos, cola, runtime);
- afecta la forma del código para siempre (monolito modular, ESM, esquema de datos);
- fija una política con costo (paginación, consistencia, retención);
- descarta una alternativa que alguien volverá a proponer.

No hace falta ADR para: agregar una dependencia menor, corregir un bug,
cambiar nombres, ajustar estilos.

## Proceso

1. Quien decide abre el PR con `plantillas/ADR.md` copiado a
   `decisiones/ADR-NNNN-slug.md`, con el siguiente número libre.
2. Requiere **un revisor** y CI en verde. Los ADRs de infraestructura y los que
   tocan datos exigen además visto bueno de Erik.
3. Se aprueba con `Estado: Aceptada` en el merge. Nada se marca "aceptada" antes.
4. Si más adelante se revierte: el ADR original pasa a
   `Estado: Reemplazada por ADR-NNNN` y se escribe el nuevo. Los dos quedan.

Formato de fecha: `YYYY-MM-DD`. Idioma: español. Código y nombres: inglés.

## Índice

| ADR | Decisión | Estado | Fecha |
|---|---|---|---|
| [0001](ADR-0001-flujos-de-trabajo-del-agente.md) | Flujos de trabajo del agente dentro del proyecto | Aceptada | 2026-09-26 |
| [0002](ADR-0002-bun-como-runtime-y-gestor.md) | Bun 1.4.2 como runtime y gestor de paquetes del monorepo | Aceptada | 2026-10-05 |
| [0003](ADR-0003-angular-zoneless-sin-zone-js.md) | Angular 22 zoneless, sin zone.js | Aceptada | 2026-10-05 |
| [0004](ADR-0004-prisma-postgresql-pgvector.md) | Prisma 7 con driver adapter sobre PostgreSQL 18 + pgvector | Aceptada | 2026-10-05 |
| [0005](ADR-0005-bullmq-para-trabajo-pesado.md) | BullMQ y Redis para OCR y trabajo asíncrono | Aceptada | 2026-10-05 |
| [0006](ADR-0006-ia-propone-humano-dispone.md) | La IA propone, el humano dispone | Aceptada | 2026-09-26 |
| [0007](ADR-0007-contrato-de-herramientas-del-agente.md) | El contrato del agente y sus herramientas viven en el repositorio | Aceptada | 2026-10-05 |
| [0008](ADR-0008-github-como-gestor-del-equipo.md) | GitHub Issues y Projects como gestor del equipo, en lugar de Monday | Aceptada | 2026-10-06 |

Pendientes de redactar, con la decisión ya tomada y verificada:

| # | Decisión pendiente de documentar |
|---|---|
| 0009 | Las reglas del caso son datos en `ReglaValidacion`, no código |
| 0010 | Bitácora e historial solo-insert |
| 0011 | Arquitectura: API encola, worker procesa, la IA propone dentro del worker |

## Reglas de esta carpeta

- Nada de secretos, tokens ni valores de `.env`. Solo nombres de variables.
- Si un ADR menciona una versión, es la versión real del `package.json`; si no
  cuadra, se arregla el ADR o la dependencia, no las dos cosas.
- Un ADR con `Estado: Propuesta` no manda. Eso es un RFC, y vive en `plantillas/RFC.md`.