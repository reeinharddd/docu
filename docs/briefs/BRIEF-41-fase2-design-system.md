# BRIEF #41-fase2 — Design system: tokens, tipografía y componentes base

## 0. Encabezado

- Issue: #41 (fase 2 de `Design system de marca`)
- Dueño: Kira
- Fechas: 2026-10-12 → 2026-10-23 · Sprint 1 · hito `Cierre de diseño` (2026-10-23)
- Prioridad / Tipo / Épica / Módulo: crítica / tarea / Diseño / diseño
- Requisitos: RNF-01; alimenta RF-01, RF-03, RF-04
- Bloqueado por: marca Fase 1 (#41-fase1, dirección elegida) · Bloquea a: #11 y #4
- Taller: rama `design/kira-playground` (huérfana; nunca se fusiona a `main`)

## 0.1 Dónde se trabaja y qué viaja a `main`

- **Taller:** `design/kira-playground`. Tokens crudos en
  `playground/tokens/` (`tokens.json` + `tokens.css`); componentes y pantallas
  en `playground/ng/`.
- **A `main` solo viaja:** `docs/diseno/DESIGN-SYSTEM.md`,
  `docs/diseno/tokens.json` (DTCG 2025.10) y capturas. **No** viaja código del
  playground ni se toca `apps/web` en esta fase: #4 mapea `@theme` cuando
  arranque.
- **Promoción:** checklist `playground/PROMOCION.md`; PR desde una rama creada
  en `main`, con `Closes #41`.
- **Acta de marca:** la dirección elegida, el motivo y las dos descartadas se
  registran en #41 y en `DESIGN-SYSTEM.md`; sin acta no se cierra #41.

## 1. Contexto

ADR-0012 prohíbe construir pantallas hasta tener design system. La fase 1 (3 direcciones de marca) ya está en marcha. La fase 2 toma la dirección elegida y la convierte en tokens, tipografía, componentes base y un documento verificable.

## 2. Por qué importa tu parte

Sin design system, #4 (frontend) y #11 (prototipos) no pueden avanzar. Los tokens definidos aquí alimentan directamente Tailwind 4 (@theme) y los componentes base se reutilizan en las 4 pantallas.

## 3. Objetivo y resultado esperado

Design system documentado y exportado como tokens, listo para producción.

| Entregable | Evidencia |
|---|---|
| `docs/diseno/DESIGN-SYSTEM.md` con tokens, tipografía, componentes base | Archivo verificado con contraste WCAG 2.2 AA y acta de marca |
| Tokens exportados (DTCG 2025.10) | `docs/diseno/tokens.json` + captura de tokens aplicados en el taller |
| Componentes base documentados (botón, input, tabla, badge, modal) | Sección de componentes con variantes |
| Aplicado a prototipos de #11 | Capturas con tokens aplicados |

## 4. Actividades específicas

1. Recibir la dirección elegida de Fase 1 y el acta (dirección, motivo y dos
   descartadas) registrada en #41. Terminado: token de marca identificado.
2. Definir tokens de color (OKLCH), tipografía (escala modular), espaciado (base 4px), radios, sombras. Terminado: estructura DTCG 2025.10 completa.
3. Definir componentes base: botón, input, tabla, badge de estado (cuarentena, pendiente, oficial), alerta, modal. Terminado: 6 componentes con variantes.
4. Verificar contraste WCAG 2.2 AA en todos los pares texto/fondo. Terminado: 0 pares fallen.
5. Exportar tokens a `docs/diseno/tokens.json` (DTCG). Terminado: JSON válido y documentado, listo para que #4 lo mapee a Tailwind 4 `@theme`. No se escribe `apps/web` en esta fase.
6. Aplicar a prototipos de #11. Terminado: capturas con tokens aplicados.

Total estimado: 4–6 h.

## 5. Entradas y salidas

- Recibe: dirección elegida de Fase 1 y su acta en #41,
  `docs/plantillas/design-system.md`, prototipos de #11.
- Entrega: `docs/diseno/DESIGN-SYSTEM.md` + `docs/diseno/tokens.json` +
  componentes documentados + capturas. Insumo de #4 (frontend). Nada de
  `apps/web` ni código del taller.

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

- Con OpenCode: abre el taller (`design/kira-playground`); `/tarea 41` (fase 2)
  para empezar y `/cerrar` para el PR de promoción desde `main`.
- La rama `design/kira-playground` es huérfana y **NUNCA** se fusiona a `main`.
- La IA genera y varía; no decide reglas, permisos, dato oficial ni diseño final.
- No escribir código de producto (`apps/web`). Solo tokens, documentos y las
  pruebas del taller; #4 mapea `@theme` en `apps/web` cuando arranque.
- Duda de 30 min: preguntar al equipo. Bloqueo de 24 h: etiqueta `bloqueado`.
- Español, Chrome/Edge y celular.

## 8. Criterios de aceptación

- [ ] Tokens de color definidos en OKLCH con contraste WCAG 2.2 AA verificado
- [ ] Tipografía con escala modular (display, body, mono) definida
- [ ] Espaciado base 4px en rem definido
- [ ] Radios y sombras definidos
- [ ] 6 componentes base documentados (botón, input, tabla, badge, alerta, modal)
- [ ] `docs/diseno/tokens.json` en DTCG 2025.10, listo para que #4 lo mapee a `@theme`
- [ ] Aplicado a prototipos de #11 con capturas
- [ ] `docs/diseno/DESIGN-SYSTEM.md` existe y está verificado
- [ ] `DESIGN-SYSTEM.md` registra la dirección elegida, el motivo y las dos descartadas, con enlace al PDF de Fase 1
- [ ] Checklist de `playground/PROMOCION.md` completo y PR con `Closes #41`

## 9. Riesgos nombrados

- Tokens que no pasan contraste AA. Mitigación: verificar con coolors.co/contrast-checker antes de exportar.
- Componentes demasiado abstractos. Mitigación: cada componente tiene variantes concretas (no solo teórico).
- Retraso si Fase 1 se atrasa. Mitigación: tokens se pueden definir en paralelo con prototipos de baja fidelidad.

## 10. Revisión

Estado 2026-10-19: Fase 2 en curso (tokens). La Fase 1 está en el PR #63, que
tiene conflictos con `main` y aún no se ha fusionado; el acta de marca debe
quedar escrita en #41 antes de cerrar esta fase.

Flujo unificado con #11: tokens y mockups se trabajan juntos en
`design/kira-playground` (una sola corriente, sin pasos duplicados); revisión
de tokens con Erik. Cierre 23-oct.

## 11. Insumos del agente

| Insumo | Estado | Notas |
|---|---|---|
| Taller `design/kira-playground` | Entregado | App Angular + tokens + reglas de promoción |
| DESIGN.md | Parcial | Plantilla en el taller; falta llenarla con la dirección elegida |
| AGENTS.md | Entregado | Raíz del taller + `playground/AGENTS.md` |
| design-system.md | Pendiente | Se entrega en esta fase (`docs/diseno/DESIGN-SYSTEM.md`) |
| Visión | Entregado | `proyecto/VISION.md` y `CASO.md` |
| Slogan | Parcial | 3 slogans + alternativa en el PDF; falta el acta de elección |
| Paleta | En progreso | Hex + modo oscuro en el PDF, AA verificado 2026-10-13; falta OKLCH y tokens |
| Tipografías | Parcial | 3 familias nombradas en el PDF; falta fijar la escala modular |
| Iconos | Pendiente | Set elegido |
| Imágenes | Parcial | Concepto de logo por dirección; faltan variantes |
| Estados | Pendiente | Cargando, vacío, error, cuarentena, confirmado |
| Acta de marca | Pendiente | Dirección, motivo y descartadas en #41; bloquea el cierre |

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
