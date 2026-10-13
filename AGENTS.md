# AGENTS.md — rama `design/kira-playground` (raíz)

> Rama huérfana de diseño. **NUNCA se fusiona a `main`.** Lo decidido viaja
> a `docs/diseno/` por PR desde `main`. Si abres opencode aquí, estas reglas
> mandan; dentro de `playground/`, suma `playground/AGENTS.md`.

## Propósito (por qué existe esta rama y qué harás en cada sesión)

ADR-0012 prohíbe construir frontend sin design system afirmado. Esta rama es
el taller donde Kira, con IA, convierte la marca elegida (Fase 1) en design
system + pantallas del flujo (captura → bandeja → programa → búsqueda) hasta
que el equipo los afirma y viajan a `main`. En TODAS las sesiones el agente:

1. Recorre `playground/CADENA.md` (anterior → entrega → tarea actual → siguiente).
2. Busca memoria del proyecto (skill `docu-memoria`: decisiones y gustos
   ya afirmados) antes de proponer.
3. Diseña con las skills de la rama, muestra en browser realtime con capturas.
4. Guarda en memoria lo que costó averiguar (gustos afirmados, decisiones
   con motivo). Estado de tareas: en GitHub Issues, nunca en memoria.

## Qué hay dónde

| Ruta | Qué es |
|---|---|
| `playground/ng/` | App Angular 22 zoneless + Tailwind 4, espejo de `apps/web` (`ng serve` :4200) |
| `playground/tokens/` | `tokens.json` (fuente DTCG) + `tokens.css` (vivo, lo que la app importa) |
| `playground/DESIGN.md` | Insumos de marca (los llena `/fijar-marca` con la dirección elegida) |
| `playground/CONSISTENCIA.md` | Cadena tokens→átomos→pantallas + contrato de pantalla (obligatorio) |
| `playground/FLUJO.md` | Técnica de trabajo (ciclo, skills por fase, realtime, delegación) |
| `playground/PROMOCION.md` | Checklist para llevar decisiones a `docs/diseno/` |
| `playground/README.md` | Arranque en 1 comando |
| `.opencode/skills/` | Skills solo-rama (ver `ORIGEN.md`): diseño + Angular + `docu-memoria` |
| `.opencode/commands/` | `/inicio`, `/tarea`, `/fijar-marca`, `/nueva-pantalla` |
| `.opencode/agents/` | `explorador` (investiga), `revisor` (revisa) |
| `playground/CADENA.md` | Cadena anterior→entrega→tarea→siguiente + insumos cruzados |

## Flujos (en este orden)

1. `/fijar-marca` — con la dirección elegida en Fase 1, llena `DESIGN.md` + tokens + brand kit. Sin esto no hay pantallas finales.
2. `/tarea N` — trabajar un issue de diseño (#41, #11, #28).
3. `/nueva-pantalla` — agregar pantalla declarando ruta, componentes y redirecciones (atomic design).
4. `PROMOCION.md` — llevar lo decidido a `docs/diseno/` por PR.

## Prohibido en esta rama

- Fusionar a `main` (ni por error: revisa `git branch` antes de pushear).
- Lógica de negocio, API, BD, servicios.
- Código fuera de `playground/ng/` y `playground/tokens/`.
- Usar el nombre real de la planta.
- Valores de diseño hardcodeados fuera de `tokens/tokens.css`.
