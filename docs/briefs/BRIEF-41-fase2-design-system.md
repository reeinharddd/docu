# BRIEF #41-fase2 — Design system: tokens, tipografía y componentes base

## 0. Encabezado

- Issue: #41 (fase 2 de `Design system de marca`)
- Dueño: Kira
- Fechas: 2026-10-12 → 2026-10-23 · Sprint 1 · hito `Cierre de diseño` (2026-10-23)
- Prioridad / Tipo / Épica / Módulo: crítica / tarea / Diseño / diseño
- Requisitos: RNF-01; alimenta RF-01, RF-03, RF-04
- Bloqueado por: marca Fase 1 (#41-fase1, dirección elegida) · Bloquea a: #4 Frontend Angular

## 1. Contexto

ADR-0012 prohíbe construir pantallas hasta tener design system. La fase 1 (3 direcciones de marca) ya está en marcha. La fase 2 toma la dirección elegida y la convierte en tokens, tipografía, componentes base y un documento verificable.

## 2. Por qué importa tu parte

Sin design system, #4 (frontend) y #11 (prototipos) no pueden avanzar. Los tokens definidos aquí alimentan directamente Tailwind 4 (@theme) y los componentes base se reutilizan en las 4 pantallas.

## 3. Objetivo y resultado esperado

Design system documentado y exportado como tokens, listo para producción.

| Entregable | Evidencia |
|---|---|
| `docs/diseno/DESIGN-SYSTEM.md` con tokens, tipografía, componentes base | Archivo verificado con contraste WCAG 2.2 AA |
| Tokens exportados (CSS variables / Tailwind 4 @theme) | `tokens.json` o `@theme` en `styles.css` |
| Componentes base documentados (botón, input, tabla, badge, modal) | Sección de componentes con variantes |
| Aplicado a prototipos de #11 | Capturas con tokens aplicados |

## 4. Actividades específicas

1. Recibir dirección elegida de Fase 1. Terminado: token de marca identificado.
2. Definir tokens de color (OKLCH), tipografía (escala modular), espaciado (base 4px), radios, sombras. Terminado: estructura DTCG 2025.10 completa.
3. Definir componentes base: botón, input, tabla, badge de estado (cuarentena, pendiente, oficial), alerta, modal. Terminado: 6 componentes con variantes.
4. Verificar contraste WCAG 2.2 AA en todos los pares texto/fondo. Terminado: 0 pares fallen.
5. Exportar tokens a `tokens.json` y mapear a Tailwind 4 @theme. Terminado: `@theme` en `styles.css` con tokens.
6. Aplicar a prototipos de #11. Terminado: capturas con tokens aplicados.

Total estimado: 4–6 h.

## 5. Entradas y salidas

- Recibe: dirección elegida de Fase 1, `docs/plantillas/design-system.md`, prototipos de #11.
- Entrega: `docs/diseno/DESIGN-SYSTEM.md` + tokens exportados + componentes documentados. Insumo de #4 (frontend).

## 6. Referencias y caja de herramientas

- `docs/plantillas/design-system.md` — estándar universal de tokens y componentes
- `docs/plantillas/DESIGN.md` — insumos del agente (paleta, tipografías, iconos)
- DTCG 2025.10 — especificación de tokens
- Tailwind 4 @theme — CSS-first configuration
- WCAG 2.2 AA — criterios de contraste y accesibilidad

### Desarrollar marca (tokens, tipografía, iconos)
- [Coolors](https://coolors.co/) — Paletas + contraste AA
- [OKLCH](https://oklch.com/) — Color con accesibilidad real
- [Google Fonts](https://fonts.google.com/) — Tipografías
- [Lucide](https://lucide.dev/) / [Phosphor](https://phosphoricons.com/) / [Tabler](https://tabler.io/icons) — Iconos
- [designtokens.org](https://www.designtokens.org/) — Especificación DTCG
- [tokens.studio](https://tokens.studio/) — Editar tokens con UI
- [type-scale.com](https://type-scale.com/) — Escala modular
- [WCAG 2.2](https://www.w3.org/WAI/WCAG22/quickref/) — Criterios AA exactos
- [axe DevTools](https://www.deque.com/axe/) — Verificación automática

## 7. Cómo trabajar

- Con OpenCode: `/tarea 41` (fase 2) para empezar y `/cerrar` para el PR.
- La IA genera y varía; no decide reglas, permisos, dato oficial ni diseño final.
- No escribir código de producto (apps/web). Solo tokens y documentación.
- Duda de 30 min: preguntar al equipo. Bloqueo de 24 h: etiqueta `bloqueado`.
- Español, Chrome/Edge y celular.

## 8. Criterios de aceptación

- [ ] Tokens de color definidos en OKLCH con contraste WCAG 2.2 AA verificado
- [ ] Tipografía con escala modular (display, body, mono) definida
- [ ] Espaciado base 4px en rem definido
- [ ] Radios y sombras definidos
- [ ] 6 componentes base documentados (botón, input, tabla, badge, alerta, modal)
- [ ] Tokens exportados a `tokens.json` y mapeados a Tailwind 4 @theme
- [ ] Aplicado a prototipos de #11 con capturas
- [ ] `docs/diseno/DESIGN-SYSTEM.md` existe y está verificado

## 9. Riesgos nombrados

- Tokens que no pasan contraste AA. Mitigación: verificar con coolors.co/contrast-checker antes de exportar.
- Componentes demasiado abstractos. Mitigación: cada componente tiene variantes concretas (no solo teórico).
- Retraso si Fase 1 se atrasa. Mitigación: tokens se pueden definir en paralelo con prototipos de baja fidelidad.

## 10. Revisión

Tras la elección de marca del martes 13-oct: flujo unificado con #11 (tokens + mockups de flujo en el playground, una sola corriente 13→23); revisión de tokens con Erik. Cierre 23-oct.

## 11. Insumos del agente

| Insumo | Estado | Notas |
|---|---|---|
| DESIGN.md | Pendiente | Plantilla en `docs/plantillas/DESIGN.md` |
| AGENTS.md | Pendiente | Plantilla en `docs/plantillas/AGENTS.md` |
| design-system.md | Pendiente | Plantilla en `docs/plantillas/design-system.md` |
| Visión | Pendiente | 1 párrafo |
| Slogan | Pendiente | Frase corta |
| Paleta | Pendiente | OKLCH + hex + contraste AA |
| Tipografías | Pendiente | Display, body, mono con escala modular |
| Iconos | Pendiente | Set elegido |
| Imágenes | Pendiente | Logo, ilustraciones, fotos |
| Estados | Pendiente | Cargando, vacío, error, cuarentena, confirmado |

## 12. Recursos por actividad

### Desarrollar marca (tokens, tipografía, iconos)
- [Coolors](https://coolors.co/) — Paletas + contraste AA. **Cuándo:** explorar paletas.
- [OKLCH](https://oklch.com/) — Color con accesibilidad real. **Cuándo:** verificar contraste perceptualmente uniforme.
- [Google Fonts](https://fonts.google.com/) — Tipografías. **Cuándo:** tipografía display/body/mono.
- [Lucide](https://lucide.dev/) / [Phosphor](https://phosphoricons.com/) / [Tabler](https://tabler.io/icons) — Iconos. **Cuándo:** set de iconos.
- [designtokens.org](https://www.designtokens.org/) — Especificación DTCG. **Cuándo:** estructurar tokens.
- [tokens.studio](https://tokens.studio/) — Editar tokens con UI. **Cuándo:** editar tokens visualmente.
- [type-scale.com](https://type-scale.com/) — Escala modular. **Cuándo:** jerarquía tipográfica.
- [WCAG 2.2](https://www.w3.org/WAI/WCAG22/quickref/) — Criterios AA exactos. **Cuándo:** verificar accesibilidad.
- [axe DevTools](https://www.deque.com/axe/) — Verificación automática. **Cuándo:** auditar accesibilidad.
