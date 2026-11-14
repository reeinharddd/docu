# BRIEF #132 (parte 1) — El dev server de la web reenvía `/v1` a la API

## 0. Encabezado

- Issue: #132 (parte de conexión web↔API; el resto del issue es de Kira)
- Dueño: Erik Beltrán (Líder, infra y pipeline) — `reeinharddd`.
- Fechas: 2026-11-13 → 2026-11-14 · Sprint 3 · hito `C1 vertical completa`
- Prioridad / Tipo / Épica / Módulo: alta / feature / front · capa
  `apps/web/` (configuración del dev server)
- Requisitos: RNF-03 (el origen único sirve también al dato), RF-06
- Bloqueado por: — · Bloquea a: la demo y las evidencias de la Etapa 4

## 1. Contexto

La SPA pide la API en **relativo**: `API_BASE_URL` vale `/v1`
(`apps/web/src/app/core/config/api-url.ts`). En desarrollo eso significa que
la petición sale a `http://localhost:4200/v1/...`, es decir, al propio dev
server. Sin proxy, el dev server contesta con el `index.html` de la SPA: el
login devuelve **404 con HTML** y no hay sesión, no hay bandeja, no hay demo.

En producción el mismo camino lo resuelve el reverse proxy que termina TLS:
la app no cambia, solo cambia quién atiende `/v1`. Por eso el arreglo es un
proxy en el dev server y no una base absoluta metida en el código.

## 2. Por qué importa tu parte (Kira)

Sin esto, ninguna pantalla puede hablar con la API: la sesión no se puede
establecer y los mappers de DTO no se pueden probar contra el backend real.
Con esto, Kira puede recorrer endpoint por endpoint con la pila viva.

## 3. Objetivo y resultado esperado

| Entregable | Evidencia |
|---|---|
| El dev server reenvía `/v1` a la API | `apps/web/proxy.conf.mjs` + `proxyConfig` en `angular.json` |
| El destino sale del `.env` que ya usa la API | `PORT_API` (o `API_PROXY_TARGET` para un destino puntual) |
| La app no depende del entorno | `API_BASE_URL` sigue siendo `/v1` |
| El camino de desarrollo y el de producción son el mismo | mismo origen, sin CORS, el proxy termina TLS |

## 4. Diagnóstico

Medido contra la pila real (API en `:3112`, web en `:4200`):

```
$ curl -s -o /dev/null -w '%{http_code}' -X POST -H 'Content-Type: application/json' \
    -d '{"username":"marta","password":"...","facilityCode":"C1"}' \
    http://localhost:4200/v1/auth/login
404
Cannot POST /v1/auth/login
```

El 404 lo genera el propio dev server (HTML), no la API: el destino de la
petición era la web, no el backend.

## 5. Solución

### 5.1 El proxy

`apps/web/proxy.conf.mjs` (módulo ESM: el paquete web no es ESM y el loader
de Angular 22 revienta con un `.js` CommonJS) exporta:

```js
export default {
  '/v1': { target, secure: false, changeOrigin: true },
}
```

`target` sale de `API_PROXY_TARGET` si está, y si no del `PORT_API` del mismo
`.env` que usa la API (se lee el archivo en vez de depender de que el
dev server herede el entorno: quien levanta la web no tiene que configurar
la API ni al revés).

### 5.2 Por qué no una base absoluta configurable en la app

Sería más simple de cambiar por entorno, pero obliga a recompilar la app
para cada destino y abre la puerta a que la demo se pruebe contra un origen
distinto del despliegue. Con el proxy, **la app es siempre la misma**: lo
que se prueba en local es lo que se despliega, y el TLS se termina en el
mismo lugar en los dos casos.

### 5.3 Lo que este brief NO resuelve

Lo que sigue de #132 es de Kira y no cambia con este PR: la sesión real en
la web (guardar y reusar el token), los mappers de DTO y el recorrido
fixture ↔ endpoint uno a uno. El mapa de rutas reales y de las que siguen en
demo está en `docs/ingenieria/API.md` §"Rutas reales y rutas en demo" y en
el comentario de #132.

## 6. Actividades específicas

1. Crear `apps/web/proxy.conf.mjs` leyendo `PORT_API` del `.env`.
2. Declarar `proxyConfig` en el `serve` de `apps/web/angular.json`.
3. Verificar login y `/v1/inbox` a través del proxy.
4. Confirmar que `bun run build` de la web no cambia (el proxy es del dev
   server, no del build).

## 7. Evidencia

Con la pila real (API en `:3113` según el `.env`, web en `:4201`):

```
$ curl -s -X POST -H 'Content-Type: application/json' \
    -d '{"username":"marta","password":"...","facilityCode":"C1"}' \
    http://localhost:4201/v1/auth/login
{"token":"…","expiresAt":"2026-11-14T08:02:47.135Z","user":{"sessionId":"…","username":"marta",…}}

$ curl -s -o /dev/null -w '%{http_code}' -H "Authorization: Bearer $TOKEN" \
    http://localhost:4201/v1/inbox
200
```

Y detrás de TLS, con nginx terminó en `:8445` reenviando `/v1` a la API:

```
$ curl -sk -o /dev/null -w '%{http_code}' -X POST -H 'Content-Type: application/json' \
    -d '{"username":"marta","password":"...","facilityCode":"C1"}' \
    https://localhost:8445/v1/auth/login
200
```

## 8. Relación con los issues abiertos

- **#132**: este PR cierra la conexión; el recorrido de pantallas sigue
  abierto para Kira.
- **Etapa 4 (pruebas y despliegue)**: sin proxy no hay evidencia possible:
  las capturas de navegador, multidispositivo y funcionales requieren una
  sesión real contra la API.

## 9. Referencias

- `apps/web/proxy.conf.mjs` — el proxy.
- `apps/web/angular.json` — `serve.options.proxyConfig`.
- `apps/web/src/app/core/config/api-url.ts` — la base relativa `/v1`.
- `docs/ingenieria/API.md` — mapa de rutas reales y rutas en demo.
