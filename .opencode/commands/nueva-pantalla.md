---
description: Agregar una pantalla del flujo - declara ruta, componentes y redirecciones con atomic design
---

Pantalla: $1 (nombre; si falta ruta, propósito o acciones, pregúntalos)

Kira pide en lenguaje normal ("agreguemos pantalla de error") y el agente
la construye con el estilo fijado. Nada de pantallas fuera del flujo #11
(captura → bandeja → programa-oficial → búsqueda) sin justificarlo.

1. Carga skills `design` (pantalla) + `ecc-angular-developer` (código) y lee
   `playground/CONSISTENCIA.md` + `playground/DESIGN.md`.
2. Declara el contrato (escríbelo en el hilo antes de codificar):
   - Ruta (`app.routes.ts`), qué muestra, cada botón/acción → a qué redirige.
   - Componentes que usa: lista cuáles existen en `ng/src/app/` y reutiliza;
     lo que falte se crea átomo-primero (botón/campo/badge → molécula →
     pantalla), un componente por función.
3. Construye con tokens únicamente (cero hardcodeados). Escala atomic:
   `tokens` → `atomos/` → `moleculas/` → `pantallas/`.
4. Verifica: build verde + gate `CONSISTENCIA.md` (grep de hardcodeados
   vacío) + captura antes/después contra :4200.
5. Reporta: ruta, componentes reusados vs creados, mapa de redirecciones.
