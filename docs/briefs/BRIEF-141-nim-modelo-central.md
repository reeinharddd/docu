# BRIEF #141 — NVIDIA NIM como modelo central: el proveedor es un dato por capacidad

## 0. Encabezado

- Issue: #141
- Dueño: Erik Beltrán (Líder, infra y pipeline) — `reeinharddd`.
- Fechas: 2026-11-13 → 2026-11-13 · Sprint 3 · hito `C1 vertical completa`
- Prioridad / Tipo / Épica / Módulo: alta / feature / back / capa
  `apps/api/src/ia/`
- Requisitos: RNF-03
- Bloqueado por: — · Bloquea a: la demo (el modelo central con el criterio que
  la planta no puede correr) y la ruta de fallback de la épica #142

## 1. Contexto

La planta no puede correr un modelo suficientemente bueno para el **modelo
central** — el que clasifica, organiza y consulta. Eso es el motivo único por
el que se usa NVIDIA NIM. El resto del trabajo de IA sí puede —y debe— quedar
en la planta: el OCR (GLM-OCR), los embeddings (qwen3-embedding:0.6b) y el
scoring calibrado (Laya).

El código, sin embargo, tenía **una sola** base URL y una sola clave para las
tres capacidades (`IA_API_BASE_URL` / `IA_API_KEY`): o todo iba a la nube o
todo se quedaba en casa. Ese era el freno real.

## 2. Por qué importa tu parte

Sin proveedor por capacidad, la planta tiene dos salidas y ninguna buena:
sacar el texto del documento a la nube (RNF-03, DLP) o resignarse a un modelo
local demasiado débil para organizar y clasificar con criterio. Con el
proveedor por capacidad, el reparto es explícito, auditable y sigue siendo
**dato, no código** (ADR-0020).

## 3. Objetivo y resultado esperado

| Entregable | Evidencia |
|---|---|
| Cada capacidad puede apuntar a su proveedor | `IA_{OCR,LLM,EMBEDDING}_API_BASE_URL` y `_API_KEY` |
| RNF-03 se aplica a cada endpoint | un endpoint remoto sin `IA_NUBE_ACTIVADA=true` impide arrancar |
| Los modelos asimétricos funcionan | `IA_EMBEDDING_INPUT_TYPE` se manda solo si se declara |
| La caché no mezcla proveedores | el endpoint es parte de la clave de caché |
| El esquema híbrido corre de punta a punta | ciclo real: OCR local + modelo central en NIM + embeddings y scoring locales |

## 4. Diagnóstico

Tres cosas, todas medidas:

1. **El bloqueo de configuración.** `IaConfig` tenía `baseUrl` y `apiKey`
   únicos; `IaRunner` construía **un** `OpenAiCompatClient` para las tres
   capacidades.
2. **Los modelos del perfil estaban retirados.** `nvidia/nemotron-nano-12b-v2-vl`
   (visión) y `meta/llama-3.3-70b-instruct` (texto) responden
   `HTTP 410 Gone — reached its end of life on 2026-08-26`. El catálogo vivo
   de la cuenta tiene 83 modelos; muchos de los que aparecen en la lista
   devuelven `404 Function not found for account` (sin acceso).
3. **Los modelos que respondían no todos sirven para el trabajo.** Con
   `response_format: json_schema` hay modelos que devuelven el JSON en
   `reasoning_content` y dejan `content` vacío: el motor los rechaza con
   «LLM returned non-JSON output despite the schema contract».

## 5. Solución

### 5.1 Proveedor por capacidad

```bash
# .env local (NO versionado)
IA_API_BASE_URL=http://localhost:11434/v1     # default: la planta
IA_API_KEY=
IA_NUBE_ACTIVADA=true
IA_LLM_API_BASE_URL=https://integrate.api.nvidia.com/v1
IA_LLM_API_KEY=...        # la credencial de build.nvidia.com; nunca en el repo
IA_LLM_MODEL=nvidia/nemotron-3-nano-omni-30b-a3b-reasoning
```

Cada capacidad resuelve su endpoint: el suyo si está declarado, el de
`IA_API_BASE_URL` si no. La misma regla de localidad (RNF-03) se aplica a
cada uno, con un mensaje que nombra la variable que falla.

### 5.2 `input_type` para embeddings asimétricos

Los modelos asimétricos (NV-Embed-QA, E5, Nemotron 3.5 Embed) responden
`HTTP 400 'input_type' parameter is required for asymmetric models`. Con
`IA_EMBEDDING_INPUT_TYPE=query` el motor lo manda; vacío = no se manda (los
modelos simétricos lo rechazan).

### 5.3 La caché distingue proveedores

La clave de caché incluye el endpoint: el mismo nombre de modelo en dos
proveedores son dos respuestas distintas y el caché no puede servir una por
la otra.

### 5.4 El modelo central, elegido con medición

La decisión no es «el más grande»: es el que clasifica bien **y** responde a
tiempo para la demo. Medido el 13-nov con el prompt real de DOCU (4 casos de
clasificación):

| Modelo | Aciertos | Tiempo promedio | JSON |
|---|---|---|---|
| `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning` | 4/4 | **2,4 s** | válido |
| `nvidia/nemotron-3-ultra-550b-a55b` | 4/4 | 24,7 s | válido |
| `llama3.2` (Ollama local) | 4/4 | 2,9 s | válido |

**Elegido: `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning`** para el pipeline
(rápido y correcto). El **Ultra 550B** queda documentado como el modelo de
razonamiento profundo para las consultas del agente, donde 25 s son
aceptables.

## 6. Actividades específicas

1. Añadir base y clave por capacidad a `IaConfig` y validarlas.
2. Construir un cliente por capacidad en `IaRunner` (compartido si coinciden).
3. Añadir `IA_EMBEDDING_INPUT_TYPE` al motor de embeddings.
4. Meter el endpoint en la clave de caché.
5. Tests: configuración por capacidad, RNF-03 por endpoint, `input_type`, caché
   sin mezcla.
6. Actualizar `.env.example` e `IA-MOTORES.md` con la decisión y las medidas.

## 7. Evidencia

**La batería live del perfil híbrido** (las tres capacidades reales):

```
$ bash .lab-review/nim-live.sh test
Proveedor del modelo central: https://integrate.api.nvidia.com/v1
Modelo central: nvidia/nemotron-3-nano-omni-30b-a3b-reasoning
OCR: glm-ocr en http://localhost:11434/v1 · embeddings: qwen3-embedding:0.6b

(pass) IA live integration (IA_LIVE_TEST=1) > embeds a real text at the configured endpoint within the 768 contract [4154.25ms]
(pass) IA live integration (IA_LIVE_TEST=1) > reads a real page with the configured vision model [100837.34ms]
(pass) IA live integration (IA_LIVE_TEST=1) > answers with the configured chat model in the requested JSON shape [4365.78ms]

27 pass / 0 fail
```

**El ciclo completo con el reparto real** (API `:3116` + worker con el perfil
híbrido, Ollama local para OCR y embeddings, NIM para el modelo central,
scoring local):

```
=== 3. subir PNG (multipart) ===
status 201 {"sourceFileId":"f4bf1c84-…","sha256":"45133ae7…"}
=== 4. esperar propuesta en bandeja ===
intento 77: propuesta de este archivo en la bandeja
  {"id":"f4f39900-…","status":"pending_confirmation","entityType":{"code":"quality_release","name":"Liberación de calidad"}}
=== 5. confirmar ===
status 200 {"id":"f4f39900-…","status":"official","version":2}
=== 6. oficial ===
status 200 [{"id":"f4f39900-…","confirmedBy":{"username":"marta","fullName":"Marta"}}]
```

La propuesta llega **con su tipo de entidad** (el arreglo de #135 en `main`) y
el ciclo entero pasa con el modelo central en la nube.

## 8. Relación con los issues abiertos

- **#142 (plataforma de ejecución por instalación)**: el ruteo por capacidad
  y el fallback grande→chico se apoyan en esto; vive fuera de la entrega del
  15-nov.
- **#135**: el seed ya declara el tipo de entidad por familia, así que el
  ciclo híbrido llega a la bandeja.
- **#136**: el presupuesto por llamada sigue siendo el límite conocido (el
  OCR local tarda ~100 s por página).

## 9. Referencias

- `apps/api/src/ia/config.ts` — la configuración por capacidad.
- `apps/api/src/ia/ia-runner.ts` — un cliente por capacidad y la caché.
- `apps/api/src/ia/engines/api-embedding.engine.ts` — `input_type`.
- `docs/ingenieria/IA-MOTORES.md` §1.0 y §1.1 — la decisión y las medidas.
- `docs/operacion/BITACORA.md` — entrada del 2026-11-13.
