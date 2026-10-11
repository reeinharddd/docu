# BRIEF #41-fase1 — Exploración de marca (3 direcciones)

## 0. Encabezado

- Issue: #41 (fase 1 de `Design system de marca`) / enlace: issue #41
- Dueño: Kira
- Fechas: 2026-10-11 → **2026-10-13** · Sprint 1 · hito `Cierre de diseño` (2026-10-23)
- Prioridad / Tipo / Épica / Módulo: alta / tarea / Diseño / diseño
- Requisitos: RNF-01 (usabilidad); alimenta RF-01, RF-03, RF-04
- Bloqueado por: nada · Bloquea a: #41 Design system, #4 Frontend Angular

Replanificación 2026-10-09: inicio 2026-10-05 → 2026-10-12 (+7 días); marca primero, flujo (#11) después (16→23-oct). Migra `docs/diseno/brief-kira-fase1.txt` a formato `plantillas/BRIEF.md`.

## 1. Contexto

DOCU necesita una marca que comunique lineage y confianza antes de construir pantallas. La planta pierde horas cruzando Excels y escaneados; el dato oficial solo vale si se ve verificable (`proyecto/CASO.md`, ADR-0006). El nombre del producto es DOCU, no cambia.

## 2. Por qué importa tu parte

Por ADR-0012 nadie construye pantallas hasta el design system. Estas 3 direcciones son la primera puerta: si salen tarde, #41 y #4 arrancan tarde y el contrato del 30 de octubre se congela sin saber qué necesita cada pantalla. Si salen bien, el frontend se construye una sola vez.

## 3. Objetivo y resultado esperado

Presentar 3 direcciones de marca; el equipo selecciona una para desarrollar en Fase 2.

| Entregable | Evidencia |
|---|---|
| 3 direcciones radicalmente diferentes | PDF o presentación con narrativa por dirección |
| Por dirección: slogan, paleta (hex), tipografía, logo, estilo + moodboard | Sección completa con códigos y nombres |
| Razonamiento conectado al diferenciador (lineage, confianza, verificación) | 3–5 líneas por decisión |
| 1 pantalla preview por dirección aplicando la marca | Mockup en baja fidelidad, escritorio y celular |
| Encaje con el caso médico/industrial en español, equipo no-técnico | 2–3 líneas por dirección |

## 4. Actividades específicas

1. Investigar (2–3 h) con los recursos curados (§6), foco en branding médico/industrial + data lineage. Terminado: lista de referencias usadas.
2. Explorar (3–4 h) 3 direcciones radicalmente diferentes. Terminado: slogan, paleta, tipografías (display, body, mono — el mono es crítico), concepto de logo por dirección.
3. Armar moodboards (2 h): 5–10 imágenes por dirección. Terminado: qué se siente en 3–5 palabras.
4. Dibujar 1 preview por dirección en pantalla clave. Terminado: demuestra que la marca funciona en producto, no solo en abstracto.
5. Armar presentación (1–2 h) con narrativa fija: inspiración → concepto → extracción → moodboard → pantalla final. Terminado: evaluable sin explicación adicional.

Total estimado: 10–13 h concentradas.

## 5. Entradas y salidas

- Recibe: caso y requisitos (`CASO.md`, `REQUISITOS.md` RF-01..04, RNF-01), ADR-0006 y ADR-0012; matriz preliminar de Carlos (#29) si existe.
- Entrega: al equipo por PR, PDF/presentación con las 3 direcciones; insumo de #41 y del contrato #23.

## 6. Referencias y caja de herramientas

- `docs/proyecto/CASO.md`, `REQUISITOS.md`, `VISION.md`; ADR-0006, ADR-0012.
- Color: Coolors, Pigment, Huemint, Muz.li Colors, UI Colors, Magnt por industria.
- Tipografía: Google Fonts, Font Squirrel, Beautiful Web Type.
- Inspiración: Awwwards, Mobbin, Component Gallery, Godly, Land-book, Behance branding 2026.
- Producto documental: SaaSUI Document Management.
- Lineage: DataHub Lineage UI, OpenMetadata Lineage, paper ProvenanceWidgets.
- Industria médica: Weill Cornell, Utah Health, Stony Brook, Respira, Medline.
- Iconos: Lucide, Phosphor, Tabler, Heroicons. Tokens: W3C Design Tokens, OKLCH, Penpot MCP.
- Mockups rápidos con IA: Uizard, Stitch. Español: Guía Impresión tendencias 2026, El Publicista.
- Del starred del equipo (chispa visual, no dependencias): https://github.com/collidingScopes/liquid-logo y https://github.com/ruucm/shadergradient para concepto de logo.
- Parejas tipográficas y escala: https://fontpair.co (qué combina con qué) y https://type-scale.com (escala modular para display/body/mono).
- Contraste real AA: https://coolors.co/contrast-checker (pares texto/fondo) — el mono de cifras también debe pasar.
- Accesibilidad WCAG 2.2 AA; la IA genera variantes, tú decides cuál queda.

## 7. Cómo trabajar

- Con OpenCode: `/tarea 41` para empezar y `/cerrar` para el PR.
- La IA genera y varía; no decide reglas, permisos, dato oficial ni diseño final.
- No escribir código ni tocar `apps/web/`. No usar el nombre real de la planta.
- Duda de 30 min: preguntar al equipo. Bloqueo de 24 h: etiqueta `bloqueado`.
- Español, Chrome/Edge y celular; contexto médico/industrial profesional, no lúdico.

## 8. Criterios de aceptación

- [ ] 3 direcciones existen y son radicalmente diferentes entre sí.
- [ ] Cada dirección tiene slogan, paleta con hex, tipografías con nombres, logo (concepto o imagen), estilo (palabras + moodboard 5–10).
- [ ] Cada dirección incluye 1 pantalla preview aplicando la marca.
- [ ] Cada decisión tiene razonamiento conectado al diferenciador de DOCU.
- [ ] Narrativa inspiración → concepto → extracción → moodboard → pantalla final.
- [ ] Presentable en universidad, sin explicación adicional de Kira.
- [ ] `bun run verify` en verde.

No es done si: se ven iguales con distintos colores; falta el porqué; no hay preview; no se entiende sin Kira.

## 9. Riesgos nombrados

Pulir estética antes de cerrar direcciones. Mitigación: baja fidelidad primero; tokens y pulido van en Fase 2. Desde el 2026-10-14 sin entrega es bloqueo.

## 10. Revisión

Martes 2026-10-14 presencial: kira presenta las 3 direcciones a todo el equipo; el equipo elige una dirección. Fase 2 (design system, tokens) se calendariza tras la selección.

## 11. Insumos del agente

| Insumo | Estado | Notas |
|---|---|---|
| DESIGN.md | Pendiente | Plantilla en `docs/plantillas/DESIGN.md` |
| AGENTS.md | Pendiente | Plantilla en `docs/plantillas/AGENTS.md` |
| design-system.md | Pendiente | Plantilla en `docs/plantillas/design-system.md` |
| Visión | Pendiente | 1 párrafo |
| Slogan | Pendiente | Frase corta |
| Paleta | Pendiente | Hex + nombre por token |
| Tipografías | Pendiente | Display, body, mono |
| Iconos | Pendiente | Set elegido |
| Imágenes | Pendiente | Logo, ilustraciones, fotos |
| Estados | Pendiente | Cargando, vacío, error, cuarentena, confirmado |

## 12. Recursos por actividad

### Investigar marca
- [Awwwards](https://www.awwwards.com/) — Excelencia visual web. **Cuándo:** necesitas ver qué se considera mundo-clase.
- [Mobbin](https://mobbin.com/) — Patrones de producto real. **Cuándo:** necesitas ver cómo otros resuelven bandejas, tablas, filtros.
- [Land-book](https://land-book.com/) — Inspiración de landing pages. **Cuándo:** necesitas composición y jerarquía visual.
- [Component Gallery](https://component.gallery/) — Componentes y patrones. **Cuándo:** necesitas ver variantes de un componente.
- [Godly](https://godly.website/) — Sitios web excepcionales. **Cuándo:** necesitas referencia de alto nivel.
- [UI Sources](https://www.uisources.com/) — UI de apps reales. **Cuándo:** necesitas ver flujos completos.
- [Page Flows](https://pageflows.com/) — Flujos de navegación. **Cuándo:** necesitas ver cómo se conectan pantallas.
- [UI Patterns](https://ui-patterns.com/) — Patrones de UI. **Cuándo:** necesitas soluciones probadas.
- [Behance](https://www.behance.net/) — Branding y diseño. **Cuándo:** necesitas branding de marca.
- [DataHub](https://datahub.com/) / [OpenMetadata](https://open-metadata.org/) — Lineage UI. **Cuándo:** necesitas mostrar procedencia de datos.
- [SaaSUI](https://saasui.design/) — Producto documental. **Cuándo:** necesitas referencia de gestión documental.
- [Weill Cornell](https://weill.cornell.edu/) / [Utah Health](https://healthcare.utah.edu/) / [Medline](https://www.medline.com/) — Branding médico/industrial. **Cuándo:** necesitas tono profesional de salud.

### Desarrollar marca
- [Coolors](https://coolors.co/) — Paletas + contraste AA. **Cuándo:** necesitas explorar paletas.
- [OKLCH](https://oklch.com/) — Color con accesibilidad real. **Cuándo:** necesitas verificar contraste perceptualmente uniforme.
- [Google Fonts](https://fonts.google.com/) — Tipografías. **Cuándo:** necesitas tipografía display/body/mono.
- [Lucide](https://lucide.dev/) / [Phosphor](https://phosphoricons.com/) / [Tabler](https://tabler.io/icons) — Iconos. **Cuándo:** necesitas set de iconos.
- [designtokens.org](https://www.designtokens.org/) — Especificación DTCG. **Cuándo:** necesitas estructurar tokens.
- [tokens.studio](https://tokens.studio/) — Editar tokens con UI. **Cuándo:** necesitas editar tokens visualmente.
