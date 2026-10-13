# Rama `design/kira-playground` — guía completa

> **⚠️ ESTA RAMA NUNCA SE FUSIONA A `main`.**
> Rama huérfana (sin historial de `main`). Lo decidido viaja a `docs/diseno/`
> por PR desde `main` (ver `playground/PROMOCION.md`).

## Qué es

Taller de Kira: app Angular 22 zoneless + Tailwind 4 espejo de `apps/web`
(mismas versiones y configs) donde itera marca, design system y pantallas
con IA, sin contaminar `main` ni violar ADR-0012.

## Arranque

```bash
git checkout design/kira-playground
cd playground && bun install && bun run start   # :4200
opencode                                        # /inicio para orientarte
```

## Dónde está cada cosa

| Quiero… | Voy a… |
|---|---|
| Ver la app | http://localhost:4200 (`playground/ng/`) |
| Cambiar paleta/tipo/espaciado | `playground/tokens/tokens.css` (+ fuente DTCG `tokens.json`) |
| Ver reglas del taller | `AGENTS.md` (raíz) + `playground/AGENTS.md` |
| Cómo se trabaja aquí | `playground/FLUJO.md` (ciclo, realtime, delegación) |
| Qué patrón es obligatorio | `playground/CONSISTENCIA.md` (tokens→átomos→pantallas) |
| Fijar la marca elegida | `/fijar-marca` (llena `DESIGN.md` + tokens + brand kit) |
| Agregar una pantalla | `/nueva-pantalla` (ruta, componentes, redirecciones) |
| Empezar un issue | `/tarea N` (41, 11, 28, 42) |
| Llevar decisión a `main` | `playground/PROMOCION.md` (checklist + PR) |
| Skills disponibles | `.opencode/skills/` (origen MIT en `ORIGEN.md`) |
| Insumos de marca | `playground/DESIGN.md` (los llena `/fijar-marca`) |

## Skills (solo esta rama, se autoinvocan por descripción)

| Skill | Cuándo se activa |
|---|---|
| `brand` | Marca y brand kit: paleta, tipografías, logo, voz |
| `design-system` | Tokens primitivo→semántico→componente |
| `design` | Pantallas del flujo captura→bandeja→programa→búsqueda |
| `ui-ux-pro-max` | Revisión UX: layout, accesibilidad, responsive |
| `ui-styling` | Estilos y detalles visuales |
| `frontend-ui-engineering` | Acabado producción, que no parezca IA |
| `hallmark` | Anti-diseño-genérico (revisión de marca) |
| `ecc-angular-developer` | Código Angular 22 zoneless, signals, ARIA, Tailwind |

¿Cómo sabe opencode que están aquí? Los descubre en `.opencode/skills/` y
los activa por coincidencia con su descripción. Refuerzo: `/tarea`,
`/nueva-pantalla` y `FLUJO.md` nombran explícitamente cuál usar por fase;
`AGENTS.md` los lista. MCPs globales (`playwright` capturas —snapmcp
bloquea localhost—, `context7` docs, `engram` memoria) funcionan en
cualquier rama.

## Reglas

| Regla | Por qué |
|---|---|
| Nunca fusionar a `main` | ADR-0012: no contaminar el repo central |
| Sin API ni BD | BRIEF-42: solo tokens y mockups |
| Código solo en `playground/ng/` y `playground/tokens/` | Aislamiento |
| Cero hardcodeados fuera de `tokens.css` | `CONSISTENCIA.md` |
| Sin nombre real de la planta | Privacidad del caso |

## Estado

🟢 13-oct: Angular espejo + tokens + opencode equipado. Falta: `/fijar-marca`
con la dirección elegida (tras revisión 13-oct) → pantallas → promoción.
