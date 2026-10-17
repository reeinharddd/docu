# Requisitos de DOCU

Estado: vigente. Origen: Etapa 1 (Análisis), recortes de la Etapa 2 v2.
Un cambio de requisito es un issue aprobado y su reflejo en
`gestion/TRAZABILIDAD.md` en el mismo PR.

## Requisitos funcionales

| ID | Requisito | Prioridad Etapa 1 | MoSCoW v2 |
|---|---|---|---|
| RF-01 | Subir Excel, PDF, correo o escaneado arrastrando y soltar, y clasificar por familia preservando el original intacto | Alta | Must |
| RF-02 | Validar al entrar; mandar a cuarentena o revisión lo inválido o dudoso con motivo visible, sin borrado silencioso | Alta | Must |
| RF-03 | Exigir confirmación humana para publicar el dato oficial (patrón repetido y responsable), con historial de origen, regla aplicada y quién confirmó | Alta | Must |
| RF-04 | Buscador de documentos y datos con filtros por fecha y área; consulta donde cada cifra cita su fuente y su cálculo; gráficas guardables | Alta | Must reducido |
| RF-05 | Tablero configurable por planta, reporte descargable y alertas (métrica, umbral, destinatarios, mensaje); reportes recurrentes que se pausan si el formato cambia | Alta | Must limitado a 1 reporte + 1 alerta |
| RF-06 | Control de acceso por rol en servidor (planta → departamento → rol → persona) y bitácora completa de quién subió y quién confirmó | Alta | Must |
| RF-07 | Documentos: ver, editar metadatos, versionar; derivados o vistas según familia | Media | Could |
| RF-08 | Parametrización por planta sin cambiar código: catálogos, familias, roles, umbrales, tableros, alertas | Media | Must mínimo + Configuración 2 |

## Requisitos no funcionales

| ID | Categoría | Meta |
|---|---|---|
| RNF-01 | Usabilidad | En español, Chrome y Edge, usable en celular, errores claros sin bloqueos silenciosos; bandeja resoluble en minutos |
| RNF-02 | Trazabilidad | Sin origen no hay cifra oficial; meta 80% automático con regla registrada y 20% a humano |
| RNF-03 | Seguridad | Permisos en servidor, contraseñas cifradas, secretos fuera del código, nada a la nube sin configuración explícita |
| RNF-04 | Rendimiento | Demo fluida; lectura de texto, lotes y alertas en segundo plano con Redis; recálculo de reportes por ciclos |
| RNF-05 | Mantenibilidad | Una sola aplicación modular, TypeScript de punta a punta, decisiones escritas |
| RNF-06 | Compatibilidad | Docker Compose con app, base y Redis; funciona en localhost sin internet salvo IA en nube opcional |
| RNF-07 | Verificabilidad | Todo comprobable al cierre con CRISP-DM adaptado; si no se demuestra, no entra |

## Recorte MoSCoW (Etapa 2 v2)

| Nivel | Contenido |
|---|---|
| Must | RF-01, RF-02, RF-03, RF-06, RF-04 reducido, RF-08 mínimo, Configuración 2 demostrada sin código |
| Should | Búsqueda semántica con pgvector, reglas extra de planta, OCR difícil |
| Could | LLM de clasificación, consulta en lenguaje natural, tableros configurables, RF-07 completo |
| Won't | Voz, agentes auto-mejorables, RLS o base por cliente, sensores, predicción |

El recorte es **funcional, no de generalidad**: la Configuración 2 se demuestra
aunque cueste.

## Trazabilidad requisito → módulo → épica

| RF | Módulo | Issue | Sprint |
|---|---|---|---|
| RF-01 | `sources/ingestión` | #12 API NestJS | Sprint 1 |
| RF-01, RF-02 | `sources/ingestión` | #3 Pipeline de ingesta, OCR y clasificación | Sprint 2 |
| RF-03 | `canonical/lineage` | #12 API NestJS | Sprint 1 |
| RF-03, RF-04 | `discover/mapping` + front | #4 Frontend Angular | Sprint 2 |
| RF-04 | `agent/tools` | #4 Frontend Angular (parcial) | Sprint 2 |
| RF-05 | `agent/tools` | #39 Reporte recurrente y alerta | Sprint 3 |
| RF-06 | `auth/governance` | #10 Arquitectura y entorno base | Sprint 1 |
| RF-06, RF-02 | `auth/governance` | #5 RBAC, bitácora y reglas declarativas | Sprint 2 |
| RF-07 | `canonical/lineage` | transversal (Could), diferido fuera de la entrega actual por decisión del líder 2026-10-12 | — |
| RF-08 | `discover/mapping` | #8 Configuración 2 | Sprint 3 |
| RNF-07 | transversal | #6 Pruebas, evidencias y cierre | Sprint 4 |

### Huecos y fechas

Los huecos de trazabilidad vivos están en `gestion/TRAZABILIDAD.md` y se
consultan con `gh issue list --label req:pendiente`. Las fechas duras son
milestones de GitHub y se listan en `gestion/RITMO-SEMANAL.md`; la más
cercana con impacto en diseño es **2026-10-30, contrato de datos congelado**
(milestone `Contrato de datos congelado`, verificado en GitHub el 2026-10-09).

## Pruebas que exige cada requisito

| RF | Evidencia mínima esperada |
|---|---|
| RF-01 | Subir un archivo de cada familia y ver su hash y familia asignados |
| RF-02 | Archivo inválido cae en cuarentena con motivo visible y el original sigue ahí |
| RF-03 | Publicar sin confirmar no es posible; al confirmar queda origen, regla y persona |
| RF-04 | Búsqueda con filtro devuelve cifras que citan fuente; consulta < 3 s con 1 000 documentos |
| RF-05 | Un reporte recurrente con una alerta que se dispara al cruzar el umbral |
| RF-06 | Usuario de un departamento no lee otro; escalada por API rechazada; bitácora con quién |
| RF-07 | Versión nueva de metadatos sin perder la anterior |
| RF-08 | Configuración 2 cargada con `git diff` de código vacío y reporte propio |

Métricas fijadas para las pruebas de clasificación y OCR sobre el dataset de C1
(composición y conteos en `ingenieria/fichas/CONTRATO.md` §8): precisión de
clasificación ≥ 80%; exactitud de campos clave ≥ 90% y CER ≤ 10% en texto corrido
sobre los escaneados del mismo dataset.

## Referencias

- Caso que da origen a los datos: `proyecto/CASO.md`
- Plan con fechas y responsables: `gestion/PLAN-EPICAS.md`
- Cadena completa hasta PR y evidencia: `gestion/TRAZABILIDAD.md`