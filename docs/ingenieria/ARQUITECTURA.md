# Arquitectura: cómo se conectan las piezas

Estado: vigente. Describe el sistema **actual** y el camino ya decidido. El
futuro va en [ADR](../decisiones/README.md), no aquí.

## 1. Mapa de procesos

```
┌─────────────┐   HTTP/JSON    ┌──────────────────┐   SQL/pg    ┌──────────────┐
│  Angular 22 │ ─────────────► │   NestJS 12      │ ──────────► │ PostgreSQL 18│
│  zoneless   │ ◄───────────── │   (puerto 3000)  │ ◄────────── │ + pgvector   │
└─────────────┘  respuestas    └────────┬─────────┘  resultado  └──────────────┘
      ▲                                    │ encola job
      │                                    ▼
      │                             ┌──────────────┐    Lua    ┌──────────────┐
      │                             │ BullMQ Queue │ ────────► │  Redis 8     │
      │                             └──────────────┘           └──────┬───────┘
      │                                                                │ toma jobs
      │                             ┌──────────────────┐               │
      └────── datos citados ──────── │ Worker (OCR,    │ ◄─────────────┘
                                    │ clasificación,  │   Worker + QueueEvents
                                    │ embeddings,      │
                                    │ modelo local)    │
                                    └────────┬─────────┘
                                             │ escribe resultado
                                             ▼
                                      PostgreSQL
```

| Proceso | Dónde vive | Puerto | responsabilidad |
|---|---|---|---|
| `db` | Docker Compose | 5432 | Datos canónicos, bitácora, historial |
| `redis` | Docker Compose | 6379 | Cola de trabajo y caché con TTL |
| `api` | `apps/api/src/main.ts` | 3000 | HTTP, validación, encola trabajo. **No ejecuta OCR** |
| `worker` | `apps/api/src/worker.ts` (M1) | — | Consume la cola: OCR, clasificación, embeddings, reportes |
| `web` | `apps/web` (dev server) | 4200 | Captura, bandeja, programa, búsqueda |

El worker **no existe todavía**. El smoke de E1 prueba BullMQ con un job `ping`
en línea, lo que demuestra que la cola funciona; falta el proceso real.

## 2. Quién habla con quién

| Origen | Destino | Mecanismo | Contrato | Fallo visible |
|---|---|---|---|---|
| Angular | API | HTTP/JSON | Rutas por módulo; convención de error única | Mensaje en pantalla, nunca bloqueo silencioso (RNF-01) |
| API | Postgres | driver `pg` directo (hoy solo `/health`) | `DATABASE_URL` del entorno | `/health` y el `doctor` |
| API | Redis | BullMQ `Queue` con ioredis | Jobs `{ archivoId, sha256, familia }` | Job en retry, luego cuarentena con motivo |
| Worker | Redis | BullMQ `Worker` y `QueueEvents` | Conexiones separadas: **nunca** compartir | El worker no arranca; `/health` no lo detecta todavía |
| Worker | Postgres | Prisma | Resultado del job: `DatoOficial`, `Cuarentena`, `HistorialOrigen` | Todo error debe dejar motivo |
| Worker | Modelo IA | HTTP a Ollama en localhost o API en nube | Salida forzada a JSON Schema | Sin confianza alta: a cuarentena, no a oficial |
| Todos | GitHub | Git + PR + CI | Ramas `feat/<ID>-<slug>`, 1 revisor | CI en rojo bloquea el merge |

## 3. Flujo de un archivo, de principio a fin

1. El usuario arrastra el archivo en la pantalla de captura. Angular lo sube
   por HTTP; no hay lógica de negocio en el front.
2. La API calcula el `sha256`, busca si ya existe ese original y crea
   `ArchivoOriginal` con estado `RECIBIDO`. **El original no se modifica jamás.**
3. La API encola un job con el identificador del archivo y responde. El front
   ya puede mostrar "en proceso".
4. El worker toma el job y ejecuta la cadena de validación en orden: tipo de
   archivo → esquema de la familia → reglas declarativas de `ReglaValidacion`.
5. Si una regla `BLOQUEO` falla, se detiene la cadena y se crea
   `Cuarentena` con motivo y código de regla. Si todo pasa, el archivo queda
   listo para revisión humana.
6. El modelo IA propone familia y confianza. Si la confianza no alcanza el
   umbral, va a cuarentena; nunca a `DatoOficial`.
7. Una persona revisa en la bandeja y confirma. Solo entonces se escribe
   `DatoOficial` con `confirmadoPorId` y `fechaConfirmacion`, más una fila en
   `HistorialOrigen` con fuente, regla y responsable.
8. Cada paso 4 a 7 deja fila en `Bitacora`. Nada se edita ni se borra.

Los pasos 4 a 7 son los que todavía no existen. Es el trabajo de M1 y E2.

## 4. Fronteras y reglas que no se cruzan

| Frontera | Regla |
|---|---|
| Front ↔ API | El front no decide permisos, ni familias, ni estados. Solo muestra |
| API ↔ Worker | La API solo encola. Si necesita un resultado, lee la base o espera un evento |
| Worker ↔ IA | El modelo no escribe en la base. Devuelve un JSON validado y el worker decide |
| App ↔ Base | El acceso a datos del producto (M1) va por Prisma; SQL crudo solo para `vector` y agregaciones que Prisma no tipa. Hoy la API solo prueba conectividad en `/health` |
| Persona ↔ Sistema | Nada se publica sin confirmación humana ([ADR-0006](../decisiones/ADR-0006-ia-propone-humano-dispone.md)) |

## 5. Modelo de despliegue

Un solo host en localhost con Docker Compose: base, Redis y la aplicación. Nada
sale a la nube sin configuración explícita (RNF-03). La configuración de Redis
en este entorno es deliberadamente simple: sin autenticación, escuchando solo en
localhost. La política de los tres entornos está pendiente de documentar (dueño:
Erik); los servicios actuales están en [ingeniería/ENTORNO.md](ENTORNO.md).

## 6. Qué falta para que este mapa sea verdad completa

| Pieza | Épica | Riesgo si se pospone |
|---|---|---|
| Proceso `worker` real | E2 | El pipeline de ingesta no existe; es el riesgo técnico mayor |
| Módulos de Nest por dominio | #12-A (S2) | La API crece como un archivo |
| `ValidationPipe` global | #12-A (S2) | Sin validación de entrada, RNF-03 no se sostiene |
| RBAC en servidor y bitácora | #5 (S2) | El front se convierte en la única "protección" |
| Cadena de validación declarativa | #3 (S2) | Las reglas quedan embebidas en `if`, y RF-08 muere |
| Colas de reportes y alertas | #39 (S3, Emmanuel) | RF-05 sin demo |