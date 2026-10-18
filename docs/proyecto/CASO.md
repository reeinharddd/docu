# Caso de negocio: Baja SterilPack

Estado: vigente como Configuración 1. Última actualización: 2026-10-15.

Este documento es la realidad de la planta: qué es, quién la mueve, qué duele y
el incidente que originó DOCU. La matriz de permisos vive en `ROLES.md` (#29);
el contrato de los documentos, en `../ingenieria/fichas/` (#9); lo técnico del
caso, en `../ingenieria/ALCANCE-SOLUCION.md`.

Planta **sintética** de empaque médico flexible: no existe, no hay
levantamiento real ni entrevistas. El caso se define en este archivo y Carlos
genera el dataset en paralelo (#9). Despliegue por compañía: una compañía corre
su propio sistema y en él pueden convivir sus plantas. El nombre real de
cualquier planta de referencia nunca aparece en entregas ni en el repositorio.

## Compañía

Empaque flexible médico: *pouches* peelables (Tyvek-film, film-film) y *header
bags* para dispositivo médico, compatibles con EtO, radiación y e-beam.

| Dato | Valor |
|---|---|
| Máquinas | 5: `TP-01`, `TP-02` (pouches) y `TB-01`, `TB-02`, `TB-03` (bags) |
| Turnos | 3, lunes a viernes |
| Personal | ~140 |
| Áreas | oficinas, recepción, salas, comedor, almacén, piso, cuarto de cambio |
| Área blanca | Controlada, **no** cleanroom certificado |
| Temperatura y humedad | Controladas por Seguridad e Higiene |
| Material base | Llega de plantas hermanas: rollstock, film, Tyvek, foil |

La planta hermana es la causa principal de paros: material incorrecto, medida
equivocada o llegada tardía.

## Organigrama

- Gerente de División → Gerente de Planta.
- Bajo el Gerente de Planta: Producción, Mantenimiento, Almacén, Ingeniería,
  Seguridad e Higiene.
- Corporativo en sitio sin reportar a planta: RH, Contaduría.
- **Planeación (1-2 personas) decide qué línea entra cuándo y con qué
  material.** Es quien vive el problema.

## Flujo de lote (trazabilidad total)

```
Orden → asignación máquina/material → corte y sellado → inspección visual + peel test
      → empaque → liberación QA → embarque
```

Campos mínimos por registro: `orden_id`, producto, BOM, `medida_ancho`,
`rollo_id`, `rollo_origen` (hermana), `certificado_pdf`, máquina, operador,
turno, fecha/hora de inicio y fin, temperatura y humedad de piso, resultado de
prueba, cantidad buena y merma, estado, quién libera.

## Formatos que hoy están dispersos (el dolor)

| Formato | Dueño | Qué aporta |
|---|---|---|
| Excel de programa de planeación con fórmulas | Planeación | Qué línea entra cuándo y con qué material; mezcla 3-4 fuentes a mano |
| Descargas de sistemas externos | Sistemas | Fechas promesa, inventario, embarques de hermanas |
| Excel de piso por máquina y turno | Producción | Buenas, merma, paros |
| Recepción de almacén | Almacén | `rollo_id`, medida, certificado, condición |
| Correo | Todos | Cambios de hermanas, avisos a cliente, cambios de ingeniería |
| Escaneados | Calidad | Hojas de verificación, peel test, listas de asistencia |

Fallas típicas: rollo equivocado, material equivocado, medida equivocada,
llegada tardía. Sin trazabilidad en tiempo real: para un reporte hay que abrir
cuatro archivos.

## Familias de archivo (catálogo de `ArchivoOriginal.familia`)

`programa_planeacion`, `recepcion_rollo`, `inventario`, `excel_turno`,
`correo_hermana`, `escaneado`. Cada familia trae su propio esquema y su propio
parser; añadir una familia es configuración, no código (RF-08).

## Reglas del caso

Las reglas son **datos** en `ReglaValidacion`, no código. Bloquean o avisan.

| Código | Severidad | Regla |
|---|---|---|
| R-P1 | BLOQUEO | Rollo sin certificado no se programa |
| R-P2 | BLOQUEO | Medida distinta a la pedida no se programa |
| R-P3 | BLOQUEO | Material ausente en almacén bloquea la fecha |
| R-P4 | AVISO | Cambio de planta hermana dispara replan y pausa el reporte viejo |
| R-Q1 | BLOQUEO | Solo calidad libera; producción no se auto-libera |
| R-A1 | BLOQUEO | Paro mayor a 30 min exige motivo |
| R-T1 | BLOQUEO | Stock mínimo de film o Tyvek bloquea la orden |

### Decisión 2026-10-12 del líder: identificadores de reglas

El documento de caso histórico usa otra nomenclatura (`R-S1` = stock mínimo,
`R-T1` = paro > 30 min) y le da a `R-P1` un alcance más amplio ("sin
certificado **o** medida distinta a BOM"). **Se descarta**: valen los códigos de
la tabla de arriba, con `R-P1` = solo certificado y `R-P2` = medida distinta.
Ninguna regla existe bajo dos códigos. Seed, dataset y validación usan estos.

## El incidente que originó DOCU: el rollo fantasma

El caso práctico que el equipo demuestra de punta a punta. Ocurre en C1 y se
cuenta de viernes a lunes. Es sintético como todo el caso: sin nombres reales de
planta ni de personas.

### Cronología

| Cuándo | Quién | Qué pasa |
|---|---|---|
| Vie 15:00 | Hermana (planta EE. UU.) → correo | Avisa embarque: "algunos rollos de Tyvek son de otro lote y pueden tardar". Nadie lo cruza con el programa. |
| Vie 16:00 | Ana (Planeación) | Arma el programa semanal a mano (2–3 Excel + descargas de SAP/CRM + correos). Asigna `R-017` a TP-01, turno T1 del lunes, confiando en un inventario del viernes que ya no es verdad. |
| Sáb 09:00 | Luis (Almacén) | Llega el trailer: 4 rollos en vez de 6; uno de calibre menor; el certificado de `R-017` no viene. Lo anota como "pendiente" y sigue. |
| Lun 06:00 | Carmen (Producción) | Monta `R-017` según el programa y arranca TP-01. |
| Lun 06:20 | Máquina | El film corre mal. TP-01 se detiene: purga del rollo completo (scrap), revisión, reposición y re-tensado del film. |
| Lun 06:30–09:00 | Pedro y Luis (Almacén), Jorge (Producción), Marta (Calidad), Ana | Almacén no encuentra `R-017` (no está, o está montado en TP-02). Producción pide otro rollo. Calidad no libera sin certificado. Ana no puede replanificar: no sabe qué hay vivo ni qué órdenes dependían de `R-017`. |
| Lun tarde | Ana y Calidad | Armar el reporte del día = abrir 4 archivos; las cifras no cuadran. Nadie reconstruye rollo → orden → máquina → turno. |

### La cascada del paro (números sintéticos)

El error no es un evento, es una cadena con costo:

| # | Evento | Métrica | Valor |
|---|---|---|---|
| A1 | Carmen detecta el film malo a los ~20 min | film corrido | ~120 m (≈2 kg) |
| A2 | Paro y purga del rollo montado | film descartado | ~34 kg |
| A3 | Revisión, reposición y tensado | paro de máquina | ~45 min |
| A4 | Nadie decide qué material usar | espera de línea | ~2 h 15 min |
| A5 | Rollos inservibles | rollos afectados | 2 (`R-017` fantasma + `R-019` de calibre menor) |
| A6 | Órdenes colgadas del rollo/línea | órdenes en riesgo | 3 |
| A7 | Total del turno T1 | TP-01 detenida | ~3 h + ~36 kg de merma |

Hoy esas cifras no se pueden juntar: viven en el Excel de turno, la recepción, el
programa y el correo.

### Choques entre departamentos

| Quién | Sostiene | Culpa a | Choque real |
|---|---|---|---|
| Ana (Planeación) | "El programa del lunes está listo" | Almacén y la hermana | Programó sobre un inventario viejo y no tenía con qué saberlo |
| Pedro (Almacén) | "Recibí lo que llegó" | Planeación y Calidad | Nada lo obliga a bloquear un rollo sin certificado (R-P1) |
| Marta (Calidad) | "Sin certificado no libero" (R-Q1) | Hermana y Almacén | Tiene razón, pero llega tarde y frena la línea |
| Jorge (Producción) | "Mi línea tiene que correr" | Planeación y Almacén | Presiona a correr igual: más merma y riesgo de sello débil |
| Carmen (Operadora) | "Hice lo que decía el programa" | — | Pagó el costo: purgó, re-tensó, volvió a arrancar |
| Andrés (Materiales) | Jefe de Ana y Pedro | Los dos | Atrapado entre su planner y su almacén |
| Miguel (Mantenimiento) | "¿Es la máquina?" | — | Pierde tiempo buscando falla mecánica; era material |

Cada quien tiene razón por separado; nadie tiene la foto completa. Eso es lo que
DOCU resuelve.

## El mes simulado (octubre 2026)

El dataset de C1 es un mes con historia, no un puñado de archivos. Ventana:
**lunes 5 a viernes 30 de octubre de 2026** — 4 semanas exactas, 20 días hábiles
× 3 turnos = **60 turnos**, sin feriados.

Antes del incidente la planta **ya traía el patrón crónico**: tres semanas de
fallos que nadie junta.

| Semana | Fallo crónico | Qué deja |
|---|---|---|
| 5–9 oct | Rollo fantasma leve | El programa pide el rollo en `TP-01`, aparece en `TP-02` |
| 5–9 oct | La hermana recorta | Menos cantidad, calibre menor, certificado que no llega |
| 12–16 oct | `TP-02` se cae seguido | Film mal → purga y re-tensado, merma repetida |
| 12–16 oct | Inventario que no cuadra | SAP dice una cosa, el piso otra |
| 19–23 oct | Certificados tardíos | Calidad frena la línea esperando papel |
| 19–23 oct | Correos sin cruzar | Avisos de la hermana que nadie mete al programa |

**Plus de calendario:** el **lunes 12-oct** es feriado en EE. UU. (la hermana y
el corporativo cierran) y día normal en México (C1 trabaja). Un embarque y el
reporte del día se desfasan, y nadie sabe de qué lado está el hueco.

El **lunes 26-oct**, con el patrón crónico ya encima, cae el **incidente nuevo**
(el rollo fantasma, arriba): el mismo tipo de falla, pero sin margen.

El detalle operativo del dataset (volúmenes por familia, ruido y reparto
válido/inválido/ambiguo) vive en `../ingenieria/fichas/CONTRATO.md` (§8–§10).

## El mismo lunes, con DOCU

Misma cronología, otra salida:

- El **correo del viernes** de la hermana ya no se pierde: entra a DOCU, su cambio
  (R-P4) pausa el reporte viejo y marca la orden para replan.
- La **recepción del sábado** bloquea `R-017` al instante: sin certificado (R-P1)
  no entra en silencio.
- El **lunes**, cuando Carmen monta el rollo, DOCU ya sabe que `R-017` no es
  asignable y le muestra a Ana qué órdenes dependían de él y qué rollo sí sirve.
  La línea no arranca a ciegas.
- El reporte del día **no se arma a mano**: sale de los documentos ya ligados
  (rollo → orden → máquina → turno), con la discrepancia marcada donde existe.

La diferencia no es magia: el correo, la recepción, el programa y el piso —que
hoy viven en cuatro archivos— quedan **cruzados**, y el humano decide con la foto
completa. DOCU propone; el humano dispone (ADR-0006).

## Ecosistema documental del "antes"

Sin DOCU, el dato vive disperso y se junta a mano:

```
CRM (pedido) ──────────────┐
SAP (stock/BOM/orden) ─────┤
dataPARC (temps/paros/OEE) ┼──► EXCEL FRANKENSTEIN (Ana) ──► programa
descargas de la hermana ───┤
correos ───────────────────┘
                                   escaneos ──► reporte (a mano, 4 archivos)
```

| Sistema | Qué es | Qué aporta |
|---|---|---|
| SAP | ERP | Materiales, BOM, orden de producción, stock, embarques |
| CRM | Pedido y cliente | Pedido, compromiso, fecha promesa |
| dataPARC | Historiador de proceso | Temperatura, humedad, velocidad, alarmas, downtime, OEE |
| Excel de planeación | Hecho a mano por Planeación | Junta todo lo anterior; nadie más lo puede reconstruir |
| Correo | Todos | Cambios de la hermana, avisos a cliente, cambios de ingeniería |
| Escáner | Calidad | Hojas de verificación, peel test, listas de asistencia |

### Inventario de artefactos del caso

| ID | Momento | Artefacto | Quién / sistema | Formato | Familia | Regla |
|---|---|---|---|---|---|---|
| D-01 | Demanda | Pedido/compromiso de cliente | CRM | dato | — (fuente) | — |
| D-02 | Demanda | Orden de producción + BOM | SAP | export | — (fuente) | — |
| D-03 | Stock | Inventario de materiales | SAP | export | `inventario` | R-P3, R-T1 |
| D-04 | Suministro | Fechas promesa y embarques de la hermana | descarga | CSV | `inventario` | R-P4 |
| D-05 | Programa | Programa semanal (Frankenstein) | Ana | Excel con fórmulas | `programa_planeacion` | R-P1/P2/P3 |
| D-06 | Suministro | Correo de cambio de la hermana | hermana → Ana | `.eml` | `correo_hermana` | R-P4 |
| D-07 | Cliente | Aviso de cambio de entrega | Planeación → cliente | correo | `correo_hermana` | — |
| D-08 | Recepción | Certificado de material (CoA/CoC) | hermana | PDF | `recepcion_rollo` | R-P1 |
| D-09 | Recepción | Etiqueta del rollo | piso | física/escaneo | `recepcion_rollo` | R-P2 |
| D-10 | Recepción | Registro de recepción | Luis | Excel/form PDF | `recepcion_rollo` | R-P1/P2 |
| D-11 | Almacén | Conteo/inventario físico | Pedro | Excel | `inventario` | R-T1 |
| D-12 | Piso | Histórico de proceso y downtime | dataPARC | serie temporal | — (fuente) | — |
| D-13 | Piso | Excel por máquina y turno | Carmen | Excel | `excel_turno` | R-A1 |
| D-14 | Piso | Registro de paro con motivo | Carmen | Excel de turno | `excel_turno` | R-A1 |
| D-15 | Calidad | Hoja de verificación / peel test | Marta | escaneo | `escaneado` | — |
| D-16 | Calidad | Liberación QA | Marta | registro/firma | `escaneado` | R-Q1 |
| D-17 | Soporte | Lista de asistencia | Sofía/RH | escaneo | `escaneado` | — |
| D-18 | Reporte | Reporte de turno/día consolidado | Ana/Calidad | Excel a mano | derivado | — |
| D-19 | Mantenimiento | Orden de cambio de ingeniería | Miguel | correo | `correo_hermana` | — |
| D-20 | Embarque | Reporte de embarque | SAP | export | — (fuente) | — |

Los `D-*` no son nuevas familias: caen en las seis del catálogo de arriba. Lo que
no es familia (CRM, SAP, dataPARC) entra como fuente.

## Alcance del caso de prueba práctico

Lo que el caso toca, y solo eso. Todo es la instancia C1 de un mecanismo
genérico: nada se cablea fijo (RF-08).

| Dimensión | Límite |
|---|---|
| Plantas | C1 + C2 mínima (solo para la prueba de aislamiento) |
| Áreas | las de este documento (oficinas, recepción, salas, comedor, almacén, piso, cuarto de cambio) |
| Máquinas | 5 (`TP-01/02`, `TB-01/02/03`); el relato usa `TP-01` (falla) y `TP-02` (rollo ocupado) |
| Turnos | 3 (T1/T2/T3); el relato vive en T1 con relevo a T2 |
| Departamentos | Planeación, Almacén, Calidad, Producción, Materiales, Mantenimiento (RH y Contaduría solo como contexto corporativo) |
| Usuarios | 8 activos: Ana, Sergio, Pedro, Luis, Marta, Jorge, Carmen, Miguel (Andrés como jefe) |
| Familias | las 6 del catálogo |
| Reglas | las 7 (`R-P1`..`R-T1`) |

Los perfiles completos, el organigrama y la matriz de permisos están en
`ROLES.md` (#29). Los campos, fuentes y marcos de error de cada familia están en
`../ingenieria/fichas/` (#9). Los límites técnicos (APIs, ingesta, idiomas,
stack) están en `../ingenieria/ALCANCE-SOLUCION.md`.

## Postura de DOCU ante lo existente

DOCU entra como un integrante más: **ingiere, no reemplaza**. Al inicio nada se
elimina; la planta sigue funcionando igual sin DOCU. Todo se va cargando —
arrastrando archivos o desde fuentes, al principio simuladas— y solo cuando un
dato ya llega solo y verificado, ese artefacto manual queda candidato a retiro.
La decisión de dejar de usar un sistema viejo es de la compañía, no de DOCU.

El original nunca se borra (ADR-0010). Migración progresiva y opcional.

## Configuración 2

Segunda planta mínima de la misma compañía, cargada solo con datos. Debe
demostrar que un usuario de la planta 2 no ve datos de la planta 1 (aislamiento
por planta), y que un reporte de Configuración 2 sale sin tocar código.
Evidencia mínima (decisión del líder 2026-10-12): prueba con 2 usuarios de
distintas plantas intentando lecturas, escrituras y reportes cruzados — todo lo
de la otra planta debe fallar — más `git diff` de código vacío y la salida del
reporte, todo adjunto al PR de #8. Sin reintroducir `Empresa` multi-tenant: el
despliegue ya es por compañía, el aislamiento es por instalación en el servidor.

## Referencias

- Visión y alcance: `proyecto/VISION.md`
- Requisitos que este caso satisface: `proyecto/REQUISITOS.md`
- Implementación de reglas: `ingenieria/MODELO-DATOS.md`