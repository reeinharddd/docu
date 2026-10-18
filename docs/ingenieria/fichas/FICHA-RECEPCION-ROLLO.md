# Ficha: `recepcion_rollo` (piloto, issue #9)

Estado: propuesta para aprobación 17-oct. Cumple el contrato de
`CONTRATO.md`. Dueño del proceso: Luis; revisa Pedro;
Marta en calidad y liberación.

## 1. Propósito

Saber qué material llegó, su procedencia, dimensiones, certificado
y condición, y reconstruir por qué un rollo puede o no entrar a
planeación. Formatos: registro Excel o formulario exportado a PDF,
etiqueta del rollo y certificado PDF asociado.

## 2. Campos

| Campo | Tipo | Obligatorio | Validación |
|---|---|---|---|
| `recepcion_id` | Texto/ID | Sí | Único por recepción |
| `rollo_id` | Texto | Sí | Identifica el rollo |
| `material_id` | Texto | Sí | Existe en catálogo |
| `rollo_origen` | Texto | Sí | Hermana o proveedor sintético |
| `orden_compra_id` | Texto | No | Relacionado si existe |
| `fecha_recepcion` | Fecha y hora | Sí | Legible y posible |
| `medida_ancho` | Número + unidad | Sí | Normalizar unidad; contra especificación |
| `certificado_referencia` | Texto/ID | Condicional | Evidencia documental |
| `certificado_presente` | Booleano | Sí | Falso activa R-P1 |
| `condicion_recepcion` | Enum | Sí | `conforme`, `danado`, `pendiente_revision` |
| `cantidad_recibida` | Número + unidad | Sí | Positiva, compatible con material |
| `ubicacion` | Texto/ID | No | Almacén |
| `registrado_por` | ID usuario | Sí | Responsable del registro |
| `archivo_evidencia_id` | ID | No | Etiqueta, certificado u otro |

Medida como valor + unidad normalizada (`152.4 mm`, no `152` seco).
Dato observado ≠ esperado ≠ aprobado: la etiqueta no reemplaza la
orden en silencio.

## 3. Fuentes

| Fuente | Aporta | Confianza |
|---|---|---|
| Registro de recepción | Rollo, fecha, cantidad, condición | Principal |
| Etiqueta del rollo | Código, lote, material, dimensiones | Evidencia física |
| Certificado | Referencia, lote, conformidad | Documental; no libera |
| Orden/especificación | Material y medidas pedidas | Referencia de comparación |
| Inventario | Ubicación, disponibilidad actual | Actual, no histórica |
| Correo de hermana | Cambios, promesas, procedencia | Contextual; verificar qué cambió |

## 4. Marcos de error

| ID | Escenario | Regla | Resultado |
|---|---|---|---|
| RR-01 | Certificado ausente | R-P1 | Bloqueo + cuarentena/revisión |
| RR-02 | Ancho distinto al pedido | R-P2 | Bloqueo |
| RR-03 | Rollo duplicado en dos recepciones | Duplicados | Revisión; distinguir duplicado de doble movimiento |
| RR-04 | Código ilegible | Extracción | Revisión humana; no inventar ID |
| RR-05 | Etiqueta vs registro discrepan | Consistencia | Conservar ambas lecturas + discrepancia |
| RR-06 | Material comprometido a otra orden | R-P3 | No asumir disponibilidad |
| RR-07 | Certificado de otro lote | R-P1 | No aceptar; revisión |
| RR-08 | Dimensión sin unidad | R-P2/extracción | No comparar hasta resolver unidad |
| RR-09 | Usuario no autorizado | Acceso | Denegar aunque el documento sea correcto |
| RR-10 | Liberación pendiente | R-Q1 | Pendiente; no publicar liberación inexistente |

## 5. Relaciones

Conecta con `inventario` (`rollo_id`, ubicación), con
`programa_planeacion` (disponibilidad para la orden) y con
`escaneado`/`correo_hermana` como evidencia. `documento_id` propio;
`origen_id` apunta a correos o certificados fuente.

## 6. Distinciones

- **Es esta familia** si habla de un rollo **que llega**: procedencia, dimensiones,
  certificado y condición de recepción.
- **No es esta familia** si el rollo ya está en stock (→ `inventario`), si solo se
  **planea** usarlo (→ `programa_planeacion`) o si el papel es evidencia de calidad
  del rollo (→ `escaneado`).
- El certificado puede llegar como adjunto de `correo_hermana` o como `escaneado`;
  aquí solo se **referencia**.

## 7. Cruces

| Con | Cómo choca |
|---|---|
| `inventario` | El conteo da el rollo por disponible; la recepción lo marca dañado o en cuarentena |
| `programa_planeacion` | El plan asigna el rollo; la recepción dice que no entró o llegó con otra medida |
| `correo_hermana` | La hermana anuncia una cantidad; la etiqueta trae otra |
| `escaneado` | El certificado llega tarde y la recepción lo marcó como ausente |

## 8. Volumen

- 14 archivos (12 del patrón crónico + 2 del incidente), sin revisiones.
- Reparto: 9 válidos / 4 inválidos / 1 ambiguo.

## Referencias

- Contrato: `CONTRATO.md`
- `../../proyecto/CASO.md`, `../../proyecto/ROLES.md` (perfiles Luis, Pedro, Marta)
