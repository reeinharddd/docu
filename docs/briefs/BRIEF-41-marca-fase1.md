# BRIEF #41-fase1 — Exploración de marca (3 direcciones)

## 0. Encabezado

- Issue: #41 (fase 1 de `Design system de marca`) / enlace: issue #41
- Dueño: Kira
- Fechas: 2026-10-12 → **2026-10-16** · Sprint 1 · hito `Cierre de diseño` (2026-10-23)
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

Pulir estética antes de cerrar direcciones. Mitigación: baja fidelidad primero; tokens y pulido van en Fase 2. Desde el 2026-10-16 sin entrega es bloqueo.

## 10. Revisión

Viernes 2026-10-16 en el sync: recorrido de 10 minutos con Erik; el equipo elige una dirección. Fase 2 (mockups hi-fi 4 pantallas, tokens, design system) se calendariza tras la selección.
