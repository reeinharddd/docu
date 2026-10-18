# BRIEF #12 — API NestJS: esqueleto, ingesta y dato oficial

## 0. Encabezado

- Issue: #12
- Dueño: Emmanuel (ejecuta), Erik (revisa).
- Fechas: propuesto 2026-10-20 → 2026-11-06 · Sprint 1→2
- Prioridad / Tipo / Épica / Módulo: alta / tarea / Backend / api.
- Requisitos: RF-01, RF-03, RNF-05
- Bloqueado por: #10 · Bloquea a: #4, #3
- Nota: endpoints de negocio esperan v1 (#59) y contrato (#23).

## 1. Contexto

La API es la única puerta de escritura del sistema (el worker procesa, la API encola: ADR-0011). Sin esqueleto modular, cada endpoint nace en el lugar equivocado y la validación de entrada queda a mano. Esta tarea deja los módulos por dominio, la validación global y el health, y después los endpoints de ingesta y dato oficial sobre el contrato congelado.

## 2. Por qué importa tu parte

El frontend (#4) y el pipeline (#3) consumen tus contratos. Si los módulos no existen o la validación no es global, cada historia posterior inventa su forma y RF-01/RF-03 no se demuestran. Si sale bien, el 30-oct el contrato se implementa en horas, no en días.

## 3. Objetivo y resultado esperado

Esqueleto modular + endpoints de ingesta y dato oficial contra el contrato #23.

| Entregable | Evidencia |
|---|---|
| Módulos por dominio + config + health | `GET /health` ok con pg y redis; estructura en `apps/api/src/` |
| Validación global de entrada | `ValidationPipe({ whitelist: true })` + `enableShutdownHooks()`; prueba de rechazo a campo extra |
| Endpoints ingesta (subir, clasificar por familia, hash) | Colección de requests + respuestas con `sha256` y `familia` |
| Endpoints dato oficial (confirmar, historial) | Confirmar sin persona falla; al confirmar queda origen, regla y persona (RF-03) |
| Contratos para #4 | Documento de endpoints usado por el frontend |

Fase A (esqueleto, 20→27-oct, sin esperar el contrato): módulos, config, health, validación; alimenta a #5. Fase B (negocio, tras #5 y #23): endpoints.

## 4. Actividades específicas

1. Crear módulos por dominio (`auth`, `ingesta`, `oficial`) sobre el esqueleto actual. Terminado: `GET /health` responde ok.
2. Cablear validación global y apagado limpio. Terminado: campo extra rechazado + `SIGTERM` cierra conexiones.
3. Modelar Prisma desde el diagrama v1 aprobado del #7. Terminado: `prisma validate` verde + migración.
4. Implementar ingesta: subir → hash `sha256` → familia → estado. Terminado: 1 archivo por familia con su hash.
5. Implementar dato oficial: confirmar exige persona; historial solo-insert. Terminado: publicar sin confirmar es imposible (prueba).
6. Documentar contratos para #4. Terminado: tabla endpoint → request/response.

## 5. Entradas y salidas

- Recibe: entorno (#10), diagrama v1 + seed (#7), reglas como datos (ADR-0009), matriz (#29, vía #7).
- Entrega: a #5 esqueleto con guards cableables (27-oct); a Kira (#4) contratos + API corriendo; a Erik (#3) ingesta usable. Comenta en #3, #4 y #5.

## 6. Referencias y caja de herramientas

- `ingenieria/STACK.md` §2.3 (NestJS 12: ESM `nodenext`, DI, Terminus), `ingenieria/MODELO-DATOS.md` (tras v1), ADR-0009/0010/0011, `ecc-nestjs-patterns` (obligatoria), `ecc-prisma-patterns` (obligatoria).
- Docs oficiales: https://docs.nestjs.com (guards, DI, `emitDecoratorMetadata`), https://www.prisma.io/docs/orm/v7 (migraciones, `prisma.config.ts`).
- Comandos: `bun --env-file ../../.env src/main.ts` desde `apps/api`, `bunx prisma migrate dev` desde `apps/api`, `bun run verify`.

Neutralidad: este brief basta con el solo contexto del repo.

## 7. Cómo trabajar

- Rama `feat/12-<slug>` desde `main`; `/tarea 12` y `/cerrar`.
- E1: nada de lógica de negocio hasta las puertas de ADR-0012; fase A es esqueleto, fase B espera contrato.
- Ningún provider inyectado por constructor se importa con `import type` (rompe DI por `emitDecoratorMetadata`).
- TypeScript estricto, sin `any` sin justificación. `.env` fuera del repo. 1 issue En progreso; bloqueo >24 h con `bloqueado`.

## 8. Criterios de aceptación

- [ ] `/health` ok con pg y redis; campo extra rechazado.
- [ ] 1 archivo por familia con hash y estado; inválido a cuarentena con motivo.
- [ ] Publicar sin confirmar imposible; confirmación deja origen, regla y persona.
- [ ] Contratos documentados y usados por #4.
- [ ] `bun run verify` en verde; PR con `Closes #12` (fase correspondiente).

No es done si: un endpoint acepta campos sin validar; el schema no sale del diagrama v1; falta el contrato para #4.

## 9. Riesgos nombrados

El contrato #23 se mueve (30-oct flexible) y la fase B se comprime. Mitigación: fase A completa el 23-oct; desde el 2026-10-30 sin contrato es bloqueo.

## 10. Revisión

Syncs lunes/viernes con Erik; demo de endpoints al cerrar fase B. Después: #4 consume, #3 integra.

## Versión corta (descripción del issue)

> [12] API NestJS — Emmanuel, propuesto 20-oct → 06-nov. Esqueleto + ingesta y dato oficial sobre contrato #23. Fase A 20→27-oct (alimenta #5), fase B tras #5+#23. Detalle: `docs/briefs/BRIEF-12-api-nestjs.md`.
