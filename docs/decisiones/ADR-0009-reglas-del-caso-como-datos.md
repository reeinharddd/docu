# ADR 0009 — Las reglas del caso son datos en `ReglaValidacion`, no código

Fecha: 2026-10-06 · Estado: Reemplazada por ADR-0014
Decide: Erik · Revisa: Emmanuel (dueño del módulo de reglas)

## Contexto

El caso Baja SterilPack trae siete reglas de negocio (R-P1 a R-P4, R-Q1, R-A1,
R-T1, `CONTEXTO.md`) y la materia exige demostrar la **Configuración 2**: un
segundo dominio cargado sin cambiar código, con `git diff` de código vacío
(RF-08, `proyecto/REQUISITOS.md`). Si una sola regla vive en un `if` del
servicio, la Configuración 2 obliga a un deploy y RF-08 falla.

El esquema ya tiene `ConfigFamilia.esquema` y `ReglaValidacion.expresion` en
`Json`, con `severidad` `BLOQUEO` o `AVISO` (`ingenieria/MODELO-DATOS.md`).

## Decisión

Toda regla de negocio, familia, umbral y catálogo **por empresa** se guarda como
fila en la base y la evalúa un motor genérico:

1. `ConfigFamilia` describe columnas, tipos y obligatorios de cada familia.
2. `ReglaValidacion` guarda la regla como expresión declarativa en `Json`, con
   código (`R-P1`…), severidad y mensaje visible.
3. El worker evalúa la cadena en orden: tipo de archivo → esquema de la familia
   → reglas. La primera `BLOQUEO` que falla manda a `Cuarentena` con el código.
4. Agregar o cambiar una regla es un `INSERT`/`UPDATE` revisado, nunca un
   cambio en `apps/`.
5. El formato exacto de la expresión se fija en el issue #5 con pruebas, antes de
   cargar la Configuración 1 (#7).

## Alternativas consideradas

| Alternativa | Por qué no |
|---|---|
| Reglas en código TypeScript, una clase por regla | Rápido al inicio; la Configuración 2 exige deploy y RF-08 no se demuestra |
| Motor externo de reglas (Drools, json-rules-engine con DSL propio) | Dependencia de primer nivel para siete reglas; otra cosa que aprender en un semestre |
| Reglas en archivos YAML versionados | Cambiar una regla vuelve a ser un PR al código; no hay alcance por empresa |

## Consecuencias

- **A favor**: la Configuración 2 se carga con datos y el `git diff` queda
  vacío; RF-08 se demuestra con evidencia objetiva.
- **A favor**: cada cuarentena cita el código de regla que la causó (RF-02,
  ADR-0006 punto 2).
- **En contra**: un motor genérico cuesta más que siete `if`; los errores de una
  expresión mal escrita aparecen al evaluar, no al compilar. Se mitiga validando
  la expresión al guardarla.
- **Riesgo residual**: que una regla compleja no quepa en el formato
  declarativo y alguien la escriba en código "solo esta vez". Se trata como bug.

## Evidencia

- `ConfigFamilia` y `ReglaValidacion` ya existen en `apps/api/prisma/schema.prisma`.
- Prueba de aceptación de RF-08: Configuración 2 con `git diff` de código vacío
  (`proyecto/REQUISITOS.md`, issue #8).
- Pendiente de verificar en #5 (motor) y #7 (Configuración 1).

## Qué nos haría revertirla

Que el formato declarativo no pueda expresar al menos 6 de las 7 reglas del
caso al cerrar #5. En ese caso se evalúa una librería de reglas con ADR propia.
