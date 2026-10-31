# BRIEF #44 — Solo-insert: originales, historial y bitácora

## 0. Encabezado

- Issue: #44 — https://github.com/reeinharddd/docu/issues/44
- Dueño: Emmanuel Valenzuela Cruz (`Agent3835`)
- Fechas: 2026-11-06 → 2026-11-12 · Sprint 3 · hito `C1 modelo y BD` (12-nov)
- Prioridad / Tipo / Épica / Módulo: alta / tarea / Base de datos / base de datos
- Requisitos: RF-02, RF-08
- Bloqueado por: #58 · Bloquea a: #7

## 1. Contexto

El ADR-0010 fija que originales, historial de origen y bitácora son
solo-insert: se escriben una vez y no se reescriben nunca. Con el ER de C1
(#58) ya hay tablas para eso, pero falta la regla que lo haga cumplir en la
base, no solo en el código: triggers, permisos y la prueba que lo demuestra.

## 2. Por qué importa tu parte

Un original que se puede reescribir es un original que no es evidencia. #7 (la
vertical completa) y la demo del 24-nov muestran el rastro completo de una
decisión; si ese rastro es mutable, la demo muestra una historia que puede
cambiar. Es también la base delega auditoría.

## 3. Objetivo y resultado esperado

| Entregable | Evidencia |
|---|---|
| Solo-insert en la base | Triggers y permisos que rechazan `UPDATE` y `DELETE` sobre originales, historial y bitácora |
| Ruta de corrección | La vía oficial para corregir un error: una fila nueva que referencia la anterior, nunca una edición |
| Pruebas | Pruebas que intentan modificar y borrar, y comprueban que la base lo rechaza |
| Documentación | La regla escrita en `docs/ingenieria/MODELO-DATOS.md` y en el ADR-0010 |

## 4. Actividades específicas

1. Enumerar las tablas solo-insert del ER y activar en cada una los triggers
   que rechazan modificación y borrado. Terminado: cada tabla de la lista
   tiene su trigger.
2. Definir la vía de corrección: fila nueva con referencia a la anterior.
   Terminado: el modelo de datos la muestra y el código la usa.
3. Escribir las pruebas que intentan modificar y borrar. Terminado: las
   pruebas fallan si la base acepta la operación.
4. Verificar que el rol de la aplicación puede escribir pero no reescribir.
   Terminado: los permisos están probados con los dos roles.
5. Documentar la regla. Terminado: el modelo de datos y el ADR-0010 la
   declaran y el código la sigue.

## 5. Entradas y salidas

- Recibe: el ER y la migración de #58, el ADR-0010 y el modelo de datos de
  #62.
- Entrega: los triggers, los permisos y las pruebas, en `apps/api/` y en la
  migración, por PR con `Closes #44`.

## 6. Referencias y caja de herramientas

- `docs/decisiones/ADR-0010-bitacora-e-historial-solo-insert.md`: la decisión.
- `docs/ingenieria/MODELO-DATOS.md`: el modelo donde se documenta la regla.
- `docs/ingenieria/DIAGRAMA-BD-v0.md`: el ER de partida.
- `docs/decisiones/ADR-0004-prisma-postgresql-pgvector.md`: cómo se escribe
  una migración en este repo.
- Skill `ecc-prisma-patterns`: trampas de migración y de triggers.

## 7. Cómo trabajar

- La regla se aplica en la base, no en el código: el código puede tener un
  error; la base no.
- Nada de `ON DELETE CASCADE` sobre una tabla solo-insert. Terminado: la
  migración no tiene cascadas hacia originales.
- PR con la migración y las pruebas en el mismo push: una migración sin su
  prueba no entra.

## 8. Criterios de aceptación

- [ ] Cada tabla solo-insert rechaza `UPDATE` y `DELETE`.
- [ ] Existe la vía de corrección por fila nueva con referencia.
- [ ] Las pruebas demuestran que la base rechaza la reescritura.
- [ ] Los permisos de la aplicación están probados con los dos roles.
- [ ] La regla está en `MODELO-DATOS.md` y en el ADR-0010.

### 8.1 Contrato, pruebas y criterio de listo

**Contrato.** Originales, historial y bitácora son inmutables en la base, y la
corrección se registra como fila nueva.

**Criterios (Given/When/Then).**

1. **Given** un original guardado, **when** se intenta actualizarlo o
   borrarlo, **then** la base lo rechaza y el dato sigue igual.
2. **Given** un dato con error, **when** se corrige, **then** existe una fila
   nueva que referencia la anterior y la anterior no cambió.
3. **Given** el rol de la aplicación, **when** intenta reescribir, **then** el
   permiso lo impide aunque el código se lo pida.

**Plan de pruebas.** Una prueba por tabla solo-insert, una prueba de la vía de
corrección y una de permisos por rol, sobre la base de pruebas de #45.

**Evidencia.** La salida de las pruebas, el SQL de los triggers y un ejemplo
real de corrección con las dos filas.

**Listo cuando.** La base lo impide, no el código, y está demostrado con
pruebas.

## 9. Riesgos nombrados

Que los triggers rompan el flujo normal de actualización de una fila que sí
debe cambiar: la mitigación es enumerar las tablas solo-insert con el ER a la
vista y probar el camino normal de las demás tablas.

## 10. Revisión

Jueves 12-nov en el sync: se afirma o se devuelve con motivos la regla y su
prueba. Después: #7 (vertical completa) y la demo.

## Versión corta (descripción del issue)

> [44] Solo-insert — Agent3835, 6→12-nov. Originales, historial y bitácora inmutables en la base, con la vía de corrección por fila nueva. Entradas recibidas de ADR-0010 y del ER aprobado (#58). Entregable: triggers y permisos con sus pruebas, y la regla documentada. Revisión el 12-nov. Detalle: `docs/briefs/BRIEF-44-solo-insert.md`.
