# Categorías y etiquetas de la interfaz

Estado: borrador para revisión (#11, absorbe el ex-#28). Dueña: Kira. Revisa:
Erik (sync del 16-nov).

Cómo se nombra y se ve cada categoría en las pantallas de DOCU: familias de
archivo, estados del dato, reglas y motivos, y las etiquetas de planta
(máquinas, turnos, departamentos). Los slugs son datos aprobados del caso
([`../proyecto/CASO.md`](../proyecto/CASO.md), fichas de #9) y **no cambian**;
lo que define este documento es la **etiqueta visible en español**, su ícono y
su color. El flujo entre pantallas está en [`FLUJO.md`](FLUJO.md); los tokens y
componentes, en [`DESIGN-SYSTEM.md`](DESIGN-SYSTEM.md).

## 0. Reglas de etiquetado

1. **Ícono + palabra, nunca solo color** (`DESIGN-SYSTEM.md` §8). El color
   refuerza; el texto informa.
2. **El color de estado está reservado.** Verde, ámbar y naranja-rojo
   significan *oficial*, *pendiente* y *cuarentena/error*. Ninguna otra
   categoría los usa, para que no se confundan con un estado.
3. **Las familias no llevan color propio.** Se distinguen por ícono y
   etiqueta sobre una etiqueta neutra de marca. Seis colores más competirían
   con los estados y no pasarían AA en los dos modos sin tokens nuevos.
4. **Los identificadores van en mono** (JetBrains Mono, `tabular-nums`):
   `R-017`, `ORD-2026-0042`, `TP-01`, `R-P1`. Así `0/O` y `1/l` se distinguen.
5. **Slug en el dato, etiqueta en la pantalla.** La UI nunca muestra
   `excel_turno`; muestra "Excel de turno". El slug solo aparece en el
   tooltip o en la vista de detalle técnico.
6. Íconos: nombres de **Lucide** (`DESIGN-SYSTEM.md` §7). Los que no están en
   el subconjunto dibujado del taller (§9.7) llegan con `lucide-angular` en #4.

## 1. Familias de archivo

Etiqueta neutra: fondo `bg.brand-soft`, texto `text.brand`, borde
`border.default`, `radius.sm`. Ícono de 20px a la izquierda.

| Slug (`familia`) | Etiqueta visible | Ícono (Lucide) | Formato típico | Quién la sube | Dónde aparece | Reglas que ejerce |
|---|---|---|---|---|---|---|
| `programa_planeacion` | Programa de planeación | `calendar-range` | Excel con fórmulas | Ana | Captura, Programa, Búsqueda | R-P2, R-P3, R-P4, R-T1 |
| `recepcion_rollo` | Recepción de rollo | `package-check` | Excel o PDF + certificado | Luis | Captura, Bandeja, Programa | R-P1, R-P2, R-P3, R-Q1 |
| `inventario` | Inventario | `boxes` | Descarga de SAP o conteo en Excel | Pedro | Captura, Programa, Búsqueda | R-P3, R-T1 |
| `excel_turno` | Excel de turno | `clipboard-list` | Excel por máquina y turno | Carmen | Captura, Bandeja, Reporte | R-P2, R-A1 |
| `correo_hermana` | Correo de planta hermana | `mail` | `.eml` (es/en) | Ana | Captura, Programa, Búsqueda | R-P1, R-P2, R-P3, R-P4 |
| `escaneado` | Escaneo de calidad | `scan-line` | PDF o imagen firmada | Marta | Captura, Bandeja, Búsqueda | R-Q1 |

Reglas de la tabla tomadas de `../ingenieria/fichas/CONTRATO.md` §7.

**Familia sin asignar.** Si la clasificación no decide, el archivo se muestra
con la etiqueta **"Sin clasificar"** e ícono `file-question`, y va a la bandeja
en *Pendiente*. Si la IA propone una familia, se muestra con el estado
**Sugerido por IA** (borde punteado, §2) hasta que una persona la confirma
(ADR-0006).

### 1.1 Subtipos visibles

Algunas familias tienen un tipo interno que la persona necesita leer. Se
muestran como texto secundario junto a la etiqueta de familia, sin color propio.

| Familia | Campo | Valor → etiqueta |
|---|---|---|
| `correo_hermana` | `tipo` | `cambio_fecha` → Cambio de fecha · `lote` → Cambio de lote · `calidad` → Calidad · `ingenieria` → Cambio de ingeniería · `cliente` → Aviso a cliente |
| `escaneado` | `tipo_documento` | `verificacion` → Hoja de verificación · `peel_test` → Peel test · `liberacion` → Liberación QA · `asistencia` → Lista de asistencia |
| `inventario` | `fuente` | `sap` → SAP · `conteo_fisico` → Conteo físico · `recepcion` → Recepción |
| `recepcion_rollo` | `condicion_recepcion` | `conforme` → Conforme · `danado` → Dañado · `pendiente_revision` → Por revisar |

## 2. Estados del dato

Son los badges de `DESIGN-SYSTEM.md` §9.3, en forma de píldora
(`radius.full`). Es la única categoría con color.

| Estado | Etiqueta | Ícono | Texto / fondo | Lleva siempre |
|---|---|---|---|---|
| `official` | Oficial · *nombre* | `check` | `status.official.text` / `.bg` | Quién confirmó, fecha y hora |
| `pending` | Pendiente | `clock` | `status.pending.text` / `.bg` | Qué falta para confirmarlo |
| `quarantine` | Cuarentena | `triangle-alert` | `status.quarantine.text` / `.bg` | Motivo y regla (§3), en la misma fila |
| `ai` | Sugerido por IA | `sparkles` | `status.ai.text` / `.bg`, borde **punteado** `status.ai.border` | Nunca sustituye a Oficial |

### 2.1 Estados de un rollo en el Programa

El rollo tiene su propio estado de asignabilidad (CASO.md, "Fallo →
resolución"). Se muestra con los mismos badges, cambiando solo la palabra:

| Situación | Etiqueta | Badge base |
|---|---|---|
| Rollo sin bloqueos y con dato oficial | Asignable | `official` |
| Rollo con una regla de BLOQUEO activa | No asignable | `quarantine` |
| Rollo comprometido a otra orden | Comprometido | `pending` |
| Orden tocada por un cambio de la hermana (R-P4) | Replan | `pending` |

### 2.2 Decisión documental

Lo que la validación decide de un archivo (`CONTRATO.md` §3) se ve en Captura
así:

| `decision_documental` | Etiqueta en Captura | Badge | Botón |
|---|---|---|---|
| `valido` | Pasó la validación | `official`* | Ver dato |
| `revision_humana` | Necesita revisión | `pending` | Ver en bandeja |
| `cuarentena` | Detenido | `quarantine` | Ver en bandeja |

\* Un archivo que pasó la validación **no** es todavía un dato oficial: el badge
dice "Pasó la validación", sin nombre, hasta que alguien confirme. Si el
equipo prefiere no reusar el verde aquí, la alternativa es la etiqueta neutra
de §1 con ícono `circle-check`.

## 3. Reglas y motivos de cuarentena

Las reglas se muestran como **código en mono + frase corta**. La frase es lo
que lee la persona en la bandeja; el código es para buscar y para la cita.

| Código | Severidad | Etiqueta corta (bandeja) | Motivo completo (detalle) | Dónde se ve |
|---|---|---|---|---|
| `R-P1` | Bloqueo | Sin certificado | El rollo no tiene certificado; no se puede programar | Bandeja, Programa |
| `R-P2` | Bloqueo | Medida distinta | La medida recibida no coincide con la pedida | Bandeja, Programa |
| `R-P3` | Bloqueo | Material ausente | El material no está en almacén; bloquea la fecha | Programa |
| `R-P4` | Aviso | Cambio de la hermana | Un correo de la planta hermana cambia esta orden; el reporte anterior queda pausado | Programa, Reporte |
| `R-Q1` | Bloqueo | Solo Calidad libera | La liberación necesita confirmación de Calidad | Bandeja |
| `R-A1` | Bloqueo | Paro sin motivo | Paro de más de 30 min sin motivo registrado | Bandeja, Reporte |
| `R-T1` | Bloqueo | Stock mínimo | El film o el Tyvek están por debajo del mínimo; bloquea la orden | Programa |

**Severidad visible.** *Bloqueo* usa el badge `quarantine` con ícono
`octagon-x`; *Aviso* usa `pending` con ícono `triangle-alert`. Siempre con la
palabra "Bloqueo" o "Aviso" escrita.

### 3.1 Clases de resultado

`CONTRATO.md` §5 separa tres clases que la interfaz **no mezcla**, porque cada
una se resuelve distinto:

| Clase | Etiqueta | Ícono | Qué hace la persona |
|---|---|---|---|
| Error documental | Archivo incompleto o ilegible | `file-x` | Volver a subir el archivo |
| Incumplimiento de negocio | Regla `R-*` + etiqueta corta (§3) | `octagon-x` / `triangle-alert` | Resolver la causa o confirmar con permiso |
| Falta de autorización | Sin permiso para este dato | `lock` | Pedírselo a quien tiene el dominio |

## 4. Etiquetas de planta

Etiquetas neutras (fondo `bg.subtle`, texto `text.secondary`), en mono cuando
son códigos.

| Categoría | Valores | Etiqueta visible | Ícono |
|---|---|---|---|
| Máquina | `TP-01`, `TP-02` | `TP-01` · Pouches | `factory` |
| Máquina | `TB-01`, `TB-02`, `TB-03` | `TB-01` · Header bags | `factory` |
| Turno | `T1`, `T2`, `T3` | `T1` · Turno 1 | `clock-3` |
| Rollo | `R-017`… | `R-017` | `cylinder` |
| Orden | `ORD-2026-0042`… | `ORD-2026-0042` | `file-text` |
| Material | `MAT-TYV-01`… | `MAT-TYV-01` + nombre del material | `layers` |

### 4.1 Departamentos

Slugs de la plataforma (`Department`); se muestran en el menú de sesión y en
"quién confirmó".

| Slug | Etiqueta |
|---|---|
| `planeacion` | Planeación |
| `almacen` | Almacén |
| `calidad` | Calidad |
| `produccion` | Producción |
| `materiales` | Materiales |
| `mantenimiento` | Mantenimiento |
| `corporativo` | Corporativo |

## 5. Pendientes para revisar con Erik

- Confirmar que las familias **sin color propio** (§0, regla 3) son la
  decisión; si se quiere color por familia, hacen falta seis tokens nuevos
  verificados AA en claro y oscuro (#41).
- Confirmar el verde en "Pasó la validación" (§2.2) o cambiarlo por la
  etiqueta neutra.
- Los íconos `octagon-x`, `calendar-range`, `package-check`, `boxes`,
  `clipboard-list`, `scan-line`, `file-question`, `file-x`, `lock`,
  `factory`, `cylinder` y `layers` no están en el subconjunto del taller:
  llegan con `lucide-angular`.
