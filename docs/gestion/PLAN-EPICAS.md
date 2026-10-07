# Gestión: plan por épicas

Estado: vigente. Fuente de verdad del **estado**: Monday `18432808588`.
Este archivo es la **vista de planificación**, no el estado. Si discrepan, gana
Monday y se corrige este archivo.

## Fecha dura fuera del tablero

> **Contrato de datos congelado el 23 de octubre de 2026 para las maquetas.**
> Está en el tablero de Subelementos (`18433853431`) y en ningún archivo del
> repositorio. Vive aquí para que no se pierda. Si se mueve, se mueve en Monday
> y se corrige aquí en el mismo PR.

## Épicas

| Épica | Sprint | Responsable | Requisitos | Estado en Monday |
|---|---|---|---|---|
| Infraestructura | 1 | Erik | RF-06, RNF-05, RNF-06 | En progreso |
| Backend | 1 | Emmanuel | RF-01, RF-03 | Por hacer |
| Frontend | 1 → 2 | Kira | RNF-01 → RF-01, RF-03, RF-04 | Por hacer |
| QA / Documentación | 1 | Erik, Carlos | RNF-07 | Por hacer |
| Autenticación | 2 | Emmanuel | RF-06, RF-02 | Por hacer |
| Base de datos | 2 | Carlos | — | Por hacer |

## Dependencias reales

La columna `Depende de` del tablero está **vacía en las 19 tarjetas**. El orden
real está aquí, y es el que hay que escribir en Monday:

| Depende de | Bloquea a | Por qué |
|---|---|---|
| Infraestructura (E1) | Todo lo demás | Sin `pgvector` no hay `vector`, sin BD no hay ingesta |
| Contrato de datos congelado (23-oct) | Frontend de maquetas | La maqueta consume el contrato, no la BD |
| Backend ingesta (RF-01, RF-02) | Frontend bandeja y oficial | La API entrega el dato que la pantalla cita |
| OCR evaluado |RF-01, RF-02 | RF-02 exige OCR ≥ 90 % con CER ≤ 10 % en escaneados reales |
| Configuración 1 (Carlos) | Configuración 2 | La 2 se prueba sobre datos de la 1 |
| Base de datos (Carlos) | Épica Backend | Ordena, lee y valida por familia |

## Riesgos

| Riesgo | Señal en Monday | Mitigación |
|---|---|---|
| OCR no alcanza el 90 % en escaneados | RF-02 en Sprint 2 con 32 días de ventana | Evaluar OCR en Etapa 0, antes de implementar |
| Sprint 1 termina el 16-oct y el contrato se congela el 23-oct | `Arquitectura…` cierra el 16, `Cierre de diseño` el 16 | Si el diseño se retrasa, la congelación no se cumple |
| 12 de 19 tarjetas sin requisito | Columna `Requisito` vacía | `gestion/TRAZABILIDAD.md` |
| Prototipos UI/UX cierran el 9-oct | `Kira`, Sprint 1 | Es la primera fecha que vence. Hoy es 5-oct |
| Frontend sin kit de componentes decidido | 0 dependencias de UI en `apps/web` | Decidir con los 12 candidatos de `diseno/` |
