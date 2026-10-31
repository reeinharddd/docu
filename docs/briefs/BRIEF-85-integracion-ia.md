# BRIEF #85 — Integración de IA: OCR y propuesta como configuración

## 0. Encabezado

- Issue: #85 — https://github.com/reeinharddd/docu/issues/85
- Dueño: Erik Alfonso Beltrán Ramírez (`reeinharddd`)
- Fechas: 2026-11-02 → 2026-11-12 · Sprint 3 · hito `C1 modelo y BD` (12-nov)
- Prioridad / Tipo / Épica / Módulo: alta / tarea / Infraestructura / ia
- Requisitos: RF-02, RF-03
- Bloqueado por: #60 · Bloquea a: #7, #3

## 1. Contexto

El sistema necesita leer documentos (OCR) y proponer el resultado (modelo de
lenguaje). La regla del plan es que **la IA entra dentro del alcance y se
configura, no se hornea**: cambiar de motor es cambiar configuración, no
reescribir código. Este brief deja esa frontera drawing y funcionando con
presupuesto, caché y trazabilidad.

## 2. Por qué importa tu parte

El OCR y el modelo son los cuellos de botella de la demo: si cada documento
tarda diez segundos, la demo del 24-nov se queda sin tiempo; si el motor no se
puede cambiar por configuración, cualquier cambio posterior es una semana de
código. #7 (la vertical completa) depende de que esto esté medido.

## 3. Objetivo y resultado esperado

| Entregable | Evidencia |
|---|---|
| Motores configurables | OCR y modelo de lenguaje seleccionados por configuración (`.env` y `apps/api`), con su coste por documento |
| Presupuesto y caché | Límite de tokens y de tiempo por llamada, caché por hash de contenido, y métrica de coste |
| Trazabilidad | Toda salida de IA guarda: motor, versión, semilla, tokens usados, tiempo y hash de la entrada |
| Evaluación con números | Corpus de C1 con métricas: tiempo por documento, coste por documento y tasa de error |

## 4. Actividades específicas

1. Definir la interfaz del motor (OCR y LLM) como contrato interno, con una
   implementación por motor. Terminado: dos motores intercambiables por
   configuración.
2. Medir el corpus de C1 con el motor elegido. Terminado: tabla de tiempo,
   coste y errores por familia de documento.
3. Implementar presupuesto, reintentos y caché por hash. Terminado: la caché
   corta la llamada repetida y el presupuesto frena la que se pasa.
4. Guardar la trazabilidad de cada llamada. Terminado: la bitácora muestra
   motor, tokens, tiempo y hash.
5. Documentar cómo se cambia de motor. Terminado: un cambio de motor se hace
   con una variable de entorno y una línea de configuración.

## 5. Entradas y salidas

- Recibe: la arquitectura (#60), el ER y el DDL (#58), el dataset del mes
  (#61) y `docs/ingenieria/OCR.md` si existe.
- Entrega: la integración en `apps/api/`, las métricas y la documentación del
  cambio de motor, por PR con `Closes #85`.

## 6. Referencias y caja de herramientas

- `docs/decisiones/ADR-0006-ia-propone-humano-dispone.md`: la IA propone, el
  humano dispone. Nada de IA publica dato oficial.
- `docs/decisiones/ADR-0011-api-encola-worker-procesa.md`: el trabajo pesado va
  al worker (#46).
- `docs/gestion/REPLAN-2026-10-30.md` §4: los motores de IA son configuración.
- `docs/ingenieria/STACK.md`: lo que ya está instalado.
- `apps/api/src/`: la API donde vive el adaptador.

## 7. Cómo trabajar

- La IA elige los motores y el presupuesto; Erik decide el proveedor y el
  gasto máximo antes de la primera llamada de producción.
- Nada de claves en el repo: `.env` y `.env.example` con los nombres.
- Cada llamada queda registrada; el PR pega la métrica, no la afirma.

## 8. Criterios de aceptación

- [ ] Cambiar de motor es un cambio de configuración, sin tocar código.
- [ ] El presupuesto corta la llamada que se pasa y avisa por métrica.
- [ ] La caché evita la segunda llamada del mismo contenido.
- [ ] Hay métricas con números: tiempo, coste y error por familia.
- [ ] Toda salida de IA queda trazada con motor, tokens, tiempo y hash.

### 8.1 Contrato, pruebas y criterio de listo

**Contrato.** El motor es un adaptador detrás de una interfaz; la elección
vive en configuración; cada llamada es medible y trazable.

**Criterios (Given/When/Then).**

1. **Given** dos motores configurados, **when** se cambia la variable de
   entorno, **then** el sistema usa el otro sin recompilar código.
2. **Given** un documento que ya se procesó, **when** se reprocesa con el
   mismo hash, **then** sale de la caché y la métrica lo dice.
3. **Given** una llamada que excede el presupuesto, **when** se intenta,
   **then** se corta, se registra el corte y el trabajo no se pierde en
   silencio.

**Plan de pruebas.** Prueba del contrato con los dos motores, prueba de caché
por hash, prueba de presupuesto, y la corrida del corpus de C1 con su tabla
de métricas.

**Evidencia.** La tabla de métricas, la salida de la corrida del corpus, la
prueba de intercambio de motor y la métrica de la caché.

**Listo cuando.** Los motores son configurables, el coste y el tiempo están
medidos, y #7 puede correr la vertical completa sin sorpresas de rendimiento.

## 9. Riesgos nombrados

Que el coste se dispare con el corpus completo: la mitigación es el presupuesto
por llamada y la caché por hash, y el milestone del 12-nov como fecha de
bloqueo.

## 10. Revisión

Jueves 12-nov en el sync: se leen las métricas y se afirma o se devuelve con
motivos. Después: #7 (vertical completa) y #3 (pipeline).

## Versión corta (descripción del issue)

> [85] Integración de IA — reeinharddd, 2→12-nov. OCR y propuesta como configuración, con presupuesto, caché y métricas. Entradas recibidas de la arquitectura (#60), del DDL (#58) y del dataset del mes (#61). Entregable: motores configurables y medidos, con la tabla de coste y tiempo por familia. Revisión el 12-nov. Detalle: `docs/briefs/BRIEF-85-integracion-ia.md`.
