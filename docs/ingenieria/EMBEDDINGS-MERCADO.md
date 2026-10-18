# Mercado: modelos de embeddings para la búsqueda semántica

Estado: **estudio de mercado** (2026-10-17). No es una decisión ni un ADR: es el
insumo para la ficha [EMBEDDINGS.md](EMBEDDINGS.md) y para el ADR que salga de ella.
Dueño: Erik.

Fuentes: fichas y reportes oficiales citados al final. Los números de benchmark son
**lo que reporta cada proyecto** (MTEB / MMTEB), no mediciones propias. Nada de esto
está probado todavía en DOCU.

## 1. Qué necesita el proyecto

| Etapa del proceso | RF | Qué se necesita | Issue |
|---|---|---|---|
| Búsqueda semántica | Should | Vector de `DatoOficial` + pgvector, consulta en lenguaje natural | #4 |
| Búsqueda textual completa | Must | `tsvector` (no depende de embeddings) | transversal |
| Clasificación / mapeo | RF-01, RF-03 | Embeddings + kNN como señal auxiliar de scoring | #3, #5 |

Restricciones que mandan: **RNF-03** (offline, sin nube salvo configuración
explícita), **sin GPU confirmada** (CPU), **esquema ya fijado** en
`DatoOficial.embedding = vector(768)`.

## 2. Modelos de embeddings (texto)

| Modelo | Params | Dims (+MRL) | Contexto | Licencia | Puntos fuertes | Puntos débiles |
|---|---|---|---|---|---|---|
| **EmbeddingGemma** (Google) | 308M | **768** → 512/256/128 | 2 K | Gemma Terms (no OSI) | #1 sub-500M multilingüe; < 200 MB RAM (QAT); Ollama | contexto corto; licencia no OSI |
| **Qwen3-Embedding-0.6B** (Alibaba) | 0.6B | 1024, MRL 32–1024 | **32 K** | Apache 2.0 | instruction-aware; salida a medida (→768); contexto largo | 0.6B algo más pesado en CPU |
| **Qwen3-Embedding-4B / 8B** | 4B / 8B | 2560 / 4096 | 32 K | Apache 2.0 | tope de calidad open (8B = #1 al lanzar) | piden GPU; dims > 2000 (halfvec) |
| **bge-m3** (BAAI) | 568M | 1024 (+ sparse + multi-vector) | 8 K | MIT | dense + sparse + ColBERT en **un** pase (híbrido) | dim 1024 rompe el contrato 768 |
| **multilingual-e5-base** (intfloat) | 278M | **768** | 512 | MIT | ligero, 768 nativa, baseline sólido | contexto 512; calidad media |
| **multilingual-e5-large-instruct** | 560M | 1024 | 512 | MIT | mejor open en MMTEB original | dim 1024 |
| **nomic-embed-text-v2-moe** | 475M / 305M act. | 768 → 256 | ~512–2 K | Apache 2.0 | **todo abierto** (pesos+código+datos); MoE barato | dataset en inglés |
| **granite-embedding-multilingual-r2** (IBM) | 311M | **768** → 512/384/256/128 | — | Apache 2.0 | MRL a 768; licencia limpia | menos difundido |
| **harrier-oss-v1** (Microsoft) | 27B / 0.6B / 270m | por verificar | — | por verificar | **nuevo (2026)**: 0.6b ya = 69.0 MMTEB | familia muy nueva; sin trayectoria |
| **jina-embeddings-v5** (jinaai) | small / nano | por verificar | — | por verificar (v3 era CC-BY-NC) | familia reciente, multimodal | licencia a revisar |
| **LaBSE** (Google) | 471M | **768** | 512 | Apache 2.0 | clásico multilingüe, 768 | superado por la nueva ola |
| **gemini-embedding-001** (Google) | — | 768 (MRL) | 2 K | **API (cerrada)** | calidad alta | **nube** (rompe RNF-03) |

## 3. Benchmarks (MMTEB v2, tablero del 2026-10-11)

Media de tareas (multilingüe, 250+ idiomas). **Ranking ≠ calidad en tu corpus.**

| Modelo | Tamaño | Media |
|---|---|---|
| harrier-oss-v1-27b (Microsoft) | 27B | 74.3 |
| KaLM-Embedding-Gemma3-12B (Tencent) | 12B | 72.3 |
| Qwen3-Embedding-8B (Alibaba) | 8B | 70.6 |
| Seed1.6-embedding (ByteDance) | — | 70.3 |
| Qwen3-Embedding-4B | 4B | 69.5 |
| **harrier-oss-v1-0.6b** (Microsoft) | 0.6B | 69.0 |
| gemini-embedding-001 (Google) | API | 68.4 |
| jina-embeddings-v5-omni-small | small | 67.0 |
| **Qwen3-Embedding-0.6B** | 0.6B | 64.3 |
| multilingual-e5-large-instruct | 0.56B | 63.2 |

En la franja **sub-500M** el líder reportado es **EmbeddingGemma** (308M), con
ventaja sobre los modelos comparables de su tamaño, incluso truncando a 128 dims.

## 4. Dimensión y pgvector (la restricción que decide)

| Tipo de columna | Dims indexables (HNSW/IVFFlat) | Nota |
|---|---|---|
| `vector` (fp32) | **≤ 2000** | 8 KB de page / 4 bytes por dim |
| `halfvec` (fp16) | ≤ 4000 | la mitad de memoria por dim |
| `bit` | ≤ 64 000 | cuantización binaria |

Consecuencias para DOCU:

- **768 y 1024 indexan como `vector`** sin trucos. 2560 (Qwen3-4B) y 4096 (8B)
  **no** → necesitarían `halfvec`.
- El contrato del esquema es **`vector(768)`**: elegir un modelo de 768 nativa
  (EmbeddingGemma, mE5-base, granite-r2, LaBSE) o uno con MRL a 768 (Qwen3) evita
  migrar la columna.
- **MRL** (Matryoshka) permite truncar 768 → 512/256 re-normalizando; si se trunca,
  la columna debe **nacer** en esa dimensión.

## 5. Cómo se usan realmente (RAG y búsqueda semántica)

- **Denso vs híbrido:** el caso simple es recuperar por similitud coseno sobre
  vectores densos. Para híbrido (denso + léxico) hay dos caminos: montar un índice
  léxico aparte, o usar **bge-m3**, que emite dense + sparse + multi-vector de un
  solo pase (y de paso sirve de reranker). No hace falta para el alcance **Should**
  de DOCU; se anota por si crece.
- **Truncar con MRL:** en un modelo MRL, las dims que conservas pesan más en el
  costo que la elección del modelo (almacenamiento ×3–6 al pasar 768 → 256).
- **Instruction-aware** (Qwen3): anteponer una instrucción de tarea cambia qué es
  "similar"; es una palanca real, pero exige disciplina de formato.
- **Servir:** Ollama (fácil), TEI (Text Embeddings Inference) o llama.cpp para
  rendimiento. Todo local, que es lo que pide RNF-03.
- **Evaluación:** MTEB es un *prior*, no un oráculo (sus datasets de retrieval no
  son estrictamente zero-shot). Lo que decide es medir **recall@k sobre consultas
  propias** — en DOCU, M1.

## 6. Qué categorías considerar al elegir

1. **Idioma y dominio:** español y las 6 familias de documento de planta.
2. **Dimensión vs esquema:** 768 ya está fijado; un modelo de 1024 obliga a migrar.
3. **Infra y restricciones:** offline (RNF-03), sin GPU, RAM, Docker, tamaño.
4. **Contexto y chunking:** 2 K (EmbeddingGemma) vs 32 K (Qwen3) según largo real.
5. **Licencia:** Apache / MIT / Gemma Terms / CC-BY-NC; cuántas piezas mantener.
6. **Métrica objetivo:** recall@k en el corpus propio; la media de MTEB no basta.
7. **Integración:** corre en el **worker** (ADR-0011), nunca en la API.

## 7. Recomendación (a confirmar en M1)

1. **Principal:** **Qwen3-Embedding-0.6B** (Apache 2.0, MRL a 768, 32 K) —
   licencia limpia y contexto largo.
2. **Alternativa (borde/CPU):** **EmbeddingGemma** (768 nativas, < 200 MB RAM;
   licencia Gemma Terms).
3. **Baseline:** **multilingual-e5-base** (768, MIT) como piso de la comparación.
4. **Si el esquema se abre a 1024:** **bge-m3** (MIT) por su salida híbrida.
5. **Descartados:** APIs de nube (RNF-03) y dims > 2000 (halfvec innecesario).
6. **Cierre:** medir recall@k en M1 y congelar como **ADR-0015**.

## 8. Fuentes

- EmbeddingGemma: <https://ai.google.dev/gemma/docs/embeddinggemma> ·
  <https://arxiv.org/pdf/2509.20354> · <https://ollama.com/library/embeddinggemma>
- Qwen3-Embedding: <https://huggingface.co/Qwen/Qwen3-Embedding-0.6B> ·
  <https://arxiv.org/abs/2506.05176>
- bge-m3: <https://huggingface.co/BAAI/bge-m3> · <https://arxiv.org/abs/2402.03216>
- multilingual-e5: <https://huggingface.co/intfloat/multilingual-e5-base>
- nomic-embed-text-v2-moe: <https://huggingface.co/nomic-ai/nomic-embed-text-v2-moe>
- granite-embedding-multilingual-r2: <https://arxiv.org/html/2605.13521v1>
- MMTEB: <https://arxiv.org/abs/2502.13595> · tablero <https://mteb-leaderboard.hf.space/>
- pgvector: <https://github.com/pgvector/pgvector>
