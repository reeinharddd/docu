# Integración: Google Drive

Estado: vigente. Verificado en vivo el 2026-10-05.
Autoridad de: entregas y documentos firmados. Nunca de reglas del equipo.

## Regla dura

**Solo lectura y siempre en vivo.** Prohibido crear, modificar, subir o borrar.
Nunca se usa una copia local como fuente de verdad: una copia envejece y nadie se
entera. Si se necesita un dato, se vuelve a leer.

## Carpeta en alcance

Una sola carpeta:

| Carpeta | ID | Rol |
|---|---|---|
| Desarrollo web integral | `1KeJaYqEfrbD4H7hKCTIZsDMEAOolUdH4` | Entregas de la materia y del proyecto |

Contenido real verificado (2 llamadas, 0 errores):

```
Desarrollo web integral/
├── diagramas/
│   └── Arquitectura en capas: ingreso, decisión humana y egreso.drawio
│       application/vnd.jgraph.mxfile · 8.1 KB · 2026-10-04
├── Etapa 0. Descubrimiento e Ideación
│       Google Doc · 2026-10-02
├── Etapa 2. Planificacion y Diseno.docx
│       .docx · 685 KB · 2026-10-05
├── Etapa1. Analisis Proyecto Web.docx
│       .docx · 30 KB · 2026-10-03
└── plantilla_formato_ieee830.docx
        .docx · 281 KB · 2026-10-04
```

Propietario único de los 5 objetos: la cuenta del líder. Nadie más escribe ahí.

## Permisos

| Acción | Permiso |
|---|---|
| Listar y leer metadatos de la carpeta | Automático |
| Leer contenido | Con confirmación |
| Crear, mover, subir, compartir o borrar | **Prohibido** |

Variables: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`
(los entrega el líder) y `GOOGLE_DRIVE_FOLDER` (no es secreto).

## Lectura

El token de acceso caduca en ~1 h y **no se guarda**: se pide uno nuevo con el
refresh token cada vez. `POST https://oauth2.googleapis.com/token`,
`grant_type=refresh_token`. Después `Authorization: Bearer <access_token>`.

Dos trampas que ya costaron una lectura falsa:

1. En el endpoint de listado, `fields` lleva el envoltorio: `files(id,name,…)`.
   En el de un archivo, no. Ponerlo mal devuelve HTTP 400 y, si no se chequea el
   estado, el bucle no itera y el resultado parece una carpeta vacía.
2. `q` debe ir codificado. Un `'` sin escapar rompe la consulta.

Chequeo mínimo: si la respuesta no es 200, lanzar. Una carpeta vacía real tiene
`files: []` con estado 200; cualquier otra cosa es un error de lectura, no una
carpeta vacía.

## Vínculos cruzados verificados

Los 3 entregables "Etapa" (issues #14, #15, #16) apuntan a objetos de Drive que
existen y son los correctos:

| Entregable | ID de Drive | Resuelve a |
|---|---|---|
| Etapa 0 | `1iVX0RocK85_4uzrQYUtaM4pVU-4hPYpk1fCFp6ULsBg` | `Etapa 0. Descubrimiento e Ideación` |
| Etapa 1 | `16aVye0h5sgC5Cdc_7WDJQ8AqHxw5Q5RR` | `Etapa1. Analisis Proyecto Web.docx` |
| Etapa 2 | `1_eXJG0jkVazBxQ2Hawu697Pk8KxbmK4B` | `Etapa 2. Planificacion y Diseno.docx` |

## Vacíos

| Vacío | Consecuencia | Dónde se resuelve |
|---|---|---|
| El único diagrama es de arquitectura en capas | `RF-04` pide diagrama de casos de uso: no existe | Issue #36 |
| No hay carpeta de originales ni dataset | `dataset/config1` y `config2` siguen vacíos | Issue #9 |
| El plan académico llama al proyecto "Proyecto EC0935 – REPOSITORIO…" y la carpeta se llama "Desarrollo web integral" | Búsqueda por nombre falla | Usar el ID, nunca el nombre |
| El SRS IEEE 830 es una tarea de Sprint 1 y la plantilla sí está aquí | El entregable académico depende de una plantilla versionada en Drive | La copia vigente en Drive (citar fecha) e issue #13 |
