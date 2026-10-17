# Ingeniería: alcance de la solución (caso C1)

Estado: **objetivo de construcción**, aún no construido. Este documento fija qué
debe hacer DOCU para el caso práctico de C1 (ver `../proyecto/CASO.md`). No
describe lo ya construido —eso vive en `ARQUITECTURA.md` y `API.md`— ni el
futuro lejano —eso va en ADR.

El stack y las versiones son los de `STACK.md`. El modelo de datos, el de
`MODELO-DATOS.md`. Aquí solo se delimita la superficie: qué entra, con qué
mecanismos y en qué idiomas.

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
**encola**; el worker procesa (ADR-0011).

| Módulo | Rutas previstas | Qué hace |
|---|---|---|
| `archivos` | `POST /v1/archivos` | Subida, `sha256`, crea `ArchivoOriginal` (solo-insert) |
| `ingesta` | `POST /v1/fuentes/:id/sync` | Trae de una fuente (simulada) y la mete al mismo pipeline |
| `clasificacion` | `GET /v1/archivos/:id/clasificacion` | Propuesta de familia + confianza (IA propone) |
| `validacion` | `GET /v1/archivos/:id/validacion` | Resultado de la cadena de reglas declarativas |
| `cuarentena` | `GET /v1/cuarentena` | Bandeja de lo detenido, con motivo y código de regla |
| `confirmacion` | `POST /v1/bandeja/:id/confirmar` | Humano confirma → `DatoOficial` + `HistorialOrigen` |
| `oficiales` | `GET /v1/oficiales` | Dato confirmado, con su fuente y responsable |
| `trazabilidad` | `GET /v1/lineage/:id` | Rollo → orden → máquina → turno → documento |
| `auth` | `POST /v1/auth/login` | Sesión y roles (RBAC en servidor) |
| `reportes` | `GET /v1/reportes/...` | Reportes base (turno/día) |

Decisiones ya anotadas como pendientes en `API.md` (autenticación y token,
versionado, formato de error único, paginación, contrato de ingesta e
idempotencia, OpenAPI como artefacto) se resuelven aquí antes de M1.

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
Schema. La planta opera **sin conexión a internet garantizada**: el sistema debe
funcionar offline y con recursos mínimos.

## 6. Lo que queda fuera y por qué

- **Producto**: no se construye producto hasta tener design system y modelo de
  datos validados (ADR-0012). Este documento es el contrato, no la construcción.
- **Integración real** con SAP/CRM/dataPARC: es post-C1; C1 demuestra el
  mecanismo con fuentes simuladas.
- **dataPARC en vivo** (historiador OT): se consume como fuente, no se
  reemplaza.
