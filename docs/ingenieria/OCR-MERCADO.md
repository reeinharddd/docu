# Mercado: extracción, layout y scoring documental

Estado: **estudio de mercado** (2026-10-17). No es una decisión ni un ADR: es el
insumo para el spike de `#32` y para los ADRs que de él salgan. Dueño: Erik.

Fuentes: repositorios y reportes oficiales citados al final. Los números de
benchmark son **lo que reporta cada proyecto** (OmniDocBench v1.5 y similares),
no mediciones propias. Nada de esto está probado todavía en DOCU.

## 1. Qué necesita el proyecto, por etapa

| Etapa del proceso | RF | Qué se necesita | Issue |
|---|---|---|---|
| Clasificación por familia | RF-01 | Decidir a qué familia pertenece un archivo (Excel, PDF, correo, escaneado) | #3 |
| **Extracción de texto** | RF-02 | Leer campos clave de escaneados/PDF/fotos con ≥ 90 % exactitud y CER ≤ 10 % | #32 → #3 |
| **Layout y estructura** | RF-02 | Orden de lectura, tablas, fórmulas; no solo texto plano | #32 |
| **Scoring y validación** | RF-02, RF-03 | Decidir cuarentena / revisión / oficial con motivo; confianza por campo | #3, #5 |
| Búsqueda semántica | Should | Embeddings + pgvector | #4 |
| Integración con sistemas | RF-08 | Agentes web para descargar documentos de portales | transversal |

## 2. Motores de extracción (OCR / documento)

| Motor | Tamaño | Fuente | Puntos fuertes | Puntos débiles | Local |
|---|---|---|---|---|---|
| **GLM-OCR** | 0.9B | Zhipu AI | SOTA en KIE (Nanonets 93.7, handwritten 86.1), recibos 94.5, sellos 90.5; **español**; Ollama/vLLM/SGLang | Modelo nuevo; poca trayectoria en producción | ✅ |
| **PaddleOCR-VL / 1.5** | 0.9B | Baidu | Multi-task (texto, fórmula, tabla); PP-OCRv6 ligero y rápido en CPU | Stack PaddlePaddle más pesado | ✅ |
| **dots.mocr** | 3B | rednote | Mejor OmniDocBench v1.5 de su clase (0.031); gráficos a SVG | 3B: pide más RAM | ✅ |
| **Dolphin-v2** | 3B | ByteDance | Layout-aware, documentos fotografiados, fórmulas/código | 3B; orientado a layout más que a KIE | ✅ |
| **HunyuanOCR** | 0.9B | Tencent | Competitivo en OmniDocBench | Menos documentado | ✅ |
| **DeepSeek-OCR** | 3B | DeepSeek | Token-eficiente | 3B | ✅ |
| **MinerU 2.5** | 1.2B | PDF-Extract-Kit | Muy preciso; DocLayout-YOLO + RapidTable | Pesado en CPU | ✅ |
| **GOT-OCR2.0** | — | StepFun | OCR-2.0 unificado | Licencia **solo investigación** | ✅ |
| **Tesseract 5.5** | — | Google | Maduro, CPU, offline, `spa` ya instalado | **Sin layout ni tablas**; débil en escáneres duros | ✅ |
| **surya** | 650M | datalab | OCR + layout + orden de lectura + tablas en uno | PyTorch; pesado en CPU | ✅ |
| **Docling** | — | Linux Foundation | PDF → Markdown/JSON con layout y TableFormer | PyTorch; EasyOCR dentro | ✅ |
| **RapidOCR / EasyOCR** | — | — | Ligeros (ONNX) | Menos exactos que los VLM | ✅ |

## 3. Layout y estructura

| Herramienta | Qué hace | Nota |
|---|---|---|
| **surya** | Detección de líneas, layout, orden de lectura, tablas, LaTeX | Un solo modelo; v2 es un VLM único |
| **Docling** | Layout + TableFormer → Markdown/JSON | Buen equilibrio precisión/complejidad |
| **MinerU** | DocLayout-YOLO + RapidTable | El más preciso; el más pesado |
| **DocLayout-YOLO** | Solo detección de layout (YOLO-v10) | Se integra en MinerU / PDF-Extract-Kit |
| **Dolphin-v2** | Layout + parseo por elementos | Orientado a documentos fotografiados |

## 4. Scoring y decisión (modelos "System 1")

**Cómo funcionan:** reciben un `state` (texto o JSON) y `questions` (1–64, cada una de
tipo `choice`, `noul` o `score`, con opciones). Devuelven una **distribilidad de
probabilidades calibradas** en **un solo pase no autoregresor**: no generan texto y no
alucinan. La `confidence` permite una **cascada**: aceptar si es confiable y escalar a
un juez fuerte si no.

| Modelo | Tipo | Peso | Licencia | Latencia | Nota |
|---|---|---|---|---|---|
| **Jev** (TypeSafe) | hosted | — | cerrado | 236–276 ms | El más exacto (9/11 puntos vs laya); es **nube** |
| **Laya** (Convai) | abierto, local | 421M / 322M | Apache 2.0 | 32.8 ms (T4) | Estándar abierto; habla el API `/v1/systemone` de Jev |
| **Kev** (Jared Palmer) | abierto, local | 0.8B–27B (Qwen) | Apache 2.0 | — | Qwen fine-tuned; compatible con el SDK de Jev |
| **OpenDecider** | abierto, local | ~400M / 4B / 30B | Apache 2.0 | 16 ms (L40S) | **0.796** en typed-decisions: supera a Laya (0.766) y a Jev (0.754) |
| **Decider** (Mapika) | abierto, local | 2B–35B (Qwen) | Apache 2.0 | — | Endpoint `/v1/systemone` |
| **Clef** (Cloudflare) | abierto, local | 9B / 27B (Qwen) | Apache 2.0 | — | Formato Jev / SystemOne |
| **JEV-27B / JEV-9B** (AutoTrust) | abierto, local | 27B / 9B (Qwen3.8) | Apache 2.0 | — | "Indistinguible de Jev 1.13 por KL"; **+0.22 sobre Jev** |
| **rev** | abierto, local | 0.5B–8B (Qwen+LoRA) | Apache 2.0 | <5 ms (KV-cache) | Shortlist de 255+ opciones |
| **jeff-2b-decision** | abierto, local | ~2B (Qwen3.5) | Apache 2.0 | — | BANKING77 95.8 % |
| **GLiNER** | abierto | ~150M | Apache | ~44 ms (CPU) | Etiquetado por esquema, sin entrenar |
| **NLI zero-shot** | abierto | — | — | — | sí/no y etiquetas sin entrenar |
| **Encoder fine-tuned** (ModernBERT / Ettin) | abierto | 150–400M | Apache | ms | Para tareas fijas con datos (Ettin-150M AUROC 0.939) |
| **Embeddings + kNN** | abierto | — | — | — | Muchos candidatos |
| **LLM acotado** | varios | — | — | 303 ms–5.6 s | Espacios de etiquetas enormes |

**Categoría:** TypeSafe acuñó "System One" el 2026-09-15 con Jev (cerrado). Le siguió
**Laya** como abierto; hoy hay **más de 20 modelos abiertos** en la lista
`awesome-system-one`, varios sobre **Qwen** (Kev, Decider, Clef, OpenDecider, JEV-27B).

**Benchmarks (Li et al. 2026; 7 283 casos + 6 640 variantes):** Jev gana en 9/11 puntos
(+10.8 a +46 pp); empate en relevancia RAG; ninguno supera al azar en *model routing*
0-shot. Laya cambia el 30.3 % de sus respuestas al invertir el orden de opciones
(Jev 1.8 %). En *typed-decisions* Laya (0.766) supera a Jev (0.727) y calibra 3× mejor
(ECE 0.081 vs 0.246).

**Ecosistema laya:** Python (`pip install laya`), Node/TS con ONNX Runtime
(`receptron/laya`, sin PyTorch) y Ollama (≥ 0.40). Su API `/v1/systemone` es
**compatible con Jev**: se cambia uno por otro cambiando la URL.

**Para DOCU:** RNF-03 (offline) → **Laya local** es el candidato; Jev queda descartado
por ser nube (salvo configuración explícita). Ojo: Laya es débil con muchas opciones;
nuestras 6 familias están dentro de su rango útil.

## 5. Modelos generales locales (VLM) por si se necesita más que OCR

| Modelo | Tamaño | Fuente | Nota |
|---|---|---|---|
| **Qwen2.5-VL / Qwen3-VL** | 3B–235B | Alibaba | Referencia en OCR multilingüe; Qwen3-VL es el más capaz |
| **MiniCPM-V 4.5 / 4.7** | 8B / 1B / 35B-A3B | OpenBMB | "Top choice for document processing" local; muy eficiente |
| **GLM-4.6V-Flash / GLM-5.3-Flash** | 9B | Zhipu AI | VLM general con buen soporte de documentos |
| **Llama 3.2 Vision** | 11B / 90B | Meta | Generalista |
| **Pixtral** | — | Mistral | Generalista |
| **moondream** | pequeño | — | Hardware con < 4 GB VRAM |

Todos disponibles en **Ollama** (`ollama pull glm-ocr`, `qwen2.5vl`, `minicpm-v`).

## 6. Agentes e integración

| Herramienta | Qué es | Uso posible en DOCU |
|---|---|---|
| **jev-ultrafast** (23.2k★) | Web agent rápido y barato (TypeSafe Jev + Browser Harness) | Descargar documentos de portales web en la etapa de ingesta |
| **browser-use** | Framework de agentes de navegador | Base de jev; alternativa más general |

## 7. Infraestructura y restricciones

- **RNF-03**: funciona en localhost sin internet salvo IA en nube opcional →
  **modelos locales**; la nube solo con configuración explícita.
- **Sin GPU confirmada** → priorizar modelos que corran bien en CPU
  (Tesseract, GLM-OCR 0.9B, PaddleOCR-VL tiny, laya).
- **Servir modelos**: Ollama (fácil), vLLM / SGLang (rendimiento), LM Studio, llama.cpp.
- **Docker**: el worker (ADR-0011) debe poder correr el motor elegido; los modelos
  grandes piden imagen propia o servicio aparte.

## 8. Recomendación (a confirmar con el spike de #32)

1. **Baseline ya disponible**: Tesseract 5.5 (`spa`) — mide el piso, no el techo.
2. **Candidato principal**: **GLM-OCR** (0.9B, español, SOTA KIE, local vía Ollama).
3. **Alternativas fuertes**: PaddleOCR-VL 1.5 (ligero) y dots.mocr (más exacto, 3B).
4. **Layout/tablas**: surya o Docling si GLM-OCR no basta; MinerU si hay recursos.
5. **Scoring**: `laya` para decisiones rápidas + CER/exactitud como métrica objetiva.
6. **Generalista de respaldo**: Qwen2.5-VL o MiniCPM-V vía Ollama.

## 9. ¿Qué categorías considerar al elegir?

1. **Entrada**: escaneado (imagen), PDF con capa de texto, foto, Office, correo. No es lo
   mismo OCR sobre imagen que PDF digital: el PDF puede no necesitar OCR.
2. **Salida requerida**: texto plano / campos (KIE) / tablas / orden de lectura. **Esta es
   la categoría que define la arquitectura**: si hay tablas, un OCR clásico no basta.
3. **Arquitectura**: todo-en-uno (un VLM) vs pipeline por etapas (layout + OCR + tabla) vs
   híbrido (OCR barato para lo limpio + VLM solo para lo difícil).
4. **Infra y restricciones**: offline (RNF-03), CPU/GPU, RAM, tamaño del modelo, Docker.
5. **Idioma y dominio**: español; los formatos reales de la planta (las 6 familias).
6. **Métrica objetivo**: RF-02 (campos ≥ 90 %, CER ≤ 10 %) — condiciona la elección.
7. **Integración**: corre en el **worker**, nunca en la API (ADR-0011); en Docker.
8. **Licencia y mantenimiento**: Apache / MIT / AGPL / solo-investigación; cuántas piezas
   hay que mantener.

## 10. Fuentes

- GLM-OCR: <https://github.com/zai-org/GLM-OCR> · reporte <https://arxiv.org/html/2603.10910v1>
- GLM-V: <https://github.com/zai-org/GLM-V>
- Dolphin (ByteDance): <https://github.com/bytedance/Dolphin>
- PaddleOCR: <https://github.com/PaddlePaddle/PaddleOCR>
- dots.ocr / dots.mocr: <https://github.com/studio-dots-ai/dots.ocr>
- surya: <https://github.com/datalab-to/surya>
- Docling: <https://github.com/docling-project/docling>
- MinerU: <https://github.com/opendatalab/MinerU>
- GOT-OCR2.0: <https://github.com/Ucas-HaoranWei/GOT-OCR2.0>
- laya: <https://github.com/NandhaKishorM/laya>
- jev-ultrafast: <https://github.com/browser-use/jev-ultrafast>
- Ollama (glm-ocr, qwen2.5vl, minicpm-v): <https://ollama.com/library>
