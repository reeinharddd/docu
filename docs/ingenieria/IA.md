# Estrategia de IA y modelos

Estado: vigente como criterio. Última investigación: 2026-10-05.

Este documento responde tres preguntas: para qué se usa un modelo en DOCU, qué
modelo se elige para cada uso, y cómo se impide que un modelo invente.

## 1. Qué trabajo se le da a un modelo

Cuatro tareas, y solo cuatro:

| Tarea | Qué produce | Quién lo usa |
|---|---|---|
| Clasificación de familia | Familia propuesta + confianza, en JSON estricto | Worker |
| Propuesta de mapeo | Par de campos origen y destino con confianza | Persona en la bandeja (RF-03) |
| Consulta sobre datos | Respuesta citada con su fuente y su cálculo | Persona (RF-04) |
| Embeddings | Vector de 768 dimensiones por dato oficial | Worker |

Nunca: decidir si algo es válido, decidir si algo se publica, escribir en la
base, ni elegir reglas. Eso es [ADR-0006](../decisiones/ADR-0006-ia-propone-humano-dispone.md).

## 2. La regla de oro: salida atada a un esquema

Un modelo no devuelve texto libre en este proyecto. Cada llamada pide una
**salida estructurada con JSON Schema** y la respuesta se valida con Zod antes
de tocar la base. Si la validación falla, el archivo va a cuarentena con motivo,
igual que un documento que no cumple el esquema de su familia.

Esto es posible y es lo correcto porque Ollama soporta salidas estructuradas
con `format` recibiendo un JSON Schema, expone además una API compatible con
OpenAI, y recomienda definir el esquema con Zod en JavaScript, temperatura 0 para
respuestas deterministas, y pasar el propio esquema en el prompt para anclar el
resultado.

Documentación: <https://docs.ollama.com/capabilities/structured-outputs> ·
<https://docs.ollama.com/api/chat> · <https://docs.ollama.com/api/embed>

Consecuencia de diseño: **el contrato de clasificación vive en el repositorio
como esquema Zod junto a la familia**, no dentro del prompt. Cambiar ese mapa
es un PR con migración. Las reglas de negocio, en cambio, siguen siendo datos
(ADR-0009): el mapa es contrato técnico, no regla.

## 3. La capa de selección y designación de categorías

Antes de que un modelo proponga nada existe una capa que decide **de qué familia
es un archivo y de qué registro se trata**. Es la capa más importante del
proyecto y la que casi siempre se documenta peor, porque parece obvious: es
donde entra la incertidumbre y donde se decide si hace falta un modelo o no.

### Qué decide

| Decisión | Dónde se guarda |
|---|---|
| Familia del archivo | `ArchivoOriginal.familia` |
| Esquema esperado de ese archivo | `ConfigFamilia.esquema` |
| Estrategia de validación a aplicar | Registro de estrategias por familia |
| Familia del dato oficial y su clave de negocio | `DatoOficial.familia` y `DatoOficial.claveNegocio` |
| Si el archivo es válido, va a cuarentena o a revisión | `estado` y fila en `Cuarentena` con `reglaCodigo` |

### Señales disponibles, en orden de fuerza

1. **Tipo de archivo declarado** (MIME real, no la extensión): Excel, PDF, imagen, correo.
2. **Estructura interna**: encabezados de hoja, columnas reconocibles, páginas de texto continuo.
3. **Remitente o dominio de origen** en el caso de correo: un dominio de planta hermana es una señal fuerte.
4. **Nombre del archivo y directorio de origen**.
5. **Longitud, cantidad de filas y presencia de fórmulas**: un Excel de planeación tiene fórmulas, uno de inventario no.
6. **Contenido textual** ya leído por OCR, si hubo.

Las señales 1 a 5 son deterministas y baratas. La 6 es la única que necesita
trabajo asíncrono.

### Regla de decisión

```
reglas deterministas  →  confianza alta    →  asignación directa
reglas + señales      →  banda intermedia  →  a revisión humana
ninguna regla aplica  →  modelo            →  propuesta con confianza
sin confianza         →  cuarentena con motivo
```

Reglas que se generan con esto y son obligatorias:

| Regla | Motivo |
|---|---|
| Un archivo que no encaja en ninguna familia no se inventa: va a cuarentena | Una familia inventada contamina el modelo canónico |
| El modelo solo propone familia; no la escribe | Separa el error recuperable del que no lo es |
| La confianza del modelo ordena la revisión; no autoriza la publicación | La confianza no es una probabilidad calibrada |
| La asignación automática exige reglas deterministas que ya coincidieron | El modelo cubre el residuo, no la base |
| Toda asignación queda registrada con su señal y su regla | Sin eso no hay por qué el archivo terminó donde terminó |

### Umbrales

*Remarca, no aplicada.* Los valores concretos de la tabla se fijan con el
dataset, no de entrada. Propuesta inicial para medir:

| Confianza | Acción |
|---|---|
| ≥ 0.90 y reglas deterministas ok | Asignación automática |
| 0.60 a 0.90 | A la bandeja de revisión, ordenada por confianza |
| < 0.60 | Cuarentena con motivo |

Medición de aceptación: precisión de clasificación ≥ 80% sobre 200 archivos
sintéticos, y el 100% de lo dudoso con motivo registrado.

### Bucle de mejora

Una corrección humana no corrige el archivo: corrige el mapa. Cada caso que una
persona corrige revela una regla o una señal que falta. El dataset sintético es
el banco de pruebas de ese mapa, y su versión se registra con la corrida.

Cuando la familia nueva se repite, se agrega al catálogo como datos, no como
código: es el mismo mecanismo que hace funcionar la Configuración 2.

## 4. Local contra nube

La decisión ya está tomada en variables: `IA_LOCAL_ACTIVADA=true`,
`IA_NUBE_ACTIVADA=false`. La nube es una opción explícita, no el valor por
defecto.

| Criterio | Local (Ollama) | Nube (API del proveedor) |
|---|---|---|
| Datos | No salen de la máquina | Salen del equipo: exige configuración explícita y aviso al responsable (RNF-03) |
| Reproducibilidad | Versión del modelo fijada, corrida repetible | El proveedor puede cambiar el modelo sin avisar; la evidencia no es reproducible |
| Calidad en documentos largos | Menor, depende del modelo y de la máquina | Mejor |
| Costo | Cero, corre en la laptop del equipo | Costo por token, requiere clave y control de cuota |
| Operación | Instalar pesos en 4 máquinas | Nada que instalar |

**Regla**: la clasificación de documentos de la planta, que incluye correos y
escrituras de proveedor, se hace **local**. La consulta en lenguaje natural
puede considerar nube si el líder lo autoriza por tarea, sin datos sensibles, y
dejando registro de qué se envió.

## 5. Modelos candidatos

### Local, servidos por Ollama

Familias con soporte amplio y licencia permisiva. La elección concreta la fija
el responsable de la tarea, pero estas son las que se evaluaron:

| Modelo | Uso previsto | Nota |
|---|---|---|
| **Llama 3.1 / 3.2** | Clasificación y consulta en texto | Muy usado, salida estructurada estable |
| **Llama 3.2 Vision** | Clasificación de escaneados y hojas | Tiene visión, evita OCR previo para leer el layout |
| **Gemma** | Alternativa ligera para máquinas modestas | Buen rendimiento por vatio |
| **Mistral** | Alternativa para texto en español | Buena adherencia a instrucciones |
| **Qwen** | Alternativa con fuerte soporte en español | Útil si los otros fallan en el dataset |
| **gpt-oss** | Alternativa abierta de tamaño medio | Sirve si se quiere comparar contra un modelo mayor |
| **embeddinggemma** u otro de embeddings | Genera el vector de `DatoOficial` | Ver la advertencia de dimensión abajo |

### Nube, solo con autorización

| Proveedor | Uso previsto | Condición |
|---|---|---|
| **Gemini** (Google) | Consulta larga, documentos extensos, buen soporte multimodal | Clave propia, sin datos de la planta |
| **Claude** (Anthropic) | Consulta y redacción, contexto largo | Clave propia, sin datos de la planta |

No hay una razón técnica para elegir un proveedor de nube sobre otro: la
diferencia está en la clave, el costo y la política del equipo. Si la decisión
no puede justificarse con un dato, no se toma: se usa local.

### Lo que se descartó y por qué

| Descartado | Motivo |
|---|---|
| Fine-tuning | No hay dataset etiquetado suficiente, y el 20% a humano no se reduce entrenando |
| Modelo propio | El cuatrimestre no da margen; se usa un modelo disponible y se mide |
| Embeddings en Redis | La fuente de verdad de los vectores es Postgres con pgvector; una segunda base vectorial duplica la verdad |
| Confianza declarada por el modelo | La "confianza" que devuelve un modelo no es una probabilidad calibrada. Se usa como señal de ordenamiento y se valida contra el dataset |

## 6. Advertencia técnica: la dimensión del embedding

Hoy el schema declara `DatoOficial.embedding` como `vector(768)`. La dimensión
**tiene que coincidir con la del modelo de embeddings elegido**. Ollama permite
pedir una dimensión concreta en `/api/embed` (por ejemplo, 128 para un modelo
reducido), y un modelo distinto producirá una dimensión distinta.

Decisión pendiente de M1: fijar el modelo de embeddings y su dimensión, y hacer
que la migración y el tipo del schema coincidan. Si el modelo elegido entrega
384 o 128 dimensiones, la columna pasa a `vector(384)` o `vector(128)` y se
cambia la migración inicial, porque todavía no hay datos de producción.

La búsqueda textual completa con `tsvector` es el camino **Must** y no depende
del modelo; el embedding es **Should**. Orden correcto: primero `tsvector`
(indice GIN, beneficio directo de Postgres 18), después vectores.

## 7. Cómo se mide

| Métrica | Objetivo | Cómo se verifica |
|---|---|---|
| Precisión de clasificación | ≥ 80% sobre 200 archivos sintéticos | Script de C1 con salida CSV por corrida |
| Cobertura de cuarentena con motivo | 100% de lo dudoso | Cada fila de `Cuarentena` tiene `motivo` y `reglaCodigo` |
| Determinismo | Corridas repetidas dan el mismo resultado | `temperature: 0`, `seed` fijo, versión del modelo registrada |
| Exactitud de OCR | ≥ 90% de campos clave, CER ≤ 10% | Fase 1 con genéricos + fase 2 con 40 escaneados sintéticos contra ground truth |

La evidencia de cada corrida registra **modelo, versión, temperatura, seed y
esquema usado**. Sin eso, una medición no es reproducible y no sirve para el
cierre (RNF-07).

## 8. Riesgos

| Riesgo | Mitigación |
|---|---|
| El proveedor de nube cambia el modelo y la evidencia deja de servir | Usar local para todo lo que se evidencie; la nube es exploración |
| El dataset no representa los documentos reales | C1 genera casos con error, duplicados y contradicciones; medir también con los escaneados sintéticos degradados |
| Alucinación de fuentes | Obligación estructural: la respuesta cita identificadores existentes en la base; si no existe, no hay respuesta |
| Prompt como configuración oculta | El esquema vive en el repo; el prompt es texto, no lógica |

## Referencias

- Requisitos no funcionales de seguridad y trazabilidad:
  [proyecto/REQUISITOS.md](../proyecto/REQUISITOS.md)
- Visión y alcance: [proyecto/VISION.md](../proyecto/VISION.md)
- Ficha técnica del stack: [STACK.md](STACK.md)