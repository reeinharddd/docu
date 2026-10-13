---
description: Fijar la marca elegida en Fase 1 - llena DESIGN.md, tokens DTCG y brand kit con gates de estándares
---

Dirección elegida: $1 (nombre, PDF de Kira o descripción; si falta, pídela con sus datos)

Kira presenta 3 direcciones y el equipo elige 1 (BRIEF-41-fase1 §9). Este
comando convierte la ganadora en insumos fijos cumpliendo estándares. Pide
cada dato que falte; no inventes paleta, tipografías ni slogan.

1. Carga skills `brand`, `design-system`, `hallmark` (revisión anti-genérico)
   y `docu-memoria` (gustos/decisiones ya afirmados). Lee `playground/CADENA.md`
   y `playground/DESIGN.md`. Si $1 es el PDF de la entrega, extráelo (el
   agente lee PDFs): dirección, slogan, paleta, tipografías, logo,
   razonamiento, preview.
2. Registra en `playground/DESIGN.md` (mapeo Fase 1 → archivo):
   - Visión (1 párrafo) + Slogan → `## Visión`, `## Slogan`.
   - Paleta con hex por token (primario, secundario, acento, éxito,
     advertencia, error, cuarentena) → tabla `## Paleta`.
   - Tipografías Display/Body/Mono con nombres + escala modular → `## Tipografías`.
   - Set de iconos + logo (concepto o imagen) + estados → sus secciones.
   - Razonamiento (3–5 líneas por decisión) + quién/cuándo la eligió.
   - Lo que falte queda `Pendiente:` explícito, no se inventa.
3. Escribe `playground/tokens/tokens.json` (DTCG 2025.10: `$value`, `$type`,
   `$description`; consulta `context7` si dudas del formato) y
   `playground/tokens/tokens.css` (`:root` + `[data-theme="oscuro"]`).
4. Gates de estándares (todo en verde o se devuelve):
   - WCAG 2.2 AA: cada par texto/fondo ≥ 4.5:1 (normal) o ≥ 3:1 (grande).
     Reporta la tabla par → ratio.
   - DTCG válido: cada token con `$value` + `$type`; primitivos separados
     de semánticos.
   - OKLCH coherente con los hex elegidos; claro+oscuro definidos.
   - Revisión `hallmark`: la marca no parece plantilla genérica.
5. Verifica: `bun --cwd ng run build` verde + serve y captura de la portada
   con los tokens nuevos (antes/después).
6. Guarda en memoria (skill `docu-memoria`) la marca fijada con su motivo.
   Comenta en #41 qué se fijó y qué quedó pendiente. Evidencia: captura.

Sin dirección elegida por el equipo, este comando no corre.
