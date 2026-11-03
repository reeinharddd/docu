# ADR 0018 — SDD y TDD como método de trabajo, con puertas automáticas que lo hacen cumplir

Fecha: 2026-11-03 · Estado: Aceptada (se acepta en el merge de esta PR) ·
Decide: Erik · Revisa: el equipo (sync del 6-nov)

> Vigencia 2026-11-03: los identificadores de código van en inglés. Las reglas
> operativas viven en `docs/gestion/SDD-TDD.md`; esta decisión es el porqué.

## Contexto

El repo ya tiene `bun run verify`, hooks de lefthook y CI, pero el método no
estaba escrito: no hay una prueba que falle antes del código ni una spec
exigida antes de empezar. La API tiene 0 pruebas; el plan v2 hace que #45 (la
suite de la API, con SDD/TDD) sea la puerta de #12 y #3, y que #84 (plataforma
frontend) se construya con el mismo método. Equipo de 4 personas en paralelo,
modelos gratuitos que se distraen, y un mes de plazo: sin método escrito, cada
quien interpreta "TDD" a su manera y la cobertura se vuelve opinión. Las
reglas que no se escriben se pierden cuando alguien sale del equipo.

Restricciones reales: nadie del equipo tiene experiencia previa con TDD
disciplinado; la CI es gratuita y corre en cada PR; el equipo ya usa briefs
con criterios Given/When/Then (el material de la spec ya existe).

## Decisión

**Spec-driven development + test-driven development, obligatorios y
verificados por máquinas, no por opiniones:**

1. **Spec antes del código**: toda PR de tarea enlaza su brief
   (`docs/briefs/BRIEF-*.md`) o su spec (`docs/plantillas/SPEC.md` llenada).
   La puerta CI `sdd-tdd / spec` falla sin ella.
2. **Test rojo antes del código verde**: el diff que toca `apps/api/src/**`
   sin ningún `*.spec.ts` en el diff no entra; la puerta CI `sdd-tdd / tdd`
   (`scripts/tdd-gate.sh`) falla, y el hook local `tdd-aviso` avisa antes del
   commit.
3. **La suite de la API corre en CI** desde que #45 la traiga; hasta entonces
   la puerta TDD garantiza que ningún código nuevo llegue sin su prueba.
4. **Escapes con etiqueta y motivo**: `sin-spec` (mantenimiento puntual) y
   `sin-test` (docs, config, diagramas). Un escape sin motivo se devuelve.

Consecuencias directas que se aceptan de entrada: nadie sube código a la API
sin su prueba, aunque sea "un controllersito"; el costo de abrir una PR sube
un poco (spec + salida del test rojo); y las plantillas de PR y spec pasan a
ser obligatorias.

## Alternativas consideradas

| Alternativa | Por qué no |
|---|---|
| Confiar en el code review manual ("el revisor pregunta si hay test") | Con 4 personas y el líder revisando todo, la revisión se vuelve juez de método y de código a la vez; y una opinión no es verificable cuando la prisa aprieta. La CI es el juez |
| Exigir un porcentaje de cobertura | La cobertura mide líneas ejecutadas, no comportamiento; se juega con pruebas triviales. El objetivo es "comportamiento descrito primero", no un número |
| TDD solo en la API, SDD solo en tareas grandes | La mitad de método que se aplica a medias se abandona en la semana 2. Las pantallas del front y la BD también derivan de specs (el mapa de derivación de CASO.md) |

## Consecuencias

- **A favor**: el método es igual para los 4; la suite de la API nace
  obligatoria (hueco de calidad #1 cerrado por diseño); las PRs llevan
  evidencia comparable; lo aprendido vive escrito y no en la cabeza de Erik.
- **En contra**: un costo fijo por PR (spec + test rojo pegado); riesgo de
  papeleo si la spec se llena por cumplir; los spikes no pueden abrir PR sin
  disfrazarse — van a rama de prueba y entran después por PR que sí cumple.
- **Riesgo residual**: la puerta bloquea trabajo legítimo si `tdd-gate.sh`
  clasifica mal (p. ej. un `main.ts` tocado sin test). Blast radius: un PR
  bloqueado; mitigación: el escape `sin-test` con motivo y la revisión de la
  puerta en el sync del 6-nov.

## Evidencia

- La puerta TDD demostrada localmente (2026-11-03, pegada en la PR de este
  ADR): diff con código de API sin spec → exit 1 con la lista de archivos
  faltantes; el mismo diff con `apps/api/test/ingesta.controller.spec.ts` →
  exit 0.
- La puerta de spec corre contra esta misma PR (se enlaza `BRIEF-87`): es el
  primer caso real.
- Pendiente de verificar en #45/#12: la primera PR de código de API real debe
  traer su spec y su test rojo — esa es la prueba de fuego del método.

## Qué nos haría revertirla

Si en dos semanas las puertas bloquearon más de 2 PRs legítimos (falsos
positivos del `tdd-gate.sh`) o la spec se llenó por cumplir sin cambiar
ninguna decisión, se simplifica: la puerta de spec pasa a checklist manual del
revisor y la de TDD se limita a archivos nuevos. Se escribe el ADR siguiente
con los motivos; este queda.
