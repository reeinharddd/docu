# Accesos e integraciones

Estado: vigente. Última actualización: 2026-10-05.

Este documento dice qué credenciales necesita el proyecto, de dónde salen, qué
se puede hacer con cada una y quién las autoriza. No contiene valores: un
secreto en el repositorio es un incidente, y la verificación automática lo
detecta.

## Principio

- Los **nombres** de las variables se declaran en `.env.example`, siempre.
- Los **valores** viven solo en el `.env` de cada máquina, que nunca se commitea.
- La credencial se comparte con quien la necesita por el canal seguro del
  equipo, no por un repositorio, un issue ni un chat.
- Rotación: una credencial que salió de su entorno se cambia el mismo día.

## Variables de entorno

| Variable | Para qué | Quién la autoriza |
|---|---|---|
| `DATABASE_URL` | Conexión a PostgreSQL | Local, sin autorización |
| `REDIS_URL` | Conexión a Redis | Local, sin autorización |
| `PG_PORT`, `REDIS_PORT` | Evitar conflictos de puertos locales | Local |
| `PORT_API` | Puerto de la API | Local |
| `JWT_SECRET` | Firma de sesión | Local; en etapas posteriores con valor compartido |
| `IA_LOCAL_ACTIVADA` | Habilita el modelo local | Local |
| `IA_NUBE_ACTIVADA` | Habilita modelos en nube | **Requiere autorización explícita del líder** |
| `MONDAY_API_KEY` | Token de la API de Monday | El líder lo entrega a quien lo necesite |
| `MONDAY_BOARD_ID` | Identificador del tablero de producto | No es secreto |
| `GOOGLE_CLIENT_ID` | Credencial OAuth del proyecto de Drive | El líder lo entrega |
| `GOOGLE_CLIENT_SECRET` | Credencial OAuth del proyecto de Drive | El líder lo entrega |
| `GOOGLE_REFRESH_TOKEN` | Token de refresco OAuth de Drive | El líder lo entrega |
| `GOOGLE_DRIVE_FOLDER` | Carpeta de entregas en Drive | No es secreto |
| `ENGRAM_PROYECTO` | Nombre del proyecto de memoria | No es secreto |

## Monday

Un solo tablero es fuente de verdad de DOCU:

| Tablero | Identificador | Propósito |
|---|---|---|
| Gestión del proyecto | `18432808588` | **Autoridad de estado.** Producto DOCU: épicas, historias, tareas, sprints |

Los demás tableros de la cuenta no son fuente de verdad del producto y no se leen
para decidir sobre DOCU. Se inventarian en `integraciones/MONDAY.md` con el motivo
de quedar fuera, para que no se reenabrunden por error.

| Tablero | Identificador | Por qué no es autoridad |
|---|---|---|
| Proyecto EC0935 – RDD | `18432676211` | Gantt académico de la materia. Planeación, no ejecución |
| Subelementos de Gestión del proyecto | `18433853431` | Desglose. Contiene la fecha de congelación del contrato |
| Proveedores | `18433290803` | Externos. No afecta el producto |
| ~~Control del proyecto~~ | `39824544` | **La API responde `boards: []`.** Declarado aquí antes sin estar disponible. Resolver antes de volver a contarlo |

Reglas de uso, en orden de permiso:

| Acción | Permiso | Condición |
|---|---|---|
| Leer tableros, columnas, grupos y tarjetas | Automático | — |
| Cambiar estado, responsable, fechas o sprint | Con confirmación | Petición explícita del líder en la conversación |
| Crear tarjetas o columnas | Con confirmación | Con el formato de brief completo y registrado |
| Archivar o cancelar | Con confirmación | Nunca borrar: el histórico es evidencia |
| Borrar tarjetas, tableros o estructura | **Prohibido** | Sin excepción |

Contrato de columnas, estados, prioridades, límites reales de la API y hallazgos
verificados: `integraciones/MONDAY.md`.

## Google Drive y Docs

Una sola carpeta, con su identificador fijo:

| Carpeta | Identificador |
|---|---|
| Desarrollo web integral | `1KeJaYqEfrbD4H7hKCTIZsDMEAOolUdH4` |

Contiene los documentos de las etapas, la plantilla de formato y el diagrama de
arquitectura. El árbol verificado y los 3 enlaces cruzados con Monday:
`integraciones/DRIVE.md`.

Se busca **por identificador, nunca por nombre**: Monday llama al proyecto
"Proyecto EC0935 – REPOSITORIO DE DOCUMENTACION DIGITAL (RDD)" y la carpeta se
llama "Desarrollo web integral". Buscar por nombre falla.

Regla dura: **solo lectura y siempre en vivo**. Nunca se usa una copia local
como fuente de verdad, porque una copia envejece y nadie se entera. Prohibido
crear, modificar, subir o borrar; solo leer y exportar.

Variables: las tres credenciales OAuth más el identificador de carpeta. Se usa
el token de refresco: el token de acceso caduca y no se guarda.

Documentación del lector y verificaciones hechas: `integraciones/DRIVE.md`.

## Memoria del proyecto

Herramienta: Engram, proyecto `docu`. Guarda contexto de sesión, descubrimientos
y el índice de decisiones. **No es fuente de verdad** de nada canónico: lo que
debe ser verdad en el tiempo vive en este repositorio.

Política de escritura: `integraciones/ENGRAM.md`.

## Repositorio y automatización

- Código, PR, historial y protección de la rama principal: GitHub.
- Revisión automática: GitHub Actions.
- Secretos en el repositorio: Gitleaks, además del hook local.
- Actualización de dependencias: Renovate, sin fusionar solo.

## Servidores MCP del proyecto

**Ninguno activo.** `.mcp.json` se versiona vacío a propósito: hoy ninguna
candidata pasa los siete criterios de `integraciones/HERRAMIENTAS-AGENTE.md`, y
un MCP a medias es peor que ninguno. El veredicto por herramienta, con el
criterio que falla, está en `integraciones/MCP.md`.

El día que uno entre: se declara en `.mcp.json` con revisión exacta, su credencial
como variable de entorno en `.env.example`, y su fila en esta tabla.

## Lo que un agente puede hacer sin preguntar

Leer el repositorio, leer el tablero `18432808588`, leer la carpeta de Drive,
leer la memoria del proyecto, y ejecutar las verificaciones declaradas en el
repositorio: `bun run lint`, `bun run typecheck`, `bun run prisma:validate`,
`bun run compose:check`, `bun run doctor`, `bash scripts/doc-index.sh` y las
pruebas.

Todo lo demás se pregunta. Incluye cualquier escritura en Monday o Drive, que
queda prohibida, no solo confirmada.