# Caso de negocio: Baja SterilPack

Estado: vigente como Configuración 1. Última actualización: 2026-10-05.

Planta **sintética** de empaque médico flexible: no existe, no hay
levantamiento real ni entrevistas. El caso se define en este archivo y Carlos
genera el dataset en paralelo (#9). Despliegue por compañía: una empresa corre
su propio sistema y en él pueden convivir sus plantas. El nombre real de
cualquier planta de referencia nunca aparece en entregas ni en el repositorio.

## Empresa

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

## Configuración 2

Segunda planta mínima de la misma compañía, cargada solo con datos. Debe
demostrar que un usuario de la planta 2 no ve datos de la planta 1 (aislamiento
por planta), y que un reporte de Configuración 2 sale sin tocar código.
Evidencia mínima (decisión del líder 2026-10-12): prueba con 2 usuarios de
distintas plantas intentando lecturas, escrituras y reportes cruzados — todo lo
de la otra planta debe fallar — más `git diff` de código vacío y la salida del
reporte, todo adjunto al PR de #8. Sin reintroducir `Empresa` multi-tenant: el
despliegue ya es por compañía, el aislamiento es por planta en el servidor.

## Referencias

- Visión y alcance: `proyecto/VISION.md`
- Requisitos que este caso satisface: `proyecto/REQUISITOS.md`
- Implementación de reglas: `ingenieria/MODELO-DATOS.md`