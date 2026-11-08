# Ingeniería: alcance de la solución (caso C1)

Estado: **objetivo de construcción**, aún no construido. Este documento fija qué
debe hacer DOCU para el caso práctico de C1 (ver `../proyecto/CASO.md`). No
describe lo ya construido —eso vive en `ARQUITECTURA.md` y `API.md`— ni el
futuro lejano —eso va en ADR.

El stack y las versiones son los de `STACK.md`. El modelo de datos, el del ER
v1 (`DIAGRAMA-BD-v0.md`; `MODELO-DATOS.md` lo reescribe #62). Aquí solo se
delimita la superficie: qué entra, con qué mecanismos y en qué idiomas.

## 1. Qué entra y qué no entra

| Entra en C1 | No entra en C1 |
|---|---|
| Ingesta por arrastrar/subir archivos | Integración en vivo con SAP/CRM/dataPARC (van simuladas) |
| Ingesta desde fuentes (al principio simuladas) | Sincronización bidireccional con esos sistemas |
| OCR español **e inglés** | Idiomas distintos de español e inglés |
| Clasificación de familia + validación declarativa | Reglas embebidas en código (prohibido: RF-08) |
| Cuarentena con motivo, confirmación humana, bitácora | Publicación automática de dato oficial (ADR-0006) |
| Consulta con trazabilidad (origen → oficial) | Reportería avanzada fuera de los reportes base |
| RBAC en servidor según `ROLES.md` (#29) | SSO corporativo, directorio externo |

## 2. Superficie de API (prevista)

Un módulo por dominio (convención de `API.md`), todo bajo `/v1`. La API
**encola**; el worker procesa (ADR-0011). Identificadores de código en inglés
(regla del repo); la explicación en español.

| Módulo | Rutas previstas | Qué hace |
|---|---|---|
| `files` | `POST /v1/files` | Subida, `sha256`, crea `ingest.source_file` (solo-insert) |
| `sources` | `POST /v1/sources/:id/sync` | Trae de una fuente (simulada) y la mete al mismo pipeline |
| `classification` | `GET /v1/files/:id/classification` | Propuesta de familia + confianza (IA propone) |
| `validation` | `GET /v1/files/:id/validation` | Resultado de la cadena de reglas declarativas |
| `quarantine` | `GET /v1/quarantine` | Bandeja de lo detenido, con motivo y código de regla |
| `inbox` | `GET /v1/inbox` | Bandeja de propuestas por revisar (la consume el front) |
| `inbox` | `POST /v1/inbox/:id/confirm` | Humano confirma → `graph.entity` oficial + `truth.origin_history` |
| `inbox` | `POST /v1/inbox/:id/reject` | Humano rechaza → `graph.entity` en `rejected` + bitácora |
| `official-records` | `GET /v1/official-records` | Dato confirmado, con su fuente y responsable |
| `lineage` | `GET /v1/lineage/:id` | Rollo → orden → máquina → turno → documento |
| `auth` | `POST /v1/auth/login` | Sesión y roles (RBAC en servidor) |
| `auth` | `POST /v1/auth/logout` | Revoca la sesión en el servidor |
| `reports` | `GET /v1/reports/day` | Reporte del día (la consume el front) |

**Dónde está el detalle.** La matriz completa —endpoint ↔ módulo ↔ tabla o
vista ↔ errores ↔ permiso— está en [ARQUITECTURA.md §3](ARQUITECTURA.md#3-contrato-de-endpoints).
Ahí vive la forma de cada respuesta; aquí solo la superficie, que es lo que
el producto necesita.

El vocabulario canónico de entidades (inglés, con su equivalente del caso)
está en `../proyecto/CASO.md` §Mapa de derivación. Los nombres de tabla y
columna son los del ER v1 (#58), en `snake_case`.

Las seis decisiones que `API.md` tenía pendientes quedan cerradas:

| Decisión | Dónde quedó |
|---|---|
| Autenticación y forma del token | [ADR-0021](../decisiones/ADR-0021-token-opaco-con-revocacion-inmediata.md): token opaco, no JWT |
| Versionado de la ruta | `/v1` para todo el producto; `API.md` y el front ya lo usan |
| Formato de error único | §2.1 de este documento (debajo), canónico |
| Paginación y filtrado de la bandeja | [ADR-0022](../decisiones/ADR-0022-paginacion-por-limit-y-offset.md) |
| Contrato de ingesta e idempotencia | [ARQUITECTURA.md §3.2](ARQUITECTURA.md#32-idempotencia-de-la-ingesta): `sha256` único por instalación, repetido = `409` |
| OpenAPI como artefacto | [ARQUITECTURA.md §8](ARQUITECTURA.md#8-qué-falta-para-que-este-mapa-sea-verdad-completa): pendiente de #12 |

### 2.1 Contrato de coordinación front ↔ backend

La frontera donde más se rompen los proyectos. Vale para ambas partes; lo
cumple el backend (#12) y lo consume el frontend (ya implementado en
`apps/web/src/app/core/`).

**Formato único de error.** Todo no-2xx devuelve el mismo sobre
(`ApiError`, tipos transversales en `apps/web/src/app/core/types/api-error.ts`):

```json
{ "code": "VALIDATION_ERROR", "message": "El rollo no tiene certificado.", "details": {} }
```

| `code` | HTTP | Cuándo |
|---|---|---|
| `VALIDATION_ERROR` | 422 | Una regla o el esquema de la familia no pasa |
| `UNAUTHENTICATED` | 401 | Sin sesión o sesión vencida |
| `FORBIDDEN` | 403 | Con sesión, sin permiso (RBAC del servidor) |
| `NOT_FOUND` | 404 | Recurso inexistente o fuera de alcance de la planta |
| `CONFLICT` | 409 | Duplicado (`sha256` ya existe) o cambio de formato |
| `RATE_LIMITED` | 429 | Demasiadas peticiones (lote de ingesta) |
| `INTERNAL` | 5xx | Falla del servidor — **sin stack traces ni detalles internos** |

`message` es humano y en español (RNF-01), seguro de mostrar. Los códigos son
valores estables del contrato, no textos.

**Flujos coordinados 401/403** (implementados en el `errorInterceptor`):
401 fuera de `/auth/login` → la sesión muere y el front va a `/login` con
`return`; 401 desde `/auth/login` → credenciales malas, sin redirect;
403 → `/forbidden`.

**Notificaciones.** Los toasts son de la UI y hablan de **acciones**
(documento confirmado, regla que bloqueó); las lecturas hablan por `ApiState`
(`StateView`). En C1 el backend no manda toasts; las alertas de #39 llegan
como datos de dominio, no como notificaciones.

**Subida de archivos (RF-01).** `POST /v1/files` con `multipart/form-data`.
El cliente valida tamaño y tipo por UX; **el servidor valida de verdad**
(tamaño, tipo, familia por clasificación). Respuestas: `201` con
`{ sourceFileId, sha256 }` o `422` con el sobre de error. Reintentos del lote
los maneja la cola del worker (ADR-0011), no el navegador. La forma de cada
respuesta está en [ARQUITECTURA.md §3.1](ARQUITECTURA.md#31-matriz-endpoint--módulo--tablas--errores);
aquí solo se recuerda la regla.

**Guardas de seguridad en la frontera.** Token solo en memoria (signals;
nunca `localStorage` — XSS). Nada de `bypassSecurityTrust` ni `innerHTML`
(Angular sanitiza por defecto). Sin secretos ni claves en el front. El
servidor es la única autoridad de reglas y permisos: la validación del
cliente es UX, no seguridad. CORS: mismo origen en C1 (un solo host, RNF-06).
CSP: el host que sirve el front envía `Content-Security-Policy` restrictiva
(sin `unsafe-inline` ni `unsafe-eval` para scripts, `connect-src` al mismo
origen); hoy no existe en el repositorio y es la mitigación del riesgo de
XSS con el token en memoria. El ciclo de vida de la sesión —expiración,
revocación, logout y limpieza de sesiones abandonadas— está en
[ARQUITECTURA.md §3.5](ARQUITECTURA.md) y en
[ADR-0021](../decisiones/ADR-0021-token-opaco-con-revocacion-inmediata.md).

## 3. Mecanismos de ingesta

Dos entradas, un solo pipeline:

1. **Subida manual** — el usuario arrastra o sube el archivo en la pantalla de
   captura. Es el camino que ya bosqueja `ARQUITECTURA.md` §3.
2. **Fuentes** — al inicio **simuladas**, para no depender de sistemas reales:
   - mock de **SAP** (stock, BOM, orden),
   - mock de **CRM** (pedido/compromiso),
   - mock de **dataPARC** (temps, paros, OEE),
   - buzón de **correo** (lo de la hermana y avisos),
   - carpeta de **escaneo** (lo que sale de Calidad).

DOCU **no debe funcionar cableado a estos supuestos**. Familias, fuentes y
reglas son **datos** (ADR-0009, RF-08): cambiar una fuente o una regla no toca
código.

## 4. Idiomas

| Superficie | Idioma |
|---|---|
| Interfaz de usuario | español |
| Documentación (`docs/`) | español |
| Código y configuración | inglés |
| **OCR** | **español e inglés** |

El OCR es bilingüe a propósito: la planta hermana (EE. UU.) y el corporativo
escriben en inglés, y los documentos llegan mezclados (etiqueta en inglés,
registro en español). El sistema no puede asumir un solo idioma.

## 5. Despliegue y operación (C1)

Lo de `ARQUITECTURA.md` §5, aplicado al caso: un solo host con Docker Compose
(base, Redis y la app), **sin nube** salvo configuración explícita (RNF-03). El
modelo IA puede ser local (Ollama) o API, siempre con salida forzada a JSON
Schema. La instalación opera **sin conexión a internet garantizada**: el sistema debe
funcionar offline y con recursos mínimos.

## 6. Lo que queda fuera y por qué

- **Producto**: no se construye producto hasta tener design system y modelo de
  datos validados (ADR-0012). Este documento es el contrato, no la construcción.
- **Integración real** con SAP/CRM/dataPARC: es post-C1; C1 demuestra el
  mecanismo con fuentes simuladas.
- **dataPARC en vivo** (historiador OT): se consume como fuente, no se
  reemplaza.
