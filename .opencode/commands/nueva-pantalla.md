---
description: Agregar una pantalla del flujo - repetible, simulable, con routing y atomic design escalable
---

Pantalla: $1 (nombre; si falta ruta, propósito, acciones o datos que muestra, pregúntalos)

Kira pide en lenguaje normal ("agreguemos pantalla de error") y el agente
la construye con el estilo fijado. Mismo flujo siempre: repetible ante
cualquier pantalla, simulable sin backend. Nada fuera del flujo #11
(captura → bandeja → programa-oficial → búsqueda) sin justificarlo.

1. Carga skills `design`, `ui-ux-pro-max` (revisión), `frontend-ui-engineering`
   (acabado), `ecc-angular-developer` (código) y `docu-memoria` (gustos
   afirmados). Lee `playground/CONSISTENCIA.md` + `playground/DESIGN.md` +
   `playground/CADENA.md` (qué rol la ve según #29, qué datos muestra según #58).
2. Declara el contrato (escríbelo en el hilo antes de codificar):
   - Ruta en inglés, kebab-case, bajo el flujo (`/bandeja`, `/programa`,
     `/captura`, `/busqueda`; error → `/error`). Textos de pantalla en español.
   - Qué muestra, cada botón/acción → a qué ruta redirige (mapa completo,
     sin callejones: toda acción lleva a una ruta o a un modal con salida).
   - Datos simulados: cada pantalla usa su fixture tipado en
     `ng/src/app/mocks/<pantalla>.mock.ts` con formas de las 6 familias del
     caso; el componente nunca inventa datos inline. Repetible: misma
     fixture → misma pantalla, siempre.
   - Componentes: lista `ng/src/app/` y reutiliza; lo que falte se crea
     átomo-primero, un componente por función.
3. Routing (buenas prácticas, escalable):
   - Una carpeta por pantalla en `ng/src/app/pantallas/<nombre>/` con su
     ruta lazy (`loadComponent`) en `app.routes.ts`; nada eager salvo portada.
   - Rutas planas del flujo; anidadas solo si la UI las anida de verdad.
   - `title` por ruta (español, para la pestaña y accesibilidad).
4. Construye con tokens únicamente (cero hardcodeados). Escalera atomic:
   `tokens` → `atomos/` → `moleculas/` → `pantallas/`.
5. Verifica (simulable y repetible): build verde + gate `CONSISTENCIA.md`
   (grep de hardcodeados vacío) + serve y captura contra :4200 navegando la
   ruta nueva + mapa de redirecciones probado clic por clic (playwright).
6. Reporta: ruta, componentes reusados vs creados, fixture usada, mapa de
   redirecciones verificado.
