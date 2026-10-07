# BRIEF #32 — Evaluación de software OCR

## 0. Encabezado

- Issue: #32
- Dueño: Emmanuel
- Fechas: 2026-10-05 → **2026-10-12** · hito `Cierre de diseño` (2026-10-16)
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
OCR alcanza el 90 %, el pipeline (#3, de Erik y tuyo) se rehace y RF-02 no se
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
- Entrega: a Erik (pipeline #3), por PR, la recomendación y el script.

## 6. Referencias y caja de herramientas

- `docs/ingenieria/ARQUITECTURA.md` §3 (dónde corre el OCR), ADR-0011.
- `docs/ingenieria/IA.md` y `STACK.md` (versiones del stack).
- Documentación oficial de Tesseract y Docling (versión fija en el script).
- Automatizable: el CER se calcula con distancia de Levenshtein; no a mano.

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
generados y escaneados por ti mismo; desde el 2026-10-09 sin escaneados es bloqueo.

## 10. Revisión

Lunes 2026-10-12 en el sync, con Erik.
