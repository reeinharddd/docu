# ADR 0021 — Token de sesión opaco en la base, con revocación inmediata

Fecha: 2026-11-07 · Estado: Aceptada (se acepta en el merge de esta PR) ·
Decide: Erik · Revisa: Emmanuel

## Contexto

`RF-06` exige control de acceso por rol **en el servidor** y `RNF-03` exige
que los secretos vivan fuera del código. Faltaba decidir la forma concreta
del token de sesión, y esa decisión "rompe sesiones y datos" si se posterga
(lo que decía la tabla de pendientes de `API.md`).

Las restricciones reales del proyecto:

- El front ya manda `Authorization: Bearer <token>` y guarda el token **solo
  en memoria** (`apps/web/src/app/core/middleware/api/interceptors.ts:31`,
  `apps/web/src/app/core/services/auth/auth.service.ts`).
- El ER v1 (#58) ya trae la tabla `platform.session` con `token_hash`
  único, `issued_at`, `expires_at`, `last_seen_at`, `revoked_at`,
  `ip_address` y `user_agent`. Es decir: el modelo ya está escrito para
  sesiones guardadas en el servidor.
- `core.app_user` tiene `password_hash`, y `bcryptjs` 3.0.3 ya está
  declarado en `apps/api` (hoy en `devDependencies`).
- El proyecto es **single-company** por instalación (ADR-0014): una base, un
  host, sin escala horizontal prevista en C1.
- Redis está, pero es la cola de trabajo (ADR-0005), no un almacén de
  sesiones.

Lo que hay que decidir es una sola cosa: **qué es el token y dónde se
valida**.

## Decisión

**El token de sesión es opaco, aleatorio, y vive hasheado en la base.**

1. Al hacer login, el servidor genera 32 bytes aleatorios criptográficos,
   los codifica en base64url y **solo** entrega ese texto al cliente. El
   cliente lo manda en `Authorization: Bearer <token>`.
2. El servidor guarda en `platform.session` el **SHA-256** del token en
   `token_hash` (columna única), junto con `app_user_id`, `facility_id`,
   `issued_at`, `expires_at` e `ip_address`/`user_agent`.
3. Cada petición autenticada busca la fila por `token_hash`. Si no existe,
   está vencida (`expires_at`) o tiene `revoked_at`, la respuesta es
   `401 UNAUTHENTICATED` con el sobre de error de
   `ALCANCE-SOLUCION.md` §2.1.
4. **No hay JWT.** No hay firma, ni `JWT_SECRET`, ni claim, ni validación
   offline. La revocación es un `UPDATE` de `revoked_at` y surte efecto en
   la siguiente petición.
5. La contraseña se verifica con `bcryptjs` contra `core.app_user.password_hash`.
   El hash de la contraseña **no** es el token: son dos secretos distintos
   con vida distinta.
6. La expiración por defecto es de **8 horas**, renovable por actividad
   (`last_seen_at`); el logout (`POST /v1/auth/logout`) revoca la fila.

Consecuencias que se aceptan de entrada: cada petición autenticada cuesta
una lectura a `platform.session` (índice único por `token_hash`, búsqueda de
índice, no de tabla), y el servidor es el único que puede decidir quién es
quién.

## Alternativas consideradas

| Alternativa | Por qué no |
|---|---|
| **JWT** (HS256 con `JWT_SECRET`) | Es stateless, pero para poder revocarlo hay que mantener una lista negra, que es estado otra vez y además más caro. Un JWT robado es válido hasta que expira, y en una planta con red local y equipos compartidos eso no sirve. Además el ER v1 ya trae `platform.session` con `revoked_at`: el modelo ya eligió sesiones guardadas, y un JWT dejaría media tabla sin usar |
| **Cookie `httpOnly` + `SameSite`** | Es defendible en web, pero el front ya está construido con token en memoria y `Authorization: Bearer` (`interceptors.ts:27-31`): cambiarlo reescribe el cliente y el `errorInterceptor`. El proyecto no tiene SSO corporativo ni varios dominios, así que `httpOnly` no compra nada que el Bearer no compre |
| **Sesiones en Redis** | Redis es la cola de trabajo (ADR-0005) y corre con `maxmemory-policy` sensible a la memoria; perder una sesión por presión de memoria sería perder el acceso a la planta. La verdad de quién es quién va en la base, que es la fuente que RNF-02 ya exige para el dato oficial |
| **Token opaco sin hashear (guardar el token tal cual)** | Si alguien lee `platform.session` (un `SELECT`, un dump, un log), con el token en claro puede suplantar a cualquier persona. El SHA-256 no es reversible y el costo es un `UPDATE` por login |
| **Contraseña como token** (el front manda usuario y contraseña en cada llamada) | Manda el secreto de la persona en cada petición y no permite revocar una sesión sin cambiar la contraseña |

## Consecuencias

- **A favor**: revocación real e inmediata (un `UPDATE`); el token no
  depende de ningún secreto del servidor, así que `JWT_SECRET` desaparece de
  `.env.example`, de `ENTORNO.md`, de `ACCESOS.md` y del `doctor`; el modelo
  de la base ya estaba escrito para esto; el front no cambia ni una línea
  (ya usa `Bearer`).
- **En contra**: una lectura extra a la base por petición; la sesión no
  sobrevive a que se caiga la base (correcto, pero es un acoplamiento que
  hay que documentar); `bcryptjs` tiene que pasar de `devDependencies` a
  `dependencies` en #12, porque en runtime el login lo necesita.
- **Riesgo residual**: que la sesión no se revoque al cerrar el navegador
  (el `signOut()` del front actual solo borra el estado local,
  `auth.service.ts:57`; y hoy ni siquiera hay sesión real, porque el front
  corre con la sesión demo de `signInDemo()` hasta que #12 conecte el login).
  Si alguien cierra la pestaña sin hacer logout, la sesión sigue viva hasta
  `expires_at`. Mitigación: el front debe llamar `POST /v1/auth/logout`
  (ya está en la matriz de endpoints) y `last_seen_at` deja rastro de sesiones
  abandonadas. Blast radius: una sesión abierta en un equipo compartido.

## Evidencia

- El ER v1 de #58 (`apps/api/prisma/schema.prisma`, rama
  `feat/58-diagrama-v0`) define `platform.session` con `token_hash` único,
  `issued_at`, `expires_at`, `last_seen_at`, `revoked_at`, `ip_address` y
  `user_agent`: el modelo de sesión en servidor ya está decidido.
- El front ya envía `Authorization: Bearer <token>`
  (`apps/web/src/app/core/middleware/api/interceptors.ts:27-31`) y trata
  `401` fuera de `/auth/login` como sesión muerta
  (`interceptors.ts:43-48`): el contrato de error que exige esta decisión
  ya está implementado y probado en
  `apps/web/src/app/core/middleware/api/interceptors.spec.ts`.
- `bcryptjs` 3.0.3 está declarado en `apps/api/package.json`.
- Pendiente de verificar en #12: la primera sesión real contra
  `platform.session` (login, uso del Bearer, logout con `revoked_at`).

## Qué nos haría revertirla

Si la instalación pasa a más de un servidor de API (sesiones compartidas
entre réplicas, que ya no es el caso en single-company), o si la lectura a
`platform.session` llega a representar una parte medible de la latencia de
lectura (RNF-04 pide consultas por debajo de 3 s con 1 000 documentos), se
reescribe el ADR siguiente: la sesión se movería a un almacén compartido con
TTL, o el token volvería a ser un JWT con lista negra en la base. Hasta
entonces, un token opaco en la base es la opción más simple que permite
revocar.
