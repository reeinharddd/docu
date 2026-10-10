# Entorno de diseño de kira — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Configurar el entorno de trabajo de kira: plantillas de insumos, caja de herramientas por actividad, y briefs autocontenidos.

**Architecture:** Tres plantillas universales en `docs/plantillas/` (DESIGN.md, AGENTS.md, design-system.md) + caja de herramientas en `docs/recursos/INDEX.md` + briefs de kira extendidos con §11 Insumos y §12 Recursos. El playground (rama aislada) se prepara cuando kira arranque su primera tarea.

**Tech Stack:** Markdown, docs del repo.

**Spec:** `docs/superpowers/specs/2026-10-09-entorno-kira-design.md`

## Global Constraints

- Los briefs no se mueven de `docs/briefs/`
- Las plantillas existentes no se tocan
- `bun run verify` en verde al final
- Los recursos viven junto al brief
- Los `.txt` de `docs/diseno/` se evalúan: se borran si su contenido ya está en los briefs

## Review Focus

- Las plantillas deben ser universales (mismas para playground y main)
- Los recursos deben tener formato de agente (nombre, URL, descripción, cuándo usarlo, opciones)
- Los briefs extendidos no deben romper las secciones 0-10 existentes
- La caja de herramientas debe cubrir las 5 actividades del flujo de kira

---

### Task 1: Crear plantilla DESIGN.md

**Files:**
- Create: `docs/plantillas/DESIGN.md`

**Interfaces:**
- Consumes: nada
- Produce: `docs/plantillas/DESIGN.md` — plantilla de insumos del agente

- [ ] **Step 1: Crear `docs/plantillas/DESIGN.md`**

Contenido:

```markdown
# DESIGN.md — Insumos del agente

> Plantilla universal. Copiar a `playground/DESIGN.md` y llenar.
> Mismo estándar para playground y main.

## Visión
[1 párrafo: qué es el producto, para quién, por qué]

## Slogan
[Frase corta que resume la marca]

## Paleta
| Token | Hex | Uso |
|---|---|---|
| primario | #XXXXXX | Botones, acciones principales |
| secundario | #XXXXXX | Acentos, highlights |
| acento | #XXXXXX | CTAs, éxitos |
| neutro-100 | #XXXXXX | Fondos |
| neutro-900 | #XXXXXX | Texto |
| éxito | #XXXXXX | Confirmaciones |
| error | #XXXXXX | Errores |
| advertencia | #XXXXXX | Alertas |

## Tipografías
| Rol | Nombre | Por qué |
|---|---|---|
| Display | [Nombre] | [Razón] |
| Body | [Nombre] | [Razón] |
| Mono | [Nombre] | [Razón — crítico para cifras] |

## Iconos
- Set: [Lucide / Phosphor / Tabler]
- Por qué: [Razón]

## Imágenes
- Logo: [archivo o "no aplica"]
- Ilustraciones: [archivo o "no aplica"]
- Fotos: [archivo o "no aplica"]

## Estados
| Estado | Descripción |
|---|---|
| Cargando | [Descripción] |
| Vacío | [Descripción] |
| Error | [Descripción] |
| Cuarentena | [Descripción] |
| Confirmado | [Descripción] |
```

- [ ] **Step 2: Verificar que el archivo existe**

Run: `ls docs/plantillas/DESIGN.md`
Expected: archivo existe

- [ ] **Step 3: Commit**

```bash
git add docs/plantillas/DESIGN.md
git commit -m "docs: plantilla DESIGN.md para insumos del agente"
```

---

### Task 2: Crear plantilla AGENTS.md

**Files:**
- Create: `docs/plantillas/AGENTS.md`

**Interfaces:**
- Consumes: nada
- Produce: `docs/plantillas/AGENTS.md` — plantilla de reglas de exploración

- [ ] **Step 1: Crear `docs/plantillas/AGENTS.md`**

Contenido:

```markdown
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
- Arranque: `cd playground && bun install && bun run start`
- Captura: `bun run capture` (snapmcp)
- Verificación: `bun run verify` (en main, no aquí)
```

- [ ] **Step 2: Verificar que el archivo existe**

Run: `ls docs/plantillas/AGENTS.md`
Expected: archivo existe

- [ ] **Step 3: Commit**

```bash
git add docs/plantillas/AGENTS.md
git commit -m "docs: plantilla AGENTS.md para reglas del playground"
```

---

### Task 3: Crear plantilla design-system.md

**Files:**
- Create: `docs/plantillas/design-system.md`

**Interfaces:**
- Consumes: nada
- Produce: `docs/plantillas/design-system.md` — estándar universal de tokens y componentes

- [ ] **Step 1: Crear `docs/plantillas/design-system.md`**

Contenido:

```markdown
# design-system.md — Estándar universal

> Plantilla universal. Mismo estándar para playground y main.
> Los tokens aquí definidos alimentan Tailwind 4 (@theme).

## Tokens

### Color
| Token | Hex | Uso |
|---|---|---|
| primario | #XXXXXX | Botones, acciones principales |
| secundario | #XXXXXX | Acentos, highlights |
| acento | #XXXXXX | CTAs, éxitos |
| neutro-100 | #XXXXXX | Fondos |
| neutro-900 | #XXXXXX | Texto |
| éxito | #XXXXXX | Confirmaciones |
| error | #XXXXXX | Errores |
| advertencia | #XXXXXX | Alertas |

### Tipografía
| Rol | Nombre | Tamaño base | Line-height |
|---|---|---|---|
| Display | [Nombre] | 48px | 1.1 |
| Body | [Nombre] | 16px | 1.5 |
| Mono | [Nombre] | 14px | 1.4 |

### Espaciado
| Token | Valor |
|---|---|
| xs | 4px |
| sm | 8px |
| md | 16px |
| lg | 24px |
| xl | 32px |
| 2xl | 48px |
| 3xl | 64px |

### Sombras
| Token | Valor |
|---|---|
| sm | 0 1px 2px rgba(0,0,0,0.05) |
| md | 0 4px 6px rgba(0,0,0,0.1) |
| lg | 0 10px 15px rgba(0,0,0,0.1) |

### Radios
| Token | Valor |
|---|---|
| sm | 4px |
| md | 8px |
| lg | 12px |
| full | 9999px |

## Componentes base

### Botón
| Variante | Uso |
|---|---|
| primario | Acciones principales |
| secundario | Acciones secundarias |
| ghost | Acciones terciarias |
| peligro | Acciones destructivas |

### Input
| Variante | Uso |
|---|---|
| default | Entrada normal |
| error | Entrada con error |
| disabled | Entrada deshabilitada |

### Tabla
| Variante | Uso |
|---|---|
| densa | Muchas filas, poco espacio |
| con-filtros | Filtrable por columnas |
| con-paginación | Paginada |

### Badge
| Variante | Uso |
|---|---|
| éxito | Confirmaciones |
| error | Errores |
| advertencia | Alertas |
| info | Información |

### Modal
| Variante | Uso |
|---|---|
| confirmación | Confirmar acción |
| error | Mostrar error |
| info | Mostrar información |

## Patrones de estados
| Estado | Componente | Descripción |
|---|---|---|
| Cargando | Skeleton | Placeholder animado |
| Vacío | Empty state | Mensaje + acción |
| Error | Error state | Mensaje + reintento |

## Accesibilidad
- Contraste AA en todos los pares texto/fondo
- Foco visible en todos los elementos interactivos
- Nombres accesibles en botones e iconos
- `prefers-reduced-motion` respetado
```

- [ ] **Step 2: Verificar que el archivo existe**

Run: `ls docs/plantillas/design-system.md`
Expected: archivo existe

- [ ] **Step 3: Commit**

```bash
git add docs/plantillas/design-system.md
git commit -m "docs: plantilla design-system.md estándar universal"
```

---

### Task 4: Crear caja de herramientas

**Files:**
- Create: `docs/recursos/INDEX.md`

**Interfaces:**
- Consume: nada
- Produce: `docs/recursos/INDEX.md` — caja de herramientas por actividad

- [ ] **Step 1: Crear `docs/recursos/INDEX.md`**

Contenido:

```markdown
# Caja de herramientas por actividad

> Recursos curados para kira y su agente. Formato: nombre, URL, descripción, cuándo usarlo, opciones.
> Organizado por actividad del flujo de kira.

## 1. Investigar marca (Fase 1 — obtener ideas)

| Recurso | URL | Descripción | Cuándo usarlo |
|---|---|---|---|
| Awwwards | awwwards.com | Excelencia visual web | Necesitas ver qué se considera mundo-clase |
| Mobbin | mobbin.com | Patrones de producto real | Necesitas ver cómo otros resuelven bandejas, tablas, filtros |
| Land-book | land-book.com | Inspiración de landing pages | Necesitas composición y jerarquía visual |
| Component Gallery | component.gallery | Componentes y patrones | Necesitas ver variantes de un componente |
| Godly | godly.website | Sitios web excepcionales | Necesitas referencia de alto nivel |
| UI Sources | uisources.com | UI de apps reales | Necesitas ver flujos completos |
| Page Flows | pageflows.com | Flujos de navegación | Necesitas ver cómo se conectan pantallas |
| UI Patterns | ui-patterns.com | Patrones de UI | Necesitas soluciones probadas |
| One Page Love | onepagelove.com | One page sites | Necesitas inspiración de una sola página |
| Spline | spline.design | 3D y diseño | Necesitas elementos 3D o interactivos |
| Recent.design | recent.design | Diseño reciente | Necesitas ver tendencias actuales |
| Skiper UI | skiper-ui.com | UI kit | Necesitas componentes de UI |
| Bklit | bklit.com | UI | Necesitas inspiración de UI |
| KokonutUI | kokonutui.com | UI | Necesitas componentes de UI |
| Originkit | originkit.dev | UI kit | Necesitas componentes de UI |
| posts.design | posts.design | Posts de diseño | Necesitas inspiración visual |
| HTMLrev | htmlrev.com | Templates HTML | Necesitas estructuras de página |
| Book of Shapes | bookofshapes.com | Formas y patrones | Necesitas formas geométricas |
| Behance | behance.net | Branding y diseño | Necesitas branding de marca |
| DataHub | datahub.com | Lineage UI | Necesitas mostrar procedencia de datos |
| OpenMetadata | open-metadata.org | Lineage UI | Necesitas mostrar procedencia de datos |
| SaaSUI | saasui.design | Producto documental | Necesitas referencia de gestión documental |
| Weill Cornell | weill.cornell.edu | Branding médico | Necesitas tono profesional de salud |
| Utah Health | healthcare.utah.edu | Branding médico | Necesitas tono profesional de salud |
| Stony Brook | stonybrook.edu | Branding médico | Necesitas tono profesional de salud |
| Respira | respira.com | Branding médico | Necesitas tono profesional de salud |
| Medline | medline.com | Branding médico | Necesitas tono profesional de salud |

## 2. Desarrollar marca (tokens, tipografía, iconos)

| Recurso | URL | Descripción | Cuándo usarlo |
|---|---|---|---|
| Coolors | coolors.co | Paletas + contraste AA | Necesitas explorar paletas |
| OKLCH | oklch.com | Color con accesibilidad real | Necesitas verificar contraste perceptualmente uniforme |
| Pigment | pigment.shapefactory.co | Paletas generativas | Necesitas variaciones de una paleta base |
| Huemint | huemint.com | Paletas por IA | Necesitas armonía automática |
| Muz.li | colors.muz.li | Colores | Necesitas inspiración de color |
| UI Colors | uicolors.app | Lista Tailwind | Necesitas ver colores Tailwind |
| csstools | csstools.io | Paletas | Necesitas generar paletas |
| CoolHue | webgradients.com | Gradientes | Necesitas gradientes |
| UI Gradients | uigradients.com | Gradientes | Necesitas gradientes |
| Gradient Hunt | gradienthunt.com | Gradientes | Necesitas gradientes |
| Mesher | mesher.madewithlove.com | Gradientes | Necesitas gradientes |
| CSS-Tricks Shadow | css-tricks.com/shadow-palette-generator | Sombras | Necesitas sombras |
| Google Fonts | fonts.google.com | Tipografías | Necesitas tipografía display/body/mono |
| Font Squirrel | fontsquirrel.com | Tipografías curadas | Necesitas tipografía de calidad |
| Beautiful Web Type | beautifulwebtype.com | Tipografía web | Necesitas ver tipografías en contexto |
| fontpair.co | fontpair.co | Parejas tipográficas | Necesitas saber qué combina con qué |
| type-scale.com | type-scale.com | Escala modular | Necesitas jerarquía tipográfica |
| Lucide | lucide.dev | Iconos | Necesitas set de iconos |
| Phosphor | phosphoricons.com | Iconos | Necesitas set de iconos |
| Tabler | tabler.io/icons | Iconos | Necesitas set de iconos |
| Heroicons | heroicons.com | Iconos | Necesitas set de iconos |
| Material Symbols | fonts.google.com/icons | Iconos | Necesitas set de iconos |
| Fluent | github.com/microsoft/fluentui-system-icons | Iconos | Necesitas set de iconos |
| Simple Icons | simpleicons.org | Iconos | Necesitas set de iconos |
| Feather | feathericons.com | Iconos | Necesitas set de iconos |
| Bootstrap Icons | icons.getbootstrap.com | Iconos | Necesitas set de iconos |
| designtokens.org | designtokens.org | Especificación DTCG | Necesitas estructurar tokens |
| style-dictionary | amzn.github.io/style-dictionary | Tokens JSON → CSS/Tailwind | Necesitas exportar tokens |
| tokens.studio | tokens.studio | Editar tokens con UI | Necesitas editar tokens visualmente |

## 3. Explorar en playground (iterar sin miedo)

| Recurso | URL | Descripción | Cuándo usarlo |
|---|---|---|---|
| shadcn/ui | ui.shadcn.com | Patrones de componentes | Necesitas componentes de calidad |
| daisyUI | daisyui.com | Componentes Tailwind | Necesitas componentes simples |
| Flowbite | flowbite.com | Componentes Tailwind | Necesitas componentes completos |
| HyperUI | hyperui.dev | Componentes Tailwind | Necesitas componentes Tailwind |
| Preline | preline.co | Componentes Tailwind | Necesitas componentes Tailwind |
| Cruip | codepen.io/cruip | Componentes Tailwind | Necesitas componentes Tailwind |
| Mamba UI | mambaui.com | Componentes Tailwind | Necesitas componentes Tailwind |
| Flowrift | flowrift.com | Componentes Tailwind | Necesitas componentes Tailwind |
| ReadymadeUI | readymadeui.com | Componentes Tailwind | Necesitas componentes Tailwind |
| Creative Tim | creative-tim.com/twcomponents | Componentes Tailwind | Necesitas componentes Tailwind |
| Meraki UI | merakiui.com | Componentes Tailwind | Necesitas componentes Tailwind |
| FlyonUI | flyonui.com | Componentes Tailwind | Necesitas componentes Tailwind |
| TUK | tuk.dev | Componentes Tailwind | Necesitas componentes Tailwind |
| Tailwind UI | tailwindui.com | Componentes Tailwind | Necesitas componentes Tailwind |
| Tailwind Elements | tailwind-elements.com | Componentes Tailwind | Necesitas componentes Tailwind |
| Sailboat UI | sailboatui.com | Componentes Tailwind | Necesitas componentes Tailwind |
| Kutty | kutty.netlify.app | Componentes Tailwind | Necesitas componentes Tailwind |
| Ripple UI | rippleui.com | Componentes Tailwind | Necesitas componentes Tailwind |
| Sira | sira.dev | Componentes Tailwind | Necesitas componentes Tailwind |
| Magic UI | magicui.design | Componentes Tailwind | Necesitas componentes Tailwind |
| Aceternity | ui.aceternity.com | Componentes Tailwind | Necesitas componentes Tailwind |
| Tailspark | tailspark.co | Componentes Tailwind | Necesitas componentes Tailwind |
| PrimeNG | primeng.org | UI kit Angular | Necesitas componentes Angular |
| Angular Material | material.angular.io | UI kit Angular | Necesitas Material Design |
| NG-ZORRO | ng.ant.design | UI kit Angular | Necesitas Ant Design para Angular |
| Clarity | clarity.design | UI kit Angular | Necesitas componentes Angular |
| Taiga UI | taiga-ui.dev | UI kit Angular | Necesitas alternativa ligera |
| AG Grid | ag-grid.com/angular-data-grid | Tablas densas | Necesitas tablas con filtros, orden, paginación |
| Kendo UI | telerik.com/kendo-angular-ui | UI kit Angular | Necesitas componentes Angular |
| Syncfusion | syncfusion.com/angular-components | UI kit Angular | Necesitas componentes Angular |
| NGX Bootstrap | valor-software.com/ngx-bootstrap | UI kit Angular | Necesitas Bootstrap para Angular |
| Nebular | akveo.github.io/nebular | UI kit Angular | Necesitas componentes Angular |
| Ionic | ionicframework.com | UI kit Angular | Necesitas componentes Angular |
| motion.dev | motion.dev | Animación con respeto | Necesitas animar transiciones |
| Animista | animista.net | Animaciones CSS | Necesitas animaciones predefinidas |
| Keyframes | keyframes.app | Animaciones CSS | Necesitas animaciones CSS |
| Cubic Bezier | cubic-bezier.com | Curvas de easing | Necesitas curvas de animación |
| CSS Layout Generator | layout.bradwoods.io | Layouts CSS | Necesitas generar layouts |
| Flexbox Froggy | flexboxfroggy.com | Aprender Flexbox | Necesitas practicar Flexbox |
| Grid Garden | cssgridgarden.com | Aprender Grid | Necesitas practicar Grid |
| Clippy | bennettfeely.com/clippy | Clip-path | Necesitas formas con clip-path |
| Fancy Border Radius | 9elements.github.io/fancy-border-radius | Bordes | Necesitas bordes redondeados |
| CSS Scan | getcssscan.com | CSS | Necesitas escanear CSS |
| Box Shadows | ui.aceternity.com/tools/box-shadows | Sombras | Necesitas sombras |

## 4. Prototipar flujo (4 pantallas, navegación, estados)

| Recurso | URL | Descripción | Cuándo usarlo |
|---|---|---|---|
| lawsofux.com | lawsofux.com | Leyes: Hick, Miller, proximidad | Necesitas justificar decisiones de UI |
| nngroup.com | nngroup.com | Heurísticas, densidad de datos | Necesitas evaluar usabilidad |
| baymard.com | baymard.com | Checkout, errores, confirmaciones | Necesitas diseñar flujos de confirmación |
| Frontend Practice | frontendpractice.com | Formularios que no cansan | Necesitas diseñar formularios |
| FreeFrontend | freefrontend.com | Formularios CSS | Necesitas formularios |
| unDraw | undraw.co | Ilustraciones | Necesitas ilustraciones para vacío/error |
| Open Peeps | openpeeps.com | Ilustraciones | Necesitas ilustraciones para vacío/error |
| Flowbite Illustrations | flowbite.com/illustrations | Ilustraciones | Necesitas ilustraciones |
| Pixabay | pixabay.com | Imágenes | Necesitas imágenes |
| screensiz.es | screensiz.es | Viewports reales | Necesitas verificar tamaños de pantalla |
| Excalidraw | excalidraw.com | Diagramar el flujo | Necesitas diagramar navegación |
| GitMind | gitmind.com | Diagramar | Necesitas diagramas |
| JSON Crack | jsoncrack.com | JSON | Necesitas visualizar JSON |
| W3C WCAG 2.2 | w3.org/WAI/WCAG22/quickref | Criterios AA exactos | Necesitas verificar accesibilidad |
| axe DevTools | deque.com/axe | Verificación automática | Necesitas auditar accesibilidad |

## 5. Promover a main (verificar y purgar)

| Recurso | URL | Descripción | Cuándo usarlo |
|---|---|---|---|
| coolors.co/contrast-checker | coolors.co/contrast-checker | Contraste AA de pares | Necesitas verificar contraste |
| axe DevTools | deque.com/axe | Auditar antes del PR | Necesitas verificar accesibilidad |
| `bun run verify` | — | Gates del repo | Necesitas verificar que nada se rompe |
```

- [ ] **Step 2: Verificar que el archivo existe**

Run: `ls docs/recursos/INDEX.md`
Expected: archivo existe

- [ ] **Step 3: Commit**

```bash
git add docs/recursos/INDEX.md
git commit -m "docs: caja de herramientas por actividad"
```

---

### Task 5: Extender BRIEF-41 con §11/§12

**Files:**
- Modify: `docs/briefs/BRIEF-41-marca-fase1.md`

**Interfaces:**
- Consume: `docs/recursos/INDEX.md` (Task 4)
- Produce: BRIEF-41 con §11 Insumos del agente + §12 Recursos por actividad

- [ ] **Step 1: Añadir §11 y §12 al final de BRIEF-41**

Añadir después de la sección 10:

```markdown
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
```

- [ ] **Step 2: Verificar que las secciones 0-10 no cambiaron**

Run: `grep -c "^## " docs/briefs/BRIEF-41-marca-fase1.md`
Expected: 13 (secciones 0-12)

- [ ] **Step 3: Commit**

```bash
git add docs/briefs/BRIEF-41-marca-fase1.md
git commit -m "docs: BRIEF-41 extendido con insumos y recursos"
```

---

### Task 6: Extender BRIEF-42 con §11/§12

**Files:**
- Modify: `docs/briefs/BRIEF-42-playground-diseno.md`

**Interfaces:**
- Consume: `docs/recursos/INDEX.md` (Task 4)
- Produce: BRIEF-42 con §11 Insumos del agente + §12 Recursos por actividad

- [ ] **Step 1: Añadir §11 y §12 al final de BRIEF-42**

Añadir después de la sección 10:

```markdown
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

### Explorar en playground
- [shadcn/ui](https://ui.shadcn.com/) — Patrones de componentes. **Cuándo:** necesitas componentes de calidad.
- [daisyUI](https://daisyui.com/) — Componentes Tailwind. **Cuándo:** necesitas componentes simples.
- [Flowbite](https://flowbite.com/) — Componentes Tailwind. **Cuándo:** necesitas componentes completos.
- [PrimeNG](https://primeng.org/) — UI kit Angular. **Cuándo:** necesitas componentes Angular.
- [Angular Material](https://material.angular.io/) — UI kit Angular. **Cuándo:** necesitas Material Design.
- [Taiga UI](https://taiga-ui.dev/) — UI kit Angular. **Cuándo:** necesitas alternativa ligera.
- [AG Grid](https://www.ag-grid.com/angular-data-grid/) — Tablas densas. **Cuándo:** necesitas tablas con filtros, orden, paginación.
- [motion.dev](https://motion.dev/) — Animación con respeto. **Cuándo:** necesitas animar transiciones.
- [Animista](https://animista.net/) — Animaciones CSS. **Cuándo:** necesitas animaciones predefinidas.
- [CSS Layout Generator](https://layout.bradwoods.io/) — Layouts CSS. **Cuándo:** necesitas generar layouts.
- [Flexbox Froggy](https://flexboxfroggy.com/) / [Grid Garden](https://cssgridgarden.com/) — Aprender CSS jugando. **Cuándo:** necesitas practicar CSS.
```

- [ ] **Step 2: Verificar que las secciones 0-10 no cambiaron**

Run: `grep -c "^## " docs/briefs/BRIEF-42-playground-diseno.md`
Expected: 13 (secciones 0-12)

- [ ] **Step 3: Commit**

```bash
git add docs/briefs/BRIEF-42-playground-diseno.md
git commit -m "docs: BRIEF-42 extendido con insumos y recursos"
```

---

### Task 7: Extender BRIEF-11 con §11/§12

**Files:**
- Modify: `docs/briefs/BRIEF-11-prototipos-ui-ux.md`

**Interfaces:**
- Consume: `docs/recursos/INDEX.md` (Task 4)
- Produce: BRIEF-11 con §11 Insumos del agente + §12 Recursos por actividad

- [ ] **Step 1: Añadir §11 y §12 al final de BRIEF-11**

Añadir después de la sección 10:

```markdown
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

### Prototipar flujo
- [lawsofux.com](https://lawsofux.com/) — Leyes: Hick, Miller, proximidad. **Cuándo:** necesitas justificar decisiones de UI.
- [nngroup.com](https://www.nngroup.com/) — Heurísticas, densidad de datos. **Cuándo:** necesitas evaluar usabilidad.
- [baymard.com](https://baymard.com/) — Checkout, errores, confirmaciones. **Cuándo:** necesitas diseñar flujos de confirmación.
- [Frontend Practice](https://www.frontendpractice.com/) — Formularios que no cansan. **Cuándo:** necesitas diseñar formularios.
- [unDraw](https://undraw.co/) / [Open Peeps](https://openpeeps.com/) — Ilustraciones. **Cuándo:** necesitas ilustraciones para vacío/error.
- [screensiz.es](https://screensiz.es/) — Viewports reales. **Cuándo:** necesitas verificar tamaños de pantalla.
- [Excalidraw](https://excalidraw.com/) — Diagramar el flujo. **Cuándo:** necesitas diagramar navegación.
- [W3C WCAG 2.2](https://www.w3.org/WAI/WCAG22/quickref/) — Criterios AA exactos. **Cuándo:** necesitas verificar accesibilidad.
- [axe DevTools](https://www.deque.com/axe/) — Verificación automática. **Cuándo:** necesitas auditar accesibilidad.
```

- [ ] **Step 2: Verificar que las secciones 0-10 no cambiaron**

Run: `grep -c "^## " docs/briefs/BRIEF-11-prototipos-ui-ux.md`
Expected: 13 (secciones 0-12)

- [ ] **Step 3: Commit**

```bash
git add docs/briefs/BRIEF-11-prototipos-ui-ux.md
git commit -m "docs: BRIEF-11 extendido con insumos y recursos"
```

---

### Task 8: Evaluar .txt en docs/diseno/

**Files:**
- Modify: `docs/diseno/brief-kira-fase1.txt`, `docs/diseno/recursos-kira-fase1.txt`

**Interfaces:**
- Consume: briefs existentes
- Produce: decisión documentada sobre los .txt

- [ ] **Step 1: Leer los dos .txt y comparar con los briefs**

Run: `cat docs/diseno/brief-kira-fase1.txt`
Run: `cat docs/diseno/recursos-kira-fase1.txt`

- [ ] **Step 2: Decidir: borrar o conservar**

Si el contenido ya está en los briefs (o en las nuevas plantillas/recursos):
```bash
git rm docs/diseno/brief-kira-fase1.txt docs/diseno/recursos-kira-fase1.txt
git commit -m "docs: eliminar borradores de fase 1 (contenido en briefs)"
```

Si tiene contenido único que no está en los briefs: conservar y documentar en el PR.

- [ ] **Step 3: Verificar estado de docs/diseno/**

Run: `ls docs/diseno/`
Expected: solo archivos con contenido único (o vacío si todo se borró)

---

### Task 9: Verificación final

**Files:**
- Ninguno (verificación)

**Interfaces:**
- Consume: todas las tasks anteriores

- [ ] **Step 1: Verificar que las plantillas existen**

Run: `ls docs/plantillas/DESIGN.md docs/plantillas/AGENTS.md docs/plantillas/design-system.md`
Expected: 3 archivos existen

- [ ] **Step 2: Verificar que la caja de herramientas existe**

Run: `ls docs/recursos/INDEX.md`
Expected: archivo existe

- [ ] **Step 3: Verificar que los briefs están extendidos**

Run: `grep -c "^## " docs/briefs/BRIEF-41-marca-fase1.md docs/briefs/BRIEF-42-playground-diseno.md docs/briefs/BRIEF-11-prototipos-ui-ux.md`
Expected: 13 en cada uno

- [ ] **Step 4: Verificar que las plantillas existentes no se tocaron**

Run: `ls docs/plantillas/ADR.md docs/plantillas/BRIEF.md docs/plantillas/CONTRATO-MODULOS.md docs/plantillas/EVIDENCIA.md docs/plantillas/RFC.md`
Expected: 5 archivos existen

- [ ] **Step 5: Verificar que los briefs no se movieron**

Run: `ls docs/briefs/`
Expected: 13 briefs existen

- [ ] **Step 6: Verificar bun run verify en verde**

Run: `bun run verify`
Expected: verde

- [ ] **Step 7: Commit final (si hay cambios pendientes)**

```bash
git add -A
git commit -m "docs: entorno de kira verificado"
```
