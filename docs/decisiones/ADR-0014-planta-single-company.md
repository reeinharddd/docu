# ADR 0014 — Planta como raíz single-company; alcance por planta

Fecha: 2026-10-13 · Estado: Propuesta · Decide: Erik · Revisa: el equipo

## Contexto

Varios documentos decían `Empresa` multi-tenant y "parametrización por empresa"
(ADR-0009, `VISION.md`, `REQUISITOS.md` RF-06/RF-08, `MODELO-DATOS.md`). El
12-oct el líder decidió: un despliegue sirve a una compañía y en él conviven
sus plantas; jamás se mezclan compañías. Los docs ya se corrigieron a `Planta`;
esta ADR lo deja decidido con consecuencias y reversión.

## Decisión

1. La raíz del modelo es `Planta`. No existe entidad `Empresa` multi-tenant.
2. Reglas, familias, umbrales, tableros y catálogos tienen alcance **por
   planta** (reemplaza el "por empresa" de ADR-0009).
3. El aislamiento entre plantas se demuestra con la prueba de 2 usuarios
   (`CASO.md` Configuración 2): lecturas, escrituras y reportes cruzados
   deben fallar.
4. Hitos vigentes (aclaran ADR-0012 §puertas): `Cierre de diseño` 2026-10-23,
   `Contrato de datos` 2026-10-30 (flexible por decisión del líder).

## Alternativas consideradas

| Alternativa | Por qué no |
|---|---|
| Multi-tenant con `Empresa` | Mezcla compañías en una BD y contradice el despliegue por compañía |
| Mantener ambas redacciones | La ambigüedad ya costó una auditoría (H-002); el diagrama no puede dudar |

## Consecuencias

- **A favor**: un modelo, una regla de aislamiento, una prueba.
- **A favor**: C2 es segunda planta sin código nuevo (RF-08 demostrable).
- **En contra**: hay que migrar el placeholder (`schema.prisma`, seed, migración base) a `Planta` en #59; nada de lo viejo se reutiliza tal cual.
- **En contra**: ADR-0009 pasa a `Reemplazada por ADR-0014` al aprobarse esta.

## Reversión

Si una compañía exigiera varias razones sociales aisladas en un despliegue, se
añade `Compania` como raíz filtraje (no multi-tenant) con nueva ADR. No se
revive `Empresa` sin esa ADR.
