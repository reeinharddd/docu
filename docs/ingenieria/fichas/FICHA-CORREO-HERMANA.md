# Ficha: `correo_hermana` (issue #9)

Estado: propuesta para aprobación 17-oct. Cumple el contrato de
`CONTRATO.md`. Dueño del proceso: Ana (cambios de programa); revisa el
responsable afectado.

## 1. Propósito

Capturar los cambios que llegan por correo y que mueven el plan: fechas
de la planta hermana, lotes, avisos a cliente y cambios de ingeniería.
Formato: `.eml` (con o sin adjuntos), **en inglés o en español**.

## 2. Campos

| Campo | Tipo | Obligatorio | Validación |
|---|---|---|---|
| `correo_id` | Texto/ID | Sí | Único |
| `de` | Texto/correo | Sí | Remitente |
| `para` | Lista | Sí | Destinatarios |
| `fecha` | Fecha y hora | Sí | Del encabezado |
| `asunto` | Texto | Sí | Puede estar en inglés |
| `planta_origen` | Texto | No | Hermana/proveedor |
| `tipo` | Enum | Sí | `cambio_fecha`, `lote`, `calidad`, `ingenieria`, `cliente` |
| `orden_afectada` | Texto | Condicional | Si el correo la nombra |
| `rollo_id` | Texto | No | Si nombra material |
| `fecha_promesa_nueva` | Fecha | Condicional | Obligatoria si `tipo = cambio_fecha` |
| `adjunto_id` | ID | No | Certificado u otro respaldo |
| `requiere_accion` | Booleano | Sí | Si dispara replan |
| `idioma` | Enum | Sí | `es`, `en`, `mixto` |

Un correo es una **señal**, no un dato oficial: propone un cambio que
alguien confirma.

## 3. Fuentes

| Fuente | Aporta | Confianza |
|---|---|---|
| Buzón de correo | Encabezado y cuerpo | Principal |
| Adjuntos | Certificados, listados | Documental |
| Programa vigente | A qué hora se compara | Referencia |
| Recepción | Si el material cambió de verdad | Verificación |

## 4. Marcos de error

| ID | Escenario | Regla | Resultado |
|---|---|---|---|
| CH-01 | Certificado mencionado pero no adjunto | R-P1 | Bloqueo; no programar |
| CH-02 | Medida anunciada distinta a la pedida | R-P2 | Bloqueo |
| CH-03 | Material reasignado a otra orden | R-P3 | Bloqueo |
| CH-04 | Cambio de fecha de la hermana no aplicado | R-P4 | Aviso + replan; pausa el reporte viejo |
| CH-05 | Asunto en inglés, cuerpo en español | OCR bilingüe | Extraer sin asumir idioma |
| CH-06 | Correo ambiguo (no dice qué cambió) | Interpretación | Revisión humana |
| CH-07 | Usuario no autorizado | Acceso | Denegar |

## 5. Relaciones

Conecta con `programa_planeacion` (dispara replan), con
`recepcion_rollo` (lote/condición anunciada) y con `inventario`. Un
adjunto puede ser, a su vez, un `escaneado` o un certificado de
`recepcion_rollo`.

## 6. Distinciones

- **Es esta familia** si es un **mensaje** (correo) que anuncia algo que mueve el
  plan.
- **No es esta familia** si ya es el plan (→ `programa_planeacion`) o si es el
  documento formal (→ certificado en `recepcion_rollo` o `escaneado`).
- Un correo es **señal**, no dato oficial; su adjunto puede ser de otra familia.

## 7. Cruces

| Con | Cómo choca |
|---|---|
| `programa_planeacion` | El correo ordena un replan que el plan vigente ignora |
| `recepcion_rollo` | Anuncia un cambio de lote o medida que la etiqueta contradice |
| `inventario` | Promete material que el conteo no tiene |
| `escaneado` | El certificado que menciona llega (o no) como escaneo aparte |

## 8. Volumen

- 16 archivos (`es`/`en`/`mixto`), sin revisiones.
- Reparto: 10 válidos / 4 inválidos / 2 ambiguos.

## Referencias

- Contrato: `CONTRATO.md`
- `../../proyecto/CASO.md`, `../../proyecto/ROLES.md` (perfiles Ana, Andrés)
