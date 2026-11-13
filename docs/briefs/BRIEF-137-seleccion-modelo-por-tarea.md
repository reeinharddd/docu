# BRIEF #137 — Capacidad de IA por tarea: ruteo, escalamiento y delegación

## 0. Encabezado

- Issue: #137
- Dueño: Erik Beltrán (Líder, infra y pipeline).
- Fechas: 2026-11-13 → 2026-12-02 · Sprint 4 · hito `C1 final` (3-dic)
- Prioridad / Tipo / Épica / Módulo: media / investigación / backend / capa `apps/api/src/ia/`
- Requisitos: RF-01, RNF-03, RNF-05, RNF-07
- Bloqueado por: #136 (el consumo por fragmentos es la precondición del ruteo) · Bloquea a: —

## 1. Contexto

Hoy el modelo es **uno por capacidad y fijo por configuración**
(`IA_OCR_MODEL=glm-ocr`, `IA_LLM_MODEL=llama3.2`,
`IA_EMBEDDING_MODEL=qwen3-embedding:0.6b`). Un motor grande paga su coste en
cada llamada aunque la tarea sea trivial (una etiqueta de familia, un campo), y
un motor pequeño no llega cuando el documento es difícil.

La decisión está en el código, así que cada tarea nueva toca el motor. La
pregunta que obliga a decidir: **¿quién decide qué modelo usa cada llamada?**

La respuesta es una **política declarativa versionada**, no más código: cada
llamada declara qué necesita y la política escoge el modelo más barato que
cumpla el requisito. La decisión queda registrada en
[ADR-0024](../decisiones/ADR-0024-capacidad-de-ia-por-tarea-y-consumo-por-fragmentos.md).

## 2. Por qué importa tu parte

El caso DOCU procesa documentos de una planta: Excel de turnos, PDF de
entrega, escaneos degradados, correo de la hermana. Cada uno tiene su
dificultad y su coste. Sin ruteo, el sistema paga el modelo mayor en cada
llamada y no tiene forma de subir de nivel cuando el documento es difícil:
o se paga de más siempre, o se sacrifica calidad en los documentos que más la
necesitan.

El principio que lo ordena: **no se manda a un chef a cortar zanahorias**. Cada
nivel de capacidad tiene un esfuerzo y un precio distintos; el sistema tiene
que saber cuál necesita, y pagarlo solo cuando toca.

## 3. Objetivo y resultado esperado

| Entregable | Evidencia |
|---|---|
| Política declarativa de ruteo | archivo versionado en `apps/api/src/ia/` con modelo por tarea, umbral de escalamiento y cadena de degradación |
| Escalamiento por evidencia | la confianza calibrada (Laya / SystemOne) decide subir de modelo, no repetir la misma llamada |
| Degradación registrada | si el modelo grande no está, se degrada al pequeño **y la traza dice qué modelo respondió y por qué** |
| Orquestación con delegación | el trabajo de ingesta es un plan con pasos repartibles; cada delegación lleva su presupuesto y su motivo |
| Proveedor como dato | los modelos disponibles se declaran por configuración, así que el proveedor puede ser Ollama local o NVIDIA NIM sin tocar código (RNF-03) |
| Prueba de comportamiento | una tarea trivial usa el modelo chico; una tarea difícil escala al grande; sin el grande, degrada con aviso |

## 4. Actividades específicas

1. Declarar las tareas del pipeline con su requisito (clasificar, extraer,
   resumir, verificar) y su umbral.
2. Escribir la política declarativa y su versión.
3. Hacer que la traza de `ia-runner` registre **qué modelo respondió y por qué**
   (hoy solo queda el modelo pedido).
4. Implementar el escalamiento por la confianza calibrada.
5. Implementar la degradación con registro.
6. Repartir el trabajo de ingesta en pasos delegables, cada uno con presupuesto
   y motivo.
7. Probar el comportamiento con los tres niveles (chico, grande, degradado).

## 5. Entradas y salidas

- Recibe: ADR-0024, `docs/ingenieria/IA.md`, `docs/ingenieria/IA-MOTORES.md`,
  el contrato de `ia-runner` y la traza actual.
- Entrega: la política de ruteo, la delegación con presupuesto, la traza que
  dice qué modelo respondió, y la prueba de los tres niveles.

## 6. Referencias y caja de herramientas (tú eliges cuáles usar)

- [ADR-0024](../decisiones/ADR-0024-capacidad-de-ia-por-tarea-y-consumo-por-fragmentos.md)
  — la decisión y sus alternativas descartadas.
- `docs/ingenieria/IA-MOTORES.md` — el contrato de la capa y los límites
  conocidos (§3.1 y §3.2).
- `docs/ingenieria/IA.md` — estrategia, umbrales y advertencia del embedding.
- ADR-0020 — los motores se cambian con configuración, nunca con código.
- #136 — el consumo por fragmentos, precondición de esta tarea.

Lo que NO se limitamos: la forma de la política, los nombres de las tareas, los
niveles de capacidad. Lo que sí se devuelve: una política escrita en código, un
modelo fijo por capacidad, una degradación silenciosa, o una traza que no dice
qué modelo respondió.

## 7. Cómo trabajar

- Rama `feat/137-seleccion-modelo-por-tarea` desde `main`, después de #136.
- La política es **dato versionado**, no código: el repositorio es la fuente de
  verdad y la reproducibilidad (RNF-07) depende de eso.
- La nube es excepción autorizada (`IA_NUBE_ACTIVADA`), nunca el default.

## 8. Criterios de aceptación

- [ ] La política declara modelo por tarea, umbral de escalamiento y cadena de
      degradación, y está versionada en el repositorio.
- [ ] La traza de cada llamada dice qué modelo respondió y por qué.
- [ ] Una tarea trivial usa el modelo chico; una difícil escala al grande; sin
      el grande, degrada al chico con aviso en la traza.
- [ ] El trabajo de ingesta se reparte en delegaciones con presupuesto y motivo.
- [ ] Cambiar de proveedor (Ollama local → NVIDIA NIM) es un cambio de
      configuración, sin tocar código.
- [ ] `bun run verify` en verde y evidencia de los tres niveles.
