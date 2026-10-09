# BRIEF #32 — Evaluación de software OCR

## 0. Encabezado

- Issue: #32
- Dueño: Erik
- Fechas: 2026-10-16 → **2026-10-23** · hito `Cierre de diseño` (2026-10-23)
- Prioridad / Tipo / Épica / Módulo: media en el plan, **crítica en la práctica** / investigación / Backend / ingesta
- Requisitos: RF-02 (campos clave ≥ 90 %, CER ≤ 10 %)
- Bloqueado por: escaneados de prueba de Carlos (#9) · Bloquea a: #3 Pipeline de ingesta

## 1. Contexto

Parte de los documentos de la planta llegan escaneados. RF-02 exige leer sus
campos clave con al menos 90 % de exactitud y CER ≤ 10 % en texto corrido
(`proyecto/REQUISITOS.md`). El OCR corre en el worker, nunca en la API
(ADR-0011).

## 2. Por qué importa tu parte

Es el riesgo técnico mayor del proyecto. Si se descubre en noviembre que ningún
OCR alcanza el 90 %, el pipeline (#3, tuyo) se rehace y RF-02 no se
cumple. Si la evaluación sale ahora, el diseño del worker se fija con datos.

## 3. Objetivo y resultado esperado

Recomendar un motor OCR con números medidos sobre escaneados del caso.

| Entregable | Evidencia |
|---|---|
| Script reproducible de evaluación | `dataset/ocr-eval/` con comando único y semilla/versiones fijadas |
| Resultados por motor y resolución (150 y 300 dpi) | CSV con exactitud de campos clave, CER y tiempo por página |
| Recomendación | `docs/ingenieria/OCR.md`: motor elegido, por qué, límites |
| Si el motor elegido no corre en Bun/Node | Borrador de ADR (`/adr`) según el criterio de reversión de ADR-0011 |

## 4. Actividades específicas

1. Acordar con Carlos 10 escaneados de prueba como mínimo (de los 50 de #9),
   con su *ground truth* de campos clave. Terminado: archivos y CSV de verdad.
2. Evaluar al menos dos motores: Tesseract (con `tesseract.js` o binario) y
   Docling. Opcional un tercero si ambos fallan.
3. Medir por motor y resolución: exactitud de campos clave, CER, tiempo y RAM.
4. Escribir `docs/ingenieria/OCR.md` con la tabla de resultados y la decisión.
5. Comentar en #3 la conclusión y cómo afecta al worker.

## 5. Entradas y salidas

- Recibe: escaneados y *ground truth* de Carlos (#9).
- Entrega: al worker y pipeline #3 (propio), por PR, la recomendación y el script. Revisa Emmanuel.

## 6. Referencias y caja de herramientas

- `docs/ingenieria/ARQUITECTURA.md` §3 (dónde corre el OCR), ADR-0011.
- `docs/ingenieria/IA.md` y `STACK.md` (versiones del stack).
- Documentación oficial de Tesseract y Docling (versión fija en el script).
- Automatizable: el CER se calcula con distancia de Levenshtein; no a mano.

Recursos oficiales para evaluar (verificados 2026-10-09):

| Para | Recurso | Cuándo usarlo |
|---|---|---|
| Motor 1: Tesseract | https://tesseract-ocr.github.io (docs) + https://github.com/naptha/tesseract.js (binding JS) o binario del sistema | Al fijar versión y DPI de prueba (150/300) |
| Motor 2: Docling OSS | https://github.com/docling-project/docling (Linux Foundation; convierte PDF/escaneado a Markdown/JSON con layout y tablas) + https://www.ibm.com/products/docling (límites del servicio nube, solo referencia) | Al evaluar layout + tablas, no solo texto plano |
| Modelos locales extra | https://github.com/12britz/awesome-free-models (starred del equipo; lista comunitaria: verificar licencia y hardware de cada modelo antes de usar) | Solo si ambos motores fallan el 90 % |
| Inferencia local y nube (curaduría del equipo) | https://ollama.com (probar visión local; https://ollama.com/settings/keys) y https://huggingface.co/docs/inference-providers/index (probar modelos visión por API con credencial explícita, RNF-03) | Como tercer motor opcional, con versión y costo anotados |
| Métrica CER | Distancia de Levenshtein normalizada por longitud; exactitud de campos clave = aciertos/total por campo | Al escribir el CSV (columnas: motor, dpi, campo, exactitud, CER, s/página, RAM) |

## 7. Cómo trabajar

- `/tarea 32` y `/cerrar` en OpenCode.
- Todo lo generado lleva versión y semilla: reproducible o no existe.
- No toques `apps/` (ADR-0012): el script vive en `dataset/ocr-eval/`.

## 8. Criterios de aceptación

- [ ] Un tercero corre el script con un comando y obtiene el mismo CSV.
- [ ] Al menos 2 motores × 2 resoluciones medidos.
- [ ] `docs/ingenieria/OCR.md` dice qué motor, con qué números y qué no alcanza.
- [ ] #3 tiene comentario con la conclusión.
- [ ] `bun run verify` en verde.

## 9. Riesgos nombrados

Que los escaneados no lleguen a tiempo. Mitigación: empezar con 10 documentos
generados y escaneados por ti mismo; desde el 2026-10-16 sin escaneados es bloqueo con etiqueta `bloqueado`.

## 10. Revisión

Replanificación 2026-10-09: dueño Emmanuel → Erik; fechas 05→12-oct a 16→23-oct.

Viernes 2026-10-23 en el sync, con Emmanuel como revisor.
