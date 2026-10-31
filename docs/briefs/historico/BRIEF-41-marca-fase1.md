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

**Formato del entregable:** un solo archivo PDF o presentación (Google Slides, PowerPoint, Figma exportado, o el que prefieras). Mínimo 15 páginas/slides: portada + 4–5 por dirección + cierre comparativo.

**Por cada una de las 3 direcciones, incluir (en este orden):**

1. **Inspiración** (1 página): de dónde salió la idea, qué la inspiró, 2–3 referencias visuales.
2. **Concepto** (1 página): la dirección en 3–5 palabras. Qué se siente. Ejemplo: "Precisión clínica, confianza industrial" o "Transparencia moderna, calidez humana".
3. **Extracción** (1–2 páginas):
   - Slogan: 1–2 opciones de tagline.
   - Paleta: primario, secundario, acento, semánticos (éxito, advertencia, error) con códigos hex. Debe funcionar en UI, no solo en print.
   - Tipografía: Display (títulos), Body (texto), Mono (datos/cifras) con nombres de fuentes. El mono es crítico: DOCU muestra cifras.
   - Logo: concepto o imagen + variaciones si aplica (horizontal, icono, mono).
   - Razonamiento: 3–5 líneas por decisión conectando con el diferenciador (lineage, confianza, verificación). Por qué estos colores, por qué esta tipografía.
4. **Moodboard** (1 página): 5–10 imágenes de referencia que transmitan el estilo.
5. **Pantalla preview** (1 página): 1 mockup de pantalla clave aplicando la marca, en baja fidelidad, versión escritorio y celular. Demuestra que la marca funciona en producto real.

**Cierre comparativo** (1 página): tabla lado a lado de las 3 direcciones con slogan, paleta (muestras de color), tipografías y sensación en 3 palabras. Para que el equipo compare de un vistazo.

| Entregable | Evidencia |
|---|---|
| 3 direcciones radicalmente diferentes | PDF/presentación con las 5 secciones por dirección + cierre comparativo |
| Razonamiento conectado al diferenciador | 3–5 líneas por decisión, en la sección de extracción |
| Usable para todo público | 2–3 líneas por dirección: cómo la marca hace entendibles conceptos complejos con pocos clics |

## 4. Actividades específicas

1. Investigar con los recursos de §11, foco en marcas que hacen entendibles conceptos complejos + data lineage. Terminado: lista de referencias usadas.
2. Explorar 3 direcciones radicalmente diferentes. Terminado: slogan, paleta, tipografías (display, body, mono — el mono es crítico), concepto de logo por dirección.
3. Armar moodboards: 5–10 imágenes por dirección. Terminado: qué se siente en 3–5 palabras.
4. Dibujar 1 preview por dirección en pantalla clave. Terminado: demuestra que la marca funciona en producto, no solo en abstracto.
5. Armar presentación con narrativa fija: inspiración → concepto → extracción → moodboard → pantalla final. Terminado: evaluable sin explicación adicional.

## 5. Entradas y salidas

- Recibe: caso y requisitos (`CASO.md`, `REQUISITOS.md` RF-01..04, RNF-01), ADR-0006 y ADR-0012; matriz preliminar de Carlos (#29) si existe.
- Entrega: al equipo por PR, PDF/presentación con las 3 direcciones; insumo de #41 y del contrato #23.

## 6. Cómo trabajar

- Esta tarea es creativa: usa las herramientas que prefieras (a mano, Figma, Penpot, IA, o la que sea). Si usas OpenCode: `/tarea 41` para empezar y `/cerrar` para el PR.
- Si usas IA: genera y varía, pero tú decides cuál queda. La IA no decide reglas, permisos, dato oficial ni diseño final.
- No escribir código ni tocar `apps/web/`. No usar el nombre real de la planta.
- Duda de 30 min: preguntar al equipo. Bloqueo de 24 h: etiqueta `bloqueado`.
- Español, Chrome/Edge y celular. Audiencia universal: desde jóvenes hasta adultos mayores, con mínima fricción y pocos clics. Tono profesional, no lúdico.

## 7. Criterios de aceptación

- [ ] 3 direcciones existen y son radicalmente diferentes entre sí.
- [ ] Cada dirección tiene slogan, paleta con hex, tipografías con nombres, logo (concepto o imagen), estilo (palabras + moodboard 5–10).
- [ ] Cada dirección incluye 1 pantalla preview aplicando la marca.
- [ ] Cada decisión tiene razonamiento conectado al diferenciador de DOCU.
- [ ] Narrativa inspiración → concepto → extracción → moodboard → pantalla final.
- [ ] Presentable en universidad, sin explicación adicional de Kira.
- [ ] `bun run verify` en verde.

No es done si: se ven iguales con distintos colores; falta el porqué; no hay preview; no se entiende sin Kira.

## 8. Riesgos nombrados

Pulir estética antes de cerrar direcciones. Mitigación: baja fidelidad primero; tokens y pulido van en Fase 2. Desde el 2026-10-14 sin entrega es bloqueo.

## 9. Revisión

Martes 2026-10-13 presencial: Kira presenta las 3 direcciones a todo el equipo; el equipo elige una dirección. Fase 2 (design system, tokens) se calendariza tras la selección.

## 10. Insumos del agente

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

## 11. Recursos por actividad

### Documentos y referencias base
- Documentos del proyecto: `docs/proyecto/CASO.md`, `REQUISITOS.md`, `VISION.md`; ADR-0006, ADR-0012.
- Accesibilidad: WCAG 2.2 AA. Contraste real AA en https://coolors.co/contrast-checker — el mono de cifras también debe pasar.

### Inspiración visual (ideas, estilos, conceptos)
- [Awwwards](https://www.awwwards.com/) — Excelencia visual web. **Cuándo:** ver qué se considera mundo-clase.
- [Mobbin](https://mobbin.com/) — Patrones de producto real. **Cuándo:** ver cómo otros resuelven bandejas, tablas, filtros.
- [Land-book](https://land-book.com/) — Landing pages curadas. **Cuándo:** composición y jerarquía visual.
- [Component Gallery](https://component.gallery/) — Design systems desarmados. **Cuándo:** ver variantes de un componente.
- [Godly](https://godly.website/) — Sitios excepcionales. **Cuándo:** referencia de alto nivel para moodboards.
- [UI Sources](https://www.uisources.com/) — UI de apps reales. **Cuándo:** ver flujos completos.
- [Page Flows](https://pageflows.com/) — Flujos de navegación. **Cuándo:** ver cómo se conectan pantallas.
- [UI Patterns](https://ui-patterns.com/) — Patrones de UI. **Cuándo:** soluciones probadas.
- [One Page Love](https://onepagelove.com/) — One page sites. **Cuándo:** inspiración de una sola página.
- [Behance](https://www.behance.net/) — Portafolios de marca. **Cuándo:** ver qué hacen otros diseñadores.
- [Dribbble](https://dribbble.com/) — Shots de diseño. **Cuándo:** inspiración rápida de estilos.
- [DataHub](https://datahub.com/) / [OpenMetadata](https://open-metadata.org/) — Lineage UI. **Cuándo:** mostrar procedencia de datos (diferenciador DOCU).
- [SaaSUI](https://saasui.design/) — Gestión documental. **Cuándo:** referencia de producto documental real.

### Color y paletas (dónde ver y crear)
- [Coolors](https://coolors.co/) — Generador rápido + contraste AA. **Cuándo:** explorar paletas.
- [Adobe Color](https://color.adobe.com/) — Rueda de color + WCAG checker + daltonismo. **Cuándo:** paletas profesionales.
- [Colormind](https://colormind.io/) — Paletas por IA. **Cuándo:** inspiración automática.
- [Khroma](https://www.khroma.co/) — IA que aprende tus gustos. **Cuándo:** paletas personalizadas.
- [Pigment](https://pigment.shapefactory.co/) — Paletas con ajuste fino. **Cuándo:** refinar una elección.
- [Huemint](https://huemint.com/) — Paletas por IA para branding. **Cuándo:** armonía automática.
- [Muz.li Colors](https://colors.muz.li/) — Paletas curadas. **Cuándo:** inspiración de la comunidad.
- [UI Colors](https://uicolors.app/) — Paletas listas para Tailwind. **Cuándo:** ya hay dirección elegida.
- [OKLCH](https://oklch.com/) — Color perceptualmente uniforme. **Cuándo:** accesibilidad real.

### Tipografía (dónde ver fuentes y parejas)
- [Google Fonts](https://fonts.google.com/) — 1,700+ familias gratis. **Cuándo:** elegir display/body/mono.
- [Adobe Fonts](https://fonts.adobe.com/) — 30,000+ fuentes profesionales. **Cuándo:** tipografía premium.
- [Font Squirrel](https://www.fontsquirrel.com/) — Fuentes licenciadas. **Cuándo:** algo más exclusivo.
- [Beautiful Web Type](https://beautifulwebtype.com/) — Guía de tipografía web. **Cuándo:** ver fuentes en contexto.
- [Fontjoy](https://fontjoy.com/) — Parejas por IA. **Cuándo:** saber qué combina con qué.
- [fontpair.co](https://fontpair.co/) — Qué combina con qué. **Cuándo:** parejas tipográficas.
- [type-scale.com](https://type-scale.com/) — Escala modular. **Cuándo:** jerarquía display/body/mono.
- [WhatFont](https://www.whatfont.com/) — Identifica fuentes en webs. **Cuándo:** ver qué usa un sitio que te gusta.

### Logo y concepto (cómo crear la marca)
- [liquid-logo](https://github.com/collidingScopes/liquid-logo) (starred) — Chispa visual para concepto de logo. **Cuándo:** explorar formas orgánicas.
- [shadergradient](https://github.com/ruucm/shadergradient) (starred) — Gradientes 3D. **Cuándo:** chispa visual para marca.
- [hallmark](https://github.com/Nutlope/hallmark) (starred) — Skill anti-diseño-genérico. **Cuándo:** evitar que la marca se vea como "hecha por IA".
- [Looka](https://looka.com/) — Generador de logos. **Cuándo:** explorar conceptos rápido.
- [Brandmark](https://brandmark.io/) — Logo + paleta + tipografía. **Cuándo:** ver sistema completo de un vistazo.

### Iconos (qué set usar)
- [Lucide](https://lucide.dev/) — Open-source, consistentes. **Cuándo:** base sólida para sistema de iconos.
- [Phosphor](https://phosphoricons.com/) — Flexibles en peso. **Cuándo:** explorar densidades visuales.
- [Tabler](https://tabler.io/icons/) — Open-source, estilo distinto. **Cuándo:** alternativa a Lucide.
- [Heroicons](https://heroicons.com/) — Limpios y minimalistas. **Cuándo:** estilo simple.
- [Material Symbols](https://fonts.google.com/icons) — Set de Google. **Cuándo:** consistencia con Material.
- [Feather](https://feathericons.com/) — Minimalistas. **Cuándo:** iconos simples.

### Herramientas de diseño (dónde crear)
- [Figma](https://figma.com/) — Colaborativo, estándar. **Cuándo:** trabajar en equipo, componentes reutilizables.
- [Penpot](https://penpot.app/) (starred) — Open-source, con MCP para agentes. **Cuándo:** alternativa libre a Figma.
- [Canva](https://canva.com/) — Fácil, con Brand Kit. **Cuándo:** no eres diseñadora, armar rápido.
- [Sketch](https://sketch.com/) — Mac, tipografía precisa. **Cuándo:** eres usuaria Mac profesional.
- [OpenPencil](https://github.com/ZSeven-W/openpencil) (starred) — Vectorial con IA. **Cuándo:** alternativa open-source con agentes.
- [Glyph](https://glyph.software/) — Identidad completa por IA. **Cuándo:** ver sistema completo (logo, colores, tipo) de un vistazo.
- [Excalidraw](https://excalidraw.com/) — Diagramas rápidos. **Cuándo:** diagramar flujo o conceptos.

### Mockups rápidos con IA
- [Uizard](https://uizard.io/) — Screenshots a mockups editables. **Cuándo:** crear pantallas rápido.
- [Stitch](https://stitch.withgoogle.com/) — Google Labs, UI desde texto. **Cuándo:** iterar rápido y exportar a Figma.

### Design tokens y estándares
- [designtokens.org](https://www.designtokens.org/) — Especificación DTCG 2025.10. **Cuándo:** estructurar tokens.
- [tokens.studio](https://tokens.studio/) — Editar tokens con UI. **Cuándo:** editar visualmente.
- [style-dictionary](https://amzn.github.io/style-dictionary) — Tokens JSON → CSS/Tailwind. **Cuándo:** exportar tokens.
- [W3C Design Tokens](https://www.w3.org/community/design-tokens/) — Estándar. **Cuándo:** entender la estructura correcta.

### Recursos en español
- [Guía Impresión Tendencias 2026](https://guiaimpresion.com/las-10-tendencias-de-diseno-grafico-que-marcaran-2026) — Tendencias en español. **Cuándo:** contexto local.
- [El Publicista](https://www.elpublicista.es/diseno-y-branding) — Industria del branding en español. **Cuándo:** estar al día en hispanohablante.
