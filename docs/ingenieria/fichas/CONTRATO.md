# Contrato común de fichas de documentos (issue #9)

Estado: propuesta para aprobación 17-oct. Dueño: Carlos.
Alcance: contrato que cumplen las 6 fichas. Sin generador (#61),
sin muestras manuales, sin afirmar campos del modelo de datos
(`MODELO-DATOS.md` advierte placeholder; las fichas proponen
contratos lógicos). Consume la matriz de `ROLES.md` (rama
`feat/29-9-matriz-dataset`), no la corrige.

## 1. Las seis familias

`programa_planeacion`, `recepcion_rollo`, `inventario`,
`excel_turno`, `correo_hermana`, `escaneado` (`CASO.md`).
Cada familia trae su esquema y su parser; añadir una es
configuración, no código (RF-08).

Mapa conceptual (no flujo rígido): la recepción alimenta el
inventario; el inventario condiciona el programa; el programa
determina producción; los correos explican cambios; los escaneados
aportan evidencia de calidad.

## 2. Identificadores comunes

| Campo | Ejemplo sintético | Función |
|---|---|---|
| `documento_id` | `DOC-C1-000123` | Documento lógico |
| `archivo_id` | UUID | Archivo físico en DOCU |
| `planta_id` | `C1` | Sitio |
| `orden_id` | `ORD-2026-0042` | Conecta programa, producción, calidad |
| `rollo_id` | `R-017` | Conecta recepción, inventario, programa |
| `material_id` | `MAT-TYV-01` | Material y especificación |
| `revision` | `2` | Versión del contenido |
| `fecha_documento` | `2026-10-16T08:30:00-07:00` | Fecha con zona horaria |
| `origen_id` | ID de correo o documento fuente | Procedencia |
| `estado_revision` | `pendiente` | Procesamiento vs aprobación |

`documento_id` ≠ `archivo_id`: mismo archivo re-subido se deduplica
por SHA-256; contenido cambiado conserva trazabilidad de versión
sin borrar el original.

## 3. Ground truth (qué espera el generador que se extraiga)

Por campo: valor observado, valor normalizado, valor esperado según
referencia, fuente y estado (`correcto`, `incumple`, `ilegible`,
`discrepa`). Por documento: reglas evaluadas (`regla_id`,
resultado, motivo), `decision_documental` (`valido`, `cuarentena`,
`revision_humana`) y `requiere_revision_humana`.

Así se evalúan por separado clasificación, OCR, extracción,
validación de negocio y permisos.

## 4. Política multidominio

- **A. Visibilidad**: un documento se descubre si hay permiso de
  lectura y se comparte al menos un dominio, cumpliendo planta,
  alcance, vigencia y denegaciones.
- **B. Campos**: visible no es legible entero; cada campo sensible
  exige su autorización. Si no hay filtrado seguro, se deniega con
  metadatos mínimos.
- **C. Reportes y IA**: solo con datos de dominios autorizados; sin
  ellos no se incluyen en silencio. Ni totales, resúmenes ni
  respuestas de IA filtran lo prohibido.

## 5. Clases de resultado (no intercambiables)

Error documental (incompleto/ilegible), incumplimiento de negocio
(contradice regla), falta de autorización (actor sin permiso). Un
archivo bien formado puede describir un rollo no programable.

## 6. Responsables por familia

| Familia | Responsable | Revisa | Consumen |
|---|---|---|---|
| `recepcion_rollo` | Luis | Pedro; Marta en calidad | Almacén, Calidad, Planeación |
| `programa_planeacion` | Ana | Andrés | Planeación, Producción |
| `inventario` | Pedro | Andrés | Almacén, Planeación |
| `excel_turno` | Carmen | Jorge | Producción, Mantenimiento |
| `correo_hermana` | Ana (cambios de programa) | Responsable afectado | Planeación, Materiales, Mantenimiento |
| `escaneado` | Marta | Revisor de calidad autorizado | Calidad y autorizados expresos |

Ser dueño no autoriza a modificar otros dominios; consumir no hace
administrador del dominio.

## 7. Cobertura regla × familia (trazabilidad)

| Regla | Familias que la ejercen |
|---|---|
| R-P1 | `recepcion_rollo`, `correo_hermana` |
| R-P2 | `recepcion_rollo`, `programa_planeacion`, `excel_turno`, `correo_hermana` |
| R-P3 | `recepcion_rollo`, `inventario`, `programa_planeacion`, `correo_hermana` |
| R-P4 | `programa_planeacion`, `correo_hermana` |
| R-Q1 | `recepcion_rollo`, `escaneado` |
| R-A1 | `excel_turno` |
| R-T1 | `inventario`, `programa_planeacion` |

Cada ficha detalla sus marcos de error; esta tabla verifica que
ninguna regla quede sin caso válido, inválido y ambiguo.

## 8. Ventana y volumen del dataset

El dataset no es un puñado de archivos sueltos: es **un mes de operación con
historia**. Ventana fija:

- **Octubre 2026, del lunes 5 al viernes 30** (4 semanas exactas, 20 días
  hábiles × 3 turnos = **60 turnos**), sin feriados.
- **Plus de calendario:** el lunes **12-oct** es feriado en EE. UU. (la hermana
  y el corporativo cierran) y día normal en México (C1 trabaja). Un embarque o
  reporte se desfasa y nadie sabe de qué lado está el hueco.
- **Historia:** 3 semanas de patrón crónico (§8.1) y el **incidente nuevo** el
  **lunes 26-oct**.
- **Foco:** la línea `TP-01`/`TP-02` y la gente del ciclo. Lo demás es ambiente,
  no primera clase.

Volumen: se cuentan **archivos** y **revisiones** por separado
(`documento_id` ≠ `archivo_id`; re-subir lo mismo deduplica por `sha256`).

| Familia | Archivos | Revisiones |
|---|---|---|
| `excel_turno` | 120 | — |
| `recepcion_rollo` | 14 | — |
| `programa_planeacion` | 1–2 | ~6 |
| `inventario` | 2 | ~6 |
| `correo_hermana` | 16 | — |
| `escaneado` | 16 | — |
| ruido (§9) | 30–40 | — |

### 8.1 Fallos crónicos sembrados

Los seis, repartidos en las 3 semanas previas al incidente:

1. Rollo fantasma leve: el programa pide el rollo en `TP-01`, aparece en `TP-02`.
2. La hermana recorta: menos cantidad, calibre menor, certificado que no llega.
3. `TP-02` se cae seguido: film mal → purga y re-tensado, merma repetida.
4. Inventario que no cuadra: SAP dice una cosa, el piso otra.
5. Certificados y liberaciones tardíos: Calidad frena la línea.
6. Correos que nadie cruza: avisos de la hermana fuera del programa.

Cada documento lleva su **porqué**: el valor que carga es el que **choca** con
sus fuentes y con otros documentos (ficha §Cruces). La inconsistencia es el
dato, no un error de captura.

### 8.2 Reparto por regla

El reparto **válido / inválido / ambiguo** vive en cada ficha (§Volumen). Aquí
solo se exige que **ninguna regla** quede sin caso válido, inválido y ambiguo
(es la verificación de §7).

## 9. Ruido y enrutamiento

Al dataset se le mete **ruido deliberado** (30–40 archivos) de tres tipos, para
probar que DOCU no confunde lo que no es del caso:

| Tipo | Qué es | Qué prueba |
|---|---|---|
| **b** | Otra línea (`TB-01/02/03`) | Que no confunde la línea del caso |
| **c** | Otras áreas (RH, facturas, spam corporativo) | Que ignora o aísla lo ajeno |
| **d** | Corruptos/ilegibles (PDF roto, foto borrosa) | Cuarentena por extracción |

El ruido prueba además una función: **enrutar**. Un documento no siempre le
toca a quien lo escanea. Ejemplo: alguien de otra sección escanea algo que le
corresponde al planeador → **le sale al planeador** (por dominio) y para quien
lo escaneó es basura que puede **seleccionar y descartar**. En una sola pieza se
prueban la asignación por dominio (§4) y la acción de descarte.

## 10. Esquemas de máquina

La ficha es la forma **humana**; el esquema es la forma **de máquina** de §2.
Por cada familia:

- `dataset/config1/esquemas/<familia>.schema.json` — JSON Schema draft 2020-12.
- `dataset/config1/esquemas/<familia>.valido.json` — ejemplo que pasa.
- `dataset/config1/esquemas/<familia>.invalido.json` — ejemplo que falla.

Sirven a #61 (generar en masa) y a la fase siguiente (construir los formatos
reales). Los nombres de campo son los de cada ficha (§2); el esquema no los
reinventa.

## Referencias

- `../../proyecto/CASO.md` (identificadores de reglas 2026-10-12),
  `../../proyecto/REQUISITOS.md`, `../../proyecto/ROLES.md` (rama #29)
- Brief: `../../briefs/BRIEF-09-dataset-pruebas.md`
