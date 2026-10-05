# Visión y alcance de DOCU

Estado: vigente. Última actualización: 2026-10-05.

## Qué es

**DOCU** (nombre técnico **RDD — Repositorio de Documentación Digital**) es una
plataforma de integración y comprensión de datos empresariales. Ingiere fuentes
heterogéneas (Excel, correos, escaneados, sistemas de las plantas hermanas),
detecta familias de información, propone una versión oficial de cada dato y
manda lo dudoso a cuarentena con motivo.

North Star del equipo:

> ¿Ayuda a integrar, entender, verificar o utilizar los datos? Si no, fuera de
> alcance.

Lo que DOCU **no** es: un repositorio documental, un gestor de archivos, ni un
ERP. Es la capa que hace confiable el dato que hoy vive disperso en 3-4 sistemas
y Excels con fórmulas.

## Diferenciador

El **motor de discovery**: compara campos por nombre, tipo, valor y similitud
semántica, propone un mapeo con nivel de confianza y **pide confirmación humana**
antes de promover una fuente al modelo canónico. Ningún dato oficial se publica
sin que una persona lo confirme y quede registrado quién y con qué regla.

## Alcance

Dentro:

- Ingesta multi-familia con el original intacto y su hash.
- Validación en cadena declarativa con reglas de negocio como datos.
- Cuarentena con motivo; nada se borra en silencio.
- Dato oficial con historial de origen, regla aplicada y quién confirmó.
- Búsqueda y consulta donde **cada cifra cita su fuente y su cálculo**.
- Control de acceso por rol **en servidor** y bitácora de quién hizo qué.
- Parametrización por empresa: la segunda configuración se carga con datos, sin
  cambiar código.
- Agente de IA que responde y alerta citando procedencia. Propone, no decide.

Fuera de alcance del MVP (MoSCoW `Could`/`Won't`): voz, agentes
auto-mejorables, RLS o base de datos por cliente, sensores, predicción,
envío de correo saliente para alertas, tableros configurables y gráficas
guardables como producto completo.

## Principios que no se negocian

1. La plataforma funciona **sin IA**; la IA acelera, nunca autoriza.
2. **RAW nunca desaparece.** Toda respuesta lleva evidencia: fuente, cálculo,
   lineage.
3. Sin tecnología nueva hasta tener un problema concreto.
4. Al cierre del cuatrimestre todo debe ser comprobable; si no se demuestra,
   no entra.
5. Permisos en servidor; el front solo oculta.
6. Bitácora e historial solo crecen: no se editan ni se borran.
7. Configuración 2 se demuestra con `git diff` de código vacío.

## Módulos (decididos en la especificación de la arquitectura §4, no inventar otros)

| Módulo | Responsabilidad |
|---|---|
| `auth/governance` | Identidad, RBAC, bitácora |
| `sources/ingestión` | Conectores por tipo de fuente, original inmutable |
| `discover/mapping` | Familias, mapeo por confianza, confirmación humana |
| `canonical/lineage` | Dato oficial, historial de origen, reglas |
| `agent/tools` | Consulta, reportes, alertas citando procedencia |

## Configuración 1 y 2

Configuración 1 es la planta de empaque médico ficticio **Baja SterilPack**
(ver `CASO.md`). Configuración 2 es un segundo dominio mínimo que debe cargar
sin una línea de código nueva. La prueba de generalidad es la evidencia central
del proyecto (RNF-07).

## Risgos de alcance que ya están identificados

| Riesgo | Mitigación decidida |
|---|---|
| OCR de escaneados en español | Pipeline por fases: reglas primero, Tesseract después; medir exactitud mínima antes de prometer |
| Meta de 80% automático en clasificación | El 20% va a humano con motivo en cuarentena; se mide con el dataset sintético (C1) |
| Alcance de RF-04/RF-05 | Recorte MoSCoW: búsqueda con cita va; gráficas guardables y tableros configurables quedan como `Could` |
| Sobreconfianza en el agente | Toda salida cita procedencia; sin fuente no hay cifra |

Ver `gestion/RIESGOS.md` para el registro vivo con responsables y fechas.

## Referencias

- Requisitos: `proyecto/REQUISITOS.md`
- Caso de negocio: `proyecto/CASO.md`
- Decisiones de stack: `decisiones/` e `ingenieria/ENTORNO.md`
- Trabajo en curso: tablero Monday `18432808588`