# BRIEF #84 — Plataforma frontend: base mínima para que el caso se vea real

## 0. Encabezado

- Issue: #84 — https://github.com/reeinharddd/docu/issues/84
- Dueño: Kira Angel López (`kirxllix`)
- Fechas: 2026-11-02 → 2026-11-06 · Sprint 2 · hito `C1 modelo y BD` (12-nov)
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
base no está el lunes, los dos carriles de Kira se bloquean el uno al otro y el
24-nov no hay producto que enseñar. Si la base existe, el trabajo de #4 es
construir pantallas, no decidir infraestructura de estilos.

## 3. Objetivo y resultado esperado

| Entregable | Evidencia |
|---|---|
| Tokens y layout base | Variables de Tailwind v4, tipografía, espaciado y contenedores, en `apps/web/src/styles/` |
| Estructura de rutas | `captura`, `bandeja`, `programa-oficial`, `busqueda`, con layout y navegación |
| Cliente de API | Un servicio tipado que llama a la API real y maneja error, carga y vacío |
| Pruebas | Al menos una prueba por ruta y una del cliente, con el runner del proyecto |
| Estilo sin CSS global | Solo estilos de componente; nada de CSS global salvo los tokens |

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

- La IA propone la base; Kira decide la estética final con Erik en el sync.
- Nada de CSS global: si dos pantallas lo necesitan, es un token.
- PRs pequeños, 1 revisor (Erik), evidencia adjunta.

## 8. Criterios de aceptación

- [ ] Las cuatro rutas del caso existen y se navega entre ellas.
- [ ] Los tokens están definidos y ninguna pantalla usa colores sueltos.
- [ ] El cliente de API maneja carga, error y vacío.
- [ ] El runner de pruebas corre y hay al menos una prueba por ruta.
- [ ] Cero CSS global fuera de los tokens.

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

## 9. Riesgos nombrados

Que la base crezca y se vuelva plataforma de la plataforma: la mitigación es
esta lista, que es corta a propósito. Lo que no está aquí, no entra.

## 10. Revisión

Viernes 6-nov en el sync: se recorre la base con Erik y se afirma o se devuelve
con motivos. Después: #11 (mockups) y #4 (frontend real).

## Versión corta (descripción del issue)

> [84] Plataforma frontend — kirxllix, 2→6-nov. Base mínima de frontend: tokens, layout, rutas, cliente de API, pruebas y estilos. Entradas recibidas del design system ya entregado y de la arquitectura (#60). Entregable: base en apps/web, probada y en main. Revisión el 6-nov. Detalle: `docs/briefs/BRIEF-84-plataforma-frontend.md`.
