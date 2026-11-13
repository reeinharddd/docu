# BRIEF #151 — El modelo de embeddings por defecto no existe y la dimensión no se pedía

## 0. Encabezado

- Issue: #151
- Dueño: Erik Beltrán (Líder, infra y pipeline).
- Fechas: 2026-11-13 → 2026-11-13 · Sprint 3 · hito `C1 vertical completa`
- Prioridad / Tipo / Épica / Módulo: crítica / bug / backend / capa `apps/api/src/ia/`
- Requisitos: RF-01, RNF-07
- Bloqueado por: — · Bloquea a: —

## 1. Contexto

La prueba live de embeddings (`IA_LIVE_TEST=1`) fallaba contra el Ollama local
con `HTTP 404 model not found`, mientras `curl` al mismo endpoint con el mismo
cuerpo respondía 200. Un fallo que se reproduction en la app real (donde el
`.env` sí fija el modelo) y solo se manifests en el test (que corre sin
`.env`) es un fallo del **default del código**, no del entorno.

## 2. Por qué importa tu parte

El contrato del ER v1 exige `vector(768)` exacto. Si la capa de IA no puede
producir un vector de 768 dimensiones, **el pipeline de ingesta no guarda
memoria**: el RAG (issue #145) y la búsqueda por contenido no tienen insumo.
Además, la entrega del 15 de noviembre se apoya en que la IA local funcione de
verdad, no en que el doble de pruebas lo simule.

## 3. Objetivo y resultado esperado

| Entregable | Evidencia |
|---|---|
| Diagnóstico con causa raíz | bisección por capas: `fetch` crudo → cliente directo → runner → runner con cliente inyectado |
| Default del modelo corregido | `IA_EMBEDDING_MODEL` por defecto = `qwen3-embedding:0.6b` (dos puntos), igual que el registro del endpoint |
| Dimensión contratada en la petición | `dimensions: 768` viaja en el body de `/v1/embeddings` |
| Batería live de las tres capacidades | embeddings, OCR y LLM contra el endpoint configurado, con presupuesto de medición (no de producción) |
| Fixture de OCR | página sintética, sin datos de planta, para la prueba live de visión |
| Documentación del proveedor alterno | bloque NVIDIA NIM en `docs/ingenieria/IA-MOTORES.md` §1.1 y en `.env.example` |

## 4. Diagnóstico (bisección)

| Prueba | Resultado |
|---|---|
| `fetch` crudo a `/v1/embeddings` | 200, vector de 1024 dims |
| `OpenAiCompatClient.embeddings()` directo | 200, vector de 1024 dims |
| `IaRunner.embed()` (mismo cliente, mismo cuerpo) | **404 model not found** |
| `curl` con el mismo cuerpo | 200 |
| `GET /v1/models` | lista `qwen3-embedding:0.6b` (con dos puntos) |

El cliente directo y el runner enviaban **bytes distintos**: el SHA-256 del
cuerpo difería (`3165b4afb083` vs `01bb5511cbcd`). La causa era el nombre del
modelo — el runner usaba `qwen3-embedding-0.6b` (guion) y el endpoint tiene
registrado `qwen3-embedding:0.6b` (dos puntos).

El guion venía del **default hardcodeado** en `apps/api/src/ia/config.ts`, no
del `.env` (que ya tenía el valor correcto).

## 5. Segundo defecto (puesto al descubierto por el primero)

Con el nombre corregido, Ollama respondía 200 pero con **1024 dimensiones**:
Qwen3-Embedding es Matryoshka y solo recorta si se lo piden. El contrato del
ER v1 exige 768 exacto, así que la llamada era rechazada con
`ContractViolationError`. La petición ahora incluye `dimensions: 768`, que
Ollama y los proveedores OpenAI-compatible con vectores Matryoshka respetan.

## 6. Actividades específicas

1. Corregir el default de `IA_EMBEDDING_MODEL` y documentar el motivo en el
   código.
2. Añadir `dimensions` al contrato de la petición de embeddings y enviarlo
   desde el motor.
3. Ampliar la batería live a las tres capacidades (embeddings, OCR, LLM) con
   presupuesto y timeout de medición.
4. Añadir el fixture sintético para la prueba live de OCR.
5. Documentar el bloque NVIDIA NIM: variables, procedimiento y las dos
   trampas del proveedor (`dimensions` no soportado por
   `nemotron-3-embed-1b`; `input_type` exigido por NV-Embed-QA y E5).

## 7. Evidencia

```
IA_LIVE_TEST=1 IA_API_BASE_URL=http://localhost:11434/v1 bun test src/ia/ia.spec.ts

(pass) embeds a real text at the configured endpoint within the 768 contract [41.08ms]
(pass) reads a real page with the configured vision model [92988.22ms]
(pass) answers with the configured chat model in the requested JSON shape [6514.97ms]

21 pass
0 fail
```

`bun run verify` verde: API 97 pass, web 116 pass, smoke `/health` OK.

## 8. Relación con los issues abiertos

- **#136** (fragmentos y presupuesto por documento) sigue abierto: este
  arreglo hace que una llamada aislada pase, no que un documento real escale.
- **#141** (NVIDIA NIM) queda bloqueado por la credencial del líder; el
  procedimiento exacto quedó en `docs/ingenieria/IA-MOTORES.md` §1.1.

## 9. Referencias

- [ADR-0020](../decisiones/ADR-0020-motores-de-ia-como-configuracion.md) — el
  proveedor es un dato, nunca código.
- `docs/ingenieria/IA-MOTORES.md` — contrato de la capa y bloque del proveedor
  NVIDIA NIM (§1.1).
- `docs/ingenieria/IA.md` §6 — la dimensión 768 es contrato del ER v1.
- #136 · #141 · #145
