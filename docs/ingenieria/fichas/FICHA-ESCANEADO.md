# Ficha: `escaneado` (issue #9)

Estado: propuesta para aprobación 17-oct. Cumple el contrato de
`CONTRATO.md`. Dueño del proceso: Marta; revisa un revisor de calidad
autorizado.

## 1. Propósito

Aportar evidencia de calidad: hojas de verificación, peel test,
liberaciones y listas de asistencia. **Solo calidad libera** (R-Q1).
Formato: escaneo (PDF o imagen) de papel firmado.

## 2. Campos

| Campo | Tipo | Obligatorio | Validación |
|---|---|---|---|
| `escaneo_id` | Texto/ID | Sí | Único |
| `tipo_documento` | Enum | Sí | `verificacion`, `peel_test`, `liberacion`, `asistencia` |
| `planta_id` | Texto | Sí | `C1` en el caso |
| `fecha` | Fecha | Sí | Del documento |
| `orden_id` | Texto | Condicional | Si aplica a una orden |
| `rollo_id` | Texto | Condicional | Si aplica a un rollo |
| `lote` | Texto | No | Trazabilidad |
| `responsable` | ID usuario | Sí | Quién firma |
| `resultado` | Enum | Condicional | `aprobado`, `rechazado`, `pendiente` |
| `firma_presente` | Booleano | Sí | Sin firma no hay liberación |
| `paginas` | Número | Sí | Integridad del escaneo |
| `legibilidad` | Enum | Sí | `alta`, `media`, `baja` |
| `idioma` | Enum | Sí | `es`, `en`, `mixto` |
| `archivo_id` | ID | Sí | Archivo físico en DOCU |

Un documento sin firma o ilegible no libera nada, aunque su contenido se
vea correcto.

## 3. Fuentes

| Fuente | Aporta | Confianza |
|---|---|---|
| Escáner (carpeta de escaneo) | Imagen del documento | Principal |
| Firma física | Autorización de calidad | Bloqueante |
| dataPARC | Corrobora el proceso | Contraste |
| Programa / Excel de turno | A qué se refiere | Referencia |

## 4. Marcos de error

| ID | Escenario | Regla | Resultado |
|---|---|---|---|
| ES-01 | Liberación sin firma de calidad | R-Q1 | Bloqueo |
| ES-02 | Producción intenta auto-liberarse | R-Q1 | Bloqueo |
| ES-03 | Hoja ilegible o de baja calidad | Extracción | Revisión humana; no inventar lectura |
| ES-04 | Resultado contradice otra evidencia | Consistencia | Conservar ambas + discrepancia |
| ES-05 | Documento de otro rollo/lote | R-Q1 | No aceptar; revisión |
| ES-06 | Documento en español e inglés | OCR bilingüe | Extraer sin asumir idioma |
| ES-07 | Usuario no autorizado | Acceso | Denegar (calidad y autorizados expresos) |

## 5. Relaciones

Conecta con `recepcion_rollo` (certificado y liberación del rollo), con
`excel_turno` (verificación de producción) y con `programa_planeacion`
(la orden/rollo al que pertenece). `documento_id` propio; `origen_id`
apunta al archivo escaneado.

## 6. Distinciones

- **Es esta familia** si es **papel firmado escaneado** que da evidencia de calidad
  (verificación, peel test, liberación, asistencia).
- **No es esta familia** si es un archivo digital nativo (→ certificado de
  `recepcion_rollo`) o un adjunto de correo (→ `correo_hermana`).
- Sin firma o ilegible **sigue siendo** `escaneado`, pero no publica liberación.

## 7. Cruces

| Con | Cómo choca |
|---|---|
| `recepcion_rollo` | El certificado del rollo vs la liberación de calidad |
| `excel_turno` | La verificación cubre la producción del turno |
| `programa_planeacion` | La orden o rollo al que aplica la evidencia |
| `correo_hermana` | El adjunto duplica (o falta) respecto al escaneo |

## 8. Volumen

- 16 archivos, sin revisiones.
- Reparto: 11 válidos / 3 inválidos / 2 ambiguos.

## Referencias

- Contrato: `CONTRATO.md`
- `../../proyecto/CASO.md`, `../../proyecto/ROLES.md` (perfiles Marta, Luis)
