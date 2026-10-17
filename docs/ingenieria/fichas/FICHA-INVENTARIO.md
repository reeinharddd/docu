# Ficha: `inventario` (issue #9)

Estado: propuesta para aprobación 17-oct. Cumple el contrato de
`CONTRATO.md`. Dueño del proceso: Pedro; revisa Andrés.

## 1. Propósito

Saber qué material hay, dónde está y si está realmente disponible.
Es la verdad que Planeación necesita y hoy descubre tarde.
Formatos: descarga de SAP y conteo físico en Excel.

## 2. Campos

| Campo | Tipo | Obligatorio | Validación |
|---|---|---|---|
| `inventario_id` | Texto/ID | Sí | Único por conteo |
| `planta_id` | Texto | Sí | `C1` en el caso |
| `material_id` | Texto | Sí | Existe en catálogo |
| `rollo_id` | Texto | Condicional | Obligatorio para material por rollo |
| `lote` | Texto | No | Trazabilidad de origen |
| `cantidad` | Número + unidad | Sí | No negativa |
| `unidad` | Enum | Sí | Normalizada |
| `ubicacion` | Texto/ID | No | Almacén o piso |
| `estado` | Enum | Sí | `disponible`, `comprometido`, `cuarentena` |
| `fecha_conteo` | Fecha y hora | Sí | Define vigencia |
| `fuente` | Enum | Sí | `sap`, `conteo_fisico`, `recepcion` |
| `registrado_por` | ID usuario | Sí | Almacén |

Disponible no es lo mismo que existente: un rollo comprometido a otra
orden sigue en el almacén pero no es asignable.

## 3. Fuentes

| Fuente | Aporta | Confianza |
|---|---|---|
| SAP (descarga) | Stock, ubicación, lote | Principal del sistema |
| Conteo físico (Pedro) | Realidad de piso | Corrige al sistema |
| Recepción | Alta de rollo nuevo | Entrada |
| Programa | Qué está comprometido | Demanda |
| dataPARC | No aplica al stock | — |

## 4. Marcos de error

| ID | Escenario | Regla | Resultado |
|---|---|---|---|
| IN-01 | Material comprometido a otra orden | R-P3 | Bloqueo |
| IN-02 | Stock bajo el mínimo de film o Tyvek | R-T1 | Bloqueo de la orden |
| IN-03 | Rollo fantasma: existe en sistema, no en piso | Consistencia | Cuarentena/revisión; no asumir disponible |
| IN-04 | Unidad inconsistente o ausente | Extracción | No comparar hasta resolver unidad |
| IN-05 | Conteo sin vigencia (fecha vieja) | Vigencia | Marcar no vigente; no planear con él |
| IN-06 | Dos conteos se contradicen | Consistencia | Conservar ambos + discrepancia |
| IN-07 | Usuario no autorizado | Acceso | Denegar |

## 5. Relaciones

Conecta con `recepcion_rollo` (`rollo_id`, alta) y con
`programa_planeacion` (lo que se puede asignar). `excel_turno` reporta
el consumo real. `documento_id` propio; `origen_id` apunta a SAP o al
conteo físico.

## 6. Distinciones

- **Es esta familia** si declara **qué hay, dónde y si es asignable** (existencia y
  disponibilidad).
- **No es esta familia** si describe la llegada de un rollo (→ `recepcion_rollo`)
  o la intención de usarlo (→ `programa_planeacion`).
- Existente ≠ disponible: un rollo comprometido sigue en el almacén pero no es
  asignable.

## 7. Cruces

| Con | Cómo choca |
|---|---|
| `recepcion_rollo` | El conteo da por existente un rollo que la recepción nunca registró |
| `programa_planeacion` | El plan compromete material que el conteo marca como no disponible |
| `excel_turno` | El consumo real del turno no cuadra con la baja de inventario |
| SAP vs piso | El sistema dice una cifra y el conteo físico otra |

## 8. Volumen

- 2 archivos, ~6 revisiones (≈8 documentos). Reparto: 5 válidos / 2 inválidos / 1 ambiguo.

## Referencias

- Contrato: `CONTRATO.md`
- `../../proyecto/CASO.md`, `../../proyecto/ROLES.md` (perfiles Pedro, Andrés)
