# BRIEF #87 — SDD y TDD: reglas, plantillas y CI que las hacen cumplir

## 0. Encabezado

- Issue: #87 — https://github.com/reeinharddd/docu/issues/87
- Dueño: Erik Alfonso Beltrán Ramírez (`reeinharddd`)
- Fechas: 2026-11-02 → 2026-11-06 · Sprint 2 · hito `C1 modelo y BD` (12-nov)
- Prioridad / Tipo / Épica / Módulo: alta / tarea / Infraestructura / proceso
- Requisitos: RNF-05, RNF-07
- Bloqueado por: — · Bloquea a: #88, #89

## 1. Contexto

El repositorio ya tiene `bun run verify`, hooks de lefthook y CI, pero las
reglas no están escritas: no hay una prueba que falle antes del código ni un
ADR que diga por qué. Este brief convierte esa intención en reglas
escritas, plantillas y una puerta automática: la puerta TDD (#45) y la puerta
de SDD son la base de todo lo demás del plan.

## 2. Por qué importa tu parte

#45 (la suite de la API) es la puerta que #12 y #3 necesitan para poder
trabajar. Si las reglas no están escritas y la CI no las verifica, cada
integrante interpreta "TDD" a su manera y la cobertura se vuelve una opinión.
Además, las reglas que no se escriben se pierden cuando alguien sale del
equipo.

## 3. Objetivo y resultado esperado

| Entregable | Evidencia |
|---|---|
| Reglas de SDD y TDD | `docs/gestion/` o ADR con el flujo exacto: spec antes del código, test rojo antes del código verde, revisión antes del merge |
| Plantilla de PR | Formulario con spec enlazada, test que falla primero, evidencia y criterio de listo |
| Puertas automáticas | La CI falla si una PR llega sin spec enlazada o sin evidencia; el hook local avisa antes del commit |
| ADR | La decisión de "SDD + TDD con puertas automáticas" queda escrita y aceptada |

## 4. Actividades específicas

1. Escribir las reglas con ejemplos reales del repo (un caso bueno y uno
   malo). Terminado: alguien que no conoce el proyecto puede seguir las
   reglas sin preguntar.
2. Escribir la plantilla de PR y la de spec. Terminado: la plantilla se copia
   y se llena en menos de diez minutos.
3. Implementar la puerta de SDD en la CI. Terminado: una PR sin spec enlazada
   falla.
4. Implementar la puerta de TDD: la suite debe fallar si no hay test para el
   código nuevo. Terminado: una PR que solo sube código sin test falla.
5. Abrir el ADR con la decisión, sus alternativas y el costo aceptado.

## 5. Entradas y salidas

- Recibe: los hooks y la CI que ya existen (`lefthook.yml`, `.github/workflows/`),
  `scripts/` y las reglas de `docs/gestion/`.
- Entrega: reglas, plantillas, puertas en la CI y el ADR, por PR con
  `Closes #87`.

## 6. Referencias y caja de herramientas

- `docs/decisiones/README.md`: el proceso de ADR y el formato.
- `docs/decisiones/ADR-0015-core-del-harness.md`: el core del harness.
- `AGENTS.md`: los comandos (`bun run verify`) y las reglas duras.
- `scripts/`: donde viven los hooks de verificación.
- `.github/workflows/ci.yml`: la puerta que se reinforcece.
- Skill `docu-documentar` para las reglas y `docu-gestion` para el ADR.

## 7. Cómo trabajo

- La IA propone las reglas y las plantillas; el líder las afirma.
- Las reglas se escriben para el equipo, no para el agente: si una regla solo
  la entiende quien la escribió, está mal escrita.
- Nada de reglas que no se puedan verificar automáticamente o con una pregunta
  de un minuto.

## 8. Criterios de aceptación

- [ ] Las reglas están escritas, con ejemplo bueno y malo.
- [ ] La plantilla de PR pide spec, test y evidencia.
- [ ] La CI falla ante una PR sin spec enlazada.
- [ ] La CI falla ante una PR que sube código sin test.
- [ ] El ADR está abierto con la decisión y sus alternativas.

### 8.1 Contrato, pruebas y criterio de listo

**Contrato.** Las reglas se verifican: la CI es el juez, no el code review.

**Criterios (Given/When/Then).**

1. **Given** una PR sin spec enlazada, **when** corre la CI, **then** falla con
   un mensaje que dice qué falta.
2. **Given** una PR que sube código de la API sin test, **when** corre la CI,
   **then** falla señalando el archivo sin cobertura.
3. **Given** una PR que cumple las reglas, **when** corre la CI, **then** pasa
   sin intervención manual.

**Plan de pruebas.** Tres PR de prueba (una rota, otra rota, una buena) contra
la CI, con su salida pegada en el PR.

**Evidencia.** La salida de las tres PR de prueba, el ADR y la plantilla
llenada de ejemplo.

**Listo cuando.** Las puertas están activas y se demostró que rompen una PR
que no cumple.

## 9. Riesgos nombrados

Que las puertas bloqueen el trabajo de los demás por reglas mal escritas: la
mitigación es probarlas con PR de prueba antes de activarlas de verdad, y que
el líder afirme las reglas el 6-nov.

## 10. Revisión

Viernes 6-nov en el sync: se leen las reglas y el ADR, y se afirma o se devuelve
con motivos.

## Versión corta (descripción del issue)

> [87] SDD y TDD — reeinharddd, 2→6-nov. Reglas escritas, plantillas y puertas automáticas que las hacen cumplir. Entradas recibidas de AGENTS.md y de los hooks y la CI que ya existen. Entregable: reglas, plantilla de PR, puertas en la CI y el ADR. Revisión el 6-nov. Detalle: `docs/briefs/BRIEF-87-sdd-tdd.md`.
