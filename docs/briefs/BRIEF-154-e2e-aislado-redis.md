# BRIEF #154 — El e2e se contaminaba con la cola Redis del sistema vivo

## 0. Encabezado

- Issue: #154
- Dueño: Erik Beltrán (Líder, infra y pipeline).
- Fechas: 2026-11-13 → 2026-11-13 · Sprint 3 · hito `C1 vertical completa`
- Prioridad / Tipo / Épica / Módulo: media / bug / qa-documentación / capa `apps/api/prisma/tests/helpers/`
- Requisitos: RNF-07
- Bloqueado por: — · Bloquea a: —

## 1. Contexto

`bun run test:e2e` fallaba de forma intermitente en la máquina de desarrollo
con un mensaje que no explicaba nada:

```
error: el job falló: 1794573429166-0
(fail) pipeline de ingesta > sube, encola, propone, manda a la bandeja y
       publica con confirmación humana
```

El pipeline estaba bien: la API, el worker y los motores funcionaban. Lo que
fallaba era **la prueba**.

## 2. Por qué importa tu parte

El e2e es la prueba que demuestra la vertical completa (subir → encolar →
proponer → bandeja → confirmar → oficial). Si falla por el estado de otra
corrida, no demuestra nada: quien lo ve rojo piensa que rompió el pipeline y
se va a depurar el lugar equivocado. En la entrega del 15 de noviembre el
equipo va a correr este e2e mientras la pila está levantada (es la condición
normal de desarrollo), así que tiene que ser determinista.

## 3. Objetivo y resultado esperado

| Entregable | Evidencia |
|---|---|
| Diagnóstico con causa raíz | jobs residuales en la cola `ingest` apuntando a una base ya eliminada |
| Aislamiento del e2e | la suite usa su propia base lógica de Redis |
| Determinismo | dos corridas seguidas con la pila viva: 0 fail |

## 4. Diagnóstico

Dos piezas que no encajaban:

1. `prisma/tests/helpers/spec-db.ts` hace `DROP DATABASE` + `CREATE` +
   `migrate` de `docu_spec` **en cada corrida** (las filas son UUIDs nuevos).
2. El e2e consume la cola `ingest` —**la misma que el sistema vivo**— porque
   `createRedisConnection()` lee `REDIS_URL` del entorno.

Los jobs que quedaron de una corrida anterior apuntan a la base que esa
corrida creó y que la siguiente ya borró. El worker del test los consume, el
procesador busca el archivo en la base nueva y no lo encuentra:

```
el archivo 552d9381-… no existe: el job 552d9381-… no tiene archivo que procesar
```

Ese `failed` ajeno dispara el `events.once('failed')` del spec, que rechaza la
promesa del primer test: el e2e falla aunque su propio job fuera a-ocho.

Además, un **worker levantado** (el de la pila de desarrollo) roba los jobs
del e2e, y el worker del e2e roba los de la pila: los dossystems comparten la
cola sin saberlo.

En CI no se ve (Redis efímero por job), pero en local rompe el e2e de forma
intermitente.

## 5. Solución

Los tests usan **su propia base lógica de Redis** (índice 15 del mismo
servidor): mismo servidor, cero infraestructura extra, y la pila viva no les
toca nada. Lo aplica el propio arnés de pruebas, así que nadie tiene que
acordarse de una variable:

```ts
// apps/api/prisma/tests/helpers/spec-db.ts
const REDIS_TEST_DB_INDEX = process.env.REDIS_TEST_DB_INDEX ?? '15'
const redis = new URL(process.env.REDIS_URL ?? 'redis://localhost:6379')
redis.pathname = `/${REDIS_TEST_DB_INDEX}`
process.env.REDIS_URL = redis.toString()
```

`REDIS_TEST_DB_INDEX` permite moverlo si el servidor de pruebas tiene menos
bases lógicas.

## 6. Actividades específicas

1. Aislar el Redis del arnés de pruebas (índice lógico propio).
2. Documentarlo en el propio archivo (el porqué: una prueba que falla por el
   estado de otra corrida no demuestra nada).
3. Comprobar que el e2e pasa con la pila levantada y dos veces seguidas.
4. Arreglar la carrera que el aislamiento destapó (ver §4.1).

## 4.1 Una carrera latente que el aislamiento destapó

Con la cola de tests vacía, el worker la agarra de inmediato y la CI mostró
este fallo, que **no** era del aislamiento:

```
expect(job.rows[0]?.status).toBe('queued')
Expected: "queued"
Received: "running"
```

El spec sube el archivo y acto seguido lee la fila de `platform.job_run`
exigiendo que el trabajo siga `queued`. Pero el worker puede haberlo tomado
ya y puesto `running`: es una carrera, y en CI la ganaba el worker. La cola
compartida la tapaba (había trabajo de otras corridas que el worker procesaba
primero).

Lo que el spec quiere comprobar es que **la corrida existe con el id del
archivo y está en vuelo**, no que el worker no haya llegado. Ahora acepta los
dos estados en vuelo (`queued` o `running`); el final del test sigue
exigiendo `done`.

## 7. Evidencia

Con la pila viva (API + worker + scoring, el escenario que fallaba):

```
$ cd apps/api && bun run test:e2e
(pass) salud del worker > /health dice que el worker vive y muestra la profundidad por cola
(pass) pipeline de ingesta > sube, encola, propone, manda a la bandeja y publica con confirmación humana
(pass) cuarentena al agotar los reintentos > un job que falla deja el archivo en cuarentena con motivo visible
3 pass / 0 fail
```

Y la suite completa, dos veces seguidas, con la pila viva:

```
111 pass / 45 skip / 0 fail    (corrida 1)
111 pass / 45 skip / 0 fail    (corrida 2)
```

Tras arreglar la carrera, el e2e cinco veces seguidas:

```
12 pass / 0 fail    (corridas 1 a 5)
```

## 8. Relación con los issues abiertos

- **#132/#133** no dependían de esto, pero el equipo corre el e2e mientras
  trabaja: ahora es determinista.
- El resto del diagnóstico del 13-nov (presupuesto por llamada, guard de
  familia) está en #136 y en `docs/operacion/BITACORA.md`.

## 9. Referencias

- `docs/operacion/BITACORA.md` — entrada del 2026-11-13.
- `apps/api/prisma/tests/helpers/spec-db.ts` — el aislamiento.
- `apps/api/test/e2e/worker.ingest.spec.ts` — la prueba que fallaba.
