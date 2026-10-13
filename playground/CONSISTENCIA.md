# CONSISTENCIA — cómo se construye siempre en esta rama

> Si algo se construye de una manera, todo lo igual se sigue construyendo
> igual. El patrón vive aquí, no en la cabeza de nadie.

## Cadena (en este orden, sin saltos)

marca (`DESIGN.md`) → tokens (`tokens/tokens.json` + `tokens.css`)
→ componentes (`src/`, botón/campo/tabla/badge/alerta/modal)
→ pantallas (`src/`, captura → bandeja → programa-oficial → búsqueda)
→ promoción (`PROMOCION.md`, por PR a `docs/diseno/` en `main`)

## Reglas duras

1. Las pantallas solo usan tokens. Cero colores, fuentes o medidas
   hardcodeadas fuera de `tokens/tokens.css`. Verificación:
   `grep -rniE "#[0-9a-f]{3,8}|rgb\(|px" src/ --include="*.html" --include="*.css"`
   debe devolver vacío (fuera de `tokens.css`).
2. Todo componente nuevo sale de un token existente; si falta el token,
   se propone primero en `tokens.json` y se justifica en una línea.
3. Cada pantalla representa el flujo real de #11: subir → revisar →
   consultar, entendible en <10 min. Pantalla que no sirve al flujo no se hace.
4. Cada iteración lleva captura antes/después para comparar.
5. Español en textos de pantalla; inglés en código y tokens.

## Brand kit (salidas de Fase 1→2)

Tokens, tipografías (display/body/mono), paleta claro+oscuro, set de iconos,
estados (cargando, vacío, error, cuarentena, confirmado) y componentes base.
Lo decidido viaja a `docs/diseno/` por PR; las pruebas se quedan aquí.
