# ADR 0023 — El ESP32-S3 es un puente de fuentes en el borde: consume, no genera

Fecha: 2026-11-13 · Estado: Propuesta
Decide: Erik Beltrán (`reeinharddd`) · Revisa: Emmanuel Valenzuela Cruz (`Agent3835`)

## Contexto

Las fuentes de la planta no viven todas en el mismo sistema: hay un SAP, una
base externa, un Excel de turnos, un programa de planeación, correo de la
hermana, escaneos, PDFs que ya existen y documentos en blanco. Cada una tiene
su forma, su calendario y su dueño.

El equipo tiene un kit de borde (ESP32-S3) disponible y una vía ya decidida
para el resto del sistema: **la API encola, el worker procesa y la IA propone**
(ADR-0011, ADR-0006). La pregunta que obliga a decidir es qué papel juega el
ESP32-S3 en ese flujo: ¿es otro sensor que produce datos propios, es un
reproductor de audio/video, o es la puerta por la que entran las fuentes de la
planta?

Restricciones reales: el kit se programa a mano (el flashing lo hace el líder
en su terminal; el entorno del agente no ve USB), no hay cámara disponible en
el kit y el presupuesto del proyecto es de horas, no de meses.

## Decisión

El ESP32-S3 es **el puente de fuentes en el borde**: **consume y normaliza, no
genera**. No captura imagen ni audio propios.

Consecuencias directas que se aceptan de entrada:

1. **Un solo contrato de entrada**: todo lo que el ESP32-S3 entrega entra por
   `POST /v1/files` (multipart con `file` + `familyCode`), igual que un archivo
   subido desde la web. El borde no inventa una vía paralela.
2. **Perfiles de fuente soportados** (el kit los consume y los normaliza):
   `sap`, `db-ext`, `excel-turno`, `programa`, `correo`, `escaneo`,
   `pdf-existente`, `en-blanco`.
3. **El borde no propone ni dispone**: el ESP32-S3 entrega el original y sus
   metadatos; la familia, las reglas, la propuesta a la bandeja y la
   confirmación humana ocurren en el worker y en la persona (ADR-0006,
   ADR-0011). El `sha256` lo calcula el servidor, no el kit.
4. **Sin cámara**: el kit no es un sensor de captura. Si alguna vez lo fuera,
   sería otra decisión (una ADR nueva).
5. **El flashing es manual y del líder**: el firmware se compila y se graba
   desde la terminal del líder; el agente no programa el kit ni verifica su
   flashes. Lo verificable por el equipo es el contrato que el kit cumple, no
   su contenido binario.

## Alternativas consideradas

| Alternativa | Por qué no |
|---|---|
| El ESP32-S3 como sensor propio (foto o lectura de tickets en campo) | No hay cámara en el kit, y el caso no necesita capturas de campo: las fuentes son documentos y sistemas que ya existen. Además, un sensor propio multiplicaría el contrato de entrada. |
| El ESP32-S3 como reproductor de audio/video en la demo | No aporta al problema del caso (trazabilidad de documentos) y consume tiempo de hardware que el equipo no tiene. |
| Una API aparte para el borde (`POST /v1/edge/...`) | Duplica la cola, el `sha256`, la idempotencia y el aislamiento por instalación. Una sola puerta (`POST /v1/files`) mantiene una sola fila en `platform.job_run` y un solo trabajo en la cola `ingest`. |

## Consecuencias

- **A favor**: una sola vía de entrada (web o borde), un solo flujo de reglas y
  propuesta, y el kit se integra sin tocar el backend: es un cliente más del
  contrato que ya existe. Las fuentes de planta dejan de ser "casos especiales".
- **En contra**: el borde depende de que el contrato `POST /v1/files` no cambie
  de forma incompatible; si cambia, el firmware hay que recompilar y regrabar.
  El equipo asume un costo de mantenimiento del firmware fuera del repositorio
  (el código del firmware, si se versiona, vivirá aparte del monorepo).
- **Riesgo residual**: que el firmware y el backend se desincronicen en el
  campo de `familyCode` (el kit envía una familia que el backend no reconoce).
  *Blast radius*: el archivo entra a cuarentena con motivo visible; no se
  pierde nada (ADR-0010). Mitigación: el `familyCode` se valida contra el
  catálogo de la instalación antes de encolar, y el fallo queda en
  `platform.job_run` con su motivo.

## Evidencia

- El contrato de entrada ya existe y está en verde: `POST /v1/files` con
  `file` + `familyCode`, respuesta `{ sourceFileId, sha256 }` (#124), y la
  vertical completa subir → encolar → worker propone → bandeja → confirmar →
  oficial está probada de punta a punta en el e2e del worker (#3, PR #129).
- El manejo del `sha256` y del aislamiento por instalación está en la base
  (ADR-0010, ADR-0019) y no depende del origen del archivo: el borde no agrega
  un caso especial en el modelo de datos.
- El flashing manual queda registrado como límite del entorno: el shell del
  agente corre con namespaces propios y no ve `/dev/ttyUSB*` ni
  `/dev/ttyACM*`.

## Qué nos haría revertirla

Si el caso necesitara captura en campo (foto o audio propios) con trazabilidad,
o si el firmware resultara más caro de mantener que el beneficio de las ocho
fuentes, esta decisión se reemplaza: el kit deja de ser puente y pasa a ser
sensor, con su propio ADR y su propio contrato de entrada.
