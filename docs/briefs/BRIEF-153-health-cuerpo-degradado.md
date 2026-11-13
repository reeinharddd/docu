# BRIEF #153 — La puerta de salud pierde el diagnóstico cuando algo está caído

## 0. Encabezado

- Issue: #153
- Dueño: Erik Beltrán (Líder, infra y pipeline).
- Fechas: 2026-11-13 → 2026-11-13 · Sprint 3 · hito `C1 vertical completa`
- Prioridad / Tipo / Épica / Módulo: media / bug / backend / capa `apps/api/src/health/`
- Requisitos: RNF-07
- Bloqueado por: — · Bloquea a: —

## 1. Contexto

La puerta operacional `GET /health` tiene un contrato escrito desde el drill
de orquestación del 2026-11-07 (BITACORA.md §"Defectos que encontró el drill
de orquestación"):

- todo arriba → `200` con `{status: "ok", postgres, redis, worker}`;
- un segmento caído → `503` con `{status: "degraded", postgres, redis, worker}`
  para que se sepa **cuál** cayó.

Lo que hace el código: `HealthController.check()` lanza
`new HttpException(report, 503)` y el filtro global (`ApiErrorFilter`) mapea
todo 5xx al sobre genérico de negocio, porque `CODE_BY_STATUS` no tiene 503.
El código HTTP llega bien; **el cuerpo que dice qué pasó, se pierde**:

```json
{"code":"INTERNAL","message":"Error interno del servidor.","details":{}}
```

El defecto ya se había encontrado una vez y se dio por cerrado: volvió por el
camino del filtro global. La CI no lo detecta porque el smoke solo mira la
rama 200 (con el worker vivo la puerta responde bien).

## 2. Por qué importa tu parte

Una puerta que responde "error interno" cuando PostgreSQL está caído no es
una puerta: es un rumor. En la demo del 24-nov, si un segmento se cae delante
de la gente, hay que poder decir *qué* pasó sin abrir logs. Y en operación,
`/health` es lo que decide si la instancia entra en rotación.

## 3. Objetivo y resultado esperado

| Entregable | Evidencia |
|---|---|
| Respuesta operacional que no se convierte en error | clase propia (`OperationalResponseException`) que el filtro deja pasar tal cual |
| Puerta con el contrato degradado | `503` + `{status: degraded, postgres, redis, worker}` |
| Spec que comprueba el diagnóstico | el test falla si el cuerpo vuelve a ser el sobre genérico |
| Contrato publicado | `docs/api/openapi.json` declara el 503 y su forma |

## 4. Diagnóstico

| Capa | Comportamiento |
|---|---|
| `health.controller.ts` | `throw new HttpException(report, 503)` — el reporte viaja dentro de la excepción |
| `http-exception.filter.ts` | `CODE_BY_STATUS` no tiene 503 → `INTERNAL` + `Error interno del servidor.` + `details: {}` |
| Contrato documentado | BITACORA.md L115-117, BOOTSTRAP.md L158 y L221: cuerpo degradado con el segmento caído |

Reproducido levantando la API del `main` nuevo (`e57d507`) sin worker:

```console
$ curl -s -w '\nstatus: %{http_code}\n' http://localhost:3112/health
{"code":"INTERNAL","message":"Error interno del servidor.","details":{}}
status: 503
```

Con el worker vivo la misma puerta responde bien (`status: ok`, `worker.alive`,
profundidad de las cuatro colas): el síntoma aparece **justo cuando importa**.

## 5. Solución

1. `OperationalResponseException` (`apps/api/src/common/`): una respuesta
   operacional no es un error de negocio; su cuerpo **es** el diagnóstico.
2. `ApiErrorFilter` la reconoce y devuelve el cuerpo tal cual, con su status.
3. `HealthController` la usa en vez de `HttpException`.
4. `health-endpoint.spec.ts`: el test comprueba `status: degraded`,
   `postgres: down`, `redis: down`, `worker: {alive: false}` y que **no**
   aparezca `code`/`message` (el sobre de error).

## 6. Actividades específicas

1. Añadir la excepción operacional y el caso del filtro.
2. Cambiar la puerta para usarla.
3. Endurecer el spec de `/health` (hoy solo comprueba que haya `code`/`message`).
4. Declarar el 503 y su forma en `docs/api/openapi.json`.
5. Anotar el hallazgo en `docs/operacion/BITACORA.md`.

## 7. Evidencia

```
$ cd apps/api && bun test src/health/
(pass) responde 503 cuando la base y redis no responden [750.41ms]
(pass) conserva el diagnostico: el 503 dice que segmento cayo [339.22ms]
6 pass / 0 fail
```

## 8. Relación con los issues abiertos

- **#154** (el e2e comparte la cola Redis global): aparecer al correr la
  suite en local; se diagnostica y se documenta aparte, no es de este arreglo.
- **#135/#136** (presupuesto por llamada): sin relación con la puerta.

## 9. Referencias

- `docs/operacion/BITACORA.md` §"Defectos que encontró el drill de
  orquestación" — el contrato original.
- `docs/operacion/BOOTSTRAP.md` — qué hacer cuando la puerta degrada.
- `docs/ingenieria/API.md` — la puerta y su forma.
- `docs/api/openapi.json` — el contrato publicado.
- #154
