# BRIEF #7 — Configuración 1: modelo y carga Baja SterilPack (solo datos)

## 0. Encabezado

- Issue (`#7`) / enlace: `#7 Configuración 1`. Este es el único brief del #7.
- Dueño: Emmanuel Valenzuela Cruz (Backend).
- Fechas (inicio-fin) / Sprint: 2026-10-13 → 2026-10-30 / Sprint 2. Hito `Contrato de datos congelado` (2026-10-30).
- Prioridad / Tipo / Épica / Módulo: alta / historia / Base de datos / base de datos.
- Requisitos asociados (RF-/RNF-): RF-08 (parametrización por planta sin código), RF-06 (acceso por rol + bitácora), RF-02 (cuarentena con motivo). RNF-05, RNF-06.
- Bloqueado por (`#7`) / Bloquea a (`#N`): entorno y migración de Erik (#10) para la carga; el diagrama v0 arranca sin esperarlo. Trabaja en paralelo con Carlos: matriz (#29) y dataset (#9). Bloquea a: #8 Configuración 2 (segunda planta), #3 Pipeline, #12 API.

## 1. Contexto

DOCU es un despliegue por compañía: una empresa paga, corre su sistema y solo su gente lo alcanza. Nunca se mezclan datos de empresas distintas en una BD. En el mismo entorno pueden convivir plantas de la misma compañía. La raíz del modelo es `Planta`, no `Empresa`.

Baja SterilPack no existe: es la Configuración 1 sintética. No hay levantamiento real ni entrevistas; el caso se define en `CASO.md` y Carlos genera el dataset en paralelo (#9). El diagrama arranca con lo básico y se pule cuando llega el dataset: si algo se olvidó, se agrega entonces.

Aviso explícito: `apps/api/prisma/schema.prisma` es un placeholder agregado sin validación. No tiene validez como fuente. El diagrama de esta tarea lo reemplaza.

La BD es la primera barrera del sistema: todo lo que entra (ingesta, validación, dataset, reportes) pasa por ella. Si cada tabla está validada, limitada y bien formada desde la BD (`NOT NULL`, `CHECK`, uniques, FK, `jsonb` con forma cerrada), construir lo demás es rápido. Cada actividad y cada acción de este brief existe para endurecer esa barrera.

## 2. Por qué importa tu parte

Backend (#12), pipeline (#3) y la Configuración 2 (#8, segunda planta) construyen sobre tu modelo. Si el diagrama trae `Empresa` multi-tenant, copia el placeholder o deja constraints abiertos, el seed, la validación en cadena y C2 nacen torcidos y el contrato del 30-oct se congela en el aire. Si sale bien, C2 carga solo con datos (`git diff` de código vacío) y el 30-oct el contrato se congela con datos sintéticos coherentes.

## 3. Objetivo y resultado esperado

C1 modelada y cargada solo con datos, con 1 reporte funcionando.

| Entregable | Evidencia |
|---|---|
| Diagrama v0 básico | `docs/ingenieria/DIAGRAMA-BD-v0.dbml` + PNG; raíz `Planta`, núcleo fijo, configuración como datos, caso mínimo; PNG generado del `.dbml` |
| Diagrama v1 refinado con dataset | `DIAGRAMA-BD-v1.dbml` + PNG; columnas y constraints ajustados a lo que el dataset de Carlos reveló |
| Familias + esquemas + reglas + roles + umbrales como datos | Seed/config versionado con semilla; `git diff` de código vacío salvo datos |
| Cadena ingesta → validación → cuarentena | Corrida con CSV del dataset: válidos pasan, inválidos a cuarentena con motivo (R-P1..T1) |
| 1 reporte funcionando sobre C1 | Salida del reporte + captura en el PR |
| Nota para C2 | Comentario en #8 de qué reutiliza la segunda planta sin código |

## 4. Actividades específicas

Fase A — diagrama v0 básico (2026-10-13 → 2026-10-16, sin esperar el dataset):

1. Fijar la raíz `Planta`: tablas `Planta`, `Departamento` (cuelga de planta, `planta+nombre` único), `Usuario` (departamento opcional: un admin no pertenece a un departamento), `Rol` (4 códigos base: `admin`, `planeacion`, `calidad`, `almacen`), `UsuarioRol`. Terminado: DBML con PK `uuid`, FK y uniques.
2. Dibujar el núcleo fijo de ingesta y oficialidad: `ArchivoOriginal` (`sha256` único, `familia` discriminante con 6 valores cerrados, `estado` con 3 valores), `Cuarentena` (`ABIERTA/RESUELTA/DESCARTADA`, motivo obligatorio), `DatoOficial` (`familia+claveNegocio` único, `datos jsonb`, `vector(768)`), `HistorialOrigen` y `Bitacora` (solo-insert, `entidad+entidadId` indexados). Terminado: cada columna con `NOT NULL`/`CHECK`/índice decidido y escrito, no implícito.
3. Dibujar configuración sin código: `ConfigFamilia` (`codigo` único, `esquema jsonb` con columnas, obligatorios y tipos por familia) y `ReglaValidacion` (`codigo` único R-P1..T1, `expresion jsonb`, severidad `BLOQUEO/AVISO`). Terminado: 1 ejemplo JSON por regla del caso como dato, cero `if` en comentarios.
4. Dibujar el caso mínimo SterilPack desde `CASO.md`: `Maquina` (5 códigos), `Orden` (folio único, producto `pouch|bag`), `Rollo` (código único, `certificado` nulo = viola R-P1), `Programa` (único `orden+maquina+fecha`), `Prueba`, `Alerta`. Terminado: DBML v0 + PNG y revisión con Erik el 16-oct.
5. Cerrar la lista de precarga fija (vale para cualquier giro): 4 roles base, estados, severidades, familias base. Terminado: tabla precarga-vs-dataset en el PR.

Fase B — refinado con dataset (2026-10-16 → 2026-10-23, en paralelo con Carlos #9):

6. Recibir cada entrega parcial del dataset y pulir el diagrama: columnas que faltan, medidas y materiales reales del generador, errores que el dataset produce y la v0 no atrapa. Terminado: `DIAGRAMA-BD-v1.dbml` + nota de qué cambió y por qué.
7. Endurecer constraints con lo aprendido: cada error del dataset que pasó la v0 se convierte en `CHECK`, unique o regla como dato. Terminado: 1 caso de prueba por constraint nuevo.

Fase C — carga C1 y reporte (2026-10-23 → 2026-10-30, con entorno del #10):

8. Cargar familias y reglas como datos: esquemas por familia, `ReglaValidacion` con severidad, roles y umbrales. Terminado: seed reproducible con semilla.
9. Probar la cadena: ingesta → validación en cadena → cuarentena o dato oficial, con el CSV del dataset (1 caso por regla R-P1..T1). Terminado: CSV de corrida + cuarentenas con motivo visible.
10. Sacar 1 reporte mínimo de C1 y documentar qué es dato y qué sería código. Terminado: salida adjunta al PR + nota para #8.
11. Integrar la matriz de Carlos (#29) cuando esté lista: mapear puestos de planta a roles base sin cambiar código. Terminado: matriz aplicada como datos.

## 5. Entradas y salidas

- Recibe (de quién, dónde, en qué formato): `CASO.md` (familias, reglas R-P1..T1, organigrama), `REQUISITOS.md` (RF-02/06/08 + evidencias), entorno y migración de Erik (#10), dataset y matriz de Carlos (#9/#29, en parciales, sin bloquear el arranque).
- Entrega (a quién, dónde, en qué formato): a Erik (#3 pipeline, #12 API) y a #8 (C2, segunda planta), por PR, diagrama + C1 cargada + reporte. Comenta en #3, #8 y #12.

## 6. Referencias y caja de herramientas

Repo (leer primero): `CASO.md`, `REQUISITOS.md`, `VISION.md` (principio 7: C2 con `git diff` vacío), `ingenieria/MODELO-DATOS.md`, `ingenieria/STACK.md` §2.4; ADR-0009 (reglas como datos), ADR-0010 (solo-insert), ADR-0011 (API encola, worker procesa).

| Para | Recurso | Cuándo usarlo |
|---|---|---|
| Dibujar el diagrama | https://dbdiagram.io (DBML) o https://app.diagrams.net | Al escribir `DIAGRAMA-BD-v0/v1.dbml` (el PNG sale del `.dbml`) |
| Probar SQL sin local | https://postgres.new (PostgreSQL en el navegador) | Al validar el núcleo antes de cada revisión |
| Ver JSON como grafo | https://jsoncrack.com | Al depurar `esquema`/`expresion`/`datos` anidados |
| Explorar filas con UI | https://www.prisma.io/docs/orm/tools/prisma-studio | Solo lectura, cuando haya seed |
| Tipos PG18 y `vector` | https://www.postgresql.org/docs/18/ + https://github.com/pgvector/pgvector | Al fijar columnas, uniques, índices |
| CSV robusto | https://papaparse.com | Al validar el CSV de corrida contra el *ground truth* |
| Seed reproducible (fase C) | https://www.prisma.io/docs/orm/prisma-migrate/workflows/seeding | Al escribir el seed idempotente con semilla |
| Skill obligatoria | `ecc-prisma-patterns` del repo | Antes de proponer cualquier tipo o índice |
| Skills de proceso | `docu-documentar`, `docu-memoria` | Formato y búsqueda en Engram antes de inventar |
| Skills oficiales Prisma (opcional) | `bunx @prisma/cli@7.10.0 agent install` (versión fijada, nunca `latest`) | Solo si necesitas la referencia oficial |

Comandos: `bunx prisma migrate dev` desde `apps/api` (fase C), `bun run verify`, `bash scripts/doc-index.sh`.

Neutralidad (regla del repo): sin rutas de ninguna máquina ni contenido para una sola persona. Este brief basta con el solo contexto del repo.

## 7. Cómo trabajar

Todo el trabajo vive dentro de la carpeta del repo clonado de `main`. Nada fuera, nada en otra carpeta.

- Arranque: `bash scripts/setup.sh`, `opencode`, `/inicio`, `/tarea 7` (`operacion/BOOTSTRAP.md`). Rama `feat/7-configuracion-1` desde `main`.
- Opencode te ayuda a diseñar: pide el diagrama por partes (raíz → núcleo → configuración → caso), que cuestione cada FK, cada unique y cada `NOT NULL`, y que valide tipos PG18 con `ecc-prisma-patterns`. La IA genera y propone; no decide reglas, permisos ni dato oficial.
- EMMANUEL NO DEBE: crear `Empresa` ni mezclar compañías; usar `schema.prisma` como fuente; meter una familia con código (viola RF-08); tocar migraciones antes de aprobarse el diagrama; importar providers con `import type` en `apps/api` (rompe DI por `emitDecoratorMetadata`); simular entrevistas o inventar datos de planta (lo no cubierto lo pone el dataset, no la imaginación).
- EMMANUEL SÍ DEBE: todo con semilla/versión (`v0`, `v1`); cada tabla marcada fija/precargada/dataset; cuarentena con motivo visible; `.env` fuera del repo; TypeScript estricto sin `any` sin justificación.
- Sincronía con Carlos: dos puntos de encuentro (16-oct v0 contra sus plantillas, 23-oct v1 contra su dataset completo). Duda de 30 minutos = preguntar en el issue. Bloqueo >24 h = etiqueta `bloqueado` y escala al líder. 1 issue `En progreso` por persona.

## 8. Criterios de aceptación

- [ ] `DIAGRAMA-BD-v0` + PNG aprobados el 16-oct (raíz `Planta`, sin `Empresa`, constraints escritos).
- [ ] `DIAGRAMA-BD-v1` refleja lo que el dataset reveló (nota de cambios adjunta).
- [ ] C1 carga con `git diff` de código vacío (solo datos).
- [ ] Cada regla R-P1..T1 tiene 1 caso que pasa o va a cuarentena con motivo.
- [ ] 1 reporte sale sobre C1 (salida adjunta).
- [ ] `bun run verify` en verde; PR con `Closes #7`.

No es done si: aparece `Empresa`; el diagrama copia el placeholder; una familia exigió parche de código; un inválido se borró en silencio; el PNG no sale del `.dbml`.

## 9. Riesgos nombrados

El dataset llega tarde o con formas que la v0 no previó y la v1 se comprime. Mitigación: arrancar la v0 con `CASO.md`, dos syncs fijos con Carlos (16 y 23-oct); desde el 2026-10-23 sin dataset completo es bloqueo (etiqueta `bloqueado`, frena seed y validación).

## 10. Revisión

16-oct con Erik: diagrama v0. Viernes 2026-10-30 con Erik (pipeline) y Carlos (dataset): demo de carga + reporte. Después: #8 Configuración 2 (segunda planta).

## Versión corta (descripción del issue)

> [7] Configuración 1 — Emmanuel, 2026-10-13 → 2026-10-30. Single-company multi-planta, diagrama v0 básico → v1 con dataset, C1 solo con datos + 1 reporte. Syncs 16/23-oct con Carlos. Revisión 30-oct. Detalle: `docs/briefs/BRIEF-07-configuracion-1.md`.
