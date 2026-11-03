# Marca documental de DOCU

<p align="center">
<strong>docu</strong><br>
<sub>Configuración 1 · Baja SterilPack · DOCU — Repositorio de Documentación Digital</sub><br>
<sub>Marca: <code>#5B2A86</code> · acento: <code>#B0215F</code> · texto: <code>#24172F</code></sub>
</p>

Cómo se ve un documento oficial del proyecto. La marca la define
`docs/diseno/DESIGN-SYSTEM.md`; aquí queda solo lo que aplica a **formatos y
plantillas**, para que cualquier integrante produzca documentos reconocibles
sin depender del diseñador.

## Encabezado obligatorio

Todo documento oficial (ADR, brief, SRS, evidencia, propuesta, FICHA, RTC)
abre con el siguiente bloque, copiado de una plantilla y sin cambiarlo:

```html
<p align="center">
<strong>docu</strong><br>
<sub>Configuración 1 · Baja SterilPack · DOCU — Repositorio de Documentación Digital</sub><br>
<sub>Marca: <code>#5B2A86</code> · acento: <code>#B0215F</code> · texto: <code>#24172F</code></sub>
</p>
```

Es HTML crudo a propósito: GitHub lo renderiza centrado y se ve igual en PR,
issue o vista previa del editor. No lleva logotipo porque el SVG del búho no
vive en el repo todavía; se añadirá solo si el asset queda versionado.

## Paleta para documentos

| Uso | Claro | Dónde |
|---|---|---|
| Marca (títulos, sellos) | `#5B2A86` | Encabezado documental |
| Acento | `#B0215F` | Wordmark `docu`, la "u" en Rosa |
| Texto | `#24172F` | Cuerpo |
| Official | `#1F7A3A` | Solo estado Oficial |
| Pendiente | `#8A5300` | Solo estado por confirmar |
| Cuarentena | `#A8360A` | Solo datos detenidos |
| IA | `#5B2A86` | Solo sugerencias de IA |

Los estados jamás se usan como decoración: un color de estado significa lo
mismo en todo el sistema.

## Wordmark

Siempre en minúsculas, `docu`, en Sora con la **u** en acento. En documentos
es el único elemento de marca permitido; nada de emojis como sello, nada de
Mayúsculas Solemnes, nada de versiones propias del búho.

## Reglas

1. **Una paleta por documento.** Nunca mezclar hex nuevos: manda
   `docs/diseno/tokens.json`.
2. **Texto, no imágenes, para color.** Las paletas se documentan como
   `#hex`; nada de capturas para enseñar colores.
3. **El encabezado no se adapta.** Mismas líneas, mismo orden, mismo
   alineado en todos los documentos oficiales.
4. **Evidencia y reportes internos** también llevan encabezado: la marca es
   del sistema, no un adorno de entregables externos.
5. Fuentes: Sora solo wordmark, Figtree cuerpo, JetBrains Mono para cifras,
   lotes y códigos.
