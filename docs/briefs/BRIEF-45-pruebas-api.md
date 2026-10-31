# BRIEF #45 — Suite de pruebas de la API: la puerta que abre el backend

## 0. Encabezado

- Issue: #45 — https://github.com/reeinharddd/docu/issues/45
- Dueño: Emmanuel Valenzuela Cruz (`Agent3835`)
- Fechas: 2026-11-02 → 2026-11-06 · Sprint 2 · hito `C1 modelo y BD` (12-nov)
- Prioridad / Tipo / Épica / Módulo: crítica / tarea / Backend / calidad
- Requisitos: RNF-04, RNF-07
- Bloqueado por: — · Bloquea a: #12, #3, #85, #86

## 1. Contexto

Hoy la API tiene cero pruebas: `verify` la arranca y le pega un `/health`,
nada más. El plan v2 pone TDD en el centro, pero la puerta tiene que existir
antes: un runner, una base de pruebas, un patrón de pruebas de integración
para NestJS y los primeros casos reales.

## 2. Por qué importa tu parte

Sin esta puerta, #12, #3 y #85 se escriben sin red y #87 no puede poner la
puerta de TDD en la CI. Con ella, cada endpoint llega con su prueba y el
equipo puede refactorizar sin miedo. Es la dependencia más bloqueante de todo
el plan.

## 3. Objetivo y resultado esperado

| Entregable | Evidencia |
|---|---|
| Runner y configuración | Pruebas de API que corren con `bun run test` en el workspace, con cobertura y reporte |
| Base de pruebas | Base separada (testcontainers o base efímera) con el esquema migrado y datos mínimos |
| Patrón de integración | Un ejemplo real de prueba de endpoint: arrange, act, assert, con la validación probada |
| Casos iniciales | Al menos el `/health`, un caso de validación y un caso de persistencia |
| CI | La suite corre en la CI y bloquea el merge cuando falla |

## 4. Actividades específicas

1. Elegir el runner y añadirlo al workspace de la API, con el comando
   `test`. Terminado: el comando existe y corre (aunque sea con un caso).
2. Levantar la base de pruebas de forma reproducible. Terminado: la suite
   levanta su base sin pasos manuales y sin tocar la de desarrollo.
3. Escribir el patrón de prueba de endpoint. Terminado: hay un ejemplo
   documentado que el equipo copia.
4. Escribir los casos iniciales. Terminado: `/health`, validación y
   persistencia, cada uno con su aserción.
5. Conectar la suite a la CI. Terminado: la CI corre la suite y una prueba
   rota la detiene.

## 5. Entradas y salidas

- Recibe: `apps/api/`, la configuración de Prisma, `scripts/smoke-api.sh` (lo
  que ya hace de prueba) y `docs/ingenieria/STACK.md`.
- Entrega: la suite en `apps/api/`, la configuración y el patrón, por PR con
  `Closes #45`.

## 6. Referencias y caja de herramientas

- `apps/api/package.json`: los scripts y dependencias actuales.
- `docs/decisiones/ADR-0004-prisma-postgresql-pgvector.md`: driver adapter y
  cómo se hace la migración en pruebas.
- `docs/ingenieria/STACK.md`: versiones exactas de Vitest o Jest disponibles.
- `scripts/smoke-api.sh`: el precedente de prueba que existe.
- `docs/decisiones/ADR-0011-api-encola-worker-procesa.md`: la API encola; las
  pruebas del worker van aparte (#46).
- Skill `ecc-prisma-patterns`: trampas de Prisma en pruebas.
- Skill `ecc-nestjs-patterns`: patrón de pruebas de integración.

## 7. Cómo trabajar

- La puerta se abre verde: la suite debe pasar **antes** de que la use nadie,
  para que nadie desconfíe de ella.
- Nada de pruebas que dependan de red externa ni de datos sucios.
- PR pequeño, 1 revisor (Erik), la salida de la suite pegada en el PR.

## 8. Criterios de aceptación

- [ ] `bun run test` del workspace de la API corre y pasa.
- [ ] La base de pruebas se levanta sola, sin pasos manuales.
- [ ] Hay un patrón documentado de prueba de endpoint.
- [ ] Existen los casos de `/health`, validación y persistencia.
- [ ] La CI corre la suite y una prueba rota detiene el merge.

### 8.1 Contrato, pruebas y criterio de listo

**Contrato.** La suite es la puerta: es rápida, aislada y determinista. Si
necesita pasos manuales, no es una puerta.

**Criterios (Given/When/Then).**

1. **Given** un clone limpio, **when** se corre `bun run test`, **then** la
   suite levanta su base, corre y pasa sin intervención.
2. **Given** una prueba que se rompe, **when** corre la CI, **then** el merge
   queda bloqueado y el fallo se ve en el reporte.
3. **Given** dos personas, **when** corren la suite a la vez, **then** no se
   pisan la base ni los datos.

**Plan de pruebas.** La prueba de sí misma: clone limpio con la suite en
verde; una PR con una prueba rota que la CI detiene; y dos corridas
simultáneas.

**Evidencia.** La salida de la suite, la salida de la CI con la PR rota y el
patrón documentado.

**Listo cuando.** La suite pasa en limpio, bloquea una PR rota y el equipo ya
la usa en #12.

## 9. Riesgos nombrados

Que la suite sea lenta y el equipo la odie: la mitigación es medirla y
mantenerla por debajo de dos minutos. Si no se puede, se documenta el costo y
se acepta, pero no se deja para después.

## 10. Revisión

Viernes 6-nov en el sync: se corre la suite en limpio frente al equipo y se
afirma o se devuelve con motivos. Después: #12 empieza con la puerta abierta.

## Versión corta (descripción del issue)

> [45] Suite de pruebas de la API — Agent3835, 2→6-nov. La puerta TDD: runner, base de pruebas aislada, patrón de integración y CI que bloquea el merge. Entradas recibidas de apps/api y de scripts/smoke-api.sh. Entregable: suite verde en clone limpio, corriendo en CI. Revisión el 6-nov. Detalle: `docs/briefs/BRIEF-45-pruebas-api.md`.
