# Plantilla de ADR

Se copia a `docs/decisiones/ADR-NNNN-slug.md` con el siguiente número libre.
Requiere un revisor y CI en verde. Nada se marca aceptada antes de mergearse.

```markdown
# ADR NNNN — <decisión en una frase>

Fecha: YYYY-MM-DD · Estado: Propuesta | Aceptada | Reemplazada por ADR-NNNN
Decide: <persona> · Revisa: <persona>

## Contexto

Qué problema obliga a decidir. Restricciones reales: tamaño del equipo,
plazo, hardware disponible, dependencias ya instaladas. Sin contexto no hay
decisión, hay opinión.

## Decisión

Qué se decide, en una frase, y las consecuencias directas que se aceptan de
entrada. Si la decisión tiene partes configurables, aquí van los valores
concretos, no "a definir".

## Alternativas consideradas

| Alternativa | Por qué no |
|---|---|
| ... | ... |

Mínimo dos alternativas reales, incluidas las que alguien va a volver a
proponer.

## Consecuencias

- **A favor**: lo que ganamos.
- **En contra**: lo que perdemos o comprometemos, con honestidad.
- **Riesgo residual**: el fallo más probable y su blast radius.

## Evidencia

Pruebas, comandos, logs o measurements que ya existen. Si no hay evidencia
todavía, decirlo: "pendiente de verificar en <épica>".

## Qué nos haría revertirla

El disparador concreto. Una ADR sin criterio de reversión es una decisión
permanente disfrazada de decisión.
```

Reglas: un ADR, una decisión. Si el borrador tiene dos decisiones, son dos
ADRs. Nada de valores de `.env` ni de tokens. Si un ADR menciona una versión,
esa versión tiene que existir en el `package.json` del día que se acepte.