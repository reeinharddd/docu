# DESIGN.md — Insumos del agente

> Plantilla universal. Copiar a `playground/DESIGN.md` y llenar.
> Mismo estándar para playground y main.
> Estándares: DTCG 2025.10, Tailwind 4 @theme, OKLCH, WCAG 2.2 AA.

## Visión
[1 párrafo: qué es el producto, para quién, por qué]

## Slogan
[Frase corta que resume la marca]

## Estándares aplicados

| Estándar | Uso |
|---|---|
| DTCG 2025.10 | Formato de tokens: `$value`, `$type`, `$ref` |
| Tailwind 4 @theme | Mapeo CSS-first: `--color-*`, `--font-*`, `--spacing` |
| OKLCH | Color perceptualmente uniforme (accesibilidad real) |
| WCAG 2.2 AA | Contraste ≥ 4.5:1 texto normal, ≥ 3:1 texto grande |

## Paleta (OKLCH)

> Los colores se definen en OKLCH (perceptualmente uniforme) y se mapean a hex para herramientas que lo requieran.

| Token | OKLCH | Hex (referencia) | Uso |
|---|---|---|---|
| primario | oklch(L C H) | #XXXXXX | Botones, acciones principales |
| secundario | oklch(L C H) | #XXXXXX | Acentos, highlights |
| acento | oklch(L C H) | #XXXXXX | CTAs, éxitos |
| neutro-100 | oklch(L C H) | #XXXXXX | Fondos |
| neutro-900 | oklch(L C H) | #XXXXXX | Texto |
| éxito | oklch(L C H) | #XXXXXX | Confirmaciones |
| error | oklch(L C H) | #XXXXXX | Errores |
| advertencia | oklch(L C H) | #XXXXXX | Alertas |

**Contraste WCAG 2.2 AA:** cada par texto/fondo debe pasar ≥ 4.5:1 (texto normal) o ≥ 3:1 (texto grande ≥ 18px o ≥ 14px bold). Verificar con [coolors.co/contrast-checker](https://coolors.co/contrast-checker).

## Tipografías

| Rol | Nombre | Peso | Tamaño base | Line-height | Por qué |
|---|---|---|---|---|---|
| Display | [Nombre] | [400-700] | [48px] | [1.1] | [Razón] |
| Body | [Nombre] | [400] | [16px] | [1.5] | [Razón] |
| Mono | [Nombre] | [400] | [14px] | [1.4] | [Razón — crítico para cifras] |

**Escala modular:** usar [type-scale.com](https://type-scale.com/) con ratio [1.25 / 1.333 / 1.5].

## Iconos
- Set: [Lucide / Phosphor / Tabler]
- Estilo: [outline / filled / duotone]
- Tamaño base: [16px / 20px / 24px]
- Por qué: [Razón]

## Imágenes
- Logo: [archivo o "no aplica"]
- Ilustraciones: [archivo o "no aplica"]
- Fotos: [archivo o "no aplica"]

## Estados
| Estado | Descripción | Componente |
|---|---|---|
| Cargando | [Descripción] | Skeleton |
| Vacío | [Descripción] | Empty state |
| Error | [Descripción] | Error state |
| Cuarentena | [Descripción] | Cuarentena state |
| Confirmado | [Descripción] | Confirmado state |

## Estructura de tokens (DTCG 2025.10)

```json
{
  "$schema": "https://www.designtokens.org/schemas/2025.10/format.json",
  "color": {
    "primario": {
      "$value": "#XXXXXX",
      "$type": "color"
    }
  },
  "spacing": {
    "md": {
      "$value": { "value": 1, "unit": "rem" },
      "$type": "dimension"
    }
  },
  "font": {
    "family": {
      "display": {
        "$value": ["Font Name", "sans-serif"],
        "$type": "fontFamily"
      }
    }
  }
}
```

## Mapeo Tailwind 4 @theme

```css
@import "tailwindcss";

@theme {
  --color-primario: oklch(L C H);
  --color-secundario: oklch(L C H);
  --color-acento: oklch(L C H);
  --color-neutro-100: oklch(L C H);
  --color-neutro-900: oklch(L C H);
  --color-exito: oklch(L C H);
  --color-error: oklch(L C H);
  --color-advertencia: oklch(L C H);

  --font-display: "Font Name", sans-serif;
  --font-body: "Font Name", sans-serif;
  --font-mono: "Font Name", monospace;

  --spacing: 0.25rem;
}
```
