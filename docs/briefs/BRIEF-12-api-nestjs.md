# BRIEF #12 — API de ingesta y validación

## 0. Encabezado

- Issue: #12
- Dueño: Emmanuel Valenzuela Cruz (Backend).
- Fechas: 2026-11-13 → 2026-11-18 · Sprint 3 · hito `C1 vertical completa` (19-nov)
- Prioridad / Tipo / Épica / Módulo: alta / tarea / Backend / api.
- Requisitos: RF-01, RF-03
- Bloqueado por: #45 (la puerta TDD) · Bloquea a: #3, #4, #7
- Nota: el endpoint de ingesta no espera al pipeline: se construye con la suite primero, sobre el DDL ya aplicado (#58).

## 1. Contexto

La API es la única puerta de escritura del sistema (el worker procesa, la API encola: ADR-0011). Sin esqueleto modular, cada endpoint nace en el lugar equivocado y la validación de entrada queda a mano. Esta tarea deja los módulos por dominio, la validación global y el health, y después los endpoints de ingesta y dato oficial sobre el contrato congelado.

## 2. Por qué importa tu parte

El frontend (#4) y el pipeline (#3) consumen tus contratos. Si los módulos no existen o la validación no es global, cada historia posterior inventa su forma y RF-01/RF-03 no se demuestran. Si sale bien, el pipeline (#3) y las pantallas (#4) se montan sobre un contrato ya probado, no sobre supuestos.

## 3. Objetivo y resultado esperado

Esqueleto modular + endpoints de ingesta y dato oficial contra el contrato #23.

| Entregable | Evidencia |
|---|---|
| Módulos por dominio + config + health | `GET /health` ok con pg y redis; estructura en `apps/api/src/` |
| Validación global de entrada | `ValidationPipe({ whitelist: true })` + `enableShutdownHooks()`; prueba de rechazo a campo extra |
| Endpoints ingesta (subir, clasificar por familia, hash) | Colección de requests + respuestas con `sha256` y `familia` |
| Endpoints dato oficial (confirmar, historial) | Confirmar sin persona falla; al confirmar queda origen, regla y persona (RF-03) |
| Contratos para #4 | Documento de endpoints usado por el frontend |

Fase A (esqueleto, 13→14-nov): módulos, config, health, validación global; alimenta a #5. Fase B (negocio, 15→18-nov): endpoint de ingesta que valida por familia y deja el oficial listo para revisión.

## 4. Actividades específicas

1. Crear módulos por dominio (`auth`, `ingesta`, `oficial`) sobre el esqueleto actual. Terminado: `GET /health` responde ok.
2. Cablear validación global y apagado limpio. Terminado: campo extra rechazado + `SIGTERM` cierra conexiones.
3. Modelar Prisma desde el diagrama v1 aprobado del #7. Terminado: `prisma validate` verde + migración.
4. Implementar ingesta: subir → hash `sha256` → familia → estado. Terminado: 1 archivo por familia con su hash.
5. Implementar dato oficial: confirmar exige persona; historial solo-insert. Terminado: publicar sin confirmar es imposible (prueba).
6. Documentar contratos para #4. Terminado: tabla endpoint → request/response.

## 5. Entradas y salidas

- Recibe: entorno (#10), diagrama v1 + seed (#7), reglas como datos (ADR-0009), matriz (#29, vía #7).
- Entrega: a #5 esqueleto con guards cableables (14-nov); a Kira (#4) contratos + API corriendo; al pipeline (#3) ingesta usable. Comenta en #3, #4 y #5.

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

### 8.1 Contrato, pruebas y criterio de listo

**Contrato.** Un endpoint de ingesta que recibe un archivo de una familia
conocida, lo valida con las reglas cargadas, y devuelve el resultado con su
familia, su hash y su estado (oficial o cuarentena).

**Criterios (Given/When/Then).**

1. **Given** un archivo válido, **when** se ingesta, **then** responde con su
   hash, su familia y el identificador del dato oficial.
2. **Given** un archivo inválido, **when** se ingesta, **then** responde con la
   cuarentena y su motivo, y el original queda intacto.
3. **Given** una familia que el motor no conoce, **when** se ingesta, **then**
   la API responde con error de validación y **no** revienta ni acepta el dato.

**Plan de pruebas.** La suite de la API (#45) es la puerta: primero el test
falla, después el endpoint, después verde. Se corre `bun run verify` completo.

**Evidencia.** Salida de los tests con los casos 1-3, la respuesta real de una
ingesta y el PR con `Closes #12`.

**Listo cuando.** La ingesta valida por familia, no acepta lo inválido y la
suite está en verde.

## 9. Riesgos nombrados

El contrato #23 se mueve (12-nov) y la fase B se comprime. Mitigación: la fase A se cierra el 14-nov; desde el 15-nov sin DDL aplicado es bloqueo.

## 10. Revisión

Syncs lunes/viernes con Erik; demo de endpoints al cerrar fase B. Después: #4 consume, #3 integra.

## Versión corta (descripción del issue)


> [12] API de ingesta — Agent3835, 13→18-nov. Endpoint de ingesta que valida por familia y deja el dato oficial listo para revisión. Entradas recibidas de la arquitectura (#60), del contrato de datos y de las reglas de validación. Entregable: endpoint de ingesta probado, con la suite de #45 en verde. Revisión el 18-nov. Detalle: `docs/briefs/BRIEF-12-api-nestjs.md`.

