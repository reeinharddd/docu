# design-system.md — Estándar universal

> Plantilla universal. Mismo estándar para playground y main.
> Estándares: DTCG 2025.10, Tailwind 4 @theme, OKLCH, WCAG 2.2 AA.
> Los tokens aquí definidos alimentan Tailwind 4 (@theme).

## 1. Tokens (DTCG 2025.10)

### 1.1. Color

> OKLCH perceptualmente uniforme. Hex solo como referencia para herramientas legacy.

| Token | OKLCH | Hex | Uso | Contraste AA |
|---|---|---|---|---|
| primario | oklch(L C H) | #XXXXXX | Botones, acciones principales | [par texto/fondo] |
| secundario | oklch(L C H) | #XXXXXX | Acentos, highlights | [par texto/fondo] |
| acento | oklch(L C H) | #XXXXXX | CTAs, éxitos | [par texto/fondo] |
| neutro-100 | oklch(L C H) | #XXXXXX | Fondos | [par texto/fondo] |
| neutro-200 | oklch(L C H) | #XXXXXX | Bordes sutiles | [par texto/fondo] |
| neutro-300 | oklch(L C H) | #XXXXXX | Bordes | [par texto/fondo] |
| neutro-700 | oklch(L C H) | #XXXXXX | Texto secundario | [par texto/fondo] |
| neutro-900 | oklch(L C H) | #XXXXXX | Texto principal | [par texto/fondo] |
| éxito | oklch(L C H) | #XXXXXX | Confirmaciones | [par texto/fondo] |
| error | oklch(L C H) | #XXXXXX | Errores | [par texto/fondo] |
| advertencia | oklch(L C H) | #XXXXXX | Alertas | [par texto/fondo] |

**Regla WCAG 2.2 AA:** contraste ≥ 4.5:1 (texto normal < 18px) o ≥ 3:1 (texto grande ≥ 18px o ≥ 14px bold). Verificar con [coolors.co/contrast-checker](https://coolors.co/contrast-checker).

### 1.2. Tipografía

| Rol | Familia | Peso | Tamaño | Line-height | Letter-spacing |
|---|---|---|---|---|---|
| Display | [Nombre] | [400-700] | [48px] | [1.1] | [-0.02em] |
| H1 | [Nombre] | [600] | [36px] | [1.2] | [-0.02em] |
| H2 | [Nombre] | [600] | [28px] | [1.25] | [-0.01em] |
| H3 | [Nombre] | [600] | [22px] | [1.3] | [0] |
| Body | [Nombre] | [400] | [16px] | [1.5] | [0] |
| Body-sm | [Nombre] | [400] | [14px] | [1.5] | [0] |
| Mono | [Nombre] | [400] | [14px] | [1.4] | [0] |
| Mono-sm | [Nombre] | [400] | [12px] | [1.4] | [0] |

**Escala modular:** [type-scale.com](https://type-scale.com/) con ratio [1.25 / 1.333 / 1.5]. El mono es crítico: DOCU muestra datos y cifras.

### 1.3. Espaciado

> Base 4px. Todo en rem (1rem = 16px). Escala: 4, 8, 12, 16, 24, 32, 48, 64, 96.

| Token | Valor | Uso |
|---|---|---|
| space-1 | 0.25rem (4px) | Ajuste fino, iconos |
| space-2 | 0.5rem (8px) | Gap pequeño, inline |
| space-3 | 0.75rem (12px) | Gap medio, componentes |
| space-4 | 1rem (16px) | Padding base, margin |
| space-6 | 1.5rem (24px) | Padding card, gap |
| space-8 | 2rem (32px) | Padding section, gap |
| space-12 | 3rem (48px) | Padding page, gap |
| space-16 | 4rem (64px) | Padding hero, gap |
| space-24 | 6rem (96px) | Padding section grande |

### 1.4. Sombras

| Token | Valor | Uso |
|---|---|---|
| shadow-sm | 0 1px 2px oklch(0 0 0 / 0.05) | Elevación sutil |
| shadow-md | 0 4px 6px oklch(0 0 0 / 0.1) | Cards, dropdowns |
| shadow-lg | 0 10px 15px oklch(0 0 0 / 0.1) | Modales, popovers |
| shadow-xl | 0 20px 25px oklch(0 0 0 / 0.15) | Overlays |

### 1.5. Radios

| Token | Valor | Uso |
|---|---|---|
| radius-sm | 4px | Ajuste fino, tags |
| radius-md | 8px | Botones, inputs |
| radius-lg | 12px | Cards, modales |
| radius-xl | 16px | Cards grandes |
| radius-full | 9999px | Avatares, pills |

### 1.6. Duración y easing

| Token | Valor | Uso |
|---|---|---|
| duration-fast | 150ms | Hover, focus |
| duration-base | 250ms | Transiciones |
| duration-slow | 350ms | Modales, overlays |
| ease-default | cubic-bezier(0.4, 0, 0.2, 1) | Transiciones estándar |
| ease-in-out | cubic-bezier(0.4, 0, 0.2, 1) | Entrada/salida |
| ease-out | cubic-bezier(0, 0, 0.2, 1) | Entrada |

## 2. Estructura JSON (DTCG 2025.10)

```json
{
  "$schema": "https://www.designtokens.org/schemas/2025.10/format.json",
  "color": {
    "primario": { "$value": "#XXXXXX", "$type": "color" },
    "secundario": { "$value": "#XXXXXX", "$type": "color" },
    "acento": { "$value": "#XXXXXX", "$type": "color" },
    "neutro-100": { "$value": "#XXXXXX", "$type": "color" },
    "neutro-900": { "$value": "#XXXXXX", "$type": "color" },
    "exito": { "$value": "#XXXXXX", "$type": "color" },
    "error": { "$value": "#XXXXXX", "$type": "color" },
    "advertencia": { "$value": "#XXXXXX", "$type": "color" }
  },
  "spacing": {
    "1": { "$value": { "value": 0.25, "unit": "rem" }, "$type": "dimension" },
    "2": { "$value": { "value": 0.5, "unit": "rem" }, "$type": "dimension" },
    "4": { "$value": { "value": 1, "unit": "rem" }, "$type": "dimension" },
    "8": { "$value": { "value": 2, "unit": "rem" }, "$type": "dimension" }
  },
  "font": {
    "family": {
      "display": { "$value": ["Font Name", "sans-serif"], "$type": "fontFamily" },
      "body": { "$value": ["Font Name", "sans-serif"], "$type": "fontFamily" },
      "mono": { "$value": ["Font Name", "monospace"], "$type": "fontFamily" }
    },
    "weight": {
      "normal": { "$value": 400, "$type": "fontWeight" },
      "medium": { "$value": 500, "$type": "fontWeight" },
      "semibold": { "$value": 600, "$type": "fontWeight" },
      "bold": { "$value": 700, "$type": "fontWeight" }
    }
  },
  "radius": {
    "sm": { "$value": { "value": 4, "unit": "px" }, "$type": "dimension" },
    "md": { "$value": { "value": 8, "unit": "px" }, "$type": "dimension" },
    "lg": { "$value": { "value": 12, "unit": "px" }, "$type": "dimension" }
  },
  "shadow": {
    "sm": {
      "$value": { "offsetX": 0, "offsetY": 1, "blur": 2, "spread": 0, "color": "oklch(0 0 0 / 0.05)" },
      "$type": "shadow"
    }
  },
  "duration": {
    "fast": { "$value": { "value": 150, "unit": "ms" }, "$type": "duration" },
    "base": { "$value": { "value": 250, "unit": "ms" }, "$type": "duration" }
  },
  "ease": {
    "default": { "$value": [0.4, 0, 0.2, 1], "$type": "cubicBezier" }
  }
}
```

## 3. Mapeo Tailwind 4 @theme

```css
@import "tailwindcss";

@theme {
  /* Color */
  --color-primario: oklch(L C H);
  --color-secundario: oklch(L C H);
  --color-acento: oklch(L C H);
  --color-neutro-100: oklch(L C H);
  --color-neutro-900: oklch(L C H);
  --color-exito: oklch(L C H);
  --color-error: oklch(L C H);
  --color-advertencia: oklch(L C H);

  /* Tipografía */
  --font-display: "Font Name", sans-serif;
  --font-body: "Font Name", sans-serif;
  --font-mono: "Font Name", monospace;

  /* Espaciado (base 4px) */
  --spacing: 0.25rem;

  /* Radios */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;

  /* Sombras */
  --shadow-sm: 0 1px 2px oklch(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px oklch(0 0 0 / 0.1);

  /* Duración */
  --duration-fast: 150ms;
  --duration-base: 250ms;

  /* Easing */
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
}
```

## 4. Componentes base

### Botón
| Variante | Uso | Estilo |
|---|---|---|
| primario | Acciones principales | bg-primario, text-white, radius-md |
| secundario | Acciones secundarias | bg-secundario, text-white, radius-md |
| ghost | Acciones terciarias | bg-transparent, text-primario |
| peligro | Acciones destructivas | bg-error, text-white, radius-md |

### Input
| Variante | Uso | Estilo |
|---|---|---|
| default | Entrada normal | border-neutro-300, radius-md |
| error | Entrada con error | border-error, text-error |
| disabled | Entrada deshabilitada | bg-neutro-100, cursor-not-allowed |

### Tabla
| Variante | Uso | Estilo |
|---|---|---|
| densa | Muchas filas | text-sm, space-y-1 |
| con-filtros | Filtrable | th con input |
| con-paginación | Paginada | nav con botones |

### Badge
| Variante | Uso | Estilo |
|---|---|---|
| éxito | Confirmaciones | bg-exito/10, text-exito |
| error | Errores | bg-error/10, text-error |
| advertencia | Alertas | bg-advertencia/10, text-advertencia |
| info | Información | bg-secundario/10, text-secundario |

### Modal
| Variante | Uso | Estilo |
|---|---|---|
| confirmación | Confirmar acción | shadow-lg, radius-lg |
| error | Mostrar error | shadow-lg, radius-lg, border-error |
| info | Mostrar información | shadow-lg, radius-lg |

## 5. Patrones de estados

| Estado | Componente | Descripción | Accesibilidad |
|---|---|---|---|
| Cargando | Skeleton | Placeholder animado | aria-busy="true" |
| Vacío | Empty state | Mensaje + acción | role="status" |
| Error | Error state | Mensaje + reintento | role="alert" |
| Cuarentena | Cuarentena state | Motivo + acción | role="status" |
| Confirmado | Confirmado state | Quién + cuándo | role="status" |

## 6. Accesibilidad (WCAG 2.2 AA)

| Criterio | Requisito | Verificación |
|---|---|---|
| Contraste | ≥ 4.5:1 texto normal, ≥ 3:1 texto grande | coolors.co/contrast-checker |
| Foco | Visible en todos los elementos interactivos | Navegación por teclado |
| Nombres accesibles | Botones e iconos con nombre accesible | axe DevTools |
| Reduced motion | Respetar prefers-reduced-motion | @media (prefers-reduced-motion: reduce) |
| Tamaño objetivo | ≥ 44x44px táctil | Revisión manual |

## 7. Referencias

- [DTCG 2025.10](https://www.designtokens.org/TR/2025.10/format/) — Especificación de tokens
- [Tailwind 4 @theme](https://tailwindcss.com/docs/theme) — Configuración CSS-first
- [WCAG 2.2 AA](https://www.w3.org/WAI/WCAG22/quickref/) — Criterios de accesibilidad
- [OKLCH](https://oklch.com/) — Color perceptualmente uniforme
- [type-scale.com](https://type-scale.com/) — Escala tipográfica modular
