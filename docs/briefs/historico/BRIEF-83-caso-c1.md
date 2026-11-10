# BRIEF #83 — Caso C1: involucrados, responsabilidades, flujos y conversaciones

## 0. Encabezado

- Issue: #83 — https://github.com/reeinharddd/docu/issues/83
- Dueño: Erik Alfonso Beltrán Ramírez (`reeinharddd`)
- Fechas: 2026-11-02 → 2026-11-06 · Sprint 2 · hito `C1 modelo y BD` (12-nov)
- Prioridad / Tipo / Épica / Módulo: alta / tarea / QA-Documentación / caso de negocio
- Requisitos: RNF-07
- Bloqueado por: — · Bloquea a: #58, #61, #11

## 1. Contexto

El caso de ejemplo (Baja SterilPack) está described a medias: hay personas, hay
un flujo, pero no está claro **qué falla, cómo se resuelve y por qué eso
afecta al resto del diseño**. Sin el caso cerrado, el ER (#58), el dataset (#61)
y los mockups (#11) tienen que inventar entradas.

## 2. Por qué importa tu parte

El caso es la entrada de tres carriles: el ER deriva de él, el dataset sale de
él y las pantallas del caso salen de él. Si el caso queda abierto, cada persona
toma su decisión con el mismo nombre pero distinto significado, y la primera
vez que se comparan aparece un conflicto de una semana.

## 3. Objetivo y resultado esperado

| Entregable | Evidencia |
|---|---|
| `docs/proyecto/CASO.md` ampliado | Personas con su rol y sus permisos, flujos paso a paso, las conversaciones que hoy el caso tiene, y **qué falla → cómo se resuelve → por qué afecta y cómo** |
| Mapa de derivación | Una tabla: cada flujo produce qué pantalla, qué endpoint, qué dato, qué regla y qué guion de la demo |
| Criterio de Hecho del caso | La lista de condiciones verificables que dicen que el caso está cerrado |

## 4. Actividades específicas

1. Listar las personas del caso (organigrama de `CASO.md`) y, para cada una,
   qué puede ver, qué puede hacer y qué no puede. Terminado: tabla con rol,
   alcance y acciones, sin ambigüedad.
2. Describir cada flujo paso a paso, con la conversación o el documento que
   intercambia cada paso. Terminado: cada paso tiene entrada, acción y salida.
3. Escribir, para cada fallo conocido del caso, cómo se resuelve y por qué esa
   resolución afecta al diseño. Terminado: cada fallo tiene su regla y su
   efecto declarado.
4. Construir el mapa de derivación. Terminado: cada flujo del caso tiene al
   menos una pantalla, un endpoint y un guion de demo.
5. Cerrar con la lista de criterios de Hecho y la revisión con el equipo.

## 5. Entradas y salidas

- Recibe: `docs/proyecto/CASO.md`, `docs/proyecto/REQUISITOS.md`,
  `docs/proyecto/ROLES.md`, `docs/ingenieria/fichas/` y las memorias del equipo
  en Engram.
- Entrega: `docs/proyecto/CASO.md` y `docs/proyecto/REQUISITOS.md` actualizados,
  por PR con `Closes #83`.

## 6. Referencias y caja de herramientas

- `docs/gestion/REPLAN-2026-10-30.md` §2 (regla de oro: nada específico del
  caso es código) y §5 (carriles).
- `docs/decisiones/ADR-0009-reglas-del-caso-como-datos.md`: las reglas son
  datos.
- `docs/ingenieria/fichas/`: el contrato de los documentos del caso.
- `docs/proyecto/EQUIPO.md`: quién es quién.
- Guía de documentación: skill `docu-documentar`. Decisiones: `docu-gestion`.

## 7. Cómo trabajar

- La IA propone el texto; el líder decide el caso. El caso es del negocio:
  si una frase no la puede confirmar el líder, no se escribe.
- Pregunta en el issue, no por mensaje suelto. Bloqueo > 24 h: etiqueta
  `bloqueado` y aviso al líder.
- PR pequeño, 1 revisor (Erik), evidencia adjunta.

## 8. Criterios de aceptación

- [ ] `CASO.md` tiene personas, flujos, conversaciones, fallos y resoluciones.
- [ ] El mapa de derivación cubre todos los flujos del caso.
- [ ] Los criterios de Hecho del caso son verificables por un tercero.
- [ ] `docs/proyecto/REQUISITOS.md` no contradice al caso ampliado.

### 8.1 Contrato, pruebas y criterio de listo

**Contrato.** El caso cerrado es la entrada de los carriles B, D, F y H: cada
uno consume el mapa de derivación y no necesita preguntar qué significa un
flujo.

**Criterios (Given/When/Then).**

1. **Given** el mapa de derivación, **when** el dueño del ER (#58) lo lee,
   **then** sabe qué tablas y qué reglas crear, sin preguntar nada.
2. **Given** una persona del caso, **when** se busca su rol en el documento,
   **then** están su alcance, sus acciones y su flujo, con nombre.
3. **Given** un fallo del caso, **when** se busca en el documento, **then** está
   su resolución y el efecto que tiene en el diseño.

**Plan de pruebas.** Revisión cruzada con el dueño del ER y con el dueño del
dataset; lectura en voz alta de un flujo completo frente a la persona que lo
vive en el caso.

**Evidencia.** El PR con el documento, la revisión del líder y el mapa de
derivación completo.

**Listo cuando.** El líder afirma el caso y los criterios de Hecho están
escritos y verificados.

## 9. Riesgos nombrados

Que el caso se cierre "en la cabeza" y no en el documento: la mitigación es el
mapa de derivación, que se lee en el PR y se puede señalar.

## 10. Revisión

Jueves 6-nov en el sync: el caso se lee completo, con el equipo, y se afirma o
se devuelve con motivos. Después: el ER, el dataset y los mockups tienen su
entrada.

## Versión corta (descripción del issue)

> [83] Caso C1 — reeinharddd, 2→6-nov. Cerrar el diseño del caso: personas, flujos, conversaciones, qué falla, cómo se resuelve y por qué afecta al resto del diseño. Entradas recibidas de docs/proyecto/CASO.md y docs/proyecto/REQUISITOS.md. Entregable: CASO.md ampliado con mapa de derivación, más la evidencia de la revisión del líder. Revisión el 6-nov. Detalle: `docs/briefs/BRIEF-83-caso-c1.md`.
