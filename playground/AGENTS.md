# AGENTS.md — Reglas del playground

> Plantilla universal. Copiar a `playground/AGENTS.md` y adaptar.
> Mismo estándar para playground y main.

## Qué puedo hacer sin pedir permiso
- Cambiar paleta, tipografía, espaciado
- Modificar layouts, textos, imágenes
- Probar variaciones de componentes
- Añadir o quitar pantallas del prototipo

## Qué se propone por PR a docs/diseno/
- Decisiones de marca (paleta final, tipografía final)
- Componentes nuevos o modificados
- Cambios en el flujo de navegación

## Qué está prohibido
- Fusionar esta rama a main
- Tocar apps/ o cualquier código de producto
- Añadir lógica de negocio (API, BD, servicios)
- Usar el nombre real de la planta

## Comandos
- Arranque: `cd playground && bun run start` (sin dependencias, :4200)
- Sesión: `/inicio` (quién eres y qué sigue), `/tarea N` (empezar un issue)
- Captura: snapmcp contra http://localhost:4200, antes/después por iteración
- Verificación: `bun run verify` (en main, no aquí)

## Herramientas (ya disponibles en esta rama)
- Skill `ecc-angular-developer`: código Angular 22 zoneless, signals, formularios, ARIA, Tailwind. Úsala al construir pantallas o componentes.
- MCPs globales: `snapmcp`/`playwright` (capturas), `context7` (docs oficiales), `engram` (memoria del proyecto).
- Consistencia obligatoria: `playground/CONSISTENCIA.md` (tokens → componentes → pantallas, cero hardcodeados).
