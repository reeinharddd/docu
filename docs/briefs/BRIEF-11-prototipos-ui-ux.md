# BRIEF #11 — Prototipos UI/UX y flujo de pantallas

## 0. Encabezado

- Issue: #11 (incluye #28 Definición de categorías y etiquetas)
- Dueño: Kira
- Fechas: 2026-10-16 → **2026-10-23** · Sprint 1 · hito `Cierre de diseño` (2026-10-16)
- Prioridad / Tipo / Épica / Módulo: alta / tarea / Frontend / diseño
- Requisitos: RNF-01 (usabilidad); alimenta RF-01, RF-03, RF-04
- Bloqueado por: nada · Bloquea a: #4 Frontend Angular

## 1. Contexto

La planta pierde horas cruzando Excels de turnos, plantas hermanas y escaneados.
DOCU recibe esos archivos, detecta su familia, manda lo dudoso a cuarentena con
motivo y deja que una persona confirme el dato oficial (`proyecto/CASO.md`,
ADR-0006). Las pantallas tienen que hacer ese flujo entendible en menos de 10
minutos para un usuario piloto.

## 2. Por qué importa tu parte

Por ADR-0012 nadie construye pantallas hasta que exista el design system. Tus
prototipos son la primera puerta: si se retrasan, #4 (frontend) y el Sprint 2
arrancan tarde, y el contrato de datos del 23 de octubre se congela sin saber qué
necesita cada pantalla. Si salen bien, el frontend se construye una sola vez.

## 3. Objetivo y resultado esperado

Prototipo navegable del flujo **subir → revisar → consultar** con las cuatro
pantallas del producto.

| Entregable | Evidencia |
|---|---|
| Flujo de pantallas (diagrama de navegación) | Imagen o enlace en `docs/diseno/FLUJO.md` |
| Prototipo navegable de: captura, bandeja de revisión/cuarentena, Programa Oficial, búsqueda con cita de fuente | Enlace público de solo lectura (Figma, Penpot u otra) + capturas en el PR |
| Categorías y etiquetas visibles en la interfaz (#28) | Tabla en `docs/diseno/CATEGORIAS.md`: familia, etiquetas, color/ícono |
| Estados de error y vacío por pantalla | Una captura por estado en el PR |
| Revisión de un par | Comentario de aprobación en el PR |

## 4. Actividades específicas

1. Leer `proyecto/CASO.md`, `proyecto/REQUISITOS.md` (RF-01..04, RNF-01) y
   ADR-0006. Entregable: lista de 5–8 tareas del usuario piloto en el PR.
2. Dibujar el flujo de navegación entre las cuatro pantallas. Terminado: cada
   tarea del punto 1 tiene un camino.
3. Prototipar las cuatro pantallas en baja fidelidad, en escritorio y celular
   (RNF-01: Chrome, Edge, Android).
4. Definir categorías y etiquetas (#28) a partir de las familias:
   `programa_planeacion`, `recepcion_rollo`, `inventario`, `excel_turno`,
   `correo_hermana`, `escaneado` (`ingenieria/MODELO-DATOS.md`).
5. Diseñar los estados: cargando, vacío, error con mensaje claro, cuarentena con
   motivo visible, dato confirmado con quién y cuándo.
6. Pasar a una persona del equipo por el flujo y anotar dónde se trabó.

## 5. Entradas y salidas

- Recibe: requisitos y caso (repo), familias (`MODELO-DATOS.md`), matriz de
  roles preliminar de Carlos (#29) para saber quién ve qué.
- Entrega: a Erik y Emmanuel, por PR a `docs/diseno/`, el flujo y qué datos
  muestra cada pantalla (insumo del contrato de datos #23).

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

- Con OpenCode: `/tarea 11` para empezar y `/cerrar` para el PR.
- La IA genera y varía; no decide reglas, permisos, dato oficial ni diseño final.
- Duda de 30 min: pregunta al equipo. Bloqueo de 24 h: etiqueta `bloqueado`.

## 8. Criterios de aceptación

- [ ] Las cuatro pantallas existen y se navega entre ellas.
- [ ] Cada pantalla tiene versión escritorio y celular.
- [ ] La bandeja muestra el motivo de cuarentena y la acción de confirmar.
- [ ] La búsqueda muestra de qué archivo y regla sale cada cifra.
- [ ] `docs/diseno/FLUJO.md` y `docs/diseno/CATEGORIAS.md` en el PR, con `bun run verify` en verde.
- [ ] Un par revisó y aprobó.

## 9. Riesgos nombrados

Es la primera fecha del proyecto (9-oct). Riesgo: pulir la estética antes de
cerrar el flujo. Mitigación: baja fidelidad primero; la marca (colores,
tipografía) se trabaja después en el playground de diseño.

## 10. Revisión

Viernes 2026-10-23 en el sync: recorrido del prototipo de 10 minutos con Erik.

Replanificación 2026-10-09: fechas 05→09-oct a 16→23-oct; va tras marca Fase 1 (#41-fase1).

## 11. Insumos del agente

| Insumo | Estado | Notas |
|---|---|---|
| DESIGN.md | Pendiente | Plantilla en `docs/plantillas/DESIGN.md` |
| AGENTS.md | Pendiente | Plantilla en `docs/plantillas/AGENTS.md` |
| design-system.md | Pendiente | Plantilla en `docs/plantillas/design-system.md` |
| Visión | Pendiente | 1 párrafo |
| Slogan | Pendiente | Frase corta |
| Paleta | Pendiente | Hex + nombre por token |
| Tipografías | Pendiente | Display, body, mono |
| Iconos | Pendiente | Set elegido |
| Imágenes | Pendiente | Logo, ilustraciones, fotos |
| Estados | Pendiente | Cargando, vacío, error, cuarentena, confirmado |

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
