# ADR 0010 — Bitácora, historial de origen y originales son solo-insert

Fecha: 2026-10-06 · Estado: Aceptada
Decide: Erik · Revisa: Emmanuel

## Contexto

RF-03 exige que cada dato oficial muestre origen, regla aplicada y quién
confirmó; RF-06 exige bitácora completa de quién subió y quién confirmó;
`REGLAS.md` 5 dice que nada se borra en silencio. Si esas tablas admiten
`UPDATE` o `DELETE`, la auditoría depende de que nadie se equivoque, y una
auditoría que se puede editar no prueba nada.

Hoy la garantía solo existe en la capa de servicio: la migración base no
instala disparadores ni revoca permisos (`ingenieria/MODELO-DATOS.md`).

## Decisión

`Bitacora`, `HistorialOrigen` y `ArchivoOriginal` son **solo-insert**:

1. El código nunca emite `update` ni `delete` sobre ellas. Una corrección es una
   fila nueva que referencia a la anterior.
2. La base lo garantiza también: disparadores `BEFORE UPDATE OR DELETE` que
   lanzan error. Se instalan en una migración de #12, con prueba que intenta
   modificar y espera el error.
3. `ArchivoOriginal` se deduplica por `sha256` único; el archivo físico en
   `originales/` es de solo lectura (`REGLAS.md` 5).
4. `DatoOficial` sí cambia (es el valor vigente), pero cada cambio deja fila en
   `HistorialOrigen`.

## Alternativas consideradas

| Alternativa | Por qué no |
|---|---|
| Solo disciplina en el código | Es el estado actual; un script de mantenimiento o un `prisma studio` lo rompe sin dejar rastro |
| Revocar `UPDATE`/`DELETE` al rol de la aplicación | Correcto, pero en local se usa un solo usuario de base; los disparadores funcionan igual en todos los entornos |
| Event sourcing completo | Desproporcionado para el alcance; solo tres tablas necesitan la garantía |

## Consecuencias

- **A favor**: la bitácora y el linaje son evidencia de RF-03 y RF-06 aunque
  alguien use la base a mano.
- **En contra**: las tablas solo crecen; en el volumen de la demo es
  irrelevante, en producción requeriría política de archivo.
- **En contra**: corregir un error de captura es más verboso (fila nueva).
- **Riesgo residual**: una migración futura que recree la tabla y olvide el
  disparador. La prueba de #12 lo detecta en CI.

## Evidencia

- Modelos en `apps/api/prisma/schema.prisma`; vacío documentado en
  `ingenieria/MODELO-DATOS.md`, sección "Lo que falta".
- Pendiente de verificar en #12 (migración y prueba).

## Qué nos haría revertirla

Ninguna razón técnica previsible: es requisito de auditoría del caso. Solo se
revisaría el mecanismo (disparador frente a permisos), no la regla.
