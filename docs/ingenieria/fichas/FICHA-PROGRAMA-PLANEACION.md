# Ficha: `programa_planeacion` (issue #9)

Estado: propuesta para aprobación 17-oct. Cumple el contrato de
`CONTRATO.md`. Dueño del proceso: Ana; revisa Andrés.

## 1. Propósito

Saber qué línea entra cuándo y con qué material, y por qué el plan cambió.
Es el "Excel Frankenstein": junta a mano stock, órdenes y fechas promesa.
Formato base: Excel de planeación con fórmulas, más descargas de SAP/CRM.

## 2. Campos

| Campo | Tipo | Obligatorio | Validación |
|---|---|---|---|
| `programa_id` | Texto/ID | Sí | Único por revisión |
| `semana` | Rango de fechas | Sí | Coherente con `planta_id` |
| `planta_id` | Texto | Sí | `C1` en el caso |
| `linea_id` | Texto | Sí | Máquina del catálogo (`TP-01`…) |
| `turno` | Enum | Sí | `T1`, `T2`, `T3` |
| `orden_id` | Texto | Sí | Existe y está abierta |
| `material_id` | Texto | Sí | Existe en catálogo |
| `rollo_id` | Texto | No | Asignación propuesta |
| `cantidad_planeada` | Número + unidad | Sí | Positiva |
| `fecha_planeada` | Fecha y hora | Sí | No en el pasado |
| `fecha_promesa` | Fecha | No | Coincide con CRM o justifica la diferencia |
| `fuente_stock` | Texto | Sí | De dónde salió el inventario usado |
| `revision` | Entero | Sí | Versiona el plan sin borrar el anterior |
| `creado_por` | ID usuario | Sí | Planeación |
| `aprobado_por` | ID usuario | No | Jefe de Materiales |
| `archivo_evidencia_id` | ID | No | Respaldo del plan |

Un plan se versiona; no se edita en silencio. El rollo asignado es una
**propuesta**, no una reserva física.

## 3. Fuentes

| Fuente | Aporta | Confianza |
|---|---|---|
| Excel de planeación | Línea, turno, orden, asignación | Principal |
| SAP | Orden, BOM, jerarquía de material | Referencia |
| CRM | Pedido y fecha promesa | Compromiso |
| Inventario | Disponibilidad real de material | Actual, no histórica |
| Correo de hermana | Cambios de fecha o lote | Contextual |
| Recepción | Si el rollo está y con qué condición | Bloqueante (R-P1) |

## 4. Marcos de error

| ID | Escenario | Regla | Resultado |
|---|---|---|---|
| PP-01 | Medida del rollo distinta a BOM | R-P2 | Bloqueo |
| PP-02 | Material ausente o comprometido a otra orden | R-P3 | Bloquea la fecha |
| PP-03 | Cambio de la hermana no reflejado en el plan | R-P4 | Aviso + replan; pausa el reporte viejo |
| PP-04 | Stock bajo el mínimo de film o Tyvek | R-T1 | Bloqueo de la orden |
| PP-05 | Fórmula no reproducible / valor calculado ambiguo | Extracción | Revisión humana; no inventar cifra |
| PP-06 | Dos revisiones del mismo programa se contradicen | Consistencia | Conservar ambas + discrepancia |
| PP-07 | Usuario no autorizado | Acceso | Denegar aunque el plan sea correcto |

## 5. Relaciones

Conecta con `inventario` (`material_id`, disponibilidad), con
`recepcion_rollo` (`rollo_id`, condición) y con `correo_hermana`
(cambios que disparan replan). `excel_turno` aporta el real contra
el planeado. `documento_id` propio; `origen_id` apunta a SAP/CRM.

## 6. Distinciones

- **Es esta familia** si asigna **qué línea corre cuándo y con qué**: es el plan,
  no la realidad.
- **No es esta familia** si reporta lo que **de verdad pasó** (→ `excel_turno`),
  si es stock real (→ `inventario`) o si es un aviso de cambio sin plan
  (→ `correo_hermana`).
- Un plan versionado no son varios planes: sube `revision` y no se crea archivo
  nuevo (→ §8).

## 7. Cruces

| Con | Cómo choca |
|---|---|
| `excel_turno` | El plan pide una orden; el piso corrió otra |
| `recepcion_rollo` | El plan asigna un rollo que nunca entró |
| `inventario` | El plan usa stock que el conteo contradice |
| `correo_hermana` | La hermana cambió la fecha y el plan vigente aún no la refleja |

## 8. Volumen

- 2 archivos base, ~6 revisiones (≈8 documentos). Reparto: 5 válidos / 2 inválidos / 1 ambiguo.

## Referencias

- Contrato: `CONTRATO.md`
- `../../proyecto/CASO.md`, `../../proyecto/ROLES.md` (perfiles Ana, Andrés)
