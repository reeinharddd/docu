# DOCU · Design system (dirección Vínculo)

> Estado: **v1.0** (tokens + componentes + pantalla de ejemplo) · lista para promoción · Issue #41 (fase 2) · Dueña: Kira · Cierre: 2026-10-23
> Nombres de tokens en inglés (regla 5 de `playground/CONSISTENCIA.md`); textos de pantalla en español.
> Fuente de verdad: `tokens.json` (DTCG 2025.10).

## 0. Acta de marca

| Campo | Registro |
|---|---|
| Dirección elegida | **3 · Vínculo** (morado y rosa): moderna, cercana, conectada |
| Motivo | El equipo buscaba una colorimetría fuera de lo común: casi todas las plataformas de datos usan colores serios (gris, negro, azul, naranja). Morado con rosa distingue a DOCU y su concepto, "cada dato con su rastro", comunica el diferenciador: ver de dónde viene cada cifra. |
| Descartadas | **1 · Reserva** (café y borgoña): elegante y de archivo. **2 · Claridad** (azul menta y verde): fresca y clínica. |
| Ajustes al elegir | Se adopta el búho documento (diseñado para Claridad) como logo; nueva tipografía (Sora para el logo, Figtree y JetBrains Mono para la interfaz). |
| Participantes | Emmanuel Valenzuela, Erik Beltrán, Ariel Rojas y Kira Garfias |
| Evidencia | PDF de Fase 1: `docs/diseno/DOCU-marca-fase1-kira.pdf` (PR #63) |

## 1. Marca

| Elemento | Valor |
|---|---|
| Dirección | 3 · Vínculo — moderna, cercana, conectada |
| Slogan | *Cada dato, con su rastro.* (alternativa: *Cada cifra, con su origen a la vista.*) |
| Logo | Búho documento (hoja con orejas, ojos rosa claro, líneas de texto) + wordmark `docu` en Sora con la "u" en rosa. *Versión final en ajuste a mano.* |
| Logo · modo claro | Cuerpo `#5B2A86` · ojos, pico y línea 1 `#F7C6DA` · pupilas `#5B2A86` · línea 2 `#B0215F` · wordmark `#5B2A86` con "u" `#B0215F` |
| Logo · modo oscuro | Cuerpo `#865FAF` (purple-500) · ojos, pico y línea 1 `#F7C6DA` · pupilas `#2E004D` · línea 2 `#F591B0` · wordmark `#C9A7F0` con "u" `#F591B0`. Contraste: cuerpo vs. fondo 3.7:1 y ojos vs. cuerpo 3.3:1 (mínimo 3:1 para gráficos, WCAG 1.4.11). |
| Mascota IA | Búho asistente, distinto del logo. *Pendiente.* Aparece solo junto a sugerencias, nunca en el sello de Oficial. |
| Regla de marca | La IA propone, una persona confirma (ADR-0006). |

## 2. Color

Todos los colores se definen en **OKLCH** con su equivalente hex. Los colores de marca aprobados en Fase 1 se conservan exactos (`purple-700` = `#5B2A86`, `pink-600` = `#B0215F`).

### 2.1 Escalas base

| Token | Hex | OKLCH |
|---|---|---|
| `purple-50` | `#F7F3FE` | `oklch(97.04% 0.0151 302.56)` |
| `purple-100` | `#EEE1FF` | `oklch(92.91% 0.0424 305.13)` |
| `purple-200` | `#DDC4FC` | `oklch(85.95% 0.0808 305.06)` |
| `purple-300` | `#C2A5E4` | `oklch(76.93% 0.0934 305.32)` |
| `purple-400` | `#A280C8` | `oklch(65.95% 0.1102 305.26)` |
| `purple-500` | `#865FAF` | `oklch(55.98% 0.1260 305.18)` |
| `purple-600` | `#6D4298` | `oklch(47.01% 0.1381 304.73)` |
| `purple-700` | `#5B2A86` | `oklch(40.03% 0.1483 305.02)` |
| `purple-800` | `#411365` | `oklch(31.05% 0.1344 305.10)` |
| `purple-900` | `#2E004D` | `oklch(24.07% 0.1250 305.07)` |
| `pink-50` | `#FFF1F4` | `oklch(97.00% 0.0156 2.66)` |
| `pink-100` | `#FEDEE6` | `oklch(92.92% 0.0368 0.96)` |
| `pink-200` | `#FFBBCE` | `oklch(85.98% 0.0817 0.57)` |
| `pink-300` | `#F591B0` | `oklch(76.97% 0.1252 0.52)` |
| `pink-400` | `#D9668D` | `oklch(65.90% 0.1492 0.65)` |
| `pink-500` | `#BF3D6F` | `oklch(56.02% 0.1706 0.73)` |
| `pink-600` | `#B0215F` | `oklch(50.52% 0.1823 0.72)` |
| `pink-700` | `#8D0A48` | `oklch(42.05% 0.1638 0.91)` |
| `pink-800` | `#5D012D` | `oklch(31.03% 0.1245 0.66)` |
| `pink-900` | `#40001D` | `oklch(24.04% 0.0974 0.50)` |
| `neutral-0` | `#FBF9FF` | `oklch(98.53% 0.0082 301.36)` |
| `neutral-50` | `#F5F2F8` | `oklch(96.52% 0.0085 308.36)` |
| `neutral-100` | `#EAE6EE` | `oklch(93.04% 0.0115 308.32)` |
| `neutral-200` | `#D9D6DE` | `oklch(88.08% 0.0113 303.09)` |
| `neutral-300` | `#BFBCC4` | `oklch(80.00% 0.0116 303.07)` |
| `neutral-400` | `#9A969E` | `oklch(67.90% 0.0124 308.26)` |
| `neutral-500` | `#76737A` | `oklch(56.05% 0.0112 305.27)` |
| `neutral-600` | `#59565E` | `oklch(45.88% 0.0133 302.85)` |
| `neutral-700` | `#413E45` | `oklch(36.94% 0.0125 305.09)` |
| `neutral-800` | `#2D2A30` | `oklch(29.06% 0.0115 308.02)` |
| `neutral-900` | `#1C191F` | `oklch(21.95% 0.0124 307.84)` |

### 2.2 Tokens semánticos (modo claro / oscuro)

Las pantallas **solo usan tokens semánticos**, nunca las escalas base directamente. Así el modo oscuro funciona sin tocar cada pantalla.

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `bg.canvas` | `#FCF8FB` | `#1A1224` | Fondo de la app |
| `bg.surface` | `#FFFFFF` | `#241A30` | Tarjetas, tablas, modales |
| `bg.subtle` | `#FBE4EE` | `#30223F` | Fondos secundarios, filas alternas |
| `bg.brand-soft` | `#F7F3FE` | `#2C1F3E` | Zonas destacadas de marca |
| `border.default` | `#EAD7E4` | `#3D2F4F` | Divisores y bordes de tarjeta |
| `border.input` | `#76737A` | `#9A8FA6` | Borde de campos (3:1 mínimo) |
| `text.primary` | `#24172F` | `#F3EAF6` | Texto principal |
| `text.secondary` | `#59565E` | `#C9BFD0` | Texto de apoyo |
| `text.muted` | `#6B6870` | `#ABA1B3` | Metadatos, ayudas |
| `text.brand` | `#5B2A86` | `#C9A7F0` | Títulos de marca, cifras |
| `text.link` | `#B0215F` | `#F591B0` | Enlaces y origen del dato |
| `text.on-brand` | `#FFFFFF` | `#1A1224` | Texto sobre botón principal |
| `action.primary` | `#5B2A86` | `#C9A7F0` | Botón principal |
| `action.primary-hover` | `#411365` | `#DDC4FC` | Botón principal (hover) |
| `focus.ring` | `#B0215F` | `#F591B0` | Anillo de foco de teclado |
| `status.official.text` | `#1F7A3A` | `#6FD08C` | Estado: ver §8 |
| `status.official.bg` | `#E4F4E8` | `#16301F` | Estado: ver §8 |
| `status.pending.text` | `#8A5300` | `#F2B35C` | Estado: ver §8 |
| `status.pending.bg` | `#FDF0DC` | `#33240E` | Estado: ver §8 |
| `status.quarantine.text` | `#A8360A` | `#FF9470` | Estado: ver §8 |
| `status.quarantine.bg` | `#FDEBE4` | `#3A1A12` | Estado: ver §8 |
| `status.ai.text` | `#5B2A86` | `#C9A7F0` | Estado: ver §8 |
| `status.ai.bg` | `#F7F3FE` | `#2C1F3E` | Estado: ver §8 |
| `status.ai.border` | `#865FAF` | `#A280C8` | Estado: ver §8 |

### 2.3 Contraste verificado (WCAG 2.2 AA)

Se verificaron **40 pares en modo claro y 40 en modo oscuro**: todo texto contra todo fondo donde puede aparecer, estados contra su fondo, y bordes de campo y foco (1.4.11, mínimo 3:1). **0 pares fallan.**

- Texto (mínimo 4.5:1): el par más bajo da **4.54:1** en claro y **5.95:1** en oscuro.
- Bordes de campo y anillo de foco (mínimo 3:1): todos lo cumplen.
- Ajuste respecto a Fase 1: el texto de cuarentena pasa de `#C2410C` a `#A8360A` para seguir pasando AA sobre su fondo tintado.

## 3. Tipografía

| Rol | Fuente | Uso |
|---|---|---|
| Logo | Sora 600 | Solo el wordmark `docu` |
| Display | Figtree 600–700 | Títulos |
| Body | Figtree 400 / 700 | Texto y negritas |
| Mono | JetBrains Mono 500 | Cifras, lotes, códigos. Siempre `tabular-nums` para alinear columnas. |

**Escala modular 1.25 (tercera mayor), base 16px:**

| Token | rem | px | Rol |
|---|---|---|---|
| `text-xs` | 0.8 | 12.8 | caption |
| `text-base` | 1 | 16 | body, body-strong, numeric |
| `text-lg` | 1.25 | 20.0 | h3 |
| `text-xl` | 1.563 | 25.0 | h2 |
| `text-2xl` | 1.953 | 31.2 | h1 |
| `text-3xl` | 2.441 | 39.1 | display, numeric-lg |
| `text-4xl` | 3.052 | 48.8 | display-lg |

Reglas: el cuerpo nunca baja de 16px; `text-xs` (12.8px) solo para metadatos, nunca para información crítica; interlineado 1.6 en texto corrido.

## 4. Espaciado

Base **4px = 0.25rem**. En Tailwind 4 basta `--spacing: 0.25rem`: `p-4` = 1rem = 16px.

| Token | rem | px |
|---|---|---|
| `space-0` | 0 | 0 |
| `space-1` | 0.25 | 4 |
| `space-2` | 0.5 | 8 |
| `space-3` | 0.75 | 12 |
| `space-4` | 1 | 16 |
| `space-5` | 1.25 | 20 |
| `space-6` | 1.5 | 24 |
| `space-8` | 2 | 32 |
| `space-10` | 2.5 | 40 |
| `space-12` | 3 | 48 |
| `space-16` | 4 | 64 |

## 5. Radios

| Token | Valor | Uso |
|---|---|---|
| `radius-sm` | 0.25rem (4px) | Etiquetas pequeñas, checkbox |
| `radius-md` | 0.5rem (8px) | Botones, campos |
| `radius-lg` | 0.75rem (12px) | Tarjetas, tablas |
| `radius-xl` | 1rem (16px) | Modales |
| `radius-full` | 9999px | Badges de estado, avatares |

## 6. Sombras

| Token | Uso |
|---|---|
| `shadow-sm` | Tarjetas en reposo |
| `shadow-md` | Menús desplegables, tarjeta en hover |
| `shadow-lg` | Modales |

Sombras tintadas con el texto de marca (`#24172F`) a baja opacidad, para que no se vean grises.

## 7. Iconos

Set recomendado: **Lucide** (lucide.dev): open source, trazo consistente y paquete oficial para Angular (`lucide-angular`). Trazo 2px, tamaño 20px en texto y 24px en botones.

## 8. Estados

| Estado | Texto | Fondo | Ícono | Regla |
|---|---|---|---|---|
| Oficial | `status.official.text` | `status.official.bg` | check | Solo cuando una persona confirmó. Muestra quién. |
| Pendiente | `status.pending.text` | `status.pending.bg` | clock | En revisión. |
| Cuarentena | `status.quarantine.text` | `status.quarantine.bg` | alert-triangle | Siempre con motivo visible. |
| Sugerido por IA | `status.ai.text` | `status.ai.bg` | sparkles + búho | Borde **punteado** `status.ai.border`. Nunca sello de Oficial. |
| Cargando | `text.secondary` | `bg.subtle` | — | Esqueleto con la forma del contenido; texto "Cargando…" para lectores de pantalla. |
| Vacío | `text.secondary` | `bg.surface` | file-up | Invita a actuar ("Sube tu primer archivo"), nunca solo "No hay datos". |
| Error | `status.quarantine.text` | `status.quarantine.bg` | circle-x | Qué pasó y qué hacer en una frase, con botón "Reintentar". |

Regla: todo estado lleva **ícono + palabra**, nunca solo color.


## 9. Componentes base

Construidos en el taller (`playground/ng/src/app/atomos/` y `moleculas/`) solo con tokens: el grep de CONSISTENCIA.md (sin hex, `rgb(` ni `px` en HTML/CSS) sale limpio. Catálogo vivo en `http://localhost:4200` con interruptor de modo oscuro. Capturas: `02-componentes-claro.png`, `03-componentes-oscuro.png`, `04-modal.png`.

### 9.0 Tokens de componente (nuevos en Fase 2)

| Token | Valor | Para qué |
|---|---|---|
| `borderWidth.1` · `.2` · `.4` | 1 · 2 · 4 px | Campos y tablas · botón secundario y foco · franja de alertas |
| `size.control.md` · `.lg` | 2.75rem (44px) · 3.25rem | Alto mínimo de botones y campos: área táctil cómoda para todo público (WCAG 2.5.8) |
| `lineHeight.tight` · `.normal` | 1.2 · 1.6 | Controles y títulos · texto corrido |
| `color.*.backdrop` | `#24172F` 55% / `#0B0712` 70% | Fondo detrás del modal |
| `color.*.logo.*` | Ver §1 | Partes del logo en claro y oscuro |

### 9.1 Botón · átomo

Uso: `<button docuButton variant="…" size="…">`. Se monta sobre `<button>` nativo para conservar teclado y lector de pantalla.

| Variante | Fondo | Texto | Cuándo |
|---|---|---|---|
| `primary` | `action.primary` | `text.on-brand` | Una acción principal por pantalla ("Confirmar dato") |
| `secondary` | `bg.surface` + borde 2 `text.brand` | `text.brand` | Acciones de apoyo ("Revisar origen") |
| `ghost` | transparente | `text.brand` | Cancelar, acciones de bajo peso |
| `danger` | `status.quarantine.text` | `text.on-brand` | Acciones que quitan un dato de lo oficial ("Mandar a cuarentena") |

Tamaños: `md` (44px de alto) y `lg` (52px). Estados: hover (`action.primary-hover` o `bg.brand-soft`), foco (anillo 2px `focus.ring`), `loading` (spinner + `aria-busy`, deshabilitado), `disabled` (`bg.subtle` + `text.muted`).

### 9.2 Campo de texto · átomo

Uso: `<docu-field label="…" hint="…" error="…" [(value)]="…">`.

- Etiqueta siempre visible (nunca solo placeholder). Si es obligatorio, lo dice con texto: "(obligatorio)".
- Ayuda y error unidos al campo con `aria-describedby`; el error marca `aria-invalid` y se muestra con ícono + texto en `status.quarantine.text`.
- Borde `border.input` (≥ 3:1), foco con anillo `focus.ring`.
- Variantes: normal, con ayuda, con error, deshabilitado, `mono` (folios, lotes y cifras en JetBrains Mono con cero rayado).

### 9.3 Badge de estado · átomo

Uso: `<docu-badge status="official" by="M. Torres" />`.

| `status` | Texto | Ícono | Regla |
|---|---|---|---|
| `official` | Oficial · *nombre* | check | Solo cuando una persona confirmó; muestra quién |
| `pending` | Pendiente | clock | En revisión |
| `quarantine` | Cuarentena | alert-triangle | Siempre acompañado del motivo en la pantalla |
| `ai` | Sugerido por IA | sparkle | Borde punteado; nunca sustituye a Oficial |

Forma de píldora (`radius.full`), siempre ícono + palabra.

### 9.4 Alerta · átomo

Uso: `<docu-alert tone="…" heading="…" dismissible>`.

| `tone` | Colores | Rol ARIA | Ejemplo |
|---|---|---|---|
| `info` | `text.brand` / `bg.brand-soft` | `status` | "Nueva versión del programa" |
| `success` | `status.official` | `status` | "Dato confirmado" |
| `warning` | `status.pending` | `alert` | "Pendiente de revisión" |
| `danger` | `status.quarantine` | `alert` | "No se pudo leer el archivo" + qué hacer |
| `ai` | `status.ai` + contorno punteado | `status` | "El búho sugiere…" |

Franja lateral de 4px del color del tono, título opcional y botón de cerrar opcional con `aria-label`.

### 9.5 Tabla · molécula

Uso: `<docu-table caption="…" [columns]="…" [rows]="…" [loading] emptyTitle="…">`.

- Tipos de columna: `text`, `number` (a la derecha, mono, números tabulares, formato es-MX), `mono` (archivos y códigos), `status` (usa el badge).
- `<caption>` visible y `th scope="col"`; filas alternas `bg.canvas`, hover `bg.brand-soft`.
- Estados: **cargando** (filas esqueleto + aviso "Cargando…" para lector de pantalla), **vacío** (título + invitación a actuar), **con datos**. Valor vacío se muestra como "—".
- En pantallas angostas la tabla se desplaza horizontalmente dentro de su marco, sin romper la página.

### 9.6 Modal · molécula

Uso: `<docu-modal heading="…" [(open)]="…">` contenido `<div modalFooter>` botones `</div>`.

- Sobre `<dialog>` nativo: atrapa el foco, cierra con Esc o clic fuera y devuelve el foco al botón que lo abrió.
- Título enlazado con `aria-labelledby`; botón de cerrar con `aria-label`.
- Pie con acciones a la derecha: la principal al final. Ejemplo validado: "Mandar a cuarentena" exige motivo antes de confirmar.
- `radius.xl`, `shadow.lg`, fondo `color.backdrop`.

### 9.7 Íconos

Subconjunto de Lucide dibujado en el taller para no agregar dependencias (check, clock, alert-triangle, sparkle, info, x, circle-x, circle-check, upload, moon). En #4 se reemplaza por `lucide-angular` con los mismos nombres.

## 10. Aplicación al flujo (#11)

Pantalla de ejemplo construida con los componentes base: **Bandeja de recepción** (`/bandeja`), primer paso de revisión del flujo subir → revisar → consultar.

| Campo | Contrato |
|---|---|
| Ruta | `/bandeja` (`playground/ng/src/app/pantallas/bandeja/`) |
| Muestra | Recepciones por revisar con hora, dato, cifra, documento de origen y estado (con quién confirmó) |
| Acciones | **Confirmar** → pasa a Oficial con el nombre de quien confirmó (en #11 redirige a `/programa`) · **Cuarentena** → modal con motivo obligatorio · **Buscar** → filtra; sin resultados muestra estado vacío · **Subir archivo** → en #11 lleva a `/captura` |
| Reusados | botón, campo, badge, alerta, íconos, tabla (con acciones por fila), modal |
| Creados | Solo la pantalla. La tabla ganó dos opciones genéricas: acciones por fila (`#rowActions`) y nombre de quien confirmó en el badge (`byKey`) |

Prototipo sin API ni BD: datos de ejemplo en memoria. Las otras tres pantallas (captura, programa oficial, búsqueda) se construyen en #11 con los mismos componentes.

**Capturas** (`docs/diseno/capturas/`):

| Archivo | Muestra |
|---|---|
| `01-tokens-antes.png` · `01-tokens-despues.png` | Paleta temporal → Vínculo en el taller |
| `02-componentes-claro.png` · `03-componentes-oscuro.png` | Catálogo de componentes en ambos modos |
| `04-modal.png` | Modal de cuarentena con validación |
| `05-bandeja-claro.png` · `06-bandeja-oscuro.png` | Pantalla de ejemplo en ambos modos |
| `07-bandeja-celular.png` | Pantalla de ejemplo en ancho de celular |

## 11. Archivos

| Archivo | Dónde | Contenido |
|---|---|---|
| `DESIGN-SYSTEM.md` | `docs/diseno/` (main) | Este documento |
| `tokens.json` | `docs/diseno/` (main) y `playground/tokens/` | Fuente de verdad, DTCG 2025.10. #4 lo mapea a `@theme` de Tailwind 4 en `apps/web` cuando arranque. |
| `tokens.css` | Solo `playground/tokens/` | Variables CSS del taller (claro/oscuro). No viaja a main. |
| `capturas/` | `docs/diseno/capturas/` (main) | Evidencia antes/después, componentes y pantalla de ejemplo |
