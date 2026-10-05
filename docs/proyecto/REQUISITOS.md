# Requisitos de DOCU

Estado: vigente. Origen: Etapa 1 (Análisis), recortes de la Etapa 2 v2.
Un cambio de requisito es un cambio aprobado en Monday y una línea en
`diario/AAAA-MM-DD.md`.

## Requisitos funcionales

| ID | Requisito | Prioridad Etapa 1 | MoSCoW v2 |
|---|---|---|---|
| RF-01 | Subir Excel, PDF, correo o escaneado arrastrando y soltar, y clasificar por familia preservando el original intacto | Alta | Must |
| RF-02 | Validar al entrar; mandar a cuarentena o revisión lo inválido o dudoso con motivo visible, sin borrado silencioso | Alta | Must |
| RF-03 | Exigir confirmación humana para publicar el dato oficial (patrón repetado y responsable), con historial de origen, regla aplicada y quién confirmó | Alta | Must |
| RF-04 | Buscador de documentos y datos con filtros por fecha y área; consulta donde cada cifra cita su fuente y su cálculo; gráficas guardables | Alta | Must reducido |
| RF-05 | Tablero configurable por empresa, reporte descargable y alertas (métrica, umbral, destinatarios, mensaje); reportes recurrentes que se pausan si el formato cambia | Alta | Must limitado a 1 reporte + 1 alerta |
| RF-06 | Control de acceso por rol en servidor (empresa → departamento → rol → persona) y bitácora completa de quién subió y quién confirmó | Alta | Must |
| RF-07 | Documentos: ver, editar metadatos, versionar; derivados o vistas según familia | Media | Could |
| RF-08 | Parametrización por empresa sin cambiar código: catálogos, familias, roles, umbrales, tableros, alertas | Media | Must mínimo + Configuración 2 |

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

| RF | Módulo | Épica en Monday `18432808588` | Sprint |
|---|---|---|---|
| RF-01 | `sources/ingestión` | API NestJS: modelo de datos, ingesta y dato oficial | Sprint 1 |
| RF-01, RF-02 | `sources/ingestación` | Pipeline de ingesta, OCR y clasificación + integración Front-End ↔ Back-End | Sprint 2 |
| RF-03 | `canonical/lineage` | API NestJS: modelo de datos, ingesta y dato oficial | Sprint 1 |
| RF-03, RF-04 | `discover/mapping` + front | Frontend Angular: captura, bandeja de revisión, Programa Oficial, búsqueda | Sprint 2 |
| RF-04 | `agent/tools` | Frontend Angular (parcial) | Sprint 2 |
| RF-05 | `agent/tools` | **sin épica etiquetada** | — |
| RF-06 | `auth/governance` | Arquitectura, modelo de datos y entorno base | Sprint 1 |
| RF-06, RF-02 | `auth/governance` | RBAC en servidor, bitácora y reglas de validación declarativas | Sprint 2 |
| RF-07 | `canonical/lineage` | **sin épica etiquetada** (Could) | — |
| RF-08 | `discover/mapping` | Configuración 2: segundo dominio sin cambiar código (**sin etiqueta de requisito**) | Sprint 3 |
| RNF-07 | transversal | Ejecución de pruebas, evidencias y documentación de cierre | Sprint 4 |

### Huecos a corregir en Monday (requiere escritura, pendiente de autorización)

1. **RF-05 no está etiquetado en ninguna tarjeta.** El recorte lo deja en Must
   como "1 reporte + 1 alerta" y no tiene dueño. Debería ser de `agent/tools`.
2. **RF-08** aparece en la tarjeta de Configuración 2 sin la etiqueta de
   requisito.
3. La tarjeta de E1 sigue en `En progreso` aunque el repo ya cerró E1 con CI
   verde.
4. Las tarjetas "Cierre de diseño", "Fin del desarrollo", "Listos para
   presentar" y "Presentación de diciembre" no llevan requisito, lo cual es
   correcto, pero tampoco llevan fecha límite.

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

Métricas fijadas para las pruebas de clasificación y OCR: 200 archivos sintéticos
(5 familias × 40) con precisión de clasificación ≥ 80%; 50 escaneados de prueba
con exactitud de campos clave ≥ 90% y CER ≤ 10% en texto corrido.

## Referencias

- Caso que da origen a los datos: `proyecto/CASO.md`
- Plan con fechas y responsables: `gestion/PLAN-EPICAS.md`
- Cadena completa hasta PR y evidencia: `gestion/TRAZABILIDAD.md`