# ADR 0006 — La IA propone, el humano dispone

Fecha: 2026-09-26 · Estado: Aceptada · Decide: el equipo · Revisa: Erik

## Contexto

DOCU usa un agente de IA para acelerar tres cosas: detectar familias y
mapear campos, clasificar documentos y responder consultas. El riesgo no es que
el modelo sea malo: es que su error sea silencioso. Si una clasificación
equivocada llega a `DatoOficial` sin revisión, el sistema publica un dato falso
con apariencia de oficial, y desde ese momento todas las decisiones de planta
que lo usan quedan contaminadas sin que nadie lo note.

Al mismo tiempo, el equipo necesita que la IA haga el trabajo pesado: el 80% de
los documentos deben clasificarse automáticamente (RNF-02) con regla registrada,
y el 20% restante tiene que llegar a una persona con motivo visible, no con una
cola muerta.

## Decisión

**La IA propone; el humano dispone.** Formalizado en cuatro reglas:

1. **Ningún dato oficial se publica sin confirmación humana explícita.**
   `DatoOficial.fechaConfirmacion` y `confirmadoPorId` no pueden quedar nulos en
   un registro oficial. No hay atajo por API ni por proceso batch.
2. **Toda salida del agente cita su procedencia.** Fuente, cálculo y regla
   aplicada. Sin origen no hay cifra.
3. **Lo dudoso va a cuarentena con motivo, nunca se descarta.** El registro del
   motivo es parte del dato, no un log.
4. **La IA acelera la mecánica, no la política.** Reglas de negocio,
   permisos, umbrales y diseño final se escriben como datos o código revisado
   por una persona.

Los permisos se aplican **en servidor**. El front solo oculta; hiding sin
backend es una mentira de seguridad (RNF-03).

## Alternativas consideradas

| Alternativa | Por qué no |
|---|---|
| Publicar automáticamente lo que el modelo confíe por encima de un umbral | El costo de un falso positivo excede el ahorro de revisar. El sistema es de documentación: un error propagado es peor que un archivo más en cuarentena |
| Sin IA, solo reglas | La meta de 80% automático con reglas puras no es alcanzable para las 6 familias; se paga en tiempo de desarrollo lo que el modelo resuelve en minutos |
| Agente con permiso de escritura amplia | La superficie de error crece con el permiso. Un agente que solo propone y un humano que dispone separa el error recuperable del que no lo es |

## Consecuencias

- **A favor**: el costo de un error del modelo es una tarea en cuarentena, no un
  dato oficial falso.
- **A favor**: la confianza en el sistema se construye; quien audita puede ver
  quién confirmó y con qué regla.
- **A favor**: RNF-02 es verificable con una métrica simple: precisión de
  clasificación sobre el dataset sintético ≥ 80%, y el resto con motivo.
- **En contra**: el flujo tiene un cuello de botella humano. Por eso el objetivo
  es que la bandeja sea resoluble en minutos (RNF-01), no que el humano
  desaparezca.
- **En contra**: más superficie de código para permisos y bitácora, que es
  trabajo de M2 y no puede recortarse.
- **En contra**: los umbrales de confianza del modelo no son un contrato
  estable; se fijan con evidencia del dataset y se revisan, no se copian del
  ejemplo de la librería.

## Evidencia

- `REGLAS.md` 6 y `proyecto/VISION.md` principios 1 y 5.
- Modelo de datos con `DatoOficial.confirmadoPorId` y `HistorialOrigen` con
  `origenTipo`, `origenRef` y `reglaAplicada` (`apps/api/prisma/schema.prisma`).
- `ReglaValidacion.severidad` en `BLOQUEO` o `AVISO` implementa la cadena de
  validación en `docs/ingenieria/MODELO-DATOS.md`.

## Qué nos haría revertirla

No se revierte: es una restricción del caso y de la seguridad, no una decisión
técnica. Si el volumen de cuarentena resultara inmanejable, la respuesta es
mejorar el mapa de reglas y la calidad del dataset, nunca publicar sin
confirmación.