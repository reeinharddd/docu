# ADR 0020 — Acceso centralizado a motores de IA vía API compatible OpenAI

Fecha: 2026-11-07 · Estado: Aceptada (2026-11-08, con la integración IA #85) ·
Decide: Erik · Revisa: Emmanuel

## Contexto

La regla del proyecto es que **cambiar de motor es cambiar un dato, no tocar
código** (REPLAN-2026-10-30 §4). La arquitectura de #60 declaró el hueco en
`ARQUITECTURA.md` §5: no hay dónde elegir el motor. Los modelos ya están
elegidos y documentados: **GLM-OCR 0.9B** para lectura de escaneados
([OCR.md](../ingenieria/OCR.md)), **Laya** para scoring con confianza
calibrada (in-proceso, OCR.md §6), **Llama 3.1/3.2** para clasificación y
consulta ([IA.md](../ingenieria/IA.md) §5) y **Qwen3-Embedding-0.6B /
EmbeddingGemma** para vectores a 768 (IA.md §6).

Lo que faltaba era decidir **cómo se accede a esos modelos**. Restricciones
reales:

- El caso de uso real: **cada compañía conecta sus propios modelos**. C1 corre
  con un proveedor; otra instalación puede apuntar a otro, sin tocar código.
- Los motores elegidos corren **local vía Ollama** (RNF-03: los datos de la
  instalación no salen de la máquina; `IA_LOCAL_ACTIVADA=true`,
  `IA_NUBE_ACTIVADA=false` en IA.md §4).
- Ollama, vLLM, SGLang, NVIDIA NIM, OpenAI y los gateways de mercado exponen
  la **misma superficie: API compatible OpenAI** (`/v1/chat/completions`,
  `/v1/embeddings`).
- No se aceptan motores falsos ni simulados: los modelos reales quedan listos
  y las pruebas de integración corren contra el endpoint configurado.
- El ER v1 (PR #107) ya registra la evidencia por corrida
  (`ocr_result.engine`/`engine_version`, `memory_embedding.model`).

## Decisión

**Un único cliente HTTP compatible OpenAI es el acceso centralizado a todos
los motores por API. El proveedor se cambia con configuración; jamás con
código.**

1. `IA_API_BASE_URL` + `IA_API_KEY` apuntan al endpoint del proveedor:
   Ollama local (`http://localhost:11434/v1`), vLLM/SGLang en el host,
   NVIDIA NIM, OpenAI, o el endpoint que la compañía opere. El mismo cliente
   sirve OCR (visión), LLM y embeddings.
2. Cada capacidad elige su modelo por entorno: `IA_OCR_MODEL` (default
   `glm-ocr`), `IA_LLM_MODEL` (default `llama3.2`),
   `IA_EMBEDDING_MODEL` (default `qwen3-embedding-0.6b`). Cambiar de modelo
   o de proveedor es cambiar `.env` y reiniciar el worker.
3. **La nube exige activación explícita** (RNF-03): si `IA_API_BASE_URL` no
   es un host local/de red privada y `IA_NUBE_ACTIVADA != true`, el módulo
   **falla al arrancar** con error accionable. Local por defecto, nube como
   excepción autorizada por el líder.
4. **Laya es la excepción por diseño**: corre en proceso en el worker (ONNX),
   no por API (OCR.md §6: confianza calibrada sin generar texto). #85 define
   y deja lista la interfaz `ScoringEngine`; su implementación ONNX la
   construye el carril de clasificación (#3) sobre esa interfaz, dentro del
   worker, sin tocar este módulo.
5. **Sin simulaciones**: no existen motores falsos. Las pruebas unitarias
   cubren construcción de peticiones y mapeo de respuestas con dobles de
   transporte dentro del spec; las pruebas de integración contra el endpoint
   real se activan con `IA_LIVE_TEST=1`.
6. Presupuesto, caché y trazabilidad rodean toda llamada
   (`IA_BUDGET_MAX_MS`, `IA_BUDGET_MAX_TOKENS`, `IA_CACHE_ENABLED`): cada
   corrida registra motor, modelo, hash de entrada, tokens, tiempo y si salió
   de caché o fue cortada por presupuesto. La base ya tiene las columnas que
   lo persisten.
7. La salida del LLM viene forzada a JSON Schema
   (`response_format: json_schema`) y **se valida con Zod antes de tocar la
   base** (IA.md §2); el esquema vive en el repo junto a la familia, no en el
   prompt.
8. La dimensión de embeddings es contrato del ER: **768** (IA.md §6). Una
   respuesta de otra dimensión es error accionable, no un dato que entra.
9. Se difiere el catálogo de motores en base (`config.engine_profile`): solo
   si C1 necesita elegir motor **por familia sin redeploy**. Hoy la elección
   por entorno y la evidencia por corrida bastan.

## Consecuencias

- **Positivas:** un solo transporte que hablar; el caso multi-compañía queda
  resuelto por configuración (cada instalación apunta a su endpoint);
  swap local↔NIM↔OpenAI sin tocar código; presupuestos y trazas iguales en
  cualquier proveedor.
- **Negativas:** el cambio de proveedor exige reinicio del worker; las
  diferencias finas entre gateways (parámetros soportados) quedan acotadas al
  cliente; cambiar el modelo de embeddings después de producción exige
  migrar vectores (prohibido sin ADR nuevo).

## Referencias

- `BRIEF-85-integracion-ia.md` · `IA.md` §2, §4, §5, §6 · `OCR.md` §1, §6
- `ARQUITECTURA.md` §5 y §8 · `COLAS.md`
- ADR-0006 · ADR-0009 · ADR-0011 · ADR-0014 · ADR-0004
