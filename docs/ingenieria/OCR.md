# OCR y scoring: motor elegido y cómo corre

Estado: **decisión de fase 1** (2026-10-17). Fase 2 confirma con los escaneados
del caso (`#61`). Dueño: Erik. Revisor: Emmanuel. Insumo de mercado y
alternativas descartadas: [OCR-MERCADO.md](OCR-MERCADO.md).

Este archivo describe **cómo se leen los escaneados hoy** y con qué se decide.
Responde a RF-02 (campos clave ≥ 90 %, CER ≤ 10 %). El "por qué se eligió este
motor sobre sus alternativas" se registra como ADR cuando la decisión se
congele; mientras tanto, este documento es el estado vigente.

## 1. Decisión

| Pieza | Elegido | Rol |
|---|---|---|
| **Lectura de escaneados (OCR/KIE)** | **GLM-OCR 0.9B** (Zhipu AI), local vía Ollama | Motor principal |
| **Texto limpio de PDF con capa de texto** | **Tesseract 5.5** (`spa`) | Baseline medido y atajo rápido cuando no hay ruido ni tablas |
| **Scoring y decisión** | **Laya**, checkpoint `multilingual` (Convai), Apache 2.0 | Clasificación de familia y mapeo con confianza calibrada |
| **Plan B (tablas duras)** | PaddleOCR-VL 1.5; dots.mocr 3B | Solo si GLM-OCR no alcanza |

Descartado como motor principal: **Jev** (nube, rompe RNF-03) y **OpenDecider**
(solo inglés, no sirve para nuestro corpus en español).

## 2. Por qué GLM-OCR y no otro OCR

| Criterio (RF-02 + RNF-03) | GLM-OCR | PaddleOCR-VL 1.5 | Tesseract 5.5 |
|---|---|---|---|
| Español | Sí (lista oficial multi-idioma) | Sí | Sí (modelo `spa`) |
| KIE (campos clave) | **93.7** Nanonets-KIE | no reporta KIE | no aplica |
| Tablas y layout | 94.6 OmniDocBench v1.5; 91.5 tablas | leve ventaja solo en manuscrito | sin layout ni tablas |
| Local + CPU (RNF-03) | Sí, 0.9B, Ollama/vLLM/SGLang | Sí | Sí |
| Tamaño de mantenimiento | un modelo | stack PaddlePaddle | maduro |

Los números de GLM-OCR son **lo que reporta Zhipu AI** en su reporte técnico
(cita en §9), no una medición propia de DOCU. La medición propia es la de §3.

**Tesseract no se elige como motor.** Se conserva por dos razones: marca el piso
de la comparación y sirve de filtro instantáneo (≈ 0.2 s) para documentos limpios,
donde un VLM es gasto innecesario. Un OCR clásico no resuelve tablas ni orden de
lectura, que es justo lo que RF-02 necesita en los formatos reales de planta.

## 3. Fase 1: lo medido en DOCU

Corpus degradado propio (`/tmp/opencode/corpus_d`), 3 tipos × 3 degradaciones
(ruido, blur, rotación), comparando GLM-OCR contra Tesseract:

| Tipo de documento | GLM-OCR (CER) | Tesseract (CER) |
|---|---|---|
| Texto degradado (blur, rotación) | se mantiene | colapsa |
| Tablas (blur / rotación / ruido) | se mantiene | 100 % / 70 % / 58.75 % |
| **Promedio degradado** | **11.26 %** | **33.67 %** |

Conclusión: **Tesseract solo gana en texto limpio y en velocidad (0.2 s vs ≈ 5 s)**;
en escaneos reales (ruido, blur, tablas) colapsa. Por eso el diseño es híbrido:
Tesseract para lo limpio, GLM-OCR para el resto. El umbral de decisión
(texto limpio vs difícil) se fija en `#3`, no aquí.

Los números de este corpus son reproducibles, pero **todavía no son el CSV del
brief**: falta el script con comando único en `dataset/ocr-eval/` (§8).

## 4. Cómo corre (worker, nunca API)

- **Dónde:** en el proceso `worker` (ADR-0011). La API solo encola; no ejecuta OCR
  ([ARQUITECTURA.md](ARQUITECTURA.md) §1).
- **GLM-OCR:** servicio **Ollama** en `localhost`, llamado por HTTP desde el
  worker, igual que los demás modelos locales de [IA.md](IA.md). En Docker va como
  contenedor propio o imagen con el modelo horneado; los pesos no entran a la
  imagen de la app.
- **Laya:** se ejecuta **en proceso** dentro del worker vía ONNX Runtime
  (`onnxruntime-node`), sin servicio aparte. *A verificar al construir el worker*:
  compatibilidad del addon nativo de `onnxruntime-node` con el runtime Bun; si no
  carga, el worker usa su contenedor Node y queda como borrador de ADR.
- **Restricción hardware:** no hay GPU confirmada. GLM-OCR (0.9B) y Laya
  (mmBERT-base) corren en CPU; el costo real por página hay que medirlo en `#46`.

## 5. Layout y tablas

GLM-OCR ya entrega layout, tablas (HTML) y orden de lectura. Si un formato del
caso lo excede, el siguiente escalón es **surya** o **Docling** (layout + tablas)
y, con más recursos, **MinerU**. No se agrega ninguna de estas piezas hasta que la
evaluación lo pida: cada una es un proceso más que mantener.

## 6. Scoring y decisión: Laya

La clasificación de familia y la propuesta de mapeo (RF-03) usan **Laya** como
primer paso, en la capa de selección de [IA.md](IA.md) §3:

| Candidato | Local | Español | Calibración (ECE ↓) | Nota |
|---|---|---|---|---|
| **Laya `multilingual`** | Sí, Apache 2.0 | Sí (45/51 idiomas) | **0.081** | Elegido |
| OpenDecider-nano | Sí, Apache 2.0 | **No (solo inglés)** | 0.092 | Descartado por idioma |
| Jev | No (nube) | — | 0.164 | Descartado por RNF-03 |

**Por qué Laya:** devuelve una **distribución calibrada en un solo pase no
autoregresor** (no genera texto, no alucina). Eso habilita una **cascada**:
si la confianza es alta, se acepta; si es baja, escala al LLM (Ollama con salida
JSON Schema validada con Zod, [IA.md](IA.md) §2). Su debilidad conocida son los
espacios de más de ~20 opciones; nuestras **6 familias** caen en su rango útil.

Nota de coherencia: [IA.md](IA.md) §5 descarta "la confianza declarada por el
modelo" porque no es calibrada. Laya es la excepción: su confianza **sí** está
calibrada (ECE 0.081, el mejor de los candidatos), y por eso puede ordenar
revisión y alimentar la cascada. Aun así, **la confianza no publica**: el humano
confirma (ADR-0006).

El resto de la estrategia de IA (modelos locales, embeddings, umbrales) sigue en
[IA.md](IA.md); aquí solo se fija el motor de scoring.

## 7. Límites: qué no alcanza

- **Scans reales de la planta:** sin medir. La fase 2 usa los `#61` contra ground
  truth; si el CER sube en formularios reales de planta, entra el plan B.
- **Formato exacto de campos clave:** el CSV del brief medirá exactitud por campo,
  no solo CER de texto corrido.
- **Volumen:** el rendimiento por página en CPU real está sin medir (`#46`).
- **Licencia:** GLM-OCR y Laya son permisivas (Apache 2.0 en Laya); Tesseract es
  Apache 2.0. Ninguna pieza es "solo investigación".

## 8. Siguientes pasos

1. Comentar la conclusión en `#3` y fijar el umbral limpio/difícil.
2. **Fase 2** (futura, fuera de este issue): validar con los escaneados del caso (`#61`).
3. **Borrador de ADR** del motor si al construir el worker el addon de Laya no
   corre bajo Bun, o si la decisión GLM-OCR vs plan B cambia con fase 2.

## 9. Fuentes

- GLM-OCR: <https://github.com/zai-org/GLM-OCR> · reporte
  <https://arxiv.org/html/2603.10910v1> (Nanonets-KIE 93.7, OmniDocBench v1.5 94.6)
- Laya: <https://huggingface.co/convaiinnovations/laya> (Apache 2.0) · ONNX
  <https://huggingface.co/onnx-community/laya-multilingual-ONNX>
- OpenDecider (descartado por idioma): <https://github.com/manjunathshiva/opendecider>
- PaddleOCR: <https://github.com/PaddlePaddle/PaddleOCR> ·
  surya: <https://github.com/datalab-to/surya> · Docling: <https://github.com/docling-project/docling>
- Ollama: <https://ollama.com/library>
