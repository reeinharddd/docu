# BRIEF #4 — Frontend Angular: captura, bandeja, Programa Oficial y búsqueda

## 0. Encabezado

- Issue: #4
- Dueño: Kira
- Fechas: 2026-10-19 → 2026-11-20 · Sprint 2
- Prioridad / Tipo / Épica / Módulo: alta / tarea / Frontend / frontend
- Requisitos: RF-01, RF-03, RF-04; RNF-01
- Bloqueado por: #41 fase 2 (design system) · Requiere: K1, M1, E2

## 1. Contexto

El frontend actual está en estado inicial: rutas vacías, componentes skeleton, sin tokens en `styles.css`. Este brief construye las 4 pantallas completas con navegación, consumo de API y pruebas e2e.

## 2. Por qué importa tu parte

Es la primera implementación real del producto. Si el frontend no consume la API real (M1/E2) y no tiene pruebas e2e, el flujo subir → revisar → consultar no está demostrado.

## 3. Objetivo y resultado esperado

Aplicación Angular + Tailwind funcional con las 4 pantallas, navegación, consumo de API y pruebas e2e.

| Entregable | Evidencia |
|---|---|
| 4 pantallas funcionales (captura, bandeja, Programa Oficial, búsqueda) | Navegación real entre pantallas |
| Rutas y navegación configuradas | `app.routes.ts` con rutas |
| Consumo de API M1/E2 | Servicios con httpResource |
| Tokens de design system aplicados | `@theme` en `styles.css` |
| Pruebas e2e (Playwright) | Flujo completo contra API real |
| Lighthouse/axe en pantallas clave | Reporte sin errores AA |

## 4. Actividades específicas

1. Configurar rutas y navegación entre las 4 pantallas. Terminado: `app.routes.ts` con rutas funcionales.
2. Aplicar tokens de design system a `styles.css` (@theme). Terminado: tokens de #41 fase 2 aplicados.
3. Construir pantalla de captura con validación inmediata. Terminado: formulario con validación y estados.
4. Construir bandeja de revisión/cuarentena con motivo visible y acción de confirmar. Terminado: tabla con filtros y acciones.
5. Construir Programa Oficial en formato hoja de cálculo. Terminado: vista tipo spreadsheet con datos.
6. Construir búsqueda con cita de fuente. Terminado: cada cifra muestra fuente y cálculo.
7. Conectar servicios a API M1/E2. Terminado: httpResource con datos reales.
8. Escribir pruebas e2e (Playwright) del flujo completo. Terminado: flujo subir → revisar → consultar contra API real.
9. Ejecutar Lighthouse/axe en pantallas clave. Terminado: sin errores AA.

Total estimado: 15–20 h.

## 5. Entradas y salidas

- Recibe: design system de #41 fase 2, prototipos de #11, API M1/E2.
- Entrega: frontend funcional con 4 pantallas, navegación, consumo de API, pruebas e2e.

## 6. Referencias y caja de herramientas

- `docs/diseno/DESIGN-SYSTEM.md` — tokens y componentes base
- `docs/briefs/BRIEF-11-prototipos-ui-ux.md` — prototipos de las 4 pantallas
- `docs/ingenieria/STACK.md` — Angular 22 + Tailwind 4
- Angular 22 zoneless, señales, @defer, httpResource

### Explorar en playground (componentes y patrones)
- [shadcn/ui](https://ui.shadcn.com/) — Patrones de componentes. **Cuándo:** componentes de calidad.
- [PrimeNG](https://primeng.org/) — UI kit Angular. **Cuándo:** componentes Angular.
- [Angular Material](https://material.angular.io/) — UI kit Angular. **Cuándo:** Material Design.
- [Taiga UI](https://taiga-ui.dev/) — UI kit Angular. **Cuándo:** alternativa ligera.
- [AG Grid](https://www.ag-grid.com/angular-data-grid/) — Tablas densas. **Cuándo:** tablas con filtros, orden, paginación.
- [motion.dev](https://motion.dev/) — Animación con respeto. **Cuándo:** animar transiciones.
- [CSS Layout Generator](https://layout.bradwoods.io/) — Layouts CSS. **Cuándo:** generar layouts.

### Prototipar flujo (patrones y estados)
- [lawsofux.com](https://lawsofux.com/) — Leyes: Hick, Miller, proximidad. **Cuándo:** justificar decisiones de UI.
- [nngroup.com](https://www.nngroup.com/) — Heurísticas, densidad de datos. **Cuándo:** evaluar usabilidad.
- [baymard.com](https://baymard.com/) — Checkout, errores, confirmaciones. **Cuándo:** diseñar flujos de confirmación.
- [Frontend Practice](https://www.frontendpractice.com/) — Formularios que no cansan. **Cuándo:** diseñar formularios.
- [unDraw](https://undraw.co/) / [Open Peeps](https://openpeeps.com/) — Ilustraciones. **Cuándo:** ilustraciones para vacío/error.
- [screensiz.es](https://screensiz.es/) — Viewports reales. **Cuándo:** verificar tamaños de pantalla.
- [W3C WCAG 2.2](https://www.w3.org/WAI/WCAG22/quickref/) — Criterios AA exactos. **Cuándo:** verificar accesibilidad.
- [axe DevTools](https://www.deque.com/axe/) — Verificación automática. **Cuándo:** auditar accesibilidad.

## 7. Cómo trabajar

- Con OpenCode: `/tarea 4` para empezar y `/cerrar` para el PR.
- La IA genera y varía; no decide reglas, permisos, dato oficial ni diseño final.
- TypeScript estricto. Nada de any sin justificación escrita.
- Duda de 30 min: preguntar al equipo. Bloqueo de 24 h: etiqueta `bloqueado`.
- Español, Chrome/Edge y celular.

## 8. Criterios de aceptación

- [ ] 4 pantallas funcionales (captura, bandeja, Programa Oficial, búsqueda)
- [ ] Rutas y navegación configuradas
- [ ] Consumo de API M1/E2 con httpResource
- [ ] Tokens de design system aplicados (@theme en styles.css)
- [ ] Pruebas e2e (Playwright) del flujo completo en verde
- [ ] Lighthouse/axe sin errores AA en pantallas clave
- [ ] Escritorio y celular (RNF-01)
- [ ] Español

## 9. Riesgos nombrados

- API M1/E2 no lista. Mitigación: usar mocks hasta que la API esté disponible.
- Design system no aprobado. Mitigación: usar tokens de Fase 1 como base.
- Retraso por pruebas e2e. Mitigación: priorizar flujo crítico (subir → confirmar → consultar).

## 9.1. Nota de alcance futuro (obligatorio para entrega final)

Las 4 pantallas (captura, bandeja, Programa Oficial, búsqueda) son la **fase inicial**, no el alcance total. Para entregar un producto completo y demostrable en vivo, es **obligatorio** añadir:

- Login y registro
- Gestión de usuarios
- Roles y permisos (RBAC)
- Bitácora/auditoría
- Configuración de empresa (Configuración 2)
- Dashboard/home

Estas pantallas se agregarán como fases posteriores dentro de este brief, con sus propios entregables y criterios. No se delimitan ahora porque dependen del backend y datos reales. Se revisarán cuando haya más información.

## 10. Revisión

Sprint 2 cierra 2026-11-20. Revisión de avances en syncs de lunes y viernes.

## 11. Insumos del agente

| Insumo | Estado | Notas |
|---|---|---|
| DESIGN.md | Pendiente | Plantilla en `docs/plantillas/DESIGN.md` |
| AGENTS.md | Pendiente | Plantilla en `docs/plantillas/AGENTS.md` |
| design-system.md | Pendiente | Plantilla en `docs/plantillas/design-system.md` |
| Visión | Pendiente | 1 párrafo |
| Slogan | Pendiente | Frase corta |
| Paleta | Pendiente | OKLCH + hex + contraste AA |
| Tipografías | Pendiente | Display, body, mono con escala modular |
| Iconos | Pendiente | Set elegido |
| Imágenes | Pendiente | Logo, ilustraciones, fotos |
| Estados | Pendiente | Cargando, vacío, error, cuarentena, confirmado |

## 12. Recursos por actividad

### Explorar en playground (componentes y patrones)
- [shadcn/ui](https://ui.shadcn.com/) — Patrones de componentes. **Cuándo:** componentes de calidad.
- [PrimeNG](https://primeng.org/) — UI kit Angular. **Cuándo:** componentes Angular.
- [Angular Material](https://material.angular.io/) — UI kit Angular. **Cuándo:** Material Design.
- [Taiga UI](https://taiga-ui.dev/) — UI kit Angular. **Cuándo:** alternativa ligera.
- [AG Grid](https://www.ag-grid.com/angular-data-grid/) — Tablas densas. **Cuándo:** tablas con filtros, orden, paginación.
- [motion.dev](https://motion.dev/) — Animación con respeto. **Cuándo:** animar transiciones.
- [CSS Layout Generator](https://layout.bradwoods.io/) — Layouts CSS. **Cuándo:** generar layouts.

### Prototipar flujo (patrones y estados)
- [lawsofux.com](https://lawsofux.com/) — Leyes: Hick, Miller, proximidad. **Cuándo:** justificar decisiones de UI.
- [nngroup.com](https://www.nngroup.com/) — Heurísticas, densidad de datos. **Cuándo:** evaluar usabilidad.
- [baymard.com](https://baymard.com/) — Checkout, errores, confirmaciones. **Cuándo:** diseñar flujos de confirmación.
- [Frontend Practice](https://www.frontendpractice.com/) — Formularios que no cansan. **Cuándo:** diseñar formularios.
- [unDraw](https://undraw.co/) / [Open Peeps](https://openpeeps.com/) — Ilustraciones. **Cuándo:** ilustraciones para vacío/error.
- [screensiz.es](https://screensiz.es/) — Viewports reales. **Cuándo:** verificar tamaños de pantalla.
- [W3C WCAG 2.2](https://www.w3.org/WAI/WCAG22/quickref/) — Criterios AA exactos. **Cuándo:** verificar accesibilidad.
- [axe DevTools](https://www.deque.com/axe/) — Verificación automática. **Cuándo:** auditar accesibilidad.
