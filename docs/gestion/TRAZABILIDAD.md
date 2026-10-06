# Gestión: trazabilidad requisito → épica → PR → evidencia

Estado: vigente. Verificado contra Monday `18432808588` el 2026-10-05.

## La cadena

Requisito → épica → PR → evidencia. `RF-07` y `RNF-07` no mapean a épica, son de
calidad transversal; el resto sí.

| Requisito | Módulo | Épica | Sprint | Tarjeta Monday | Etiqueta `Requisito` |
|---|---|---|---|---|---|
| RF-01 | API | Backend | 1 | API NestJS: modelo de datos, ingesta y dato oficial | Sí |
| RF-02 | API | Backend | 2 | Pipeline de ingesta, OCR y clasificación | Sí |
| RF-03 | API | Backend | 1 | API NestJS | Sí |
| RF-04 | Documentos | Frontend | 2 | Frontend Angular | Sí |
| **RF-05** | `agent/tools` | **sin épica etiquetada** | — | — | **No existe la etiqueta en ninguna tarjeta** |
| RF-06 | Permisos | Autenticación | 2 | RBAC en servidor | Sí |
| RF-07 | — | transversal | — | — | No mapea |
| RF-08 | — | **sin épica etiquetada** | 3 | Configuración 2 | **No** |
| RNF-01 | — | Frontend | 1 | Prototipos UI/UX | Sí |
| RNF-05 | Infraestructura | Infraestructura | 1 | Arquitectura, modelo de datos | Sí |
| RNF-06 | Infraestructura | Infraestructura | 1 | Arquitectura, modelo de datos | Sí |
| RNF-07 | Auditoría | QA/Documentación | 4 | Ejecución de pruebas, evidencias | Sí |

## Huecos que hay que cerrar en Monday

Son escrituras, así que requieren confirmación explícita del líder
(`integraciones/MONDAY.md`).

| # | Hueco | Acción propuesta |
|---|---|---|
| 1 | `RF-05` no aparece en ninguna tarjeta | Etiquetar `RF-05` en la tarjeta que gestiona tableros, gráficas y alertas. Hoy esa épica no existe |
| 2 | `RF-08` está en Configuración 2 sin etiqueta | Añadir `RF-08` a "Configuración 2: segundo dominio sin cambiar código" |
| 3 | "Configuración 1: carga de familias de la planta" sin etiqueta | Añadir el requisito que corresponda |
| 4 | "Dataset sintético (Configuración 1 y 2) + plan y casos de prueba" sin etiqueta | Añadir el requisito que corresponda |
| 5 | "SRS DOCU IEEE 830" sin etiqueta | Es entregable académico. O se etiqueta `RNF-07` o se acepta que no mapea |
| 6 | RF-07 y RF-08 sin módulo | Definir módulo o declarar que son transversales |
| 7 | `Depende de` vacía en las 19 tarjetas | Escribir las 6 dependencias de `PLAN-EPICAS.md` |

## Reglas

1. Una tarjeta sin etiqueta de requisito no entra a un sprint cerrado. Si es
   entregable o hito, se deja `req=-` a propósito y se marca como tal.
2. Un requisito sin tarjeta no se considera empezado, por muy avanzado que esté
   el código.
3. La evidencia (enlace en la columna `Enlace`) es obligatoria en `Listo`.
4. Esta tabla se corrige contra Monday en el mismo PR en que se corrige Monday.
