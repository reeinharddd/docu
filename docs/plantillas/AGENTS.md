<p align="center">
<strong>docu</strong><br>
<sub>Configuración 1 · Baja SterilPack · DOCU — Repositorio de Documentación Digital</sub><br>
<sub>Marca: <code>#5B2A86</code> · acento: <code>#B0215F</code> · texto: <code>#24172F</code></sub>
</p>

# AGENTS.md — Playground rules

> Universal template. Copy to `playground/AGENTS.md` and adapt.
> Same standard for playground and main.

## What you can do without asking
- Change palette, typography, spacing
- Modify layouts, texts, images
- Try component variations
- Add or remove screens from the prototype

## What goes to `docs/diseno/` via PR
- Brand decisions (final palette, final typography)
- New or modified components
- Changes to the navigation flow

## What is forbidden
- Merging this branch into `main`
- Touching `apps/` or any product code
- Adding business logic (API, DB, services)
- Using the real plant name

## Commands
- Start: `cd playground && bun install && bun run start`
- Capture: `bun run capture` (snapmcp)
- Verification: `bun run verify` (on main, not here)
