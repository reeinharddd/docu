<p align="center">
<strong>docu</strong><br>
<sub>Configuración 1 · Baja SterilPack · DOCU — Repositorio de Documentación Digital</sub><br>
<sub>Marca: <code>#5B2A86</code> · acento: <code>#B0215F</code> · texto: <code>#24172F</code></sub>
</p>

# ADR 0024 — La capacidad de IA se decide por tarea y el documento se consume por fragmentos

Fecha: 2026-11-13 · Estado: Aceptada (2026-11-13)
Decide: Erik Beltrán (`reeinharddd`) · Revisa: Emmanuel Valenzuela Cruz (`Agent3835`)

## Contexto

La capa de IA quedó con **un modelo por capacidad y fijo por configuración**
(`IA_OCR_MODEL=glm-ocr`, `IA_LLM_MODEL=llama3.2`,
`IA_EMBEDDING_MODEL=qwen3-embedding:0.6b`), y con **un presupuesto por
llamada** (`IA_BUDGET_MAX_TOKENS=4000`). La prueba de la pila real (2026-11-13,
API + worker + Ollama local) mostró que las dos decisiones no aguantan un
documento real:

1. **El presupuesto no escala.** El runner estima los tokens del archivo
   entero (`ceil(bytes/4)`): un PDF de 27 páginas son 942 189 tokens observados
   y uno de 2 páginas, 16 814. El guardián funciona y registra el motivo, pero
   el trabajo muere antes de empezar. Con `IA_BUDGET_MAX_TOKENS=60000` el
   trabajo avanza y falla por otro motivo: el motor de visión rechaza el PDF
   con `HTTP 400 invalid image input`, porque el motor de OCR no rasteriza.
2. **El modelo no se elige.** Un modelo grande paga su coste en cada llamada
   aunque la tarea sea trivial (una etiqueta de familia, un campo), y un
   modelo pequeño no llega cuando el documento es difícil. La decisión está en
   el código, así que cada tarea nueva toca el motor.

La pregunta que obliga a decidir: **¿quién decide qué modelo usa cada llamada
y cómo se consume un documento que no cabe en un presupuesto?**

Restricciones reales: el motor local es Ollama con `glm-ocr`, `llama3.2` y
`qwen3-embedding:0.6b` (ya instalados); la nube es excepción autorizada por
`IA_NUBE_ACTIVADA` (RNF-03); el determinismo es requisito (RNF-07, ADR-0020
deja el proveedor en configuración, no en código); y el plazo del equipo es de
días, no de meses.

## Decisión

**La capacidad de IA se decide por tarea, y el documento se consume por
fragmentos.** Dos reglas que se corresponden.

### 1. El consumo es por fragmento, nunca por documento

El documento se trocea (por página o por sección) y **cada fragmento se procesa
con su propio presupuesto**; los resultados se agregan en una sola propuesta.
El presupuesto deja de ser un máximo global del archivo y pasa a ser una
política con dos niveles:

- **Por fragmento**: el límite que aplica a una llamada (el que ya existe).
- **Agregado**: el máximo del documento, y **al alcanzarlo se degrada en vez de
  matar el trabajo**: fragmento más pequeño → modelo más pequeño → cuarentena
  con motivo visible (RF-02).

La consecuencia aceptada: **un documento real siempre puede pasar un límite
global**; por eso el límite no se sube hasta que quepa, sino que se parte el
documento. El original queda intacto (ADR-0010) y la imagen rasterizada es
trabajo, no original.

### 2. El modelo se elige por tarea, con escalamiento y degradación

Cada llamada declara **qué necesita** (clasificar, extraer, resumir,
verificar) y una **política declarativa** escoge el modelo más barato que
cumpla ese requisito:

- **Ruteo por tarea**: un modelo grande solo se usa cuando la tarea lo exige.
  No se usa "al 100 % de las capacidades siempre"; se usa el 100 % solo cuando
  hace falta.
- **Escalamiento por evidencia**: si la confianza calibrada no llega al
  umbral, la política **sube de modelo** en vez de repetir la misma llamada.
  La señal de escalamiento es la confianza calibrada (Laya / SystemOne), que
  hoy ordena la revisión humana (ADR-0006) y mañana ordena el modelo.
- **Degradación, no caída**: si el modelo grande no está disponible, se degrada
  al pequeño **y se registra** que el resultado salió con menos capacidad. El
  trabajo no se pierde ni se disfraza: la traza dice qué modelo respondió.
- **Orquestación con delegación**: un trabajo de ingesta es un plan con pasos
  repartibles (página → OCR, texto → clasificación, campos → extracción,
  reglas → verificación). El orquestador reparte, delega y agrega; **cada
  delegación lleva su presupuesto y su motivo**.

### Lo que esta ADR no cambia

- El contrato de la API y el modelo de datos no se tocan: es la capa
  `apps/api/src/ia/`.
- El acceso a los motores sigue siendo un único cliente compatible OpenAI
  (ADR-0020): el proveedor se cambia con configuración, nunca con código.
- Local primero (RNF-03): el ruteo elige entre los modelos disponibles en el
  proveedor configurado (Ollama local por defecto). La nube sigue siendo
  excepción autorizada.

## Alternativas consideradas

| Alternativa | Por qué no |
|---|---|
| Subir `IA_BUDGET_MAX_TOKENS` hasta que quepa el documento | Mueve el problema, no lo resuelve: el siguiente documento más grande vuelve a pasarlo, y el coste por llamada crece sin control. Además, un máximo alto retrasa el fallo en vez de evitarlo. |
| Un límite global con cuarentena al superarlo | Es lo que hace hoy el guardián, y funciona: el motivo queda escrito. Pero convierte cada documento grande en trabajo perdido. La cuarentena es el **último** recurso, no el primero. |
| OCR del PDF completo en una sola llamada | El motor de visión no acepta PDF (rechaza la entrada), y aunque lo aceptara, una sola llamada sobre 27 páginas no cabe en ningún presupuesto razonable ni da un resultado agregable por página. |
| Un modelo grande fijo para todo | El coste por tarea trivial es alto y no compra nada: clasificar una familia no necesita el modelo mayor. |
| Un modelo chico fijo para todo | La calidad cae justo en los documentos que más la necesitan (escaneados degradados, PDFs de 27 páginas). |
| Decidir el modelo dentro de cada motor (código) | Cada tarea nueva toca el motor y el proveedor se filtra al código: contradice ADR-0020 y vuelve la política ilegible. |
| Degradar en silencio cuando falta el modelo grande | El resultado parece completo y no lo es. La trazabilidad (RNF-07) exige que la traza diga qué modelo respondió y por qué. |

## Consecuencias

- **A favor**: el presupuesto deja de ser una barrera artificial y pasa a ser
  una política; los documentos reales dejan de fallar por tamaño; el modelo
  grande se paga solo donde aporta; la confianza calibrada deja de ordenar
  únicamente la revisión humana y pasa a ordenar también el escalamiento.
- **En contra**: la política de ruteo es estado que hay que mantener y versionar
  (una política sin versionar rompe el determinismo de RNF-07). La orquestación
  con delegación añade un nivel de indirección sobre el worker actual, que hoy
  es una función lineal.
- **Riesgo residual**: que la política escale de forma inexperada (un modelo
  grande detrás de cada fragmento). *Blast radius*: coste y latencia, no
  datos: la degradación y el agregado por documento acotan el trabajo. Mitigación:
  el presupuesto agregado y la degradación por umbral son parte de la misma
  política, no una configuración aparte.
- **Coste de implementation**: esta ADR no es necesaria para la entrega del
  15-nov. El pipeline actual funciona con los tres modelos fijos; lo que la
  ADR ordena es que no crezca como código.

## Evidencia

- La prueba de la pila real (2026-11-13) está registrada en #135 y #136: el
  `PDF` rechazado por el motor de visión, el presupuesto de 4 000 tokens
  superado por un documento de 2 páginas, y el PNG equivalente recorriendo el
  ciclo completo (OCR → scoring → campos → propuesta → bandeja → confirmar →
  oficial).
- La costura donde vive esta decisión ya existe y está probada:
  `apps/api/src/ia/ia-runner.ts` (traza por llamada), `apps/api/src/ia/budget.ts`
  (presupuesto), `apps/api/src/ia/config.ts` (configuración validada al
  arrancar), `apps/api/src/worker/ingest.processor.ts` (el plan de trabajo que
  hoy es lineal y mañana reparte).
- El contrato de los motores y sus reglas de localidad están en
  `docs/ingenieria/IA-MOTORES.md` (ADR-0020) y la estrategia de IA, los
  umbrales y la advertencia del embedding en `docs/ingenieria/IA.md`.

## Tareas derivadas

- #136 — el OCR rechaza los PDF y el presupuesto por llamada no escala
  (consumo por fragmentos, rasterización, degradación).
- #137 — selección de modelo por tarea: ruteo dinámico, escalamiento y
  orquestación con delegación.
