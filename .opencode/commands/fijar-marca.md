---
description: Fijar la marca elegida en Fase 1 - llena DESIGN.md, tokens y brand kit desde la dirección ganadora
---

Dirección elegida: $1 (nombre o descripción; si falta, pídela con sus datos)

Kira presenta 3 direcciones y el equipo elige 1 (BRIEF-41-fase1 §9). Este
comando convierte la ganadora en insumos fijos. Pide cada dato que falte;
no inventes paleta, tipografías ni slogan.

1. Carga skills `brand` y `design-system`. Lee `playground/DESIGN.md`.
2. Registra en `playground/DESIGN.md` (mapeo Fase 1 → archivo):
   - Visión (1 párrafo) + Slogan (frase) → `## Visión`, `## Slogan`.
   - Paleta con hex por token (primario, secundario, acento, éxito,
     advertencia, error) → tabla `## Paleta`.
   - Tipografías Display/Body/Mono con nombres → tabla `## Tipografías`.
   - Set de iconos + logo (concepto o imagen) + estados → sus secciones.
   - Razonamiento (3–5 líneas por decisión) + quién/cuándo la eligió.
   - Lo que falte queda como `Pendiente:` explícito, no se inventa.
3. Escribe `playground/tokens/tokens.json` (DTCG `$value`/`$type`) y
   `playground/tokens/tokens.css` (`:root` + `[data-theme="oscuro"]`)
   con los valores elegidos. Reporta contraste AA por par texto/fondo.
4. Verifica: `bun --cwd ng run build` en verde + serve y captura de la
   portada con los tokens nuevos.
5. Comenta en #41 qué se fijó y qué quedó pendiente. Evidencia: captura.

Sin dirección elegida por el equipo, este comando no corre.
