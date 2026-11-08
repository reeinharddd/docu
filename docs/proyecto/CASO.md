# Caso de negocio: Baja SterilPack

Estado: vigente como Configuración 1. Última actualización: 2026-11-03.

Este documento es la realidad de la planta: qué es, quién la mueve, qué duele y
el incidente que originó DOCU. La matriz de permisos vive en `ROLES.md` (#29);
el contrato de los documentos, en `../ingenieria/fichas/` (#9); lo técnico del
caso, en `../ingenieria/ALCANCE-SOLUCION.md`.

Planta **sintética** de empaque médico flexible: no existe, no hay
levantamiento real ni entrevistas. El caso se define en este archivo y Carlos
genera el dataset en paralelo (#61, contrato en #9). Despliegue por compañía: una compañía corre
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

## Personas del caso: quién puede qué

Resumen operativo del reparto; la matriz completa y formal vive en
`ROLES.md` (#29) — este cuadro no la duplica, la resume para leer el caso.
"Ve" = alcance de lectura; "Hace" = acciones que DOCU le permite; "No puede"
= lo que otra persona o regla le niega (sin ambigüedad).

| Persona | Rol | Ve | Hace | No puede | Flujos |
|---|---|---|---|---|---|
| Ana | Planeadora | Su programa, bloqueos de sus órdenes y lo oficial de Materiales | Emite y mantiene el programa, replanifica (R-P4), confirma su dato oficial | Liberar calidad ni ver escaneados ajenos a su flujo | F1, F5, F6 |
| Sergio | Aux. de planeación | Sus descargas y documentos de su flujo | Sube descargas externas (promesas, inventario SAP, embarques), consulta | Modificar el programa de Ana ni confirmar datos ajenos | F1 (apoya) |
| Pedro | Jefe de Almacén | Inventario y recepciones de Almacén | Valida stock, cuenta, confirma el conteo (R-T1) | Programar ni liberar calidad | F2, F6 |
| Luis | Almacenista de recepción | Sus recepciones | Registra rollo, medida, certificado y condición; deja pendiente lo que falta | Marcar un rollo como asignable sin certificado (R-P1) ni con medida distinta (R-P2) | F2 |
| Marta | Jefa de Calidad | Escaneados, liberaciones y cuarentena de calidad | **Única** que libera QA (R-Q1) y confirma dato oficial de calidad | Tocar el programa de Planeación | F4, F6 |
| Jorge | Jefe de Producción | Órdenes, asignación y estado de rollos asignables | Asigna máquina/material, da seguimiento al turno | Auto-liberarse (R-Q1) ni programar | F3 (apoya), F7 |
| Carmen | Operadora TP-01 | Su turno y su máquina | Sube el Excel de turno con merma y motivo de paro (R-A1) | Ver otras máquinas ni confirmar datos ajenos | F3 |
| Miguel | Jefe de Mantenimiento e Ingeniería | Paros y cambios de ingeniería | Sube correos de cambio, consulta paros por máquina | Tocar calidad ni planeación | F7 (soporte) |
| Andrés | Jefe de Materiales (jefe de Ana y Pedro) | Todo su dominio: planeación, compras, almacén, inventarios | Aprueba replans, ve consolidado de su dominio | Liberar calidad | F1, F5, F6 (vista jefe) |

Fuera del ciclo activo del caso (pero en el sistema): Roberto (corporativo,
reportes consolidados), Laura (gerente de planta, admin) y Juan (facilities,
scope fino). Detalle en `ROLES.md`.

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

## Flujos del caso, paso a paso

Cada paso declara **entrada → acción → salida** con el documento o la
conversación que se intercambia. Estos flujos son la materia prima del mapa de
derivación; los identificadores `D-*` son el inventario de artefactos de la
sección siguiente.

### F1 — Programa semanal (Ana, con apoyo de Sergio)

| # | Entrada | Acción | Salida |
|---|---|---|---|
| 1 | D-01 pedido (CRM), D-02 orden+BOM (SAP), D-03 stock (SAP) — vía descarga de Sergio | Ana junta 3–4 fuentes a mano en el Excel Frankenstein | D-05 programa semanal (`programa_planeacion`) |
| 2 | D-05 + D-03/D-04 (inventario y promesas) | Ana asigna máquina/material/turno; valida contra stock mental | D-05 con asignaciones; los bloqueos de regla no existen aún |
| 3 | D-06 correo de la hermana (si llegó) | Hoy: nadie lo cruza; el programa queda pegado a un inventario viejo | Desfase programa↔realidad (R-P4 sin mecanismo) |

### F2 — Recepción de rollo (Luis, jefe Pedro)

| # | Entrada | Acción | Salida |
|---|---|---|---|
| 1 | Trailer de la hermana | Luis descarga y cuenta; compara contra aviso | Discrepancia detectada a mano (4 de 6, calibre menor) |
| 2 | D-08 certificado (PDF), D-09 etiqueta (física/escaneo) | Luis registra en D-10 recepción (`recepcion_rollo`); si falta certificado anota "pendiente" y sigue | Rollo registrado sin bloqueo (R-P1/R-P2 sin mecanismo) |
| 3 | D-10 | Pedro cuadra contra D-11 conteo físico (`inventario`) | Stock con dos verdades: SAP vs piso (R-P3/R-T1 a ojo) |

### F3 — Turno en piso (Carmen; Jorge asigna)

| # | Entrada | Acción | Salida |
|---|---|---|---|
| 1 | D-05 programa del día | Jorge asigna máquina/material; Carmen monta | Montaje según programa (aunque el rollo no sirva) |
| 2 | Corrida en TP-01; D-12 dataPARC en paralelo | Carmen registra en D-13 excel de turno: buenas, merma, paros (`excel_turno`) | Paro > 30 min a veces sin motivo (R-A1 sin mecanismo) |
| 3 | Fin de turno | Carmen entrega su Excel; nadie lo cruza con recepción ni programa | Datos de piso aislados |

### F4 — Liberación de calidad (Marta)

| # | Entrada | Acción | Salida |
|---|---|---|---|
| 1 | Muestra del lote; D-15 hoja de verificación / peel test (escaneo) | Marta prueba y llena su hoja | D-15 escaneado, papel |
| 2 | D-15 + D-08 certificado | Marta decide liberar o frenar (R-Q1: solo Calidad) | D-16 liberación QA (registro/firma); si falta papel, la línea espera (patrón crónico de certificados tardíos) |

### F5 — Cambio de la hermana (correo → replan)

| # | Entrada | Acción | Salida |
|---|---|---|---|
| 1 | D-06 correo de la hermana (recorta cantidad, cambia calibre, avisa retraso) | Hoy: llega a Ana/Andrés y se lee; no se cruza con nada | Ninguna acción estructurada; el programa queda desfasado (R-P4 sin mecanismo) |
| 2 | Reunión o llamada de Andrés con Ana | Replan a mano de las órdenes afectadas | D-05 re-hecho a mano; el cambio anterior se pierde de vista |

### F6 — Reporte del día (Ana y Calidad)

| # | Entrada | Acción | Salida |
|---|---|---|---|
| 1 | D-13 (piso), D-10/D-11 (almacén), D-05 (programa), D-06 (correos) | Abrir los 4 archivos y cuadrar cifras a mano | D-18 reporte consolidado, con discrepancias sin explicar |
| 2 | Pregunta "¿de qué rollo salió esta orden?" | Buscar en papeles y memoria | Nadie reconstruye rollo → orden → máquina → turno |

### F7 — El incidente: rollo fantasma (transversal)

La cronología completa (viernes→lunes) y la cascada con números están en
"El incidente que originó DOCU". En términos de flujos: F5 dejó el aviso sin
cruzar (paso 1), F2 registró el rollo sin certificado como pendiente, F3 montó
un rollo que no servía y paró la línea, F4 frenó sin certificado (R-Q1), y F6
no pudo reconstruir qué pasó. Cada fallo típico del caso aparece en ≥1 flujo.

## Reglas del caso

Las reglas son **datos** en `ValidationRule` (ADR-0009), no código. Bloquean o avisan.

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

## Fallo → resolución → efecto en el diseño

Cada fallo del caso (crónicos §"El mes simulado" + incidente) con su
resolución y el efecto concreto que esa resolución tiene en el diseño. Si un
fallo no tiene efecto de diseño, no entra: es ruido, no requerimiento.

| Fallo | Resolución con DOCU | Efecto en el diseño |
|---|---|---|
| Rollo sin certificado se programa | R-P1 bloquea en la validación de recepción; el rollo queda "no asignable" | Estado de asignabilidad por rollo en el ER; bandeja de cuarentena con motivo y regla visible (G2) |
| Medida distinta a la pedida | R-P2 compara etiqueta vs BOM/orden | Campos `medida_pedida` y `medida_recibida` comparables en el ER; resultado en la validación |
| Inventario que no cuadra (SAP vs piso) | Ambas verdades entran como fuentes distintas y quedan fechadas; R-P3/R-T1 bloquean la orden si el material no alcanza | Stock con fuente y fecha (no un número único); bloqueo visible en Programa (G4) |
| Correo de la hermana que nadie cruza | El correo es una familia más (`correo_hermana`); R-P4 dispara replan y **pausa el reporte viejo** | Relación correo→orden(es) afectadas en el ER; mecanismo de pausa de reporte (#39) |
| Paro > 30 min sin motivo | R-A1 exige motivo en el Excel de turno | Campo motivo obligatorio condicional en `excel_turno`; valida en la cadena |
| Producción se auto-libera | R-Q1: solo Calidad confirma la liberación | Permiso de confirmación por rol (RBAC `ROLES.md`); DatoOficial lleva quién confirmó |
| Reporte que se arma a mano con 4 archivos | El reporte se genera del encadenamiento rollo→orden→máquina→turno→documento | Lineage consultable (G5); cifras del reporte que citan su fuente (RF-04) |
| Nadie sabe qué órdenes cuelgan de un rollo | El lineage responde al instante; DOCU propone el rollo sustituto | Consulta por rollo/orden en Búsqueda; sustituto propuesto, humano dispone |

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
válido/inválido/ambiguo) vive en `../ingenieria/fichas/CONTRATO.md` (§8–§10).## El mismo lunes, con DOCU

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

## Mapa de derivación: flujo → pantalla → endpoint → dato → regla → guion

Este mapa es el **contrato de entrada de los carriles B (frontend), D (BD),
F (dataset) y H (mockups)**: cada flujo produce qué pantalla, qué endpoint,
qué dato, qué regla y qué guion de la demo. Las pantallas y endpoints son los
previstos en `../ingenieria/ALCANCE-SOLUCION.md` §2; la matriz completa de
endpoints, con sus tablas y sus errores, está en
`../ingenieria/ARQUITECTURA.md` §3; los guiones (G1–G6) se corren con el
dataset de C1 (`CONTRATO.md` §8).

**Idioma de los identificadores (regla del repo):** todo lo que es código —
endpoints, entidades, tablas, colas, campos — va en **inglés**; el documento
explica en español. Las pantallas de la UI y el vocabulario del negocio
(rollo, turno, merma) siguen en español (RNF-01). Los slugs de familia del
contrato (`excel_turno`, `recepcion_rollo`, …) son datos aprobados del caso
(#9) y no cambian.

**El ER v1 no tiene una tabla por entidad lógica.** El modelo es híbrido: hay
tablas fijas del motor y, para todo lo que describe cada instalación, un tipo
de entidad y una entidad genérica. La columna "En el ER v1" dice dónde vive
cada cosa; los nombres son `snake_case` y son los de
`docs/ingenieria/DIAGRAMA-BD-v0.md` y del `schema.prisma` que lo ejecuta, en
la rama de #58 (pendiente de merge).

| Entidad lógica | En el caso es | En el ER v1 |
|---|---|---|
| `OriginalFile` | cada archivo que entra a DOCU | tabla `ingest.source_file` (solo-insert) |
| `Document` | documento lógico (`document_id` del contrato), D-01…D-20 | `graph.entity` de tipo `document` |
| `OfficialRecord` | la cifra que cita su fuente | `graph.entity` con `status = 'official'`, se lee por la vista `truth.official_record` |
| `OriginHistory` | de dónde salió cada dato | tabla `truth.origin_history` (solo-insert) |
| `ValidationRule` | regla declarativa (datos, no código), R-P1…R-T1 | tabla `config.validation_rule` |
| `Quarantine` | lo detenido con su regla | tabla `ingest.quarantine` |
| `AuditLog` | quién subió y quién confirmó | tabla `truth.audit_log` (solo-insert) |
| `ProductionSchedule` | el Excel Frankenstein de Ana, saneado | `graph.entity` de tipo `production_schedule` |
| `ProductionOrder` | lo que cuelga de un rollo | `graph.entity` de tipo `production_order` |
| `Material` | material y stock: film, Tyvek, foil | `graph.entity` de tipo `material` |
| `Roll` | rollo: `R-017`, `R-019` | `graph.entity` de tipo `roll` |
| `GoodsReceipt` | lo que registra Luis | `graph.entity` de tipo `goods_receipt` |
| `Machine` | máquina: `TP-01`, `TP-02`, `TB-*` | `graph.entity` de tipo `machine` |
| `Shift` | turno: T1/T2/T3 | `graph.entity` de tipo `shift` |
| `Downtime` | paro con motivo, los ~45 min del incidente | `graph.entity` de tipo `downtime` |
| `Scrap` | merma, los ~36 kg del incidente | `graph.entity` de tipo `scrap` |
| `QualityRelease` | lo que firma Marta | `graph.entity` de tipo `quality_release` |
| `ScanRecord` | hojas de verificación, peel test (D-15/D-16) | `graph.entity` de tipo `scan_record` |
| `SisterChange` | el correo del viernes | `graph.entity` de tipo `sister_change` |
| `Report` | el reporte del día | derivado: `graph.entity` oficial agregado por `GET /v1/reports/day` |
| `User` / `Role` / `Permission` | la matriz de `ROLES.md` | `core.app_user`, `core.role`, `core.permission` (+ `core.user_role`, `core.role_permission`) |
| El encadenamiento entre ellos | `Roll→ProductionOrder→Machine→Shift→Document` | tabla `graph.relation` |
| La familia a la que pertenece un archivo | Excel de turno, escaneado, correo… | tabla `config.family_config` |

Los códigos de tipo de entidad (`roll`, `production_order`, …) los declara cada
instalación como datos en `graph.entity_type`; no hay un `CREATE TYPE` en el
esquema. La lista de los que C1 necesita es semilla de #59.

| Flujo | Pantalla(s) | Endpoint(s) previstos | Dato(s) lógico(s) que exige el ER | Regla(s) | Guion |
|---|---|---|---|---|---|
| F1 Programa semanal | Programa | `POST /v1/sources/:id/sync` (SAP mock), `GET /v1/official-records` | `ProductionSchedule`, `ProductionOrder`, `Material`/stock, `Machine`, `Shift` | R-P1, R-P2, R-P3 (bloqueos visibles) | G4 |
| F2 Recepción de rollo | Captura | `POST /v1/files`, `GET /v1/files/:id/validation` | `Roll`, `GoodsReceipt`, certificado como `Document` (D-08/D-09/D-10), estado `assignable` del rollo | R-P1, R-P2 | G2 |
| F3 Turno en piso | Captura | `POST /v1/files` (lote 120 excels), worker procesa | `Shift`, `Scrap`, `Downtime` con motivo, `Machine` | R-A1 | G1 |
| F4 Liberación de calidad | Captura + Bandeja | `POST /v1/files` (escaneado), `POST /v1/inbox/:id/confirm` | `QualityRelease`, `ScanRecord` (D-15/D-16), permiso de confirmación por rol | R-Q1 | G3 |
| F5 Cambio de la hermana | Captura + Programa | `POST /v1/files` (correo), R-P4 al validar | `SisterChange`, relación con `ProductionOrder` afectada, pausa de reporte | R-P4 | G5 |
| F6 Reporte del día | Reporte + Búsqueda | `GET /v1/reports/day`, `GET /v1/lineage/:id` | `Report` derivado; cada cifra cita `OriginHistory` | — (agregado sobre oficiales) | G6 |
| F7 Rollo fantasma (transversal) | Bandeja + Búsqueda + Programa | `GET /v1/quarantine`, `GET /v1/lineage/:id`, `GET /v1/official-records` | Encadenamiento `Roll→ProductionOrder→Machine→Shift→Document` (el corazón del ER) | R-P1, R-P2, R-Q1, R-P4 | G5 |
| F8 Consulta con trazabilidad (nueva con DOCU) | Búsqueda | `GET /v1/lineage/:id`, `GET /v1/official-records`, `POST /v1/auth/login` | `OfficialRecord`, `OriginHistory`, `ValidationRule`, `AuditLog` | — | G5, G6 |

Guiones de demo (todos corren sobre el mes simulado, sin datos externos):

| Guion | Qué se demuestra | Flujo | Fecha del dataset |
|---|---|---|---|
| G1 | Subida en lote de los 120 excels de turno; clasificación y validación; el paro sin motivo (R-A1) cae a revisión | F3 | semana 3 del mes |
| G2 | Recepción del sábado: `R-017` sin certificado cae en cuarentena por R-P1, con motivo visible; el original queda intacto | F2 | 24-oct (sábado previo al incidente) |
| G3 | Marta confirma la liberación QA; el dato oficial queda con origen, regla y quién confirmó | F4 | semana 4 |
| G4 | El programa muestra bloqueos vivos: rollo no asignable, material que no alcanza | F1 | semana 4 |
| G5 | Trazabilidad del rollo fantasma: del correo del viernes a las órdenes en riesgo, rollo→orden→máquina→turno→documento | F5, F7, F8 | 23–26 oct |
| G6 | Reporte del día generado solo, cada cifra cita fuente; la alerta (#39) dispara al cruzar el umbral | F6 | 26-oct |

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

## Criterios de Hecho del caso

Verificables por un tercero leyendo este documento y los que cita. El caso
está **cerrado** cuando todo esto se cumple:

1. Cada flujo (F1–F7) tiene pasos con entrada, acción y salida, y cada paso
   nombra el documento (`D-*`) o la conversación que se intercambia.
2. Cada flujo aparece en el mapa de derivación con al menos una pantalla, un
   endpoint y un guion de demo.
3. Las 7 reglas (`R-P1`–`R-T1`) aparecen en al menos un flujo y en al menos un
   fallo con resolución y efecto de diseño.
4. Las 6 familias del catálogo (`programa_planeacion`, `recepcion_rollo`,
   `inventario`, `excel_turno`, `correo_hermana`, `escaneado`) aparecen en al
   menos un flujo.
5. Las 8 personas activas del ciclo (+ su jefe) tienen fila con ve/hace/
   no-puede, coherente con la matriz formal de `ROLES.md`.
6. Cada fallo del caso tiene resolución y efecto de diseño declarado.
7. Los guiones G1–G6 se pueden correr con el dataset de C1
   (`../ingenieria/fichas/CONTRATO.md` §8), sin datos fuera del mes simulado
   ni del inventario `D-*`.
8. `REQUISITOS.md` no contradice este documento: su trazabilidad apunta a
   `gestion/TRAZABILIDAD.md` y las fechas duras son las milestones vivas.

## Referencias

- Visión y alcance: `proyecto/VISION.md`
- Requisitos que este caso satisface: `proyecto/REQUISITOS.md`
- Implementación de reglas: `ingenieria/MODELO-DATOS.md`