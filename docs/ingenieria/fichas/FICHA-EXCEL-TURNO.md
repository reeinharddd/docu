# Ficha: `excel_turno` (issue #9)

Estado: propuesta para aprobación 17-oct. Cumple el contrato de
`CONTRATO.md`. Dueño del proceso: Carmen; revisa Jorge.

## 1. Propósito

Registrar lo que de verdad pasó en el piso por máquina y turno: buenas,
merma y paros con motivo. Es la única fuente de datos de piso (R-A1).
Formato: Excel por máquina y turno.

## 2. Campos

| Campo | Tipo | Obligatorio | Validación |
|---|---|---|---|
| `turno_id` | Texto/ID | Sí | Único por máquina + turno |
| `planta_id` | Texto | Sí | `C1` en el caso |
| `linea_id` | Texto | Sí | Máquina del catálogo |
| `fecha` | Fecha | Sí | Coherente con el turno |
| `turno` | Enum | Sí | `T1`, `T2`, `T3` |
| `operador` | ID usuario | Sí | Quien registra |
| `orden_id` | Texto | No | Orden que corría |
| `rollo_id` | Texto | No | Rollo montado |
| `cantidad_buena` | Número + unidad | Sí | Conteo de producción |
| `merma` | Número + unidad | Sí | Descartado |
| `paro_min` | Número | Sí | Minutos detenidos |
| `paro_motivo` | Texto/Enum | Condicional | Obligatorio si `paro_min > 30` |
| `hora_paro` | Hora | No | Momento del paro |
| `observaciones` | Texto | No | Libre |
| `archivo_evidencia_id` | ID | No | Respaldo |

La suma `buena + merma` debe cuadrar con lo corrido; si no, es señal de
error de captura, no de producción.

## 3. Fuentes

| Fuente | Aporta | Confianza |
|---|---|---|
| Excel de piso | Buenas, merma, paros | Principal |
| dataPARC | Tiempos, velocidad, alarmas | Contraste de máquina |
| Bitácora del operador | Motivos y notas | Contextual |
| Programa | Qué debía correr | Referencia |

## 4. Marcos de error

| ID | Escenario | Regla | Resultado |
|---|---|---|---|
| ET-01 | Paro mayor a 30 min sin motivo | R-A1 | Bloqueo; no cierra el turno |
| ET-02 | Rollo o medida distinta al programa | R-P2 | Aviso/bloqueo según severidad |
| ET-03 | Totales no cuadran (`buena + merma` ≠ corrido) | Consistencia | Revisión |
| ET-04 | Turno ilegible o sin cerrar | Extracción | Revisión humana |
| ET-05 | Dos versiones del mismo turno | Consistencia | Conservar ambas + discrepancia |
| ET-06 | Usuario no autorizado | Acceso | Denegar |

## 5. Relaciones

Conecta con `programa_planeacion` (planeado vs real), con `inventario`
(consumo) y con `recepcion_rollo` (rollo usado). dataPARC corrobora el
paro. `documento_id` propio; `origen_id` apunta al Excel de origen.

## 6. Distinciones

- **Es esta familia** si reporta **lo que pasó en el piso** por máquina y turno: el
  real, no el plan.
- **No es esta familia** si es el plan (→ `programa_planeacion`), el stock
  (→ `inventario`) o evidencia firmada de calidad (→ `escaneado`).
- La bitácora del operador es fuente, no familia aparte: su contenido vive aquí.

## 7. Cruces

| Con | Cómo choca |
|---|---|
| `programa_planeacion` | Planeado vs real: rollo o medida distinta a lo programado |
| `inventario` | El consumo del turno no cuadra con la baja de stock |
| dataPARC | Los tiempos de máquina contradicen el paro anotado a mano |
| `escaneado` | La verificación de calidad cubre o contradice el turno |

## 8. Volumen

- 120 archivos (2 máquinas × 60 turnos), sin revisiones.
- Reparto: 96 válidos / 20 inválidos / 4 ambiguos.

## Referencias

- Contrato: `CONTRATO.md`
- `../../proyecto/CASO.md`, `../../proyecto/ROLES.md` (perfiles Carmen, Jorge)
