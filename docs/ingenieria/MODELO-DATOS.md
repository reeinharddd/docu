# Ingeniería: modelo de datos

Estado: en revisión 2026-10-12. No hay esquema ni migración implementados: el
modelo de datos se decide con el diagrama v1 (BRIEF-07/BRIEF-58) y se escribe en
el repositorio recién en M1 (#59). Lo que sigue es contexto histórico, no verdad.

PostgreSQL 18 con `pgvector`. La extensión `vector` la creará la migración base
de M1 (`CREATE EXTENSION vector`), no un script de arranque: `infra/postgres/init`
está montado pero vacío y no debe cargarse a mano.

## Capa de organización y acceso

`Instalacion` → `Departamento` → `Usuario`, con `Rol` en tabla puente
(`UsuarioRol`). Raíz `Instalacion`: un despliegue sirve a una compañía y en él
conviven sus instalaciones; nunca se mezclan compañías. Cuatro códigos de rol: `admin`, `manager`, `member`, `guest` (`proyecto/ROLES.md`).

`Usuario.departamentoId` es opcional a propósito: un administrador no pertenece
a un departamento. `Instalacion` + `Departamento` + `nombre` es único.

## Ingesta

| Modelo | Papel |
|---|---|
| `ArchivoOriginal` | Entra por `sha256` único. Nunca se borra ni se sobrescribe |
| `Cuarentena` | Un archivo que no pasa una validación. `ABIERTA` → `RESUELTA` o `DESCARTADA` |

`ArchivoOriginal.familia` es un discriminante de texto: `programa_planeacion`,
`recepcion_rollo`, `inventario`, `excel_turno`, `correo_hermana`, `escaneado`.
`estado`: `RECIBIDO`, `VALIDADO`, `EN_CUARENTENA`.

`sha256` único es la garantía de no duplicar: subir dos veces el mismo archivo no
crea dos filas.

## Dato oficial e historial

| Modelo | Papel |
|---|---|
| `DatoOficial` | El valor vigente de un hecho. Único por `(familia, claveNegocio)` |
| `HistorialOrigen` | **Solo-insert.** De dónde salió cada valor |

`DatoOficial.embedding` es `vector(768)` opcional. **768 es el contrato de
`docs/ingenieria/IA.md`**: cambiarlo exige migrar los vectores existentes, así
que el modelo de embeddings queda fijado antes de producción.

`DatoOficial` apunta a `archivoId` y `confirmadoPorId`. Sin confirmar,
`fechaConfirmacion` es nula. Un dato oficial sin confirmación humana no es
publicable (`docs/decisiones/ADR-0006`).

## Bitácora

`Bitacora` es **append-only**: `actorId`, `accion`, `entidad`, `entidadId`,
`detalle` en `Json`, `creadoEn`. Nada la actualiza ni la borra. Es la evidencia de
auditoría de RF-06.

Las tres tablas append-only (`Bitacora`, `HistorialOrigen`, y los originales)
están garantizadas **en capa de servicio**, no por el schema. La migración base
(M1) todavía no instala disparadores ni revoca `UPDATE`/`DELETE`. Al cerrarlo hay
que añadir esa garantía en la base, no confiar solo en el código.

## Configuración sin código

| Modelo | Papel |
|---|---|
| `ConfigFamilia` | `esquema` en `Json`: columnas, obligatorios, tipos por familia |
| `ReglaValidacion` | `expresion` en `Json`: regla declarativa evaluable |

Es el mecanismo de Cfg-1 y Cfg-2: agregar una familia o una regla es un `INSERT`,
no un deploy. `ReglaValidacion.severidad`: `BLOQUEO` frena, `AVISO` avisa.

## Caso Baja SterilPack

`Maquina` (M1..M5), `Orden` (folio `ORD-2026-XXXX`, producto `pouch`|`bag`),
`Rollo` (código `R-###`, `certificado` nulo = sin certificado = viola R-P1),
`Programa` (único por `ordenId` + `maquinaId` + `fecha`), `Prueba` (`queCobre`
conecta prueba con requisito RF), `Alerta`.

## Índices

| Índice | Para qué |
|---|---|
| `HistorialOrigen(entidad, entidadId)` | Reconstruir el linaje de un dato |
| `Bitacora(entidad, entidadId)` | Auditar una entidad |
| `ArchivoOriginal.sha256` | Deduplicación en la ingesta |
| `DatoOficial(familia, claveNegocio)` | Lectura del dato oficial |

## Lo que falta y quién lo debe

| Vacío | Responsable |
|---|---|
| Garantía append-only en la base (triggers o permisos) | Backend, M1 |
| Tests de modelo de datos: hoy `apps/api` no tiene ninguno | Backend, M1 |
| `embedding` sin poblar y sin benchmark de modelo | IA, M1 |
| `dataset/config1` y `config2` vacíos | Carlos, C1 |
