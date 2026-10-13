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
- Arranque: `cd playground && bun install && bun run start` (Angular espejo, :4200)
- Sesión: `/inicio` (quién eres y qué sigue), `/tarea N` (empezar un issue)
- Marca: `/fijar-marca` (dirección elegida → DESIGN + tokens + brand kit)
- Pantalla: `/nueva-pantalla <nombre>` (contrato ruta/componentes/redirecciones)
- Captura: snapmcp/playwright contra http://localhost:4200, antes/después por iteración
- Verificación: `bun run verify` (en main, no aquí)

## Herramientas (solo esta rama, ver `FLUJO.md` para cuándo usar cada una)
- Skills diseño: `brand` (marca/brand kit), `design-system` (tokens), `design` (pantallas), `ui-ux-pro-max` (revisión UX), `ui-styling` (estilos), `frontend-ui-engineering` + `hallmark` (acabado producción, anti-genérico).
- Skill código: `ecc-angular-developer` (Angular 22 zoneless, signals, ARIA, Tailwind).
- Subagentes: `explorador` (investiga antes de construir), `revisor` (revisa antes de promover).
- MCPs globales: `snapmcp`/`playwright` (capturas realtime), `context7` (docs oficiales), `engram` (memoria).
- Consistencia obligatoria: `playground/CONSISTENCIA.md` (tokens → componentes → pantallas, cero hardcodeados).
- Origen skills: `.opencode/skills/ORIGEN.md` (MIT).
