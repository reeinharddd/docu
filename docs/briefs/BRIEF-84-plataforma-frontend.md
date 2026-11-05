# BRIEF #84 — Plataforma frontend: base mínima para que el caso se vea real

## 0. Encabezado

- Issue: #84 — https://github.com/reeinharddd/docu/issues/84
- Dueño: Erik Alfonso Beltrán Ramírez (`reeinharddd`); Kira Angel López (`kirxllix`) colabora en la estética y hereda la base
- Fechas: 2026-11-02 → 2026-11-10 · Sprint 2 → 3 · hito `C1 modelo y BD` (12-nov)
- Prioridad / Tipo / Épica / Módulo: alta / tarea / Frontend / plataforma
- Requisitos: RNF-01
- Bloqueado por: — · Bloquea a: #11, #4

## 1. Contexto

Kira y Erik hacen al frente del frontend. Sin una base común, cada pantalla
nace con su propio estilo y sus propios atajos, y la demo del 24-nov se ve
como cuatro pantallas pegadas. La plataforma es lo mínimo que hace que las
pantallas del caso se vean como un producto: tokens, layout, rutas, cliente de
API, tests y estilos.

## 2. Por qué importa tu parte

#4 (frontend real) y #11 (mockups) se construyen encima de esta base. Si la
base no está el 10-nov, los dos carriles de Kira se bloquean el uno al otro y el
24-nov no hay producto que enseñar. Si la base existe, el trabajo de #4 es
construir pantallas, no decidir infraestructura de estilos.

## 3. Objetivo y resultado esperado

| Entregable | Evidencia |
|---|---|
| Tokens y layout base | Variables de Tailwind v4, tipografía, espaciado y contenedores, en `apps/web/src/styles/` |
| Estructura de rutas | Cada feature es dueño de sus rutas (`features/<dominio>/<dominio>.routes.ts`); `app.routes.ts` solo las monta. Rutas del caso: `capture`, `inbox`, `schedule`, `search`, más `login` y `forbidden` |
| Cliente de API | Un servicio tipado que llama a la API real y maneja error, carga y vacío |
| Pruebas | Al menos una prueba por ruta y una del cliente, con el runner del proyecto |
| Estilo sin CSS global | Solo estilos de componente; nada de CSS global salvo los tokens |
| Kit de UI atómico | `Button`, `PageHeader`, `StateView`, `StatusBadge` y toasts: una pantalla nunca escribe el CSS de un botón |

## 4. Actividades específicas

1. Definir los tokens (color, tipografía, espaciado, radio, sombra) como
   variables de Tailwind v4. Terminado: una pantalla consume tokens y no
   colores sueltos.
2. Montar el layout y la navegación por rutas. Terminado: las cuatro rutas
   del caso existen y se llega a cada una con la navegación.
3. Escribir el cliente de API tipado. Terminado: una llamada real (puede ser
   un mock de la API) con estado de carga, error y vacío.
4. Configurar el runner de pruebas del proyecto web y escribir las primeras
   pruebas. Terminado: `bun run test` del workspace web en verde.
5. Revisar que no quedó CSS global. Terminado: cero reglas globales fuera de
   los tokens.

## 5. Entradas y salidas

- Recibe: `docs/proyecto/CASO.md` (#83), los tokens y el design system que ya
  están en `main` (`docs/diseno/`), y la arquitectura de frontend existente en
  `apps/web/`.
- Entrega: la base en `apps/web/`, por PR con `Closes #84`.

## 6. Referencias y caja de herramientas

- `docs/diseno/README.md`: tokens y componentes base ya entregados.
- `docs/decisiones/ADR-0003-angular-zoneless-sin-zone-js.md`: Angular 22
  zoneless, sin `zone.js`.
- `docs/ingenieria/STACK.md` §Angular: versiones y comandos reales.
- `apps/web/`: la app que existe; el runner de pruebas se configura aquí.
- Skill `ecc-angular-developer`: señales, rutas y estructura de componentes.
- Skill `docu-documentar`: si la base cambia una regla del proyecto.

## 7. Cómo trabajar

- Erik construye la base (infraestructura y arquitectura); Kira afina la estética y arranca #11 en cuanto la base aterrice.
- Nada de CSS global: si dos pantallas lo necesitan, es un token.
- PRs pequeños, 1 revisor (Erik), evidencia adjunta.

## 8. Criterios de aceptación

- [ ] Las cuatro rutas del caso existen y se navega entre ellas.
- [ ] Cada feature declara sus propias rutas (archivo `<dominio>.routes.ts`) y la app solo las monta.
- [ ] Los tokens están definidos y ninguna pantalla usa colores sueltos.
- [ ] El cliente de API maneja carga, error y vacío.
- [ ] El runner de pruebas corre y hay al menos una prueba por ruta.
- [ ] Cero CSS global fuera de los tokens.
- [ ] No hay CSS de botón en las pantallas: todas usan el componente atómico `Button`.

### 8.1 Contrato, pruebas y criterio de listo

**Contrato.** La plataforma es la base que #4 y #11 comparten: rutas, tokens,
cliente de API y pruebas ya instaladas.

**Criterios (Given/When/Then).**

1. **Given** una ruta nueva, **when** se crea, **then** hereda layout,
   navegación y tokens sin código extra, y la prueba de la ruta se escribe con
   ella.
2. **Given** la API caída, **when** se abre una pantalla, **then** el error se
   muestra con un mensaje accionable, no una pantalla en blanco.
3. **Given** el runner de pruebas, **when** corre en CI, **then** falla si una
   prueba falla y no se puede saltarse.

**Plan de pruebas.** `bun run test` del workspace web en verde, el typecheck
del workspace en verde y el build de la app sin errores.

**Evidencia.** Capturas de las cuatro rutas, la salida de las pruebas y el
build, en el PR con `Closes #84`.

**Listo cuando.** La base está en `main`, probada y #4 y #11 pueden empezar
sin decidir infraestructura.

## 8bis. Alcance ampliado (decisión del líder, 2026-11-03)

La demo del 24-nov no serán 4 pantallas sueltas: la plataforma deja el marco
completo marcado para todas las etapas del frontend — rutas con guards y
permisos reales (`authGuard`, `requiresPermission`, `/login`, `/forbidden`,
wildcard), interceptores (base de API, token, errores), kit de UI atómico
(`PageHeader`, `StateView`, `StatusBadge`), tipos transversales con el backend
(mismo TypeScript: `Session`, `Permission`), patrones de prueba y la skill
`docu-frontend` que fija las convenciones. Además, el **mecanismo de
coordinación front ↔ backend** quedó fijado (ALCANCE-SOLUCION §2.1): sobre
único de errores (`ApiError` transversal, 7 códigos estables), flujos 401/403
en el interceptor, toasts de acciones separados de las lecturas, contrato de
subida de archivos y guardas de seguridad (token en memoria, nada de bypass
de sanitización, el servidor es la autoridad). Los datos de demo están
marcados como efímeros: nada demo llega a la versión final, todo será
dinámico desde el backend real (#12).

**Arquitectura por dominios (decisión del líder, 2026-11-04).** Una feature es
un dominio y es dueña de su parte: sus rutas, sus vistas y, cuando los haya,
su servicio y sus tipos. `core/` guarda lo transversal y se ordena **por tipo
primero y por dominio después**. La estructura queda así:

```text
apps/web/src/app/
├── core/
│   ├── types/               # contratos transversales: api-error, api-state, permissions
│   ├── services/            # servicios transversales: api/, auth/, notifications/
│   ├── middleware/          # guards e interceptores: auth/, permissions/, api/
│   └── config/              # api-url
├── features/<dominio>/      # un dominio = una feature
│   ├── <dominio>.routes.ts  # sus rutas, su título y su permiso
│   └── views/               # sus vistas (data/ y model/ cuando existan)
└── ui/
    ├── atoms/               # button, status-badge
    ├── molecules/           # page-header, state-view
    └── organisms/           # toasts
```

Reglas que fija esta arquitectura:

- `app.routes.ts` solo monta features (lazy `loadChildren`); cada feature
  declara el permiso que necesita y sus rutas quedan trazables a un archivo.
- Los niveles de UI no se mezclan: un átomo no importa una molécula, una
  molécula compone átomos, un organismo se monta en la app.
- **Solo Tailwind**: las utilidades van en el template y los tokens en
  `styles/tokens.css`. Ningún componente tiene archivo `.css` propio; los
  estilos del host van en `host: { class: ... }`.
- Identificadores y clases en inglés; el texto de la interfaz en español.
- El CSS de los botones vive en el átomo (`ui/atoms/button/`), no en las
  pantallas: si cambia un botón, cambian todos.


## 9. Riesgos nombrados

Que la base crezca y se vuelva plataforma de la plataforma: la mitigación es
esta lista, que es corta a propósito. Lo que no está aquí, no entra.

## 10. Revisión

Martes 10-nov en el sync: se recorre la base con Erik y se afirma o se devuelve con
motivos. Después: #11 (mockups, 13-nov) y #4 (frontend real, 17-nov).

## Versión corta (descripción del issue)

> [84] Plataforma frontend — kirxllix, 2→10-nov. Base mínima de frontend: tokens, layout, rutas, cliente de API, pruebas y estilos. Entradas recibidas del design system ya entregado y de la arquitectura (#60). Entregable: base en apps/web, probada y en main. Revisión el 10-nov. Detalle: `docs/briefs/BRIEF-84-plataforma-frontend.md`.
