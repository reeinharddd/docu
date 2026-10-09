# BRIEF #42 — Playground de diseño con IA (rama que nunca se fusiona)

## 0. Encabezado

- Issue: #42
- Dueño: Erik (lo usa Kira)
- Fechas: 2026-10-16 → **2026-10-23** · Sprint 1 · hito `Cierre de diseño` (2026-10-23)
- Prioridad / Tipo / Épica / Módulo: alta / tarea / Diseño / diseño
- Requisitos: RNF-01; sostiene ADR-0012 (puerta 1: design system)
- Bloqueado por: marca Fase 1 (#41-fase1, qué dirección) · Bloquea a: #41 Design system

Replanificación 2026-10-09: fechas 09→12-oct a 16→23-oct (tras la elección de marca del 16-oct).

## 1. Contexto

ADR-0012 prohíbe construir frontend hasta tener design system. Para no contaminar `main`, la exploración vive en la rama `design/kira-playground`, que **nunca se fusiona**. Ahí Kira itera paletas, tipografías y layouts con IA sin romper nada.

## 2. Por qué importa tu parte

Sin playground, cada prueba de marca toca `apps/web/` y ADR-0012 se viola; con playground, Kira prueba en minutos y solo lo decidido viaja a `docs/diseno/` por PR. Si no está listo el 16-oct, la dirección elegida no se desarrolla y #41 no cierra el 30-oct.

## 3. Objetivo y resultado esperado

Rama aislada donde Kira prueba una paleta nueva en <5 minutos.

| Entregable | Evidencia |
|---|---|
| Rama `design/kira-playground` | Existe, con README de uso; protegida contra merge a `main` (se documenta el no-merge) |
| Página de tokens editable | Paleta, tipografía, espaciado con vista previa de componentes (captura en #42) |
| AGENTS.md propio de exploración libre | Reglas de iteración rápida + comandos/skills de diseño en `.opencode/` del playground |
| Capturas automáticas por iteración | Carpeta de comparativas para elegir (antes/después) |
| Plantilla de promoción a `docs/diseno/` | Checklist para llevar una decisión del playground al repo por PR |

## 4. Actividades específicas

1. Crear rama y esqueleto (2 h): `gh issue develop 42 --base main --checkout`, página de tokens, README con 1 comando de arranque. Terminado: Kira abre la rama y ve tokens.
2. Reglas de exploración (1 h): AGENTS.md del playground (libre, sin puertas de producto), skills de diseño. Terminado: la IA puede variar sin pedir permiso de arquitectura.
3. Capturas (1 h): script o flujo para captura por iteración. Terminado: 2 comparativas de ejemplo.
4. Plantilla de promoción (1 h): qué viaja a `docs/diseno/` (tokens, componentes, decisiones) y qué se queda (pruebas). Terminado: checklist en el repo.
5. Prueba con Kira (30 min): Kira cambia una paleta en <5 min. Terminado: criterio de hecho cumplido y comentado en #42.

Total estimado: 5–6 h.

## 5. Entradas y salidas

- Recibe: dirección elegida el 16-oct (BRIEF-41), `STACK.md` (Angular 22 + Tailwind 4 solo como referencia, sin código de producto).
- Entrega: a Kira, rama usable + comentario en #42 con el comando. Lo decidido viaja a #41 por PR de Kira.

## 6. Referencias y caja de herramientas

- ADR-0012 (por qué aislado), `STACK.md`, `HERRAMIENTAS-AGENTE.md` (Uizard, Stitch, Penpot MCP si Kira elige Penpot).
- `AGENTS.md` raíz (esto es excepción documentada: exploración libre solo aquí).

Recursos oficiales y del starred del equipo para construirlo:

| Para | Recurso | Cuándo usarlo |
|---|---|---|
| Formato de tokens | https://www.designtokens.org (especificación DTCG, JSON con `$value`/`$type`) | Al estructurar la página de tokens para que exporte a Tailwind 4 |
| Tailwind 4 (referencia) | https://tailwindcss.com/docs/v4-beta (CSS-first, `@theme`) | Al mapear tokens → variables que usará #4 |
| Penpot (si Kira lo elige) | https://penpot.app + repo https://github.com/penpot/penpot (starred del equipo) | Al conectar playground con tokens y componentes |
| Kits Angular a evaluar (gap abierto: sin UI kit) | Curaduría del equipo: https://primeng.org, https://material.angular.io, https://taiga-ui.dev, https://ng.ant.design, https://clarity.design; tablas densas: https://www.ag-grid.com/angular-data-grid/ | Al probar en el playground qué kit respeta los tokens (1 ganador alimenta #41) |
| Componentes Tailwind de referencia | Curaduría del equipo: https://flowbite.com, https://daisyui.com, https://ui.shadcn.com (patrones, no dependencias) | Al maquetar previews sin reinventar botón/tabla/badge |
| Movimiento con respeto | https://motion.dev (y `prefers-reduced-motion`) | Al animar transiciones sin romper accesibilidad |
| Pipeline de tokens | https://amzn.github.io/style-dictionary (tokens JSON → CSS/Tailwind) y https://tokens.studio (editar tokens con UI) | Al hacer que la página de tokens exporte de verdad |
| Paletas del equipo | Curaduría del equipo: https://coolors.co, https://pigment.shapefactory.co, https://huemint.com, https://uicolors.app (lista Tailwind), https://oklch.com (accesibilidad real) | Al probar direcciones sin partir de cero |
| Logo e inspiración (starred del equipo) | https://github.com/collidingScopes/liquid-logo y https://github.com/ruucm/shadergradient | Solo como chispa visual para la marca, no como dependencia |

## 7. Cómo trabajar

- ERIK NO DEBE: fusionar esta rama a `main` jamás; meter lógica de negocio; decidir la marca (la elige el equipo, la desarrolla Kira).
- ERIK SÍ DEBE: dejar 1 comando de arranque; documentar el no-merge; avisar a Kira en #41 cuando esté listo.
- KIRA SÍ DEBE: iterar sin miedo; lo que quede, lo propone a `docs/diseno/` por PR.

## 8. Criterios de aceptación

- [ ] Kira abre la rama, corre 1 comando y prueba 1 paleta en <5 min (comentario en #42).
- [ ] Página de tokens con preview existe (captura).
- [ ] Checklist de promoción a `docs/diseno/` existe.
- [ ] Consta por escrito que la rama nunca se fusiona.
- [ ] `bun run verify` en verde (en `main`; el playground no rompe gates).

No es done si: hay que explicar de voz cómo arrancar; el playground importa código a `apps/`.

## 9. Riesgos nombrados

Convertir el playground en frontend real. Mitigación: sin API ni BD, solo tokens y mockups; revisión 23-oct lo confirma.

## 10. Revisión

Viernes 2026-10-23 con Kira: demo de 5 min del cambio de paleta. Después: #41 design system.
