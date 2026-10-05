# ADR 0003 — Angular 22 zoneless, sin zone.js

Fecha: 2026-10-05 · Estado: Aceptada · Decide: Kira + Erik · Revisa: Erik

## Contexto

El front de DOCU es una aplicación interna de escritorio con tablas, filtros,
carga de archivos y estados de error claros (RNF-01). El modelo de cambio de
detección por defecto de Angular (zone.js) obliga a que cualquier biblioteca de
terceros que arranque trabajo asíncrono por fuera de Angular notifique al
framework para que la vista se refresque. Con el patrón asíncrono del proyecto
(ingesta, validación en cadena, cola de OCR, alertas) eso produce:

- Actualizaciones de vista que dependen de parches manuales de `zone.js` en
  librerías de terceros.
- Fuente de falsos "cambio no detectado" y de parches manuales con
  `ChangeDetectorRef`.
- Sobrecarga de patching que no aporta nada en una app que casi toda la
  mutación de estado hace con signals.

Angular 21 en adelante ya no necesita `zone.js` para funcionar en modo zoneless,
y Angular 22 es la versión del proyecto.

## Decisión

La aplicación web se construye **zoneless**, sin `zone.js`:

- No se instala `zone.js` en `apps/web/package.json`.
- `app.config.ts` no registra `provideZoneChangeDetection` ni
  `provideZoneChangeDetection` experimental; solo
  `provideBrowserGlobalErrorListeners()` y `provideRouter(routes)`.
- Todo el estado de vista es signal o `computed`, y los componentes son
  `standalone`.
- Tailwind 4 para estilos, con PostCSS mediante `@tailwindcss/postcss`.

Regla operativa: si una librería asíncrona no signals cambio a Angular, se
envuelve la zona de lectura con un signal explícito en el servicio, no se
parchea zone.js.

## Alternativas consideradas

| Alternativa | Por qué no |
|---|---|
| Mantener zone.js | Es el camino por defecto de la documentación antigua; con el patrón asíncrono de DOCU es la fuente típica de parches y de errores de detección de cambios |
| `provideZonelessChangeDetection` explícito en Angular 21 | Correcto, pero redundante en 22, donde zoneless ya es el comportamiento por defecto y la bandera explícita generaWarnings de migración |
| Signals con zone.js presente | Se paga la sobrecarga sin ganar nada: los signals notifican por sí mismos |

## Consecuencias

- **A favor**: no hay patching de zone.js, `zone.js` desaparece del bundle, y
  cualquier trabajo asíncrono de BullMQ, Prisma o del worker llega a la vista
  sin parche.
- **A favor**: el código nuevo se escribe con signals desde el día uno, que es
  el estilo que el resto de la arquitectura asume.
- **En contra**: cualquier componente que se agregue debe ser `standalone` y
  cambiar estado con signals. Un `setTimeout` que escriba en una variable de
  clase sin signal no refresca la vista; eso es intencionado y se documenta en
  `diseno/` cuando ocurra.
- **En contra**: las librerías de terceros que solo notifican cambios a
  través de zone.js requieren un adaptador explícito. Con las dependencias actuales
  (`@angular/*`, `rxjs`) no ha hecho falta ninguno.
- Riesgo de rendimiento (RNF-04) heredado de signals: se mide en el smoke de
  búsqueda con 1 000 documentos.

## Evidencia

- `apps/web/package.json`: sin `zone.js` en dependencias ni devDependencies.
- `apps/web/src/app/app.config.ts`: solo `provideBrowserGlobalErrorListeners()`
  y `provideRouter(routes)`.
- `bunx ng test --watch=false` en verde sobre `apps/web` (2/2).
- CI corre `ng test --watch=false` en el job de guardas.

## Qué nos haría revertirla

Una dependencia de primer nivel del front que exija zone.js para funcionar sin
adaptador (por ejemplo, una librería de gráficos de terceros con ciclo de vida
basado en patching). En ese caso se evaluaría añadir zone.js como dependencia y
volver al modo híbrido solo en ese build.