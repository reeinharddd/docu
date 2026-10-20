# BRIEF #11 — Prototipos UI/UX y flujo de pantallas

## 0. Encabezado

- Issue: #11 (absorbió #28: categorías se definen aquí; #28 cerrado not planned 13-oct)
- Dueño: Kira
- Fechas: 2026-10-16 → **2026-10-23** · Sprint 1 · hito `Cierre de diseño` (2026-10-23)
- Prioridad / Tipo / Épica / Módulo: alta / tarea / Diseño / diseño
- Requisitos: RNF-01 (usabilidad); alimenta RF-01, RF-03, RF-04
- Bloqueado por: #41 Fase 2 (tokens y componentes base) · Bloquea a: #4 Frontend Angular
- Taller: rama `design/kira-playground` (huérfana; nunca se fusiona a `main`)

## 0.1 Dónde se trabaja y qué viaja a `main`

- **Taller:** rama huérfana `design/kira-playground`. Ahí viven la app Angular 22
  espejo (`playground/ng`, `bun run start` → `:4200`), los tokens crudos
  (`playground/tokens/`), las pantallas y las capturas de iteración.
- **Arranque:** `git worktree add ../docu-playground design/kira-playground` (o
  `git switch design/kira-playground`), luego
  `cd playground && bun install && bun run start`; `opencode` y `/inicio`.
- **Se queda en el taller:** código, pruebas, iteraciones descartadas, capturas
  de trabajo y tokens sin aprobar. Nada de eso viaja a `main` (ADR-0012).
- **Viaja a `main` (solo lo afirmado):** `docs/diseno/FLUJO.md`,
  `docs/diseno/CATEGORIAS.md`, capturas finales adjuntas al PR y, cuando #41
  cierre, `docs/diseno/DESIGN-SYSTEM.md` + `docs/diseno/tokens.json`. Checklist:
  `playground/PROMOCION.md`.
- **Promoción:** el PR sale de una rama creada desde `main` (no de la huérfana),
  con `Closes #11` y evidencia (capturas + `bun run verify`). Lo revisa un par.
- **Enlaces:** [rama](https://github.com/reeinharddd/docu/tree/design/kira-playground)
  · `BRIEF-42-playground-diseno.md` · `playground/PROMOCION.md`.

## 1. Contexto

La planta pierde horas cruzando Excels de turnos, plantas hermanas y escaneados.
DOCU recibe esos archivos, detecta su familia, manda lo dudoso a cuarentena con
motivo y deja que una persona confirme el dato oficial (`proyecto/CASO.md`,
ADR-0006). Las pantallas tienen que hacer ese flujo entendible en menos de 10
minutos para un usuario piloto.

## 2. Por qué importa tu parte

Por ADR-0012 nadie construye pantallas hasta que exista el design system. Tus
prototipos son la primera puerta: si se retrasan, #4 (frontend) y el Sprint 2
arrancan tarde, y el contrato de datos del 30 de octubre se congela sin saber qué
necesita cada pantalla. Si salen bien, el frontend se construye una sola vez.

## 3. Objetivo y resultado esperado

Prototipo navegable del flujo **subir → revisar → consultar** con las cuatro
pantallas del producto.

| Entregable | Evidencia |
|---|---|
| Flujo de pantallas (diagrama de navegación) | `docs/diseno/FLUJO.md` con el diagrama y el enlace al taller |
| Prototipo navegable de: captura, bandeja de revisión/cuarentena, Programa Oficial, búsqueda con cita de fuente | App en `design/kira-playground` (`playground/ng`, `:4200`) + capturas por pantalla en el PR; el código del taller no se fusiona |
| Categorías y etiquetas visibles en la interfaz (ex-#28, parte de #11) | Tabla en `docs/diseno/CATEGORIAS.md`: familia, etiquetas, color/ícono |
| Estados de error y vacío por pantalla | Una captura por estado en el PR |
| Promoción del taller a `main` | Checklist de `playground/PROMOCION.md` completo; solo docs, tokens aprobados y capturas |
| Revisión de un par | Comentario de aprobación en el PR |

## 4. Actividades específicas

1. Leer `proyecto/CASO.md`, `proyecto/REQUISITOS.md` (RF-01..04, RNF-01) y
   ADR-0006. Entregable: lista de 5–8 tareas del usuario piloto en el PR.
2. Dibujar el flujo de navegación entre las cuatro pantallas. Terminado: cada
   tarea del punto 1 tiene un camino; el diagrama se promueve a
   `docs/diseno/FLUJO.md`.
3. Prototipar las cuatro pantallas en el taller (`/nueva-pantalla`), baja
   fidelidad primero, en escritorio y celular (RNF-01: Chrome, Edge, Android).
   Cada pantalla declara su contrato (ruta, datos, acciones) según
   `playground/CONSISTENCIA.md`.
4. Definir categorías y etiquetas (ex-#28, absorbido aquí) a partir de las familias:
   `programa_planeacion`, `recepcion_rollo`, `inventario`, `excel_turno`,
   `correo_hermana`, `escaneado` (`ingenieria/MODELO-DATOS.md`).
5. Diseñar los estados: cargando, vacío, error con mensaje claro, cuarentena con
   motivo visible, dato confirmado con quién y cuándo.
6. Pasar a una persona del equipo por el flujo y anotar dónde se trabó.
7. Promover con `playground/PROMOCION.md`: PR desde `main` con `FLUJO.md`,
   `CATEGORIAS.md`, capturas y `bun run verify` en verde.

## 5. Entradas y salidas

- Recibe: requisitos y caso (repo), familias (`MODELO-DATOS.md`), matriz de
  roles preliminar de Carlos (#29) para saber quién ve qué, y los tokens
  aprobados de #41 Fase 2.
- Entrega: a Erik y Emmanuel, por PR desde `main` a `docs/diseno/`, el flujo,
  las capturas y qué datos muestra cada pantalla (insumo del contrato de datos
  #23). El prototipo se revisa en el taller, no en `main`.

## 6. Referencias y caja de herramientas

- `docs/proyecto/CASO.md`, `REQUISITOS.md`, `VISION.md`.
- ADR-0006 (la confirmación humana es visible) y ADR-0012 (por qué aún no hay código).
- Accesibilidad: criterios WCAG 2.2 AA; verificar contraste con la extensión axe.
- La IA puede generar variantes de layout y textos de error; tú decides cuál queda.

Recursos oficiales y curados para diseñar el flujo:

| Para | Recurso | Cuándo usarlo |
|---|---|---|
| Criterios exactos AA | https://www.w3.org/WAI/WCAG22/quickref/ (contraste, foco, nombres accesibles) | Al definir cada pantalla y sus estados de error |
| Verificación automática | https://www.deque.com/axe/ (extensión axe DevTools) | Al auditar el prototipo antes del PR |
| Patrones de usabilidad | https://www.nngroup.com (heurísticas, mensajes de error, densidad de datos) | Al diseñar bandeja/cuarentena y búsqueda con cita |
| Marca ya elegida | Dirección ganadora de Fase 1 (`BRIEF-41`) + tokens del playground (#42) | Al pasar de baja a alta fidelidad |
| Inspiración documental y lineage | Lista curada de `BRIEF-41` §6 (SaaSUI, DataHub/OpenMetadata, ProvenanceWidgets) | Al dibujar la cita de fuente por cifra |
| Flujos reales de referencia | Curaduría del equipo: https://pageflows.com (flujos subir→revisar→consultar), https://ui-patterns.com y https://www.uisources.com (bandejas, filtros, tablas) | Al dibujar la navegación antes de prototipar |
| Estados vacíos/error ilustrados | Curaduría del equipo: https://undraw.co y https://openpeeps.com (ilustraciones) | Al diseñar vacío, error y cuarentena sin pantallas frías |
| Tamaños reales de pantalla | Curaduría del equipo: https://screensiz.es (viewport Android + desktop) | Al cumplir RNF-01 celular + escritorio |
| Diagramar el flujo | https://excalidraw.com (rápido, exportable) | Al entregar `FLUJO.md` |
| Por qué funciona cada patrón | Curaduría del equipo: https://lawsofux.com (leyes: Hick, Miller, proximidad) y https://www.nngroup.com (heurísticas, densidad de datos) | Al justificar decisiones de bandeja y búsqueda |
| Formularios que no cansan | Curaduría del equipo: https://www.frontendpractice.com (clones reales) | Al diseñar captura con validación |
| Investigación de e-commerce aplicable | https://baymard.com (checkout, errores, confirmaciones) | Al diseñar cuarentena→confirmación como un checkout de confianza |

## 7. Cómo trabajar

- Con OpenCode: abre el taller (`design/kira-playground`) y usa `/inicio`,
  `/tarea 11` y `/nueva-pantalla`; `/cerrar` para el PR de promoción desde
  `main`.
- La rama `design/kira-playground` es huérfana y **NUNCA** se fusiona a `main`;
  dentro del taller manda su `AGENTS.md`.
- Sin API ni BD. Código solo en `playground/ng/` y `playground/tokens/`; cero
  valores hardcodeados fuera de `tokens.css` (`CONSISTENCIA.md`).
- A `main` solo viaja lo afirmado (docs, tokens aprobados y capturas); nada de
  código del playground (ADR-0012).
- Estado: #11 sigue `Por hacer` hasta que #41 cierre; una persona, un issue
  `En progreso`.
- La IA genera y varía; no decide reglas, permisos, dato oficial ni diseño final.
- Duda de 30 min: pregunta al equipo. Bloqueo de 24 h: etiqueta `bloqueado`.

## 8. Criterios de aceptación

- [ ] Las cuatro pantallas existen en `design/kira-playground` y se navega entre ellas.
- [ ] Cada pantalla tiene versión escritorio y celular.
- [ ] La bandeja muestra el motivo de cuarentena y la acción de confirmar.
- [ ] La búsqueda muestra de qué archivo y regla sale cada cifra.
- [ ] Cada pantalla tiene estados cargando, vacío, error y confirmado.
- [ ] `docs/diseno/FLUJO.md` y `docs/diseno/CATEGORIAS.md` en el PR, con `bun run verify` en verde.
- [ ] Checklist de `playground/PROMOCION.md` completo; el PR no trae código del playground.
- [ ] Un par revisó y aprobó.

## 9. Riesgos nombrados

Es la primera fecha del proyecto (9-oct). Riesgo: pulir la estética antes de
cerrar el flujo. Mitigación: baja fidelidad primero; la marca (colores,
tipografía) se trabaja después en el playground de diseño.

Riesgo: el prototipo se queda atrapado en el taller y `main` nunca ve la
evidencia. Mitigación: `PROMOCION.md`, enlaces fijados en #11 y demo en el sync
del 23-oct.

## 10. Revisión

Estado 2026-10-19: #41 Fase 2 (tokens) en curso. #11 sigue bloqueado por #41 y
no se mueve a `En progreso` hasta que cierre. El taller está listo en
`design/kira-playground`; la Fase 1 de #41 espera resolver los conflictos del
PR #63.

Viernes 2026-10-23 en el sync: recorrido del prototipo de 10 minutos con Erik.
Flujo unificado con #41-fase2: tokens y mockups se trabajan juntos en el taller
(una sola corriente, sin pasos duplicados).

Replanificación 2026-10-09: fechas 05→09-oct a 16→23-oct; va tras marca Fase 1 (#41-fase1).

## 11. Insumos del agente

| Insumo | Estado | Notas |
|---|---|---|
| Taller `design/kira-playground` | Entregado | Rama huérfana + app Angular + tokens + reglas (`AGENTS.md`, `CONSISTENCIA.md`, `PROMOCION.md`) |
| DESIGN.md | Parcial | Plantilla en el taller; falta llenarla con la dirección elegida |
| AGENTS.md | Entregado | Raíz del taller + `playground/AGENTS.md` |
| design-system.md | Pendiente | #41 Fase 2; sin tokens aprobados no hay alta fidelidad |
| Visión | Entregado | `proyecto/VISION.md` y `CASO.md` |
| Slogan | Parcial | 3 en el PDF de Fase 1; falta el acta de elección en #41 |
| Paleta | Parcial | Hex + modo oscuro en el PDF; falta OKLCH y tokens |
| Tipografías | Parcial | 3 familias en el PDF; falta escala modular |
| Iconos | Pendiente | Set elegido |
| Imágenes | Parcial | Concepto de logo; faltan variantes |
| Estados | Pendiente | Cargando, vacío, error, cuarentena, confirmado |
| Acta de marca | Pendiente | Dirección, motivo y descartadas en #41; sin acta no cierra #41 |

## 12. Recursos por actividad

### Prototipar flujo
- [lawsofux.com](https://lawsofux.com/) — Leyes: Hick, Miller, proximidad. **Cuándo:** necesitas justificar decisiones de UI.
- [nngroup.com](https://www.nngroup.com/) — Heurísticas, densidad de datos. **Cuándo:** necesitas evaluar usabilidad.
- [baymard.com](https://baymard.com/) — Checkout, errores, confirmaciones. **Cuándo:** necesitas diseñar flujos de confirmación.
- [Frontend Practice](https://www.frontendpractice.com/) — Formularios que no cansan. **Cuándo:** necesitas diseñar formularios.
- [unDraw](https://undraw.co/) / [Open Peeps](https://openpeeps.com/) — Ilustraciones. **Cuándo:** necesitas ilustraciones para vacío/error.
- [screensiz.es](https://screensiz.es/) — Viewports reales. **Cuándo:** necesitas verificar tamaños de pantalla.
- [Excalidraw](https://excalidraw.com/) — Diagramar el flujo. **Cuándo:** necesitas diagramar navegación.
- [W3C WCAG 2.2](https://www.w3.org/WAI/WCAG22/quickref/) — Criterios AA exactos. **Cuándo:** necesitas verificar accesibilidad.
- [axe DevTools](https://www.deque.com/axe/) — Verificación automática. **Cuándo:** necesitas auditar accesibilidad.
