# ADR 0014 — Instalación como raíz single-company; alcance por instalación

Fecha: 2026-10-13 · Estado: Aceptada · Decide: Erik · Revisa: el equipo

> Vigencia 2026-10-30: los hitos y fechas que este ADR menciona fueron sustituidos por
> `docs/gestion/REPLAN-2026-10-30.md` §9. La decisión no cambia; lo que cambió es el calendario.

## Contexto

Varios documentos decían `Empresa` multi-tenant y "parametrización por empresa"
(ADR-0009, `VISION.md`, `REQUISITOS.md` RF-06/RF-08, `MODELO-DATOS.md`). El
12-oct el líder decidió: un despliegue sirve a una compañía y en él conviven sus
instalaciones; jamás se mezclan compañías. DOCU es **agnóstico al giro** del
cliente, así que la raíz del modelo se nombra `Instalacion` y no "planta" ni
ningún término atado a un tipo de dominio. Los docs ya se corrigieron a
`Instalacion`; esta ADR lo deja decidido con consecuencias y reversión.

## Decisión

1. La raíz del modelo es `Instalacion`. No existe entidad `Empresa` multi-tenant.
2. Reglas, familias, umbrales, tableros y catálogos tienen alcance **por
   instalación** (reemplaza el "por empresa" de ADR-0009).
3. El aislamiento entre instalaciones se demuestra con la prueba de 2 usuarios
   (`CASO.md` Configuración 2): lecturas, escrituras y reportes cruzados
   deben fallar.
4. Hitos vigentes (aclaran ADR-0012 §puertas): `Cierre de diseño` 2026-10-23,
   `Contrato de datos` 2026-10-30 (flexible por decisión del líder).

## Alternativas consideradas

| Alternativa | Por qué no |
|---|---|
| Multi-tenant con `Empresa` | Mezcla compañías en una BD y contradice el despliegue por compañía |
| Mantener ambas redacciones | La ambigüedad ya costó una auditoría (H-002); el diagrama no puede dudar |
| Nombrar la raíz `Planta` | Ata el modelo a un giro (manufactura); DOCU sirve cualquier dominio |

## Consecuencias

- **A favor**: un modelo, una regla de aislamiento, una prueba.
- **A favor**: C2 es segunda instalación sin código nuevo (RF-08 demostrable).
- **En contra**: hay que migrar el placeholder (`schema.prisma`, seed, migración base) a `Instalacion` en #59; nada de lo viejo se reutiliza tal cual.
- **En contra**: ADR-0009 queda con su alcance actualizado por esta ADR ("por
  empresa" → "por instalación"); el resto de ADR-0009 (las reglas son datos)
  sigue vigente.

## Reversión

Si una compañía exigiera varias razones sociales aisladas en un despliegue, se
añade `Compania` como raíz filtraje (no multi-tenant) con nueva ADR. No se
revive `Empresa` sin esa ADR.
