# BRIEF #61 — Generador de dataset: corpus del mes, reproducible y verificable

## 0. Encabezado

- Issue: #61
- Dueño: Carlos (`WearyBerry`); Erik (`reeinharddd`) apoya y revisa.
- Fechas: 2026-11-03 → 2026-11-16 · Sprint 2 → 3 · hito `C1 vertical completa` (20-nov)
- Prioridad / Tipo / Épica / Módulo: alta / tarea / Datos / generacion
- Requisitos: RF-08, RNF-02, RNF-07
- Bloqueado por: #23 (contrato congelado), #58 (ER); #83 cerrado el 3-nov con PR #101 · Bloquea a: #59, #85, #86
- Dependencias que no bloquean el arranque: #58 (familias y reglas finales) y
  #23 (catálogo de reglas). Bloquean la **emisión final**, no el generador.
- Rama: `feat/61-generador-dataset` (desde `main`)

## 1. Contexto

El dataset del mes de octubre (5–30-oct, 20 días hábiles × 3 turnos = 60
turnos) es lo que prueba el caso de punta a punta: 6 familias de archivo, 7
reglas, 6 fallos crónicos y un incidente el lunes 26-oct. Volumen aprobado en
`docs/ingenieria/fichas/CONTRATO.md` §8 y §9.

**Punto de partida (2026-11-05):** ya están los **18 JSON Schemas** de las 6
familias (`dataset/config1/esquemas/`: schema + ejemplo válido + inválido por
familia, issue #9) y el **volumen aprobado transcrito a máquina** en
`dataset/config1/esperado.json` (conteos por familia, rango de ruido, ventana
de 60 turnos). Eso es el contrato contra el que se mide tu generador.

Lo que **no** existe todavía es el generador: `dataset/generar.ts`, las
plantillas de los archivos, la semilla versionada, el manifiesto y las
pruebas. La puerta `bun run dataset:check` hoy pasa en verde diciendo
`seed pending`: por diseño, valida lo que hay y no acepta el corpus hasta que
los conteos del manifiesto cuadren con `esperado.json`.

El corpus **no se versiona** (es grande y desechable). Lo que viaja a `main`
es lo reproducible: semilla + plantillas + esperado + manifiesto + el
generador + sus pruebas.

## 2. Por qué importa tu parte

El dataset es el terreno de pruebas de todo lo demás: sin corpus no hay
verificación de reglas, ni evaluación del modelo, ni demo con datos. Y si el
corpus no es reproducible, cada prueba mide una cosa distinta y nadie sabe qué
se comparó.

## 3. Objetivo y resultado esperado

### Ya está (no lo rehagas)

| Pieza | Estado | Evidencia |
|---|---|---|
| 6 familias con JSON Schema draft 2020-12 + ejemplo válido + inválido | Hecho | `dataset/config1/esquemas/` (18 archivos) |
| Volumen aprobado del mes, a máquina | Hecho | `dataset/config1/esperado.json` (CONTRATO §8/§9) |
| Puerta de verificación | Hecho: valida esquemas, esperado, semilla, hashes y conteos | `scripts/dataset-check.ts` (`bun run dataset:check`) |
| Reglas de la puerta | Verde con `seed pending` | corre en `bun run verify` y en CI |

### Falta (tu entregable)

| Entregable | Evidencia |
|---|---|
| Generador determinista | `dataset/generar.ts`: con la misma semilla emite el mismo corpus, byte a byte |
| Plantillas de los archivos | `dataset/plantillas/` (una por familia): el formato que el worker sabrá leer |
| Semilla versionada | `dataset/config1/semilla/semilla.json` con `seed`, `version` y `vocabulary.names` (nombres sintéticos, nunca reales) |
| Corpus emitido con el volumen aprobado | 170 archivos de las 6 familias + 30–40 de ruido, en `dataset/config1/corpus/<familia>/` |
| Manifiesto | `dataset/config1/manifiesto.sha256`: una línea por archivo (`<hash>  <ruta>`) |
| Casos por regla | Cada una de las 7 reglas (R-P1..T1) con caso válido, inválido y ambiguo, sembrado en el corpus |
| Pruebas del generador | `docs/ingenieria/PRUEBAS.md`: cómo se reproduce el corpus y cómo se verifica |
| Puerta en verde con el corpus | Salida de `bun run dataset:check` con los conteos de `esperado.json` y 0 hallazgos |

**El punto de partida y el final.** Tu PR cierra dos cosas: el **generador**
(que puede empezar hoy, contra los esquemas que ya están) y la **emisión**
(el corpus con los conteos aprobados). Si al 14-nov las familias finales de
#58 o el catálogo de #23 todavía no están, entregas el generador y la semilla
con el conteo esperado, y el manifiesto se regenera en cuanto #58/#23 cierren;
eso no bloquea tu PR, pero sí bloquea el dataset final.

## 4. Actividades específicas

1. Leer `docs/ingenieria/fichas/CONTRATO.md` (§8 ventana y volumen, §9 ruido),
   las 6 fichas de `docs/ingenieria/fichas/` y los 18 esquemas de
   `dataset/config1/esquemas/`. Terminado: la lista de plantillas coincide con
   las 6 familias.
2. Escribir `dataset/generar.ts`: lee la semilla, emite los archivos de
   `dataset/config1/corpus/<familia>/`, y escribe `manifiesto.sha256`. Debe ser
   determinista: sin `Date.now()`, sin aleatoriedad sin semilla, sin rutas
   absolutas en el manifiesto.
3. Escribir `dataset/plantillas/` (una por familia) y `semilla/semilla.json`.
4. Emitir el corpus y cuadrar los conteos con `esperado.json`: 120
   `excel_turno`, 14 `recepcion_rollo`, 2 `programa_planeacion`, 2 `inventario`,
   16 `correo_hermana`, 16 `escaneado`, más 30–40 de ruido (otras líneas, otras
   áreas, corruptos). Terminado: `bun run dataset:check` en verde con el
   conteo real.
5. Sembrar los fallos crónicos (CONTRATO §8.1) y el incidente del 26-oct en los
   archivos correctos: cada documento lleva su porqué (el valor que choca con
   sus fuentes).
6. Cubrir las 7 reglas con caso válido, inválido y ambiguo (CONTRATO §7).
7. Escribir `docs/ingenieria/PRUEBAS.md`: el comando que regenera el corpus, el
   que verifica los hashes y el criterio de "mismo corpus".
8. PR desde `feat/61-generador-dataset` con la evidencia de la puerta en verde.

## 5. Entradas y salidas

- Recibe: `CONTRATO.md` §7–§9, las 6 fichas de familia, los 18 esquemas,
  `dataset/config1/esperado.json`, el mapa de derivación de `CASO.md` (#83) y
  las reglas de #23 cuando cierren.
- Entrega: a Erik, a Emmanuel (quien necesita el corpus para probar el modelo) y
  a Kira (quien lo usa en las pantallas): el generador, la semilla, las
  plantillas, el manifiesto y las pruebas.

## 6. Caja de herramientas (tú eliges cuáles usar)

Principio: este brief te da contexto y restricciones duras, no el diseño.
Tú propones las plantillas y la semilla; la revisión del 17-nov las afirma o
las devuelve con motivos.

- `docs/ingenieria/fichas/CONTRATO.md` — la ventana (5–30-oct, 60 turnos), el
  volumen por familia, los 6 fallos crónicos (§8.1) y el ruido (§9). Es tu
  cifra de referencia, y ya está transcrita a máquina en
  `dataset/config1/esperado.json`.
- `docs/ingenieria/fichas/` — una ficha por familia: la forma humana de cada
  archivo y sus marcos de error. El JSON Schema no reinventa nombres de campo.
- `docs/proyecto/CASO.md` — los flujos F1–F8 y el mapa de derivación: de dónde
  sale cada documento (así se siembran los cruces).
- `dataset/config1/esquemas/` — el contrato de máquina: tu generador emite
  archivos que validan contra estos esquemas (caso válido) y contra los
  inválidos (caso inválido).
- `docs/proyecto/REQUISITOS.md` — RF-08 (qué debe sostener el modelo) y RNF-02
  (consistencia).
- ADR-0010 (`docs/decisiones/ADR-0010-bitacora-e-historial-solo-insert.md`) —
  los originales del dataset son solo-insert: tu corpus es el insumo de esa
  historia, no un archivo que se edita.
- Determinismo y ruido: nunca uses `Math.random()` sin semilla, ni
  `Date.now()`; el hash del manifiesto es la prueba de reproducibilidad.
- Plantillas reales como referencia de forma: curaduría del equipo —
  un Excel de turnos, un PDF de escaneo y un correo de la planta hermana
  bastan; el formato importa menos que la semántica que valida el schema.
- Skill `docu-documentar` para `docs/ingenieria/PRUEBAS.md` y el README del
  dataset.

## 7. Cómo trabajar

- `bash scripts/setup.sh`, `opencode`, `/inicio`, `/tarea 61`. Rama
  `feat/61-generador-dataset` (desde `main`, con `scripts/rama-env.sh`).
- **Puertas de tu PR:** `bun run dataset:check` (la puerta real: con el
  manifiesto presente, exige los conteos de `esperado.json`, los hashes y la
  semilla), `bun run lint`, `bun run typecheck` y `bun run verify` completo.
- El corpus generado **no** se commitea: se regenera y se describe con el
  manifiesto. Si tu PR trae 170 archivos generados, la puerta va a marcar que
  el `.gitignore` no los cubre.
- CARLOS NO DEBE: versionar el corpus generado; inventar nombres de personas
  reales (la semilla trae nombres sintéticos); `rm`/reset destructivo.
- CARLOS SÍ DEBE: decidir la semilla y las plantillas; documentar cómo se
  reproduce el corpus.
- Duda 30 min en el issue; bloqueo >24 h con `bloqueado`. 1 issue En progreso.

## 8. Criterios de aceptación

- [ ] `dataset/generar.ts` existe y es determinista: dos corridas con la misma semilla dan los mismos hashes.
- [ ] `dataset/config1/semilla/semilla.json` versionada con `seed`, `version` y `vocabulary.names` sintéticos.
- [ ] `dataset/plantillas/` con una plantilla por familia.
- [ ] El corpus emitido tiene los conteos de `esperado.json`: 170 archivos de las 6 familias y 30–40 de ruido.
- [ ] `dataset/config1/manifiesto.sha256` con una línea por archivo y hashes que cuadran.
- [ ] Las 7 reglas tienen caso válido, inválido y ambiguo; los 6 fallos crónicos y el incidente del 26-oct están sembrados.
- [ ] `docs/ingenieria/PRUEBAS.md` explica cómo regenerar y cómo verificar el corpus.
- [ ] `bun run dataset:check` en verde con el corpus presente y 0 hallazgos.
- [ ] `bun run verify` en verde.
- [ ] El corpus no está versionado.

No es done si: la puerta sigue en `seed pending`, o el manifiesto cuadra con los hashes pero no con los conteos.

### 8.1 Contrato, pruebas y criterio de listo

**Contrato.** El dataset es un mes de operación con historia, emitido de forma
reproducible: la semilla + las plantillas + `esperado.json` son la entrada; el
corpus y el manifiesto son la salida. El manifiesto es la única prueba de que
el corpus no cambió.

**Criterios (Given/When/Then).**

1. **Given** la semilla versionada, **when** se regenera el corpus, **then** los
   hashes del manifiesto salen idénticos.
2. **Given** el manifiesto, **when** corre `bun run dataset:check`, **then** los
   conteos por familia son los de `esperado.json` y el ruido está en 30–40.
3. **Given** una familia del schema, **when** se busca un archivo de esa
   familia en el corpus, **then** valida contra su JSON Schema.
4. **Given** las 7 reglas, **when** se recorre el corpus, **then** cada regla
   tiene su caso válido, inválido y ambiguo, y cada fallo crónico aparece con
   su porqué.

**Plan de pruebas.** Prueba de determinismo (dos corridas, mismos hashes),
prueba de conteos contra `esperado.json`, validación de una muestra de cada
familia contra su schema, y revisión manual de los casos por regla.

**Evidencia.** Salida de `bun run dataset:check` (conteos reales), la salida de
dos corridas comparadas, y el PR con el manifiesto.

**Listo cuando.** El corpus existe, se regenera igual y la puerta pasa con 0
hallazgos.

## 9. Riesgos nombrados

Riesgo: las familias finales (#58) o el catálogo de reglas (#23) se mueven y el
corpus emitido hay que regenerarlo. Mitigación: la semilla y las plantillas son
la parte estable; el manifiesto se regenera sin rehacer el generador.

Riesgo: el corpus generado se cuela en el repo y las PRs pesan. Mitigación: el
`.gitignore` cubre `dataset/config1/corpus/`; la puerta lo marca si aparece.

## 10. Revisión

Martes 17-nov en el sync, con Erik y Emmanuel: el corpus se prueba contra el
modelo. Después: #72, #12, #38 y #19.

## Versión corta (descripción del issue)

> [61] Generador de dataset — WearyBerry, 3→16-nov. Corpus del mes de octubre (5–30-oct, 60 turnos) emitido de forma reproducible a partir de semilla + plantillas versionadas: 170 archivos de las 6 familias más 30–40 de ruido, con los 6 fallos crónicos y el incidente del 26-oct sembrados, y las 7 reglas con caso válido, inválido y ambiguo. El corpus generado no se versiona: viajan la semilla, las plantillas, `esperado.json`, el manifiesto y el generador. Entradas recibidas de docs/ingenieria/fichas/CONTRATO.md §7–§9 y de los 18 JSON Schemas de dataset/config1/esquemas/. Entregable: `dataset/generar.ts`, `dataset/plantillas/`, semilla, manifiesto, `docs/ingenieria/PRUEBAS.md` y `bun run dataset:check` en verde con los conteos de `esperado.json`. Revisión el 16-nov. Detalle: `docs/briefs/BRIEF-61-generador-dataset.md`.
