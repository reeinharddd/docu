# Diseño de producto

Qué se ve y cómo se usa DOCU: identidad, pantallas, flujos y componentes. El
diseño describe la experiencia, no el código; si necesita nombrar un archivo
`.ts`, no es diseño (`docs/README.md`, regla 3).

**Dueña:** Kira. **Alcance:** Erik (`proyecto/EQUIPO.md`).

## Índice

| Documento | Responde a | Estado |
|---|---|---|
| `README.md` | Qué vive en esta carpeta | vigente |
| [`DOCU-marca-fase1-kira.pdf`](DOCU-marca-fase1-kira.pdf) | Exploración de marca: 3 direcciones con paleta, tipografías, logo, moodboard y pantalla de ejemplo (#41 Fase 1) | entregado 2026-10-13 |
| `DESIGN-SYSTEM.md` | Tokens, tipografía y componentes base (#41 Fase 2) | pendiente |

## Por qué la marca va en dos fases

Por [ADR-0012](../decisiones/ADR-0012-construccion-tras-design-system-y-modelo.md)
nadie construye pantallas hasta que el design system está validado. #41 se
entrega en dos fases: la Fase 1 explores direcciones y el equipo elige una; la
Fase 2 convierte esa elección en tokens y componentes.

El detalle de la decisión —dirección elegida, motivo, alternativas descartadas—
se registra en `DESIGN-SYSTEM.md`, que es lo que consumen #11 y #4. El PDF es
el entregable de la Fase 1 y queda como evidencia de la exploración: no es la
fuente de verdad de los tokens, porque tokens en hex envejecen mal y el estándar
del proyecto es OKLCH.

## Reglas de esta carpeta

- **El detalle vive aquí, no en los issues.** Los issues llevan el estado: quién
  decide, cuándo y a qué tarea pertenece (`docs/README.md`, capas de autoridad).
- **Tokens en OKLCH**, exportados a `tokens.json` y mapeados a Tailwind 4
  `@theme`. El hex es referencia para herramientas legacy, no fuente.
- **Toda paleta se verifica con WCAG 2.2 AA**: ≥ 4.5:1 en texto normal, ≥ 3:1 en
  texto grande. Un color que no se va a usar como texto se declara superficie.
- **El mono no es opcional.** DOCU muestra cifras y lotes; `0/O` y `1/l` tienen
  que distinguirse a tamaño de cuerpo.
- **La IA propone y el humano dispone**, también en diseño
  ([ADR-0006](../decisiones/ADR-0006-ia-propone-humano-dispone.md)): lo que
  sugiere el asistente va punteado hasta que una persona lo confirma.

## Referencias

- [`../plantillas/DESIGN.md`](../plantillas/DESIGN.md) — plantilla de diseño de pantalla
- [`../plantillas/design-system.md`](../plantillas/design-system.md) — plantilla del design system
- [`../briefs/BRIEF-41-marca-fase1.md`](../briefs/BRIEF-41-marca-fase1.md) — brief de la Fase 1
- [`../briefs/BRIEF-41-fase2-design-system.md`](../briefs/BRIEF-41-fase2-design-system.md) — brief de la Fase 2
