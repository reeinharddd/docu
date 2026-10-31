# BRIEF #5 — RBAC en servidor, bitácora y reglas

## 0. Encabezado

- Issue: #5
- Dueño: Emmanuel Valenzuela Cruz + Carlos Ariel Martín Rojas (Erik revisa)
- Fechas: 2026-11-13 → 2026-11-18 · Sprint 3 · hito `C1 vertical completa` (19-nov)
- Prioridad / Tipo / Épica / Módulo: alta / tarea / Autenticación / permisos.
- Requisitos: RF-02, RF-06, RNF-03
- Bloqueado por: #58 · Bloquea a: #4, #39
- Nota: los permisos viven en la API, no en la BD: sin esqueleto no hay dónde cablearlos.

## 1. Contexto

Los permisos se deciden en el servidor; el front solo oculta (principio 5 de VISION). La matriz de Carlos (#29) y el modelo del #7 son las entradas: sin ellas, programar permisos es inventar. Esta tarea convierte matriz + modelo en guards, bitácora append-only y reglas evaluables.

## 2. Por qué importa tu parte

Sin RBAC efectivo, el aislamiento entre instalaciones (C2) y RF-06 no se demuestran: la prueba de 2 usuarios debe fallar en el servidor, no en el botón. Si sale bien, cada pantalla y cada reporte heredan permisos sin código extra.

## 3. Objetivo y resultado esperado

Autorización efectiva en servidor + bitácora completa + reglas como datos.

| Entregable | Evidencia |
|---|---|
| Guards por rol y alcance (propio, departamento, instalación) | Prueba: usuario de la instalación 2 no lee ni escribe la instalación 1, incluidas rutas indirectas |
| Bitácora append-only (quién subió, quién confirmó) | Tabla con actor, acción, entidad, detalle; nada la edita ni borra |
| Reglas R-P1..T1 evaluables desde `ReglaValidacion` | 1 caso por regla ejecutado por el evaluador, no por `if` |
| Prueba "un departamento no lee otro" (#26) | Caso verde en el PR |

## 4. Actividades específicas

1. Aplicar matriz #29 como datos (mapeo puestos→roles base, sin crear roles en código). Terminado: `ROLES.md` aplicado en seed.
2. Implementar guards en servidor por rol × acción × alcance. Terminado: escalada por API rechazada (prueba).
3. Cablear bitácora en subir/validar/confirmar/publicar. Terminado: cada cifra cita quién y cuándo.
4. Implementar evaluador de `ReglaValidacion.expresion` (BLOQUEO frena, AVISO avisa). Terminado: 1 caso por regla.
5. Pasar la prueba de 2 usuarios (evidencia C2, `CASO.md`). Terminado: cruces fallan, propio pasa.

## 5. Entradas y salidas

- Recibe: matriz (#29), modelo v1 (#7), ADR-0009/0010, `ROLES.md`.
- Entrega: a Kira (#4, qué ve cada rol) y a #39 (destinatarios). Comenta en #4 y #8.

## 6. Referencias y caja de herramientas

- `STACK.md` §2.3 (NestJS guards, DI), `ecc-nestjs-patterns` (obligatoria), OWASP Authorization Cheat Sheet + NIST SP 800-162 (modelo, solo lectura), ADR-0006 (confirmación visible), ADR-0009/0010.
- Comandos: `bun run verify`; pruebas de API (tras #45 o manuales con evidencia).

## 7. Cómo trabajar

- Rama `feat/5-<slug>`; `/tarea 5` y `/cerrar`. Carlos matriz+pruebas, Emmanuel implementación.
- Permisos en servidor siempre; jamás confiar en el front. `.env` fuera del repo. 1 issue En progreso por persona; bloqueo >24 h con `bloqueado`.

## 8. Criterios de aceptación

- [ ] Instalación 2 no accede a instalación 1 (lectura, escritura, reportes, rutas indirectas).
- [ ] Departamento no lee otro departamento (#26 verde).
- [ ] Bitácora registra quién subió y quién confirmó cada dato oficial.
- [ ] Reglas ejecutadas por evaluador, cero `if` de negocio en código.
- [ ] `bun run verify` en verde; PR con `Closes #5` (fase correspondiente).

No es done si: el permiso solo se oculta en front; un rol se creó en código; falta la prueba de 2 usuarios.

### 8.1 Contrato, pruebas y criterio de listo

**Contrato.** Los permisos se calculan en el servidor, la bitácora registra
quién qué cuándo y por qué, y las reglas de validación son datos cargables.

**Criterios (Given/When/Then).**

1. **Given** un usuario de un departamento, **when** pide un dato de otro,
   **then** la API lo rechaza y queda el intento en la bitácora.
2. **Given** una regla nueva en la tabla de reglas, **when** se sube un archivo
   que la viola, **then** va a cuarentena con ese motivo, sin tocar el código.
3. **Given** una publicación confirmada, **when** se consulta su historial,
   **then** devuelve origen, regla y persona, y no admite cambios.

**Plan de pruebas.** Tests de la API en verde (#45) con los casos de la matriz
de `docs/proyecto/ROLES.md`, más la prueba de dos usuarios con alcances
distintos.

**Evidencia.** Salida de los tests, una consulta a la bitácora y la captura de
la cuarentena con motivo.

**Listo cuando.** Los permisos, la bitácora y las reglas funcionan sin una
línea de código específica del caso.

## 9. Riesgos nombrados

La matriz de `docs/proyecto/ROLES.md` ya está afirmada, pero el mapeo fino de acciones por rol sigue creciendo con el caso. Mitigación: arrancar con los 4 roles base + 4 acciones × 3 alcances (cerrado); el resto entra como datos, nunca como `if`.

## 10. Revisión

Syncs con Erik; demo de escalada rechazada + bitácora al cerrar. Después: #4 por rol, #39 destinatarios.

## Versión corta (descripción del issue)


> [5] RBAC y reglas — Agent3835 y WearyBerry, 13→18-nov. Permisos en el servidor, bitácora de cambios y reglas de validación declarativas, sin lógica del caso en el código. Entradas recibidas de ADR-0009 y de las familias de docs/ingenieria/fichas/. Entregable: permisos aplicados, bitácora funcionando y reglas cargadas como datos. Revisión el 18-nov. Detalle: `docs/briefs/BRIEF-05-rbac-bitacora.md`.

