# ADR 0012 — No se construye producto hasta tener design system de marca y modelo de datos validado

Fecha: 2026-10-06 · Estado: Aceptada
Decide: Erik · Revisa: el equipo

## Contexto

El repositorio ya tiene esqueleto de API, web, base y cola (E1). La tentación es
empezar pantallas y endpoints ya. Sin un design system, cada pantalla inventa
colores, tipografía y componentes, y rehacerlas cuesta más que esperar. Sin las
categorías (#28), la matriz de roles (#29) y el contrato de datos (#23), cada
endpoint adivina el modelo y se migra varias veces.

## Decisión

Hasta que se cumplan las dos puertas, `apps/` no recibe lógica de negocio ni
pantallas de producto:

| Puerta | Se cumple cuando |
|---|---|
| **Design system de marca** | Tokens (color, tipografía, espaciado, radios), componentes base y flujo de pantallas aprobados y documentados en `docs/diseno/`, con prototipos de #11 revisados |
| **Modelo de datos validado** | Categorías (#28), matriz de roles (#29) y requisitos aprobados (#30) integrados al esquema, y contrato de datos congelado (#23, 2026-10-23) |

Mientras tanto:

1. El trabajo va a documentación, investigación (#32, #31, #33), dataset (#9) y
   herramientas del equipo.
2. La exploración visual ocurre en una rama de playground de diseño que nunca se
   fusiona a `main`; a `main` solo llegan sus decisiones como documentos.
3. Cambios en `apps/` permitidos: mantenimiento del esqueleto, dependencias,
   pruebas y configuración.

## Alternativas consideradas

| Alternativa | Por qué no |
|---|---|
| Construir en paralelo al diseño | Retrabajo seguro en pantallas y migraciones; el equipo es de 4 y no hay holgura para hacer las cosas dos veces |
| Usar un kit genérico (Material, PrimeNG) y no diseñar | La entrega evalúa la propuesta de diseño; un kit sin marca se ve genérico y no responde a RNF-01 |
| Diseñar todo antes de cualquier código | Ya existe el esqueleto verificado; detenerlo todo no aporta. Solo se frena la lógica de producto |

## Consecuencias

- **A favor**: cuando empiece la construcción, pantallas y endpoints nacen
  contra un contrato estable.
- **En contra**: el Sprint 2 arranca con presión; las puertas deben cerrarse a
  tiempo (16 y 23 de octubre).
- **Riesgo residual**: que las puertas se retrasen y se coma el margen de
  desarrollo. Se vigila en el ritmo semanal (`gestion/RITMO-SEMANAL.md`).

## Evidencia

- Fechas de las puertas: milestones `Cierre de diseño` (2026-10-16) y
  `Contrato de datos congelado` (2026-10-23).
- Regla 6 de `AGENTS.md`: E1 es solo configuración.

## Qué nos haría revertirla

Se cumple sola: al cerrarse las dos puertas, esta ADR deja de restringir y se
marca `Reemplazada` por la ADR que abra la etapa de construcción.
