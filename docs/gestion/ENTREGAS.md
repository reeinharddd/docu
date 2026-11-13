# Gestión: entregables y documentos fuera del repositorio

Estado: vigente. Última actualización: 2026-11-13.

Registro de los entregables que el equipo produce para fuera del repositorio
(entregas de asignatura, PDFs de informe, demos grabadas). El **código** vive en
el repositorio y se versiona; el **artefacto** vive en la carpeta de trabajo del
equipo y se entrega por el canal que pida la asignatura.

## Por qué este registro

El repositorio es la fuente de verdad del producto y del método (ADR-0007). Un
PDF de entrega, en cambio, es un artefacto de un momento: cambia con cada
cambio de código y no tiene valor de historial. Lo que sí importa es que el
equipo sepa **qué existe, dónde está, de cuándo es y qué falta**, para no
regenerar dos veces lo mismo ni entregar una versión vieja.

## Entregables

| Entregable | Destinatario / materia | Fecha límite | Estado | Ubicación |
|---|---|---|---|---|
| Documentación del proyecto + demo del agente (PDF, 27 págs) | Asignatura de Developing for Intelligent Devices (Miguel Ángel Cardona) | — | Borrador generado el 2026-11-12 | Carpeta de trabajo del equipo: `entrega/` (fuera del repo) — `DOCU-Documentacion-y-Demo-del-Agente.pdf`, con su fuente en `entrega/fuentes/documento.html` |
| Segunda evaluación: Proyecto (40 pts) | Yakko Olivo Nájera | **2026-11-15 23:59** (entrega) · presentación **2026-11-17** | En curso | Requisitos: app web con repositorio en funcionamiento, caso de estudio, metodología ágil, mecanismos de seguridad (DLP/DRP, generación de respaldos), web services de terceros y propios, y documento *Etapa 4: Pruebas y despliegue* en PDF con portada y conclusión breve. La parte de despliegue corresponde al tercer parcial |
| Demo con el profesor | Erik Beltrán (líder) | **2026-11-24** | Pendiente de guion y ensayo (#89) | Repositorio + demo en vivo, con video de respaldo |

## Reglas

1. **El artefacto no entra al repositorio**: pesa, cambia por versión y no es
   código. Lo que entra es su *fuente* (HTML, guiones, capturas) cuando esa
   fuente sirve al producto o al informe.
2. **Cada artefacto se nombra con fecha y alcance**, para que dos versiones no
   se confundan: `DOCU-Documentacion-y-Demo-del-Agente.pdf` y, cuando haga
   falta, `...-v2-YYYY-MM-DD.pdf`.
3. **Antes de regenerar**, se revisa esta tabla: si el artefacto ya existe y la
   fecha límite no cambió, se actualiza en lugar de rehacerse.
4. **La evidencia vive en el repositorio**: capturas de `docs/diseno/capturas/`,
   resultados de `bun run verify`, y el guion en `docs/gestion/`. El PDF es la
   entrega; la evidencia es lo que la sostiene.
