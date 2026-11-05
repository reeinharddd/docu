# BRIEF #11 — Pantallas funcionales: el caso completo con datos

## 0. Encabezado

- Issue: #11 (las categorías se definen aquí; #28 quedó cerrado como no planificado)
- Dueño: Kira
- Fechas: 2026-11-13 → **2026-11-16** · Sprint 3 · hito `C1 vertical completa` (19-nov)
- Prioridad / Tipo / Épica / Módulo: alta / tarea / Diseño / diseño
- Requisitos: RF-01, RF-02, RF-03, RF-04, RF-05, RNF-01 (RF-06 lo implementa #5)
- Bloqueado por: #84 (plataforma frontend, PR #104) · Bloquea a: #4 Frontend Angular
- Rama: `feat/11-prototipos-ui-ux` (desde `main`)

## 0.1 Dónde se trabaja y qué viaja a `main`

- **Rama:** `feat/11-prototipos-ui-ux`, creada desde `main` con
  `bash scripts/rama-env.sh 11 feat/11-prototipos-ui-ux`. La rama
  `design/kira-playground` está **abandonada**: no se restaura ni se trabaja
  ahí.
- **Qué son las pantallas:** pantallas **funcionales de la app real**
  (`apps/web`), no un playground aparte. Cada pantalla vive en
  `apps/web/src/app/features/<dominio>/` (ruta + vista) y compone los átomos,
  moléculas y organismos de `apps/web/src/app/ui/`. Lo que se entrega es
  producto, no maqueta: por eso viaja a `main` con código.
- **Datos:** hasta que #61 entregue el corpus, cada pantalla usa un **fixture
  local versionado** en `apps/web/src/app/features/<dominio>/fixtures/`
  (marcado como mock). Cuando el dataset llegue, el fixture se sustituye por
  el corpus real. Plan B: si el 16-nov el corpus no está, el PR se entrega con
  fixtures y se abre la issue que los enchufa al dataset; el flujo no se
  entrega a medias.
- **Viaja a `main`:** el código de las pantallas, sus pruebas, `docs/diseno/FLUJO.md`,
  `docs/diseno/CATEGORIAS.md` y las capturas finales adjuntas al PR.
- **Gates:** `bun run verify` en verde (lint, tipos, pruebas web), specs nuevas
  para cada pantalla y revisión de un par. Sin evidencia no hay PR
  (`docs/REGLAS.md`).
- **Herramienta:** `/inicio`, `/tarea 11`, y la skill `docu-frontend` para la
  estructura y los niveles de UI. No existe comando `/nueva-pantalla`: una
  pantalla nueva se crea como una feature de su dominio.

## 1. Contexto

La planta pierde horas cruzando Excels de turnos, plantas hermanas y escaneados.
DOCU recibe esos archivos, detecta su familia, manda lo dudoso a cuarentena con
motivo y deja que una persona confirme el dato oficial (`proyecto/CASO.md`,
ADR-0006). Las pantallas tienen que hacer ese flujo entendible en menos de 10
minutos para un usuario piloto.

El **mapa de derivación del caso** (`proyecto/CASO.md` §"Mapa de derivación") es
la autoridad del alcance: cada flujo dice qué pantalla produce. Por eso el
alcance son **cinco** pantallas, no cuatro: `F6 Reporte del día` produce
**Reporte + Búsqueda**, y el reporte no se puede omitir (guion de demo `G6`).

## 2. Por qué importa tu parte

Por ADR-0012 nadie construye pantallas hasta que exista el design system. Tus
pantallas son la primera puerta: si se retrasan, #4 (frontend) y el Sprint 2
arrancan tarde, y el contrato de datos del 30 de octubre se congela sin saber qué
necesita cada pantalla. Si salen bien, el frontend se construye una sola vez.

## 3. Objetivo y resultado esperado

Las **cinco** pantallas del caso, navegables de punta a punta con datos:

| Pantalla | Dominio y ruta | Flujos del caso | Endpoints que necesitará | Dato que muestra |
|---|---|---|---|---|
| Captura | `capture` · `/capture` | F2, F3, F4, F5 | `POST /v1/files`, `GET /v1/files/:id/validation` | archivo original, familia asignada, hash, estado de la validación |
| Bandeja | `inbox` · `/inbox` | F4, F7 | `GET /v1/quarantine`, `POST /v1/inbox/:id/confirm` | lo que está en cuarentena, **el motivo**, la regla aplicada y la acción de confirmar |
| Programa | `schedule` · `/schedule` | F1, F5, F7 | `GET /v1/official-records`, `POST /v1/sources/:id/sync` | el programa semanal con sus bloqueos vivos (rollo no asignable, material que no alcanza) |
| Búsqueda | `search` · `/search` | F6, F7, F8 | `GET /v1/lineage/:id`, `GET /v1/official-records` | cada cifra con su fuente, su regla y su cálculo (RF-04) |
| Reporte | `reports` · `/reports` | F6 | `GET /v1/reports/...` | el reporte del día, cada número citando su origen, y la alerta cuando cruza el umbral |

`Login` y `Forbidden` **no son de este brief**: vienen de la plataforma (#84).

| Entregable | Evidencia |
|---|---|
| Cinco pantallas navegables en la app real | Rutas y vistas en `apps/web/src/app/features/<dominio>/` + capturas por pantalla en el PR |
| Estados por pantalla (cargando, vacío, error, cuarentena con motivo, confirmado con quién y cuándo) | Una captura por estado en el PR |
| Un spec por pantalla | `features/<dominio>/views/<name>-view.spec.ts` en verde (`bun --filter web test`) |
| Flujo de pantallas (diagrama de navegación) | `docs/diseno/FLUJO.md` con el diagrama y las rutas reales |
| Categorías y etiquetas visibles en la interfaz (ex-#28, parte de #11) | Tabla en `docs/diseno/CATEGORIAS.md`: familia, etiquetas, color/ícono |
| Revisión de un par | Comentario de aprobación en el PR |

## 4. Actividades específicas

1. Leer `proyecto/CASO.md` (mapa de derivación y flujos F1–F8),
   `proyecto/REQUISITOS.md` (RF-01..RF-06, RNF-01) y ADR-0006. Entregable: lista
   de 5–8 tareas del usuario piloto en el PR.
2. Dibujar el flujo de navegación entre las cinco pantallas y dejarlo en
   `docs/diseno/FLUJO.md`. Terminado: cada tarea del punto 1 tiene un camino.
3. Construir las pantallas en la app real, baja fidelidad primero, en escritorio
   y celular (RNF-01: Chrome, Edge, Android). Cada pantalla es una feature de
   su dominio (`apps/web/src/app/features/<dominio>/`: ruta + vista) y compone
   `apps/web/src/app/ui/`; la skill `docu-frontend` fija el contrato (ruta,
   datos, acciones, estados).
4. Definir categorías y etiquetas (ex-#28, absorbido aquí) a partir de las familias:
   `programa_planeacion`, `recepcion_rollo`, `inventario`, `excel_turno`,
   `correo_hermana`, `escaneado` (`ingenieria/MODELO-DATOS.md`).
5. Diseñar los estados: cargando, vacío, error con mensaje claro, cuarentena con
   motivo visible, dato confirmado con quién y cuándo.
6. Pasar a una persona del equipo por el flujo y anotar dónde se trabó.
7. Entregar con PR desde `feat/11-prototipos-ui-ux`: pantallas, specs,
   `FLUJO.md`, `CATEGORIAS.md`, capturas y `bun run verify` en verde.

**El reporte y su dependencia.** La pantalla de Reporte se construye con el
fixture local; el endpoint `GET /v1/reports/...` lo entrega #39 (Emmanuel). El
cambio de fixture a endpoint es el mismo intercambio del punto 3 del §8.1 y no
reabre el brief.

## 5. Entradas y salidas

- Recibe: requisitos y caso (repo), familias (`MODELO-DATOS.md`), matriz de
  roles preliminar de Carlos (#29) para saber quién ve qué, los tokens y el
  design system de #41 (`docs/diseno/`) y la plataforma frontend de #84
  (PR #104: `core/`, `features/<dominio>/`, `ui/`).
- Entrega: a Erik y Emmanuel, por PR desde `feat/11-prototipos-ui-ux`: las
  pantallas con sus pruebas, el flujo (`FLUJO.md`), las categorías
  (`CATEGORIAS.md`) y las capturas. El PR es producto: código y docs.

## 6. Referencias y caja de herramientas

- `docs/proyecto/CASO.md`: mapa de derivación (pantallas por flujo), flujos F1–F8
  y guiones de demo G1–G6 (son los que se corren en la demo del 24-nov).
- `docs/proyecto/REQUISITOS.md`: RF-01 (subir y clasificar), RF-02 (cuarentena
  con motivo), RF-03 (confirmación humana), RF-04 (búsqueda con citas),
  RF-05 (reporte y alerta), RF-06 (roles; lo implementa #5, la pantalla solo
  muestra el alcance), RNF-01 (usabilidad).
- `docs/ingenieria/ALCANCE-SOLUCION.md` §2: endpoints previstos.
- ADR-0006 (la confirmación humana es visible) y ADR-0012 (por qué aún no hay código).
- Accesibilidad: criterios WCAG 2.2 AA; verificar contraste con la extensión axe.
- La IA puede generar variantes de layout y textos de error; tú decides cuál queda.

Recursos oficiales y curados para diseñar el flujo:

| Para | Recurso | Cuándo usarlo |
|---|---|---|
| Criterios exactos AA | https://www.w3.org/WAI/WCAG22/quickref/ (contraste, foco, nombres accesibles) | Al definir cada pantalla y sus estados de error |
| Verificación automática | https://www.deque.com/axe/ (extensión axe DevTools) | Al auditar el prototipo antes del PR |
| Patrones de usabilidad | https://www.nngroup.com (heurísticas, mensajes de error, densidad de datos) | Al diseñar bandeja/cuarentena y búsqueda con cita |
| Marca ya elegida | Dirección ganadora de Fase 1 (`BRIEF-41`) + tokens de #41 (`docs/diseno/`) | Al pasar de baja a alta fidelidad |
| Inspiración documental y lineage | Lista curada de `BRIEF-41` §6 (SaaSUI, DataHub/OpenMetadata, ProvenanceWidgets) | Al dibujar la cita de fuente por cifra |
| Flujos reales de referencia | Curaduría del equipo: https://pageflows.com (flujos subir→revisar→consultar), https://ui-patterns.com y https://www.uisources.com (bandejas, filtros, tablas) | Al dibujar la navegación antes de prototipar |
| Estados vacíos/error ilustrados | Curaduría del equipo: https://undraw.co y https://openpeeps.com (ilustraciones) | Al diseñar vacío, error y cuarentena sin pantallas frías |
| Tamaños reales de pantalla | Curaduría del equipo: https://screensiz.es (viewport Android + desktop) | Al cumplir RNF-01 celular + escritorio |
| Diagramar el flujo | https://excalidraw.com (rápido, exportable) | Al entregar `FLUJO.md` |
| Por qué funciona cada patrón | Curaduría del equipo: https://lawsofux.com (leyes: Hick, Miller, proximidad) y https://www.nngroup.com (heurísticas, densidad de datos) | Al justificar decisiones de bandeja y búsqueda |
| Formularios que no cansan | Curaduría del equipo: https://www.frontendpractice.com (clones reales) | Al diseñar captura con validación |
| Investigación de e-commerce aplicable | https://baymard.com (checkout, errores, confirmaciones) | Al diseñar cuarentena→confirmación como un checkout de confianza |

## 7. Cómo trabajar

- Con OpenCode: `bash scripts/rama-env.sh 11 feat/11-prototipos-ui-ux` (o
  `git switch feat/11-prototipos-ui-ux`), luego `opencode`, `/inicio` y
  `/tarea 11`. La skill `docu-frontend` dice cómo va cada pieza.
- La rama `design/kira-playground` está abandonada: no se restaura, no se
  trabaja ahí, no se mezcla con `main`.
- Sin API ni BD en esta etapa: cada pantalla usa su fixture local versionado
  (`features/<dominio>/fixtures/`) hasta que #61 entregue el corpus. Cero
  valores reales de planta.
- A `main` viaja lo afirmado (código de las pantallas, docs y capturas) por PR
  con `Closes #11` y `bun run verify` en verde.
- Estado: #11 se mueve a `En progreso` cuando la plataforma de #84 esté
  integrada (PR #104). Una persona, un issue `En progreso`.
- La IA genera y varía; no decide reglas, permisos, dato oficial ni diseño final.
- Duda de 30 min: pregunta al equipo. Bloqueo de 24 h: etiqueta `bloqueado`.

## 8. Criterios de aceptación

- [ ] Las cinco pantallas (captura, bandeja, programa, búsqueda, reporte) existen en la app real (`apps/web/src/app/features/`) y se navega entre ellas.
- [ ] Cada pantalla tiene versión escritorio y celular.
- [ ] La bandeja muestra el motivo de cuarentena y la acción de confirmar.
- [ ] La búsqueda muestra de qué archivo y regla sale cada cifra.
- [ ] El programa muestra los bloqueos vivos (rollo no asignable, material insuficiente).
- [ ] El reporte muestra cada número con su origen.
- [ ] Cada pantalla tiene estados cargando, vacío, error y confirmado.
- [ ] Cada pantalla tiene su spec; `bun --filter web test` en verde.
- [ ] `docs/diseno/FLUJO.md` y `docs/diseno/CATEGORIAS.md` en el PR, con `bun run verify` en verde.
- [ ] El PR no trae ramas huérfanas ni código fuera de `apps/web`.
- [ ] Un par revisó y aprobó.

### 8.1 Contrato, pruebas y criterio de listo

**Contrato.** Las pantallas ya son navegables y consumen datos (el fixture local
mientras #61 no entregue el corpus), no pantallas vacías: sirven de spec de UI
para el frontend real (#4).

**Criterios (Given/When/Then).**

1. **Given** los datos de la pantalla (fixture local o corpus del mes), **when**
   se abre el flujo de revisión, **then** muestra los casos que el caso
   describe, con sus valores.
2. **Given** un revisor, **when** recorre el flujo completo, **then** puede
   llegar del programa al oficial sin ayuda y en menos de 10 minutos.
3. **Given** la plataforma frontend (#84, PR #104), **when** se compara la
   pantalla con la base, **then** vive en su feature de dominio, compone
   `ui/` y no duplica lógica de plataforma.
4. **Given** el corpus de #61 (o el endpoint de #39 para el reporte), **when**
   llega, **then** sustituir el fixture por el corpus no cambia la pantalla ni
   sus specs.
5. **Given** una cifra oficial, **when** se busca en la pantalla de búsqueda,
   **then** se ve de qué archivo y regla salió, y quién la confirmó.

**Plan de pruebas.** Specs de cada pantalla (Vitest), recorrido manual
cronometrado con captura en cada paso, y verificación de que los datos salen
del fixture o del corpus (no de valores sueltos en la vista).

**Evidencia.** Video del recorrido, capturas de cada pantalla con datos y el PR
con `Closes #11`.

**Listo cuando.** El flujo del caso se puede recorrer entero con datos y sirve
de spec para #4.

## 9. Riesgos nombrados

Es la primera fecha del proyecto (9-oct). Riesgo: pulir la estética antes de
cerrar el flujo. Mitigación: baja fidelidad primero; la marca (colores,
tipografía) ya está entregada por #41.

Riesgo: la plataforma (#84, PR #104) no llega a tiempo y Kira se queda sin
base. Mitigación: la rama `feat/11-prototipos-ui-ux` existe desde ya; si el
PR #104 no está integrado el 13-nov, se trabaja sobre `main` y se rebasea al
integrarse. Mientras tanto, `docs/diseno/FLUJO.md` y `CATEGORIAS.md` no
dependen de la plataforma y pueden adelantar.

Riesgo: el corpus de #61 no llega y las pantallas quedan con datos de mentira.
Mitigación: fixtures versionados y marcados; el intercambio fixture→corpus
está en el criterio 4 de §8.1.

Riesgo: la pantalla de Reporte depende de #39 (endpoint). Mitigación: el
fixture local la deja construible y el intercambio está escrito (§4).

## 10. Revisión

Estado 2026-11-05: #41 (marca y design system) entregado. #11 se trabaja en la
rama `feat/11-prototipos-ui-ux` sobre la app real; la plataforma de #84 llega
por PR #104 y se revisa como base (Kira es CODEOWNER de `apps/web`).

Lunes 2026-11-16 en el sync: recorrido del flujo de 10 minutos con Erik.

Replanificación v2 (2026-10-30): las pantallas son funcionales y usan datos
reales del dataset (#61); la marca y el design system de #41 ya están
entregados.

## 11. Insumos del agente

| Insumo | Estado | Notas |
|---|---|---|
| Plataforma frontend (#84) | En revisión | PR #104: `core/`, `features/<dominio>/`, `ui/`; Kira revisa `apps/web` |
| Rama `feat/11-prototipos-ui-ux` | Entregado | Creada desde `main` con `scripts/rama-env.sh` |
| Skill `docu-frontend` | Entregado | Niveles de UI, contrato de pantalla y reglas del repo |
| Mapa de derivación del caso | Entregado | `proyecto/CASO.md`: qué pantalla produce cada flujo |
| DESIGN.md | Parcial | Falta llenarlo con la dirección elegida |
| design-system.md | Entregado | #41: tokens, tipografía y componentes base en `docs/diseno/` |
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


> [11] Mockups funcionales — kirxllix, 13→16-nov. Pantallas funcionales navegables en la app real con el flujo del caso y datos del dataset, no pantallas vacías. Entradas recibidas de docs/proyecto/CASO.md (mapa de derivación), del dataset (#61) y de la plataforma (#84). Entregable: cinco pantallas navegables (captura, bandeja, programa, búsqueda, reporte) con sus datos. Revisión el 16-nov. Detalle: `docs/briefs/BRIEF-11-prototipos-ui-ux.md`.
