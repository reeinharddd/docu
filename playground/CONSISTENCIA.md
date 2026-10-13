# CONSISTENCIA — cómo se construye siempre en esta rama

> Si algo se construye de una manera, todo lo igual se sigue construyendo
> igual. El patrón vive aquí, no en la cabeza de nadie.

## Cadena (en este orden, sin saltos)

marca (`DESIGN.md`, la fija `/fijar-marca`) → tokens (`tokens/tokens.json` + `tokens.css`)
→ átomos (`ng/src/app/atomos/`: botón, campo, badge, alerta)
→ moléculas (`ng/src/app/moleculas/`: tabla, modal, tarjetas)
→ pantallas (`ng/src/app/pantallas/`: captura → bandeja → programa-oficial → búsqueda)
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
6. Un componente por función; antes de crear, se demuestra que no existe
   uno reusable (`/nueva-pantalla` hace este chequeo).
7. Toda pantalla declara su contrato: ruta, qué muestra, cada acción →
   a qué redirige, componentes reusados vs creados.

## Contrato de pantalla (lo escribe `/nueva-pantalla` antes de codificar)

| Campo | Ejemplo |
|---|---|
| Ruta | `/bandeja` (en `ng/src/app/app.routes.ts`) |
| Muestra | Tabla de recepciones pendientes con cita de fuente |
| Acciones → redirección | Confirmar → `/programa`; Cuarentena → modal motivo |
| Reusados | `atomo-boton`, `molecula-tabla` |
| Creados | `pantalla-bandeja` (justificación en 1 línea) |

## Brand kit (salidas de Fase 1→2)

Tokens, tipografías (display/body/mono), paleta claro+oscuro, set de iconos,
estados (cargando, vacío, error, cuarentena, confirmado) y componentes base.
Lo decidido viaja a `docs/diseno/` por PR; las pruebas se quedan aquí.
