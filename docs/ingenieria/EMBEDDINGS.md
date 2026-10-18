# Embeddings: modelo y dimensión para la búsqueda semántica

Estado: **propuesta de fase 1** (2026-10-17). Se congela en M1 con medición propia
sobre el corpus de DOCU; hasta entonces no es ADR. Dueño: Erik. Revisor: Emmanuel.
Insumo de mercado y alternativas descartadas: [EMBEDDINGS-MERCADO.md](EMBEDDINGS-MERCADO.md).

Este archivo responde a **búsqueda semántica** ([REQUISITOS.md](../proyecto/REQUISITOS.md)
§Should) y a la advertencia de dimensión de [IA.md](IA.md) §6. El "por qué se
eligió este modelo sobre sus alternativas" se registra como ADR (ADR-0015) cuando
la decisión se congele; mientras tanto, este documento es el estado vigente.

## 1. Decisión

| Pieza | Elegido | Rol |
|---|---|---|
| **Modelo de embeddings** | **Qwen3-Embedding-0.6B** (Alibaba), Apache 2.0, local | Genera el vector de `DatoOficial.embedding` |
| **Dimensión** | **768** (salida MRL del modelo) | Coincide con el contrato ya fijado en el esquema (`vector(768)`) |
| **Alternativa** | **EmbeddingGemma 308M** (Google), 768 nativas | Menos RAM/CPU; licencia Gemma Terms |
| **Baseline de comparación** | **multilingual-e5-base** (768, MIT) | Piso de la comparación |
| **Búsqueda textual (obligatoria)** | **tsvector** (Postgres) | Camino **Must**; no depende del modelo |

Descartado como vector principal: los modelos **nativos de 1024 dims** (bge-m3,
multilingual-e5-large) porque forzarían cambiar el contrato a `vector(1024)`, y
las **APIs de embeddings en la nube** (Gemini, Cohere, OpenAI, Voyage) porque
rompen RNF-03 (offline).

## 2. Por qué Qwen3 y no otro

El contrato **`vector(768)` ya está fijado** en el esquema y en los docs
([MODELO-DATOS.md](MODELO-DATOS.md) §`DatoOficial`, [BRIEF-58](../briefs/BRIEF-58-diagrama-v0.md),
[IA.md](IA.md) §6, [INVESTIGACION-HERRAMIENTAS.md](../integraciones/INVESTIGACION-HERRAMIENTAS.md)).
Elegir un modelo que **produzca 768** evita migrar la columna y reindexar.

| Criterio (RNF-03 + esquema) | Qwen3-Embedding-0.6B | EmbeddingGemma | bge-m3 | multilingual-e5-base |
|---|---|---|---|---|
| Español / multilingüe | Sí (100+ idiomas) | Sí (100+ idiomas) | Sí (100+ idiomas) | Sí (100 idiomas) |
| **Salida 768** | 1024, MRL 32–1024 → **768** | **768 nativa** | 1024 (sin MRL) | **768 nativa** |
| Contexto | **32 K tokens** | 2 K tokens | 8 K tokens | 512 tokens |
| Local + CPU (RNF-03) | Sí, 0.6B | Sí, < 200 MB RAM (QAT) | Sí, 0.57B | Sí, 0.28B |
| Licencia | **Apache 2.0** | Gemma Terms (no OSI) | MIT | MIT |
| Servido | TEI / llama.cpp / Ollama | Ollama (`embeddinggemma`) | Ollama | Ollama |

**Por qué Qwen3:** licencia **Apache 2.0** limpia para producto, **contexto de 32 K**
(no obliga a trocear campos libres largos) y **MRL** que permite pedir **salida de
768** sin tocar el esquema. Es instruction-aware, una palanca extra por tarea.

**Cuándo cambiar a EmbeddingGemma:** si el recurso es el límite (corre en CPU con
< 200 MB de RAM y **768 dims nativas**), a cambio del **contexto de 2 K** y de la
licencia **Gemma Terms** (permisiva pero no OSI). Es la mejor opción sub-500M para
embeber en el borde.

## 3. Cómo se usa realmente

- **Dónde vive el vector:** `DatoOficial.embedding`, `vector(768)` **opcional**
  ([MODELO-DATOS.md](MODELO-DATOS.md)). Nace **sin poblar**; se llena cuando hay
  modelo fijado y benchmark (riesgo ya anotado en MODELO-DATOS §riesgos).
- **Quién lo produce:** el proceso **`worker`** (ADR-0011), al crear o confirmar un
  `DatoOficial`. La API solo encola.
- **Cómo se consulta:** búsqueda semántica = consulta en lenguaje natural →
  vecinos más cercanos por **coseno** (`<=>`) sobre `DatoOficial` **confirmados**,
  con índice **HNSW** (`vector_cosine_ops`).
- **Orden de la búsqueda:** primero **`tsvector`** (Must, texto completo); el
  embedding es una **segunda capa** (Should) que no reemplaza al texto
  ([IA.md](IA.md) §6). Si el embedding falta, la búsqueda textual sigue funcionando.
- **Chunking:** un embeddings es **por registro** (un `DatoOficial` = un hecho), no
  por documento entero: el texto a embeber es corto (campos/ficha), así que el tope
  de contexto es holgado salvo en campos libres muy largos.

## 4. Cómo corre (worker, nunca API)

- **Servido:** servicio **Ollama** en `localhost`, llamado por HTTP desde el worker,
  igual que GLM-OCR y los demás modelos locales ([IA.md](IA.md), [OCR.md](OCR.md) §4).
  Alternativa de rendimiento: TEI / llama.cpp.
- **En Docker:** contenedor propio o servicio aparte; **los pesos no entran a la
  imagen de la app**.
- **Hardware:** no hay GPU confirmada → EmbeddingGemma (308M) corre en **CPU**.
  El costo real por registro se mide en M1.

## 5. Dimensión y pgvector (por qué 768)

- pgvector indexa la columna `vector` con HNSW/IVFFlat hasta **2000 dims**
  (límite derivado del page de 8 KB y 4 bytes por dim fp32). **768 entra de sobra**;
  1024 también.
- Más de 2000 dims exigiría **`halfvec`** (hasta 4000). **No aplica** mientras la
  dimensión sea ≤ 2000.
- **Matryoshka (MRL):** se puede truncar 768 → 512/256 y re-normalizar, bajando el
  almacenamiento. Si se trunca, la columna debe **nacer** en esa dimensión
  (`vector(256)`), no reducirse después.
- **Regla dura:** la dimensión se fija **antes de poblar**. Cambiarla implica
  reindexar y **re-embeber** todo el corpus; no es una migración en caliente.

## 6. Límites: qué no alcanza

- **Sin medir en DOCU:** los rankings (MTEB/MMTEB) son lo que **reporta cada
  proyecto**, no una medición propia. El corpus real (las 6 familias) todavía no se
  ha embebido ni evaluado.
- **Calidad de recuperación:** se mide en M1 con una muestra y un ground truth
  pequeño (recall@k); hasta entonces la elección es **propuesta**, no hecho.
- **Contexto de 2 K** (EmbeddingGemma) frente a campos libres largos: se resuelve
  con chunking o cambiando a Qwen3 (32 K).
- **Licencia:** EmbeddingGemma sale bajo **Gemma Terms** (permisiva pero no OSI),
  con restricciones de uso; revisar antes de producto. Qwen3/bge-m3/mE5 son
  Apache 2.0 / MIT.

## 7. Siguientes pasos

1. **M1:** embeber una muestra del corpus y medir recall@k contra un ground truth
   chico; decidir **Qwen3@768 vs EmbeddingGemma@768**.
2. Poblar `DatoOficial.embedding` en el worker + crear el índice HNSW.
3. **ADR-0015** cuando se congele modelo + dimensión (reemplaza el "pendiente de
   M1" de [STACK.md](STACK.md) §decisiones abiertas #13).

## 8. Fuentes

- EmbeddingGemma: <https://ai.google.dev/gemma/docs/embeddinggemma> ·
  blog <https://developers.googleblog.com/en/introducing-embeddinggemma/> ·
  paper <https://arxiv.org/pdf/2509.20354> · Ollama <https://ollama.com/library/embeddinggemma>
- Qwen3-Embedding: <https://huggingface.co/Qwen/Qwen3-Embedding-0.6B> ·
  paper <https://arxiv.org/abs/2506.05176>
- bge-m3: <https://huggingface.co/BAAI/bge-m3> · paper <https://arxiv.org/abs/2402.03216>
- multilingual-e5: <https://huggingface.co/intfloat/multilingual-e5-base>
- MMTEB: <https://arxiv.org/abs/2502.13595>
- pgvector (límites de dimensión y HNSW): <https://github.com/pgvector/pgvector>
