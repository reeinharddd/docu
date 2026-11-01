# Mercado: servicios web para DOCU

Estado: **estudio de mercado** (2026-10-20). No es una decisión ni un ADR: es el
insumo para el spike de `#32`, para la búsqueda semántica de `#4` y para la
ingesta de `#3`. Dueño: Erik.

Precios de lista en USD consultados el **2026-10-20** en la página oficial de
cada proveedor. No incluyen impuestos, descuentos por volumen ni compromisos
anuales. Cambian: la fecha es parte del dato. Nada de esto está probado en DOCU.

## 1. Qué se busca y qué no

DOCU es offline-first: Docker Compose con app, PostgreSQL y Redis; la nube solo
se abre con configuración explícita (RNF-03) y el sistema debe operar sin
internet (RNF-06). Por eso un servicio web no es un requisito: es una excepción
que hay que justificar.

| Necesidad | RF | Servicio web posible | Veredicto |
|---|---|---|---|
| Leer escaneados y PDF | RF-02 | Mistral OCR, Azure DI, Google Document AI, AWS Textract, LlamaParse, Reducto | Solo *fallback*; GLM-OCR local sigue siendo el motor primario |
| Consulta en lenguaje natural | RF-04 | APIs de LLM | Opcional y con autorización; nunca decide validez |
| Búsqueda semántica | Should | Cohere, OpenAI, Gemini, Voyage | Opcional; el contrato es `vector(768)` |
| Descargar de portales | RF-08 | Firecrawl, Apify | Etapa posterior; C1 usa fuentes simuladas |
| Copia externa de originales | RNF-03 | Cloudflare R2, S3, B2 | Opcional; nunca fuente de verdad |
| Auth, correo, BD, cola, hosting | — | Clerk, WorkOS, Resend, Neon, Upstash, Railway | **No** para C1: no hay SSO ni correo saliente, y el despliegue es local |

Criterios que mandan: RNF-03 (nada sale sin configuración explícita), RNF-06
(offline), ADR-0006 (la IA propone), ADR-0011 (la API encola, el worker
procesa), sin GPU confirmada y `DatoOficial.embedding = vector(768)`.

## 2. Cómo leer los precios

- **Por página** (OCR) no es comparable con **por token** (LLM/embeddings).
- **Standard vs batch**: el batch suele ser más barato, pero agrega latencia.
- **Free tier** no es producción: casi siempre tiene límites de retención,
  concurrencia o región.
- **Egress**: R2 no cobra salida; S3 y otros sí.
- **Retención**: un OCR barato que guarda el documento 30 días no es apto para
  datos de la instalación sin revisar el contrato.
- **Región**: la lista de precios de EE. UU. no siempre aplica a México o la UE.

## 3. OCR y Document AI

Precio por 1,000 páginas, salvo que se indique.

| Servicio | Precio de lista | Modalidad | Puntos fuertes | Límites para DOCU | Veredicto |
|---|---|---|---|---|---|
| **Mistral OCR 4.1** | $4; batch $0.40 según la lista actual (el anuncio de junio decía $2); Document AI $5 | API, batch y self-host enterprise en un contenedor | 170 idiomas, bounding boxes, bloques tipados y confianza; español | Nube por defecto; el self-host es solo enterprise; revisar retención | Mejor *fallback* nube; medir en `#61` |
| **Azure Document Intelligence** | Read $1.50; layout/prebuilt $10; custom $30; clasificador $3; 500 págs/mes gratis | API y contenedores; *disconnected* con compromiso anual | Layout, tablas y formularios; contenedor on-prem | Contenedor *disconnected*: Read 16M págs/año ~$77,760; custom 500k ~$107,100/año | Único on-prem real; solo si el presupuesto lo permite |
| **Google Document AI** | OCR $1.50 (primeras 1k gratis); layout $10; form/custom $30; add-ons $6 | API | OCR y layout maduros; GCP | Solo nube; lock-in de GCP | No para C1 |
| **AWS Textract** | Texto $1.50; tablas $15; forms $50; 1k págs/mes gratis por 3 meses | API | Integración con AWS | Solo nube; tablas caras | No para C1 |
| **LlamaParse** | $1.25 por 1k créditos; Fast $1.25, Cost-effective $3.75, Agentic $12.50, Agentic Plus $56.25 por 1k págs | API; BYOC enterprise | Documentos difíciles y tablas | Nube; el costo sube rápido con la calidad | Solo benchmark si GLM-OCR falla |
| **Reducto** | Parse $10; Extract $20; Deep Extract $40; Split $20; Classify $7.50; Edit $60 ($15 pre-filled); $150 de uso gratis | Cloud, VPC u on-prem enterprise | Citas, bounding boxes y extracción estructurada | Caro para volumen; nube por defecto | *Fallback* premium, no C1 |

**Lectura:** GLM-OCR local sigue siendo el primario. Mistral OCR es el
*fallback* nube más barato; Azure DI es el único que puede correr sin internet,
pero su contenedor *disconnected* tiene un compromiso anual alto. Google y AWS
no encajan en C1 porque no resuelven RNF-03.

## 4. LLM para consulta — RF-04

Precio por 1M de tokens (entrada / salida).

| Proveedor y modelo | Precio | Nota |
|---|---|---|
| **Mistral Small 4** | $0.15 / $0.60 | UE; opción económica |
| **Mistral Large 3** | $0.50 / $1.50 | Más calidad, sigue siendo barato |
| **OpenAI GPT-6 Luna** | $0.10 / $0.50 | Empata con Haiku en entrada y salida |
| **OpenAI GPT-6 Sol** | $2.00 / $10.00 | Gama media |
| **Anthropic Haiku 5.5** | $0.10 / $0.50 hasta 100k; $0.50 / $2.50 arriba | Ojo con documentos largos |
| **Anthropic Sonnet 5.5** | $2.00 / $10.00 | Gama media |
| **Google Gemini 3.1 Flash-Lite** | $0.25 / $1.50 | Contexto largo y precio bajo |
| **Google Gemini 3.8 Flash** | $0.75 / $3.75 hasta 2026-12-31; luego $1.50 / $7.50 | Precio introductorio |

Para consultas cortas, todos están en el mismo orden de magnitud. La decisión
no es el precio: es si el dato puede salir de la máquina, qué se registra y si
el proveedor fija la versión del modelo. La clasificación de documentos se
queda local (ADR-0006).

## 5. Embeddings — búsqueda semántica

Precio por 1M de tokens de entrada.

| Servicio | Precio | Dimensiones | Nota |
|---|---|---|---|
| **Cohere Embed 5 Fast** | $0.08 | 256–2048, incluida 768 | 128k de contexto, 100+ idiomas; **mejor encaje con `vector(768)`** |
| **Cohere Embed 5 Pro** | $0.12 | 256–2048, incluida 768 | Más calidad para indexar; misma espacio que Fast |
| **OpenAI text-embedding-3-small** | $0.02 | 1536 nativo; admite 768 | Barato; el contrato obliga a fijar 768 |
| **OpenAI text-embedding-3-large** | $0.13 | 3072 | Sobra dimensión para el esquema actual |
| **Google Gemini Embedding 2** | ~$0.20 | 768 / 1536 / 3072 | Multimodal; 768 disponible |
| **Voyage 4 Lite** | $0.02 | Verificar | 200M tokens gratis; revisar dimensiones antes de adoptar |

El contrato del esquema es `vector(768)`: la nube solo entra si devuelve 768 o
si se acepta migrar la columna. La opción local sigue siendo
**Qwen3-Embedding-0.6B**; estas APIs son una alternativa, no un reemplazo por
defecto.

## 6. Infraestructura y producto

| Servicio | Precio de lista | Encaje en C1 |
|---|---|---|
| **Cloudflare R2** | $0.015/GB-mes estándar; IA $0.01; Class A $4.50/M; Class B $0.36/M; 10 GB, 1M y 10M gratis; egress $0 | Copia externa de originales; no fuente de verdad |
| **Upstash Redis** | Free 250 MB/500k comandos; PAYG $0.20/100k comandos + $0.25/GB; fijo 250 MB $10/mes | Solo si se despliega fuera; BullMQ está diseñado para Redis local |
| **Neon Postgres** | Free 1 GB/proyecto y 100 CU-horas; pago $0.106/CU-hora + $0.35/GB | Staging o demo; no C1 offline |
| **Supabase** | Free 500 MB (se pausa); Pro $25/mes | Staging o demo; no C1 |
| **Clerk** | Free 50k MRU; Pro $25/mes | No: DOCU no tiene SSO ni directorio externo |
| **WorkOS** | Free 1M MAU; SSO $125/conexión | No: SSO está fuera de C1 |
| **Resend** | Free 3k correos/mes (100/día); Pro $20/50k | No: el correo saliente de alertas está fuera del MVP |
| **Railway** | Hobby $5/mes con $5 de uso | Demo o staging; no reemplaza Docker Compose local |
| **Render** | Hobby $0 + cómputo; servicio desde $7/mes; free con spin-down | Demo o staging |
| **Fly.io** | Sin free tier; ~$2.19/mes por 256 MB; Postgres administrado $38/mes | Demo o staging; Postgres caro |
| **Firecrawl** | Free 1k créditos/mes; Hobby $16/mes anual ($19 mensual); Standard $83/mes anual; 1 crédito/página, JSON +4 | RF-08 futuro; ya está como placeholder en `.env.example` |
| **Apify** | Free $5 de créditos/mes; Starter $19/mes | Alternativa para portales difíciles; no C1 |

**Observabilidad:** Sentry cloud o GlitchTip self-host son opcionales. Si se
usan, que no viajen documentos ni datos personales; para C1 basta logging
local/OTel.

## 7. Recomendación por etapa

1. **C1 ahora:** no adoptar ningún servicio. Mantener GLM-OCR + Laya +
   Qwen3-Embedding + PostgreSQL/Redis locales.
2. **Si GLM-OCR no llega a CER ≤ 10 % en `#61`:** probar **Mistral OCR 4.1
   batch** y **Azure DI Read/Layout en contenedor** (offline). Medir con el
   mismo corpus y ground truth.
3. **Si el líder autoriza RF-04 en nube:** **Mistral Small 4** o **Gemini
   Flash-Lite** para consulta; **Cohere Embed 5 Fast** a 768 para embeddings.
   Fijar versión del modelo y registrar qué se envió.
4. **Si se autoriza copia externa:** **Cloudflare R2** para los originales;
   nunca como fuente de verdad.
5. **RF-08 (portales):** **Firecrawl** primero; **Apify** si falla en portales
   con anti-bot. No antes de que exista la ingesta real.
6. **No adoptar en C1:** Clerk/WorkOS/Auth0, Resend/Postmark/SES,
   Neon/Supabase/Upstash, Railway/Render/Fly.

## 8. Condiciones para adoptar cualquiera

- Variable nueva en `.env.example` y fila en `integraciones/ACCESOS.md`.
- Autorización explícita del líder si el dato sale de la máquina (RNF-03).
- Versión del modelo o servicio fijada; registrar qué se envió y cuándo.
- Revisar retención, región, DPA y borrado antes de subir un documento real.
- La nube es *fallback* o consulta, nunca la ruta principal que produce
  evidencia.
- Medir el costo con el corpus real; el precio de lista no es el costo de la
  instalación.

## 9. Fuentes

- Mistral, precios de API: <https://mistral.ai/pricing/api/>
- Mistral OCR 4, anuncio y self-host: <https://mistral.ai/news/ocr-4/>
- Azure Document Intelligence, precios: <https://azure.microsoft.com/en-us/pricing/details/document-intelligence/>
- Azure, precios de detalle (API minorista): <https://prices.azure.com/api/retail/prices>
- Google Document AI, precios: <https://cloud.google.com/products/document-ai/pricing>
- AWS Textract, precios: <https://aws.amazon.com/textract/pricing/>
- LlamaParse, precios: <https://developers.llamaindex.ai/llamaparse/general/pricing/>
- Reducto, precios: <https://reducto.ai/pricing>
- OpenAI, precios de API: <https://developers.openai.com/api/docs/pricing>
- Anthropic, precios: <https://platform.claude.com/docs/en/about-claude/pricing>
- Google Gemini, precios: <https://cloud.google.com/vertex-ai/generative-ai/pricing>
- Cohere Embed 5: <https://cohere.com/blog/embed-5>
- Voyage, precios: <https://docs.voyageai.com/docs/pricing>
- Cloudflare R2, precios: <https://developers.cloudflare.com/r2/pricing/>
- Upstash Redis, precios: <https://upstash.com/pricing/redis>
- Neon, free tier: <https://neon.com/faqs/managed-postgres-databases-free-tier>
- Supabase, precios: <https://supabase.com/pricing>
- Clerk, precios: <https://clerk.com/pricing>
- WorkOS, precios: <https://workos.com/pricing>
- Resend, precios: <https://resend.com/pricing>
- Railway, precios: <https://railway.com/pricing>
- Render, precios: <https://render.com/pricing>
- Fly.io, precios: <https://fly.io/docs/about/pricing/>
- Firecrawl, precios: <https://www.firecrawl.dev/pricing>
- Apify, precios: <https://apify.com/pricing>
