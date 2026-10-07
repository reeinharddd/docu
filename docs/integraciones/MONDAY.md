# Integración: Monday (histórico)

Estado: **reemplazado** el 2026-10-06 por GitHub
(`decisiones/ADR-0008-github-como-gestor-del-equipo.md`). El gestor vigente se
documenta en `integraciones/GITHUB-GESTION.md`. Este archivo se conserva como
evidencia: Monday ya no es autoridad de nada y no se escribe. Las 19 tarjetas y
9 subelementos se migraron a los issues #3–#26.

Verificado contra la API el 2026-10-05 (`API-Version: 2026-07`).

## Tablero en alcance

Un solo tablero es fuente de verdad de DOCU:

| Tablero | ID | Rol |
|---|---|---|
| Gestión del proyecto | `18432808588` | **Autoridad.** Épicas, historias, tareas, sprints, estados, fechas |

Los otros tableros de la cuenta **no son fuente de verdad de DOCU** y no se leen
para tomar decisiones del producto:

| Tablero | ID | Por qué queda fuera |
|---|---|---|
| Proyecto EC0935 – REPOSITORIO DE DOCUMENTACION DIGITAL (RDD) | `18432676211` | Es el gantt académico de la materia (23 ítems en 6 etapas, sin estado ni trazabilidad). Es planeación, no ejecución |
| Subelementos de Gestión del proyecto | `18433853431` | 9 ítems desglosados sin metadatos. Sirve de contexto, no se cita |
| Proveedores | `18433290803` | Externos y riesgos. No afecta el producto |
| ~~Control del proyecto~~ | `39824544` | **Declarado antes en `ACCESOS.md` pero la API responde `boards: []`.** O se eliminó o el token perdió acceso. Hay que resolverlo antes de volver a declararlo |

Regla para evitar chocar: cuando dos fuentes discrepan, para estado gana
`18432808588` y se corrige la otra en el mismo PR. Ningún otro tablero puede
mover una tarjeta de DOCU.

## Contrato de columnas (verificado)

13 columnas en `18432808588`:

| ID | Título | Tipo | Uso |
|---|---|---|---|
| `name` | Name | name | Título de la tarjeta |
| `subtasks_mm7ss4c6` | Subelementos | subtasks | Desglose |
| `dropdown_mm7jvkp6` | Tipo | dropdown | `Tarea`, `Historia`, `Milestone`, `Entregable` |
| `color_mm7jdjxc` | Estado | status | `Por hacer`, `En progreso`, `Listo` |
| `color_mm7j2zxx` | Prioridad | status | `Critica`, `Alta`, `Media` |
| `multiple_person_mm7jeeyn` | Responsable | people | Persona asignada |
| `dropdown_mm7jxmet` | Épica | dropdown | `Backend`, `Frontend`, `Base de datos`, `Infraestructura`, `Autenticación`, `QA/Documentación` |
| `dependency_mm7j570z` | Depende de | dependency | **Vacía en las 19 tarjetas** |
| `dropdown_mm7j4eth` | Sprint | dropdown | `Sprint 1` … `Sprint 4` |
| `dropdown_mm7jprw3` | Módulo | dropdown | `API`, `Documentos`, `Auditoría`, `Permisos`, `Base de datos`, `Infraestructura` |
| `link_mm7jmbaq` | Enlace | link | Evidencia (Drive, PR) |
| `tag_mm7s3zw3` | Requisito | tags | `RF-01`…`RF-08`, `RNF-01`…`RNF-07` |
| `timerange_mm7th844` | Cronograma | timeline | Inicio y fin |

Grupos: `📥 BACKLOG`, `🎯 SPRINT ACTUAL`, `🚧 DESARROLLO`, `🧪 QA / REVISIÓN`,
`🚀 RELEASE`, `🏁 COMPLETADO`.

## Permisos

| Acción | Permiso | Condición |
|---|---|---|
| Leer columnas, grupos y tarjetas | Automático | — |
| Mover estado, responsable, fecha o sprint | Con confirmación | Petición explícita del líder |
| Crear tarjetas o columnas | Con confirmación | Brief completo y registrado |
| Archivar o cancelar | Con confirmación | Nunca borrar: el histórico es evidencia |
| Borrar tarjetas, tableros o estructura | **Prohibido** | Sin excepción |

Variables: `MONDAY_API_KEY` (secreto, lo entrega el líder), `MONDAY_BOARD_ID` (no
es secreto). Endpoint `https://api.monday.com/v2`, GraphQL `POST`, cabecera
`API-Version` explícita en cada llamada: sin ella la API puede resolver otro
esquema.

## Lectura mínima y verificada

```graphql
query($ids: [ID!]!, $cur: String) {
  boards(ids: $ids) {
    name
    items_page(limit: 500, cursor: $cur) {
      cursor
      items { id name group { title } column_values { id text type } }
    }
  }
}
```

`ItemsResponse` expone `cursor` e `items`. No expone `total_count` ni
`items_page_items`. Paginar por `cursor`; una llamada sin `cursor` no devuelve
error, solo la primera página, y eso parece un tablero vacío.

## Hallazgos del 2026-10-05

19 tarjetas: 10 `BACKLOG`, 5 `SPRINT ACTUAL`, 4 `COMPLETADO`. Estados: 14
`Por hacer`, 1 `En progreso`, 4 `Listo`. **12 de 19 sin requisito.** 0 sin
cronograma.

| Hallazgo | Impacto |
|---|---|
| `RF-05` no está etiquetada en ninguna tarjeta | La épica de tableros y gráficas no está conectada al tablero. Ver `gestion/TRAZABILIDAD.md` |
| `RF-08` aparece en Configuración 2 sin la etiqueta de requisito | Requisito sin trazabilidad |
| Configuración 1 tampoco lleva requisito | Tercera historia huérfana |
| Los 4 milestones llevan `req=-` | Correcto: un milestone no mapea a un requisito |
| La columna `Depende de` está vacía | Las dependencias del plan se llevan en la cabeza, no en la herramienta |
| "Contrato de datos congelado el 23 de octubre para maquetas" (tablero Subelementos) | **Fecha dura a 18 días. No está en ningún archivo del repositorio.** Registrada en `gestion/PLAN-EPICAS.md` |
| No existe ninguna tarjeta llamada "E1" | `proyecto/REQUISITOS.md` afirmaba lo contrario. Corregido |
| `39824544` inaccesible | Declarado en `ACCESOS.md` sin estar disponible |
