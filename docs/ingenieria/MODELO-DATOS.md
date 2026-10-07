# Ingeniería: modelo de datos

Estado: vigente. Describe el presente, no el deseo.
Fuente: `apps/api/prisma/schema.prisma`. Migración base: `prisma/migrations/0_baseline`.

PostgreSQL 18 con `pgvector`. La extensión la crea la migración base
(`CREATE EXTENSION vector`), no un script de arranque: `infra/postgres/init` está
montado pero vacío y no debe necessary cargarse a mano.

## Capa de organización y acceso

`Empresa` → `Departamento` → `Usuario`, con `Rol` en tabla puente
(`UsuarioRol`). Cuatro códigos de rol: `admin`, `planeacion`, `calidad`, `almacen`.

`Usuario.departamentoId` es opcional a propósito: un administrador no pertenece
a un departamento. `Empresa` + `Departamento` + `nombre` es único.

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

`Bitacora` es **append-only**: `actorId`, `accion`, `entividad`, `entidadId`,
`detalle` en `Json`, `creadoEn`. Nada la actualiza ni la borra. Es la evidencia de
auditoría de RF-06.

Las tres tablas append-only (`Bitacora`, `HistorialOrigen`, y los originales)
están garantizadas **en capa de servicio**, no por el schema. La migración E1 no
instala disparadores ni revoca `UPDATE`/`DELETE`. Al cerrar M1 hay que añadir esa
garantía en la base, no confiar solo en el código.

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
