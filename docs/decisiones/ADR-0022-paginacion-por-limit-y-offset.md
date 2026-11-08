# ADR 0022 — Paginación por `limit` y `offset`, con respuesta de array plano

Fecha: 2026-11-07 · Estado: Aceptada (se acepta en el merge de esta PR) ·
Decide: Erik · Revisa: Emmanuel

## Contexto

La bandeja y la lista de oficiales **crecen sin límite**: cada archivo que
entra puede generar un registro en cuarentena y, si se confirma, uno
oficial. `API.md` tenía esta decisión pendiente y la Listed "La bandeja
crece sin límite" como razón para no postergarla.

Las restricciones reales:

- El front ya consume estas listas y **no espera un envoltorio**:
  `ApiClient.get()` mapea la respuesta con `Array.isArray(data)`, y una
  respuesta vacía produce el estado `empty`
  (`apps/web/src/app/core/services/api/api-client.ts:24-33`). Las pruebas lo
  fijan: `http.expectOne('/v1/quarantine').flush([])` espera estado `empty`
  (`apps/web/src/app/core/services/api/api-client.spec.ts:33-38`).
- RNF-04 pide que la consulta con 1 000 documentos responda en menos de 3 s.
- El proyecto es single-company (ADR-0014): una instalación, una base, un
  volumen de entre miles y decenas de miles de filas en la lista de
  oficiales, no millones.
- RNF-05 pide una sola aplicación modular y decisiones escritas: la
  paginación tiene que ser la misma en todos los endpoints de lista.

Hay que decidir tres cosas: **cómo se pide una página**, **cómo se
devuelve** y **cómo se ordena**, porque un orden no estable hace que dos
páginas se pisen entre sí.

## Decisión

**Paginação por `limit` y `offset`, con la respuesta como array plano.**

1. Los endpoints de lista aceptan dos parámetros de consulta:
   `limit` (por defecto **50**, máximo **200**) y `offset` (por defecto
   **0**, nunca negativo). Valores fuera de rango devuelven
   `422 VALIDATION_ERROR` con el sobre de error de
   `ALCANCE-SOLUCION.md` §2.1.
2. La respuesta del body es **un array JSON**, no un objeto `{ items, total }`.
   El front ya está escrito así y cambiarlo obligaría a rehacer
   `ApiClient` y todas las pantallas.
3. El total de filas que satisfacen el filtro va en la **cabecera
   `X-Total-Count`**, no en el cuerpo. Así el front puede pintar "página 2
   de 17" sin romper el contrato del array.
4. El orden es **estable y explícito** en cada endpoint, con un
   desempate por identificador para que dos filas con la misma fecha nunca
   se pisen:

   | Endpoint | Orden |
   |---|---|
   | `GET /v1/quarantine` | `ingest.quarantine.created_at DESC, id DESC` |
   | `GET /v1/inbox` | `graph.entity.created_at DESC, id DESC` |
   | `GET /v1/official-records` | `truth.official_record.updated_at DESC, id DESC` |

5. El **filtro va antes de la paginación**: `GET /v1/quarantine?status=pending&severity=BLOQUEO`
   pagina sobre lo filtrado, no sobre todo. Los filtros permitidos son los
   que el ER v1 puede expresar con `CHECK`: `status`, `severity` y
   `rule_code` en cuarentena; `status` en la bandeja; `entity_type_code` en
   los oficiales.
6. El límite duro de 200 filas por petición es una decisión de seguridad,
   no de gusto: nadie puede pedir la tabla entera en una sola respuesta.

Consecuencias que se aceptan de entrada: un `offset` profundo tiene que
recorrer filas y se pone más lento a medida que avanza, y el total exige
un `COUNT` aparte en cada página.

## Alternativas consideradas

| Alternativa | Por qué no |
|---|---|
| **Envoltorio `{ items, total, page }`** | Es la forma más común, pero el front ya está construido y probado contra un array plano (`api-client.ts:24-33` y su spec). Cambiarlo es rehacer `ApiClient`, `StateView` y las pantallas, para ganar algo que la cabecera `X-Total-Count` ya da |
| **Cursor / keyset** (`after=<id>`) | Es lo correcto para listados enormes o de escritura concurrente, y evita el costo del `offset` profundo. Pero exige un cursor opaco y un orden por una clave única que el cliente pueda reenviar; el front todavía no lo necesita y complica el "ir a la página N" |
| **Sin paginación, devolver todo** | Es lo que hay hoy implícitamente y es lo que rompe RNF-04: la bandeja de una planta con un mes de turno y 120 excels por turno son miles de filas en una sola respuesta |
| **Paginación por páginas numeradas (`page=3`)** | Se traduce a `offset` por dentro y no aporta nada al cliente; además obliga a recalcular el total en cada salto |
| **El total en el cuerpo, junto al array** | Un array no puede llevar un campo al lado. O se rompe el array, o se vuelve al envoltorio: las dos opciones ya se descartaron |

## Consecuencias

- **A favor**: el front no cambia; el total está disponible sin romper el
  contrato; el límite duro protege al servidor de una consulta que pida
  todo; el orden con desempate por `id` hace que la paginación sea
  reproducible.
- **En contra**: `offset` profundo es más lento que un cursor; el
  `COUNT` de cada página cuesta una consulta extra; `X-Total-Count` es una
  convención que hay que recordar al hacer el front (nadie la ve en el body).
- **Riesgo residual**: que el total y la página se calculen en dos
  consultas y alguien escriba entre medias, y el total no cuadre con las
  filas de la página. No es un bug: el total es una foto de un instante y
  las filas son la página pedida. Blast radius: un número que se ve
  desfasado un instante en la UI.

## Evidencia

- El contrato del front ya está fijado y probado:
  `apps/web/src/app/core/services/api/api-client.ts:24-33` y
  `apps/web/src/app/core/services/api/api-client.spec.ts:33-38` (array
  vacío → estado `empty`).
- Los índices del ER v1 (#58) soportan el orden elegido:
  `ingest.quarantine` tiene `@@index([facilityId, status])` y
  `@@index([ruleCode])`; `graph.entity` tiene `@@index([facilityId, status])`.
- Pendiente de verificar en #12: la primera página real de
  `GET /v1/quarantine` con el `COUNT` y la cabecera `X-Total-Count`.

## Qué nos haría revertirla

Si una lista de la instalación pasa de **50 000 filas** (por ejemplo, si el
histórico de la planta se ingiere completo en vez de por mes) o si el
`COUNT` de una página llega a tardar más de **1 s** con el dataset de C1,
la paginación por cursor se vuelve necesaria y se escribe el ADR siguiente:
el cursor opaco reemplaza a `offset`, y el total pasa a ser aproximado o
desaparece. El front tiene que migrar en ese momento, no antes.
