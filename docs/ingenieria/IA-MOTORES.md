<p align="center">
<strong>docu</strong><br>
<sub>Configuración 1 · Baja SterilPack · DOCU — Repositorio de Documentación Digital</sub><br>
<sub>Marca: <code>#5B2A86</code> · acento: <code>#B0215F</code> · texto: <code>#24172F</code></sub>
</p>

# Ingeniería: motores de IA — acceso centralizado por API

Estado: vigente con la rama de #85. Contrato interno del módulo
`apps/api/src/ia/`. La decisión es el
[ADR-0020](../decisiones/ADR-0020-motores-de-ia-como-configuracion.md): **un
solo cliente compatible OpenAI** es el acceso a todos los motores; el
proveedor se cambia con configuración, nunca con código. Los modelos son los
ya decididos: [OCR.md](OCR.md) y [IA.md](IA.md). No hay motores simulados:
los reales quedan listos y se miden.

## 0. Resumen

| Capacidad | Motor (default) | Endpoint | Resultado esperado |
|---|---|---|---|
| OCR / KIE de escaneados | **GLM-OCR 0.9B** (`IA_OCR_MODEL=glm-ocr`) | `POST /v1/chat/completions` con imagen base64 | Texto y layout; CER ≤ 10 % en degradados ([OCR.md](OCR.md) §3: 11.26 % medido) |
| Clasificación y consulta | **Llama 3.1/3.2** (`IA_LLM_MODEL=llama3.2`) | `POST /v1/chat/completions` con `response_format: json_schema` | JSON válido validado con Zod; temperatura 0, seed fija |
| Embeddings | **Qwen3-Embedding-0.6B** (`IA_EMBEDDING_MODEL=qwen3-embedding:0.6b`) | `POST /v1/embeddings` | Vector de **768** dimensiones exactas (contrato del ER, IA.md §6) |
| Scoring con confianza calibrada | **Laya** (SystemOne-compatible) | `IA_SCORING_URL` (default `http://localhost:8000/v1/systemone`), wire propio `POST /v1/systemone` | Confianza calibrada (ECE 0.081); implementada en `SystemOneScoringEngine` sobre la interfaz `ScoringEngine`; la variante ONNX in-proceso queda como evolución de #3 |

El proveedor detrás del endpoint es indiferente al código: **Ollama local**
(default, `http://localhost:11434/v1`), **vLLM/SGLang** en el host,
**NVIDIA NIM**, **OpenAI** o **el endpoint que cada compañía opere**. Ese es
el caso multi-compañía: apuntar `IA_API_BASE_URL` a lo que la instalación
tenga, sin tocar una línea de código.

## 1. Configuración (variables de entorno)

| Variable | Default | Qué fija |
|---|---|---|
| `IA_API_BASE_URL` | `http://localhost:11434/v1` | El endpoint compatible OpenAI |
| `IA_API_KEY` | (vacía; Ollama local no pide) | Credencial del proveedor; jamás en el repo |
| `IA_OCR_MODEL` | `glm-ocr` | Modelo de visión para OCR/KIE |
| `IA_LLM_MODEL` | `llama3.2` | Modelo de texto para clasificación y consulta |
| `IA_EMBEDDING_MODEL` | `qwen3-embedding:0.6b` | Modelo de embeddings (salida a 768); tag del registro de Ollama. **El nombre depende del proveedor** (§1.1) |
| `IA_SCORING_URL` | `http://localhost:8000/v1/systemone` | Endpoint del motor de scoring (contrato SystemOne); mismo wire, otro motor. Mismas reglas de localidad que `IA_API_BASE_URL` (RNF-03) |
| `IA_SCORING_AUTO_THRESHOLD` / `IA_SCORING_REVIEW_THRESHOLD` | `0.90` / `0.60` | Umbrales de la cascada de decisión (IA.md §3); valores iniciales, se afinan contra el dataset (#61). Exige `review ≤ auto` |
| `IA_SEED` | `42` | Seed fija para corridas reproducibles (RNF-07) |
| `IA_TEMPERATURE` | `0` | Determinismo (IA.md §2) |
| `IA_BUDGET_MAX_MS` | `30000` | Tiempo máximo por llamada |
| `IA_BUDGET_MAX_TOKENS` | `4000` | Tokens estimados máximos por llamada |
| `IA_MAX_RETRIES` | `2` | Reintentos ante 429/5xx/red, con backoff exponencial |
| `IA_CACHE_ENABLED` | `true` | Caché por hash de contenido |
| `IA_CACHE_TTL_MS` | `3600000` | Vida de la entrada de caché |
| `IA_LOCAL_ACTIVADA` / `IA_NUBE_ACTIVADA` | `true` / `false` | Los interruptores de IA.md §4 |

**Regla RNF-03 forzada en código:** si `IA_API_BASE_URL` no es un host local
o de red privada y `IA_NUBE_ACTIVADA != true`, el módulo falla al arrancar
con error accionable. La nube es excepción autorizada, no default. Una clave
inválida o un número malformado también falla al arrancar nombrando la
variable y sus valores válidos.

### 1.1 NVIDIA NIM como proveedor de pruebas

NIM es **una instancia más del mismo endpoint compatible OpenAI**: no hay
código de NIM en el repo. Solo cambian cuatro datos del `.env` local (que
nunca va al repo) y el interruptor RNF-03.

```bash
# .env local (NO versionado)
IA_API_BASE_URL=https://integrate.api.nvidia.com/v1
IA_API_KEY=<clave personal de build.nvidia.com>
IA_NUBE_ACTIVADA=true
IA_OCR_MODEL=nvidia/nemotron-nano-12b-v2-vl
IA_LLM_MODEL=meta/llama-3.3-70b-instruct
IA_EMBEDDING_MODEL=nvidia/llama-3.2-nv-embedqa-1b-v2
```

Procedimiento de verificación:

```bash
# 1. La credencial responde y lista los modelos servidos
curl -s -H "Authorization: Bearer $IA_API_KEY" \
  https://integrate.api.nvidia.com/v1/models | jq '.data[].id'

# 2. La batería live del módulo corre contra ese endpoint
cd apps/api && IA_LIVE_TEST=1 bun test src/ia/ia.spec.ts
```

**Los modelos no son intercambiables entre proveedores.** El mismo
`IA_EMBEDDING_MODEL` que vale en Ollama no vale en NIM, y hay dos trampas
documentadas por NVIDIA que conviene conocer antes de atribuir un fallo al
código:

| Trampa | Qué hace | Qué hacer |
|---|---|---|
| La dimensión pedida puede no estar soportada | `nvidia/nemotron-3-embed-1b` solo acepta su dimensión nativa (2048): pedir 768 responde `HTTP 400 dimensions must be one of 2048` | Usar un modelo MRL que sí acepte 768: `nvidia/llama-3.2-nv-embedqa-1b-v2` (384/512/768/1024/2048) o `nvidia/llama-nemotron-embed-vl-1b-v2` (768 entre sus valores fijos) |
| Algunos modelos exigen `input_type` | NV-Embed-QA y E5 differentiate `query` y `passage`; sin el campo, la calidad de retrieval se desploma | El sufijo en el nombre lo resuelve sin tocar el cliente: `nvidia/llama-3.2-nv-embedqa-1b-v2-query` / `-passage` |

Con el resto de los proveedores la superficie es la misma: `response_format:
json_schema` para el LLM, `image_url` con `data:` URI para visión, y
`dimensions` para embeddings. Lo que **no** cambia con el proveedor es el
contrato: 768 dimensiones exactas o el vector no entra (IA.md §6).

NIM es además la **fuente de fallback y delegación** acordada: cuando el
motor local no está disponible o la confianza calibrada no alcanza, el
ruteo por capacidad de [ADR-0024](../decisiones/ADR-0024-capacidad-de-ia-por-tarea-y-consumo-por-fragmentos.md)
puede escalar a este proveedor. Ese ruteo es plataforma de ejecución y vive
en la épica #142, **fuera de la entrega del 15 de noviembre**.

## 2. Cómo llama cada capacidad

- **OCR (visión):** `chat/completions` con el archivo codificado en
  `data:` URI dentro de `image_url`, prompt de extracción en español y
  salida de texto/layout. GLM-OCR no devuelve confianza calibrada: la
  confianza que ordena la revisión la da Laya (§0), no el OCR.
  **Hoy solo acepta imagen rasterizada**: un PDF crudo es rechazado por el
  motor (§3.2, #136).
- **LLM:** `chat/completions` con `temperature: 0`, `seed` y
  `response_format: { type: 'json_schema', ... }`. El JSON que vuelve se
  **valida con Zod** contra el esquema de la familia antes de tocar la base
  (IA.md §2); si falla, cuarentena con motivo, igual que un documento
  inválido.
- **Embeddings:** `embeddings` con el texto y `dimensions: 768` — el contrato del
  ER (vector(768), IA.md §6) viaja en la petición, no se negocia después. Los
  motores con vectores Matryoshka (Ollama con Qwen3-Embedding, NIM con
  `llama-3.2-nv-embedqa-1b-v2`) recortan a la dimensión pedida; si el vector
  vuelve con otra medida es un `ContractViolationError` con el remedio (modelo
  compatible MRL a 768: Qwen3-Embedding-0.6B o EmbeddingGemma). Cambiar la
  dimensión después de producción exige migrar vectores: prohibido sin ADR
  nuevo.
  - **El tag del modelo va con dos puntos.** `qwen3-embedding:0.6b` es el
    nombre registrado en Ollama; `qwen3-embedding-0.6b` no existe y el
    proveedor responde `HTTP 404 model not found`. El default del código y el
    `.env.example` usan la forma correcta; si se cambia el valor, se copia tal
    cual de `/v1/models` del endpoint configurado.

## 3. Presupuesto, reintentos, caché y trazabilidad

| Mecanismo | Qué hace | Cómo se ve |
|---|---|---|
| Presupuesto | Corta la llamada que excede `IA_BUDGET_MAX_TOKENS` (estimado: caracteres/4) o `IA_BUDGET_MAX_MS` | `BudgetExceededError` + traza con `budgetCut: true`; el trabajo no se pierde: el worker reintenta o manda a cuarentena con motivo |
| Reintentos | 429/5xx/error de red se reintentan hasta `IA_MAX_RETRIES` con backoff exponencial y el mismo `AbortSignal` del presupuesto | La traza registra los intentos; un 4xx de contrato no se reintenta |
| Caché | Clave `sha256(kind\|model\|entrada)`; misma entrada con mismo modelo sale de caché | Traza con `cached: true`; el spec lo prueba |
| Trazabilidad | `CallTrace` por llamada: motor, modelo, hash de entrada, tokens, duración, caché, corte | El worker lo persiste en `ocr_result.engine`/`engine_version`, `memory_embedding.model`, `job_run` y `audit_log` |

### 3.1 Límite conocido: el presupuesto es por llamada, no por documento

El presupuesto de arriba acota **una llamada**. El runner estima los tokens del
**archivo entero** (`ceil(bytes/4)`), así que un documento real lo rebota:

| Documento | Tokens observados | Resultado con el default (4 000) |
|---|---|---|
| PDF de 2 páginas | 16 814 | `BudgetExceededError`, trabajo perdido |
| PDF de 27 páginas | 942 189 | `BudgetExceededError`, trabajo perdido |

El guardián funciona (el motivo queda escrito en `platform.job_run.error` y el
job va a cuarentena), pero **un documento grande no se procesa**: se pierde
trabajo que se podría hacer por partes.

La corrección acordada está en
[ADR-0024](../decisiones/ADR-0024-capacidad-de-ia-por-tarea-y-consumo-por-fragmentos.md)
(Propuesta): **consumo por fragmentos** (el documento se trocea, cada fragmento
tiene su presupuesto y los resultados se agregan) y **selección de modelo por
tarea** (el modelo grande solo cuando la tarea lo exige). Las tareas son #136
(fragmentos y rasterización) y #137 (ruteo, escalamiento y orquestación).

Mientras tanto, **subir `IA_BUDGET_MAX_TOKENS` no arregla el problema**: mueve
el umbral y el siguiente documento más grande vuelve a pasarlo.

### 3.2 Límite conocido: el motor de visión no acepta PDF

`VisionOcrEngine` arma el `data:` URI con el `mimeType` original y lo manda como
`image_url`. Un motor de visión rechaza bytes de PDF con `HTTP 400 invalid
image input`: hoy **ningún PDF pasa el OCR**, aunque la API lo acepte y lo
registre bien. La rasterización PDF → imagen por página es parte de #136; el
original intacto se conserva y la imagen rasterizada es trabajo, no original
(ADR-0010).

## 4. Resultados esperados y cómo se miden

Las métricas son las de IA.md §7, ahora con dueño de medición:

| Métrica | Objetivo | Verificación |
|---|---|---|
| Exactitud OCR (CER) | ≤ 10 % en degradados | Contra ground truth por familia; baseline Tesseract ya medido (33.67 % CER promedio, OCR.md §3) |
| JSON válido del LLM | 100 % de respuestas parseadas y validadas | Toda respuesta pasa por Zod; las inválidas a cuarentena |
| Dimensión de embedding | 768 exacto | El adaptador lo rechaza si no |
| Tiempo y coste por familia | Tabla por familia del corpus | Corrida con `IA_LIVE_TEST=1` contra el endpoint configurado; el CSV queda como evidencia del PR |
| Determinismo | Corridas repetidas = mismo resultado | `temperature: 0` + `IA_SEED` + modelo/versión registrados en la traza |

Las pruebas unitarias (`apps/api/src/ia/ia.spec.ts`) corren **sin red** y
verifican construcción de peticiones, mapeo de respuestas, reintentos,
presupuesto, caché y contratos de error, con un doble de transporte dentro
del spec (no es un motor simulado del producto: es el banco de pruebas del
cliente). Las pruebas de integración contra el endpoint real se activan con
`IA_LIVE_TEST=1` y consumen la clave del `.env`.

## 5. Fronteras (no pisar otros carriles)

- El **worker** (#46) consume este módulo; la **API** (#12) solo encola.
- La **cascada de decisión** con Laya es del pipeline (#3): aquí viven la
  interfaz `ScoringEngine` y su implementación de referencia por HTTP
  (`SystemOneScoringEngine`); la variante ONNX in-proceso la construirá #3
  sobre la misma interfaz.
- El **corpus** lo genera #61; la medición por familia corre cuando exista.

## Referencias

- [ADR-0020](../decisiones/ADR-0020-motores-de-ia-como-configuracion.md) ·
  [OCR.md](OCR.md) · [OCR-MERCADO.md](OCR-MERCADO.md) ·
  [IA.md](IA.md) · [EMBEDDINGS.md](EMBEDDINGS.md)
- [COLAS.md](COLAS.md) · [ARQUITECTURA.md](ARQUITECTURA.md) §5
