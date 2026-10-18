# BRIEF #32 — Evaluación de software OCR

## 0. Encabezado

- Issue: #32
- Dueño: Erik
- Fechas: 2026-10-16 → **2026-10-23** · hito `Cierre de diseño` (2026-10-23)
- Prioridad / Tipo / Épica / Módulo: media en el plan, **crítica en la práctica** / investigación / Backend / ingesta
- Requisitos: RF-02 (campos clave ≥ 90 %, CER ≤ 10 %)
- Bloqueado por: nada para fase 1 (documentos genéricos en español); scans del caso (#61) para fase 2 · Bloquea a: #3 Pipeline de ingesta

## 1. Contexto

Parte de los documentos de la instalación llegan escaneados. RF-02 exige leer sus
campos clave con al menos 90 % de exactitud y CER ≤ 10 % en texto corrido
(`proyecto/REQUISITOS.md`). El OCR corre en el worker, nunca en la API
(ADR-0011).

Alcance acordado (2026-10-17): este issue **delimita tecnologías y estructuras**;
no construye nada. No hay script, ni CSV, ni scans o documentos reales por ahora.
La validación con los escaneados del caso (#61) queda como fase 2 futura, fuera
del entregable.

## 2. Por qué importa tu parte

Es el riesgo técnico mayor del proyecto. Si se descubre en noviembre que ningún
OCR alcanza el 90 %, el pipeline (#3, tuyo) se rehace y RF-02 no se
cumple. Si la evaluación sale ahora, el diseño del worker se fija con datos.

## 3. Objetivo y resultado esperado

Decidir y delimitar qué tecnología lee los escaneados y cómo corre, con números
medidos en fase 1. Sin script ni CSV: la decisión y su justificación son el
entregable.

| Entregable | Evidencia |
|---|---|
| Decisión de motor + scoring | `docs/ingenieria/OCR.md`: qué motor, con qué números y qué no alcanza |
| Insumo de mercado | `docs/ingenieria/OCR-MERCADO.md`: alternativas y por qué se descartaron |
| Si el motor elegido no corre en Bun/Node | Borrador de ADR (`/adr`) según el criterio de reversión de ADR-0011 |
| Fuera de alcance | Script `dataset/ocr-eval/`, CSV y scans reales (#61, fase 2 futura) |

## 4. Actividades específicas

1. Evaluar fase 1 con un corpus genérico en español (Tesseract `spa` y un
   motor moderno) midiendo CER. Los números van en `OCR.md`; no hay CSV.
2. Comparar al menos dos motores. El elegido fue **GLM-OCR 0.9B** frente a
   **Tesseract 5.5** (el brief planteaba Tesseract + Docling; ver §6).
3. Escribir `docs/ingenieria/OCR.md` con la tabla de resultados y la decisión.
4. Comentar en #3 la conclusión y cómo afecta al worker.

## 5. Entradas y salidas

- Recibe: un corpus genérico en español (fase 1). Los scans del caso (#61) quedan para fase 2 futura, fuera de este issue.
- Entrega: a #3, por PR, la decisión (`OCR.md`) y su insumo (`OCR-MERCADO.md`). Revisa Emmanuel.

## 6. Referencias y caja de herramientas

- `docs/ingenieria/ARQUITECTURA.md` §3 (dónde corre el OCR), ADR-0011.
- `docs/ingenieria/IA.md` y `STACK.md` (versiones del stack).
- Documentación oficial de Tesseract y Docling (versión fija en el script).
- Automatizable: el CER se calcula con distancia de Levenshtein; no a mano.

Recursos oficiales para evaluar (verificados 2026-10-09). *Nota: la lista de
motores de abajo es la del plan original (Tesseract + Docling); la evaluación
real eligió GLM-OCR y comparó contra Tesseract (`OCR.md`). Se conserva como
registro.*

| Para | Recurso | Cuándo usarlo |
|---|---|---|
| Motor 1: Tesseract | https://tesseract-ocr.github.io (docs) + https://github.com/naptha/tesseract.js (binding JS) o binario del sistema | Al fijar versión y DPI de prueba (150/300) |
| Motor 2: Docling OSS | https://github.com/docling-project/docling (Linux Foundation; convierte PDF/escaneado a Markdown/JSON con layout y tablas) + https://www.ibm.com/products/docling (límites del servicio nube, solo referencia) | Al evaluar layout + tablas, no solo texto plano |
| Modelos locales extra | https://github.com/12britz/awesome-free-models (starred del equipo; lista comunitaria: verificar licencia y hardware de cada modelo antes de usar) | Solo si ambos motores fallan el 90 % |
| Inferencia local y nube (curaduría del equipo) | https://ollama.com (probar visión local; https://ollama.com/settings/keys) y https://huggingface.co/docs/inference-providers/index (probar modelos visión por API con credencial explícita, RNF-03) | Como tercer motor opcional, con versión y costo anotados |
| Métrica CER | Distancia de Levenshtein normalizada por longitud; exactitud de campos clave = aciertos/total por campo | Al escribir el CSV (columnas: motor, dpi, campo, exactitud, CER, s/página, RAM) |
| Rasterizar a DPI exactos | https://poppler.freedesktop.org (`pdftoppm -r 150/300`) y https://imagemagick.org (ruido, blur, skew para simular escáner real) | Al preparar las imágenes de evaluación desde PDFs limpios |
| Comparar motores más allá de los dos | Curaduría del equipo: https://github.com/UB-Mannheim/tesseract/wiki (modelos `spa`) | Al fijar el modelo de idioma español de Tesseract |

## 7. Cómo trabajar

- `/tarea 32` y `/cerrar` en OpenCode.
- Toda cifra que se cite lleva su versión y origen; si no, no existe.
- No toques `apps/` (ADR-0012): este issue no entrega código.

## 8. Criterios de aceptación

- [ ] `docs/ingenieria/OCR.md` dice qué motor, con qué números y qué no alcanza.
- [ ] La elección se justifica frente a las alternativas (Tesseract, Docling, plan B).
- [ ] Alcance y divergencia documentados: sin script, CSV ni scans reales en este issue.
- [ ] #3 tiene comentario con la conclusión.
- [ ] `bun run verify` en verde.

## 9. Riesgos nombrados

Que el motor elegido falle en escaneados reales. Mitigación: fase 1 mide con un
corpus degradado propio; la validación con scans del caso (#61) se agenda en fase 2.

## 10. Revisión

Replanificación 2026-10-09: dueño Emmanuel → Erik; fechas 05→12-oct a 16→23-oct.

Viernes 2026-10-23 en el sync, con Emmanuel como revisor.
