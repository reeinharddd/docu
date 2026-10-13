# Técnica de trabajo en el playground

> Diseñar rápido sin romper consistencia: proponer → ver → comparar → afirmar.

## Ciclo por tarea (`/tarea N`)

0. **Fijar marca**: `/fijar-marca` con la dirección elegida llena `DESIGN.md`
   + tokens + brand kit. Sin esto no hay pantallas finales, solo exploración.
1. **Plan**: `/tarea N` carga issue + `CONSISTENCIA.md` + `DESIGN.md`. Si la
   tarea toca pantallas nuevas, delega primero al subagente `explorador`
   (investiga patrones, no construye). Pantalla suelta: `/nueva-pantalla`
   (contrato ruta/componentes/redirecciones antes de codificar).
2. **Construir**: `ng serve` corriendo (watch). Cada cambio se ve en el
   browser en segundos. Skills por fase:
   - `brand` → marca y brand kit (paleta, tipografías, logo, voz).
   - `design-system` → tokens (primitivo → semántico → componente).
   - `design` → pantallas del flujo (captura → bandeja → programa → búsqueda).
   - `ui-ux-pro-max` → revisión UX (layout, accesibilidad, responsive).
   - `frontend-ui-engineering` → acabado producción (que no parezca IA).
   - `ecc-angular-developer` → código Angular 22 zoneless + Tailwind.
   - `ui-styling` → estilos y detalles visuales.
3. **Ver en tiempo real**: tras cada cambio, captura con `snapmcp` o
   `playwright` contra http://localhost:4200. Compara antes/después.
   Ojo humano de Kira decide; el agente propone y varía.
4. **Revisar**: antes de promover, delega al subagente `revisor`
   (rigurosa contra `CONSISTENCIA.md`: cero hardcodeados, flujo <10 min).
5. **Promover**: checklist `PROMOCION.md`, por PR a `docs/diseno/` en `main`.

## Delegación

Kira decide marca, flujo y pantallas finales. El agente nunca decide dato
oficial, reglas ni permisos (eso es producto, no diseño). Duda 30 min en el
issue; bloqueo >24 h con etiqueta `bloqueado`. Una tarea `En progreso` a la vez.
