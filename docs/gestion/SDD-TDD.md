<p align="center">
<strong>docu</strong><br>
<sub>Configuración 1 · Baja SterilPack · DOCU — Repositorio de Documentación Digital</sub><br>
<sub>Marca: <code>#5B2A86</code> · acento: <code>#B0215F</code> · texto: <code>#24172F</code></sub>
</p>

# Reglas de método: SDD y TDD

Estado: vigente. Dueño: Erik (`reeinharddd`). Decisión: [ADR-0018](../decisiones/ADR-0018-sdd-y-tdd-como-metodo-de-trabajo.md).
Estas reglas se escriben para el equipo, no para el agente: si una regla solo
la entiende quien la escribió, está mal escrita. La CI es el juez, no el code
review.

## El flujo, en cinco pasos

1. **Spec antes del código.** Toda tarea nace con su brief
   (`docs/briefs/BRIEF-<N>-*.md`, con criterios Given/When/Than) o, si no hay
   brief, con la plantilla [`SPEC.md`](../plantillas/SPEC.md) llenada. Sin
   spec no hay PR: la puerta `sdd-tdd / spec` falla.
2. **Test rojo.** Escribes primero la prueba que describe el comportamiento y
   corres la suite: **falla**, y pegas esa salida en la PR. Un test que pasa
   antes del código no prueba nada: o repite lo que ya existe o mide lo
   equivocado.
3. **Código mínimo verde.** El código justo para que la prueba pase — y la
   suite completa también. Nada más.
4. **Refactor con la red puesta.** Con pruebas en verde puedes mover el
   código. Si el refactor rompe, se nota al instante.
5. **PR con evidencia.** Spec enlazada, salida del test rojo, `bun run verify`
   en verde, un revisor. El issue se cierra con el merge (`Closes #N`).

## Las puertas (automáticas, sin opinión)

| Puerta | Dónde corre | Qué revisa | Escape |
|---|---|---|---|
| `sdd-tdd / spec` | CI, en cada PR | El cuerpo de la PR enlaza `docs/briefs/BRIEF-*.md` | `sin-spec` (mantenimiento puntual, con motivo) |
| `sdd-tdd / tdd` | CI, en cada PR | El diff toca `apps/api/src/**` sin ningún `*.spec.ts` en el diff (`scripts/tdd-gate.sh`) | `sin-test` (docs, config, diagramas — con motivo) |
| `tdd-aviso` | hook local, en cada commit | Lo mismo que arriba, sobre lo *staged*; avisa, no bloquea | ninguno (es un aviso) |
| `pr-issue / enlace` | CI, en cada PR | El cuerpo dice `Closes #N` o lleva `sin-issue` | `sin-issue` |
| `guardas` / `diagramas` / `smoke` | CI | Lint, tipos, secretos, índices, diagramas, API arriba | ninguno |

## Ejemplo bueno (de este repo)

La puerta documental del índice (`scripts/doc-index.sh`): antes de que
existiera, un documento podía prometer lo que no existía y nadie lo notaba
(el `README` prometía `prisma migrate deploy` sin que Prisma estuviera
instalado). La puerta hace que el índice mienta en rojo, y el repo dejó de
discutirlo: la CI es el juez. La puerta TDD aplica el mismo principio a las
pruebas.

## Ejemplo malo (de este repo, corregido)

Los sub-issues #18, #19 y #20: tres tareas abiertas sin spec propia, con
cronograma heredado de octubre y asignación heredada, que nadie habría podido
empezar "bien" porque no describían comportamiento verificable — solo un
título. Se cerraron como *not planned* el 2026-11-03 y su alcance real vive en
#12/#3/#46, cada uno con su brief. Con la puerta de spec, ese vacío se habría
visto el día que alguien intentara abrir su PR, no tres semanas después en una
auditoría.

## Excepciones, con motivo

- **Mantenimiento** (`sin-issue`): la spec es el propio PR; qué cambia y por
  qué va en el cuerpo.
- **Cambios sin test** (`sin-test`): docs, config, CI, diagramas, scripts del
  repo — el motivo va en la PR. Un `sin-test` sin motivo se devuelve.
- **Explorar** (rama de prueba, spike): no abre PR; si el hallazgo vale, entra
  por PR que cumple el flujo completo.

## Cómo se escriben las pruebas

- Una prueba por comportamiento, no por línea de código. El nombre lo dice:
  `rechaza_rollo_sin_certificado`, no `test_1`.
- Datos reales del caso: un rollo sin certificado, no `foo`/`bar`.
- La suite de la API corre en CI desde que #45 la traiga; mientras tanto, la
  puerta TDD garantiza que ningún código nuevo llegue sin su prueba.
