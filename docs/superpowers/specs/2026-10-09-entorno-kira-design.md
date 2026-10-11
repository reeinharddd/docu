# Spec: Entorno de diseño de kira — flujo completo

**Fecha:** 2026-10-09
**Estado:** Propuesta (pendiente de aprobación)
**Autor:** Erik (con agente)
**Rama de implementación:** `feat/<issue>-entorno-kira` (desde `main`)

---

## 1. Objetivo

Configurar el entorno de trabajo de kira para **todas** sus tareas de diseño, desde la investigación de marca hasta la construcción en `main`. El entorno debe ser:

- **Autocontenido:** cada brief lleva sus recursos, insumos e instrucciones juntos.
- **Aislado:** el playground vive en una rama que nunca se fusiona a `main`.
- **Universal:** los estándares (DESIGN.md, AGENTS.md, design-system.md) son los mismos para playground y main.
- **Lista para agentes:** un agente que lee un brief debe poder saber qué recursos usar, cuándo, y con muchas opciones.

**Por ahora:** preparar el entorno desde cero (plantillas, recursos, briefs autocontenidos). No implementar las tareas de kira aún.

## 1.1. Ciclo completo de kira — 5 briefs, 5 issues

| # | Issue | Brief | Sprint | Estado |
|---|---|---|---|---|
| 41-fase1 | Investigación marca | BRIEF-41-marca-fase1.md | 1 | ✅ |
| 42 | Playground | BRIEF-42-playground-diseno.md | 1 | ✅ |
| 11 | Prototipos UI/UX | BRIEF-11-prototipos-ui-ux.md | 1 | ✅ |
| 41-fase2 | Design system | BRIEF-41-fase2-design-system.md | 2 | ✅ |
| 4 | Frontend Angular | BRIEF-04-frontend-angular.md | 2 | ✅ |

**Flujo:** investigación → playground → prototipos → design system → frontend.

---

## 2. Restracciones

| Restricción | Fuente |
|---|---|
| El playground nunca se fusiona a `main` | ADR-0012, BRIEF-42 |
| Sin API ni BD en el playground | BRIEF-42 |
| Stack real: Angular 22 + Tailwind 4 | STACK.md, decisión de Erik |
| Los briefs no se mueven de `docs/briefs/` | Gestión de issues |
| Las plantillas existentes no se tocan | ADR-0007, decisiones previas |
| `bun run verify` en `main` no se ve afectado | Reglas del repo |
| Los recursos viven junto al brief | Decisión de Erik |
| Los insumos del agente viven en el repo, con variación playground/main | Decisión de Erik |
| `docs/diseno/` recibe solo decisiones finales purgadas | Decisión de Erik |
| Los `.txt` de `docs/diseno/` se borran si su contenido ya está en los briefs | Decisión de Erik |

---

## 3. Estructura general

### 3.1. En `main` (repo central)

```
docs/
├── briefs/                    ← BRIEF-NN.md autocontenidos (secciones 0-12)
│   ├── BRIEF-41-marca-fase1.md  ← §11 Insumos + §12 Recursos
│   ├── BRIEF-42-playground-diseno.md ← §11 Insumos + §12 Recursos
│   ├── BRIEF-11-prototipos-ui-ux.md ← §11 Insumos + §12 Recursos
│   └── [otros briefs de kira] ← §11 Insumos + §12 Recursos
├── plantillas/                ← Existen: ADR, BRIEF, CONTRATO-MODULOS, EVIDENCIA, RFC
│   ├── DESIGN.md              ← NUEVO: plantilla de insumos del agente
│   ├── AGENTS.md              ← NUEVO: plantilla de reglas de exploración
│   └── design-system.md       ← NUEVO: estándar universal de tokens y componentes
├── recursos/                  ← NUEVO: caja de herramientas por actividad
│   └── INDEX.md               ← Mapa completo por actividad
├── diseno/                    ← Decisiones finales purgadas (al promover)
│   ├── brief-kira-fase1.txt   ← BORRAR si contenido ya está en briefs
│   └── recursos-kira-fase1.txt ← BORRAR si contenido ya está en briefs
└── superpowers/
    └── specs/                 ← Este spec

.opencode/
└── skills/                    ← Skills existentes (docu-documentar, docu-gestion, etc.)
```

### 3.2. En el playground (rama aislada)

```
design/kira-playground/        ← Rama aislada, NUNCA se fusiona
├── playground/                ← Subdirectorio aislado (su propio package.json)
│   ├── src/                   ← Prototipo Angular 22 + Tailwind 4
│   ├── DESIGN.md              ← Copiado de plantilla, llenado por kira
│   ├── AGENTS.md              ← Reglas de exploración libre
│   └── tokens/                ← Paleta, tipografía, espaciado
├── docs/
│   ├── briefs/                ← Copia de los briefs autocontenidos
│   ├── recursos/              ← Caja de herramientas por actividad
│   └── diseno/                ← Decisiones y capturas
└── README.md                  ← 1 comando de arranque + no-merge documentado
```

### 3.3. Reglas de la rama

| Regla | Implementación |
|---|---|
| Nunca se fusiona a `main` | Documentado en README + protección de rama |
| Subdirectorio aislado | `playground/` con su propio `package.json` y `node_modules` |
| No toca `apps/` | El playground no importa código de `apps/` |
| `bun run verify` no se ve afectado | El playground está fuera del workspace bun |

---

## 4. Plantillas

### 4.1. `docs/plantillas/DESIGN.md`

Lo que kira llena para que un agente construya:

```markdown
# DESIGN.md — Insumos del agente

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

### 4.2. `docs/plantillas/AGENTS.md`

Reglas de exploración libre del playground:

```markdown
# AGENTS.md — Reglas del playground

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

### 4.3. `docs/plantillas/design-system.md`

Estándar universal (el mismo para playground y main):

```markdown
# design-system.md — Estándar universal

## Tokens
### Color
[Tokens de color con hex y uso]

### Tipografía
[Display, body, mono con escala]

### Espaciado
[Escala de espaciado: 4, 8, 12, 16, 24, 32, 48, 64]

### Sombras
[Sombras por elevación]

### Radios
[Radios por contexto: botones, cards, inputs]

## Componentes base
### Botón
[Variantes: primario, secundario, ghost, peligro]

### Input
[Variantes: default, error, disabled]

### Tabla
[Variantes: densa, con filtros, con paginación]

### Badge
[Variantes: éxito, error, advertencia, info]

### Modal
[Variantes: confirmación, error, info]

## Patrones de estados
| Estado | Componente | Descripción |
|---|---|---|
| Cargando | Skeleton | [Descripción] |
| Vacío | Empty state | [Descripción] |
| Error | Error state | [Descripción] |

## Accesibilidad
- Contraste AA en todos los pares texto/fondo
- Foco visible en todos los elementos interactivos
- Nombres accesibles en botones e iconos
- `prefers-reduced-motion` respetado
```

---

## 5. Caja de herramientas por actividad

Formato por recurso: **nombre, URL, descripción de 1 línea, cuándo usarlo (trigger), opciones múltiples.**

### 5.1. Investigar marca (Fase 1 — obtener ideas)

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

### 5.2. Desarrollar marca (tokens, tipografía, iconos)

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

### 5.3. Explorar en playground (iterar sin miedo)

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

### 5.4. Prototipar flujo (4 pantallas, navegación, estados)

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

### 5.5. Promover a main (verificar y purgar)

| Recurso | URL | Descripción | Cuándo usarlo |
|---|---|---|---|
| coolors.co/contrast-checker | coolors.co/contrast-checker | Contraste AA de pares | Necesitas verificar contraste |
| axe DevTools | deque.com/axe | Auditar antes del PR | Necesitas verificar accesibilidad |
| `bun run verify` | — | Gates del repo | Necesitas verificar que nada se rompe |

---

## 6. Flujo de trabajo completo de kira

### 6.1. Etapas

| # | Etapa | Brief | Recursos | Entregable |
|---|---|---|---|---|
| 1 | Investigar marca | #41-fase1 | Caja §1 | 3 direcciones con slogan, paleta, tipografía, logo, moodboard |
| 2 | Presentar y confirmar | #41-fase1 | — | Dirección elegida y confirmada |
| 3 | Desarrollar marca | #41 (fase 2) | Caja §2 | Design system con tokens |
| 4 | Playground | #42 | Caja §3 | Prototipo navegable con marca aplicada |
| 5 | Prototipar flujo | #11 | Caja §4 | Flujo subir → revisar → consultar navegable |
| 6 | Promover a main | — | Caja §5 | Decisiones purgadas y verificadas |
| 7 | Construir en main | #4 | — | Frontend Angular funcional |

### 6.2. Flujo por etapa

```
1. LLEGA EL BRIEF
   Erik avisa por mensaje o en persona. Kira abre el brief.
   El brief es autocontenido: recursos + insumos + instrucciones.

2. KIRA LLENA LOS INSUMOS
   Copia docs/plantillas/DESIGN.md → playground/DESIGN.md
   Copia docs/plantillas/AGENTS.md → playground/AGENTS.md
   Copia docs/plantillas/design-system.md → playground/
   Llena: visión, slogan, paleta, tipografías, iconos, imágenes.

3. KIRA ITERA EN EL PLAYGROUND
   Rama design/kira-playground (nunca se fusiona).
   Exploración libre: paletas, tipografías, layouts, textos.
   Sin pedir permiso de arquitectura. Sin API ni BD.
   Capturas automáticas por iteración (snapmcp).

4. EL PLAYGROUND CUMPLE SU META
   Kira decide que el prototipo está listo.
   El prototipo tiene: 4 pantallas, navegación, estados, marca.

5. PROMOCIÓN A MAIN
   Opción A: Copiar artefactos directamente a docs/diseno/.
   Opción B: Usar la plantilla para adaptar el playground a main.
   PR a docs/diseno/ con decisiones purgadas y verificadas.
   El PR lleva: DESIGN.md, design-system.md, capturas, FLUJO.md.

6. MAIN TIENE LO PURGADO
   docs/diseno/ tiene las decisiones finales de diseño.
   El frontend (#4) se construye a partir de aquí.
   El playground se borra (o se conserva como referencia).
```

### 6.3. Reglas del flujo

| Regla | Por qué |
|---|---|
| El playground nunca se fusiona a `main` | ADR-0012: no contaminar el repo central |
| Los insumos se copian de plantillas, no se inventan | Estándares universales |
| Las decisiones se promueven por PR, no directo | Trazabilidad y revisión |
| `bun run verify` en `main` no se ve afectado | El playground está aislado |
| Los recursos viven junto al brief | Kira y su agente tienen todo junto |

---

## 7. Criterios de aceptación

- [ ] Las 3 plantillas existen en `docs/plantillas/` (DESIGN.md, AGENTS.md, design-system.md)
- [ ] La caja de herramientas existe en `docs/recursos/INDEX.md` con las 5 actividades
- [ ] Los briefs tienen §11 Insumos del agente + §12 Recursos por actividad
- [ ] Los `.txt` de `docs/diseno/` se evalúan: se borran si su contenido ya está en los briefs
- [ ] El spec está aprobado por Erik
- [ ] `bun run verify` en verde

---

## 8. Fuera de alcance

- Implementar las tareas de kira (investigar, presentar, playground, prototipos)
- Construir el frontend en `main`
- Añadir lógica de negocio al playground
- Fusionar el playground a `main`
- Tocar `apps/` o el workspace bun existente

---

## 9. Referencias

- ADR-0012: No se construye producto hasta tener design system y modelo de datos validado
- BRIEF-41: Fase 1 de marca (3 direcciones)
- BRIEF-42: Playground de diseño con IA
- BRIEF-11: Prototipos UI/UX y flujo de pantallas
- STACK.md: Stack tecnológico (Angular 22 + Tailwind 4)
- Bookmarks de Brave (perfil Default, 2026-10-09)
- Starred repos: liquid-logo, shadergradient, penpot
