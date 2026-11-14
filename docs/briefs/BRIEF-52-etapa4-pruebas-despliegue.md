# BRIEF #52 — Etapa 4: pruebas y despliegue de la instalación C1

## 0. Encabezado

- Issue: #52 (Épica QA/Documentación) — entregable "Etapa 4" del plan de
  electrónica
- Dueño: Erik Beltrán (Líder, infra y pipeline) — `reeinharddd`.
- Fechas: 2026-11-13 → 2026-11-14 · Sprint 3 · hito `Entrega 15-nov`
- Prioridad / Tipo / Épica / Módulo: crítica / entregable / qa · `docs/`,
  `scripts/`
- Requisitos: RNF-03, RNF-07
- Bloqueado por: — · Bloquea a: la entrega del 15-nov

## 1. Contexto

La entrega pide el documento de **Etapa 4 — pruebas y despliegue** con cinco
tablas y una captura por tabla: (1) navegadores/SSL-TLS/redireccionamiento,
(2) multidispositivo, (3) pruebas funcionales con automatizadas, (4)
respaldos con prueba de restauración, (5) DLP y DRP. Y evaluar un emulador
de AWS para el despliegue.

El repositorio **no tenía** procedimiento de respaldo ni restauración: la
exploración del 13-nov no encontró ni un script ni una mención técnica de
DRP (sólo la rúbrica que lo pide). Sin respaldo restaurable, la tabla 4 era
invented.

## 2. Objetivo y resultado esperado

| Entregable | Evidencia |
|---|---|
| Documento de la Etapa 4 con 5 tablas + 1 captura por tabla y conclusiones | `docs/operacion/ETAPA-4-PRUEBAS-Y-DESPLIEGUE.md` |
| Procedimiento de respaldo repetible | `scripts/backup.sh` (bundle de git + pg_dump custom + manifiesto con SHA-256) |
| **Prueba de restauración** repetible | `scripts/restore-check.sh` (restaura a scratch y compara tree + conteos de las 26 tablas) |
| Evaluación del emulador de AWS | `docs/ingenieria/EVALUACION-EMULADOR-AWS.md` — no aplica, con motivo y disparador |
| Evidencia cruda | `docs/operacion/evidencias/etapa4/` (5 capturas + 8 logs) |

## 3. Solución

**El respaldo** produce dos artefactos atados por un manifiesto: el bundle de
git (todo el código, tree hash incluido) y el `pg_dump --format=custom` (las
26 tablas). `backups/` está git-ignored: el dump lleva datos de la planta.

**La prueba de restauración** restaura ambos a espacio scratch y los
verifica: SHA-256 contra el manifiesto, tree del clon = tree del manifiesto,
y conteo de filas tabla por tabla entre la instalación viva y la restaurada.
Cualquier diferencia sale con `exit 1`; el scratch se destruye solo.

**El entorno de las capturas** es la instalación real: build de producción
servido por nginx con TLS (la misma puerta que en producción), API con el
perfil híbrido de #141, y navegadores reales vía Playwright (Chromium,
Firefox, WebKit — el motor de Safari). La prueba funcional de navegador
(`.lab-review/tools/etapa4-navegador.mjs`, fuera del repo) automatiza el
flujo del usuario: carga HTTPS → entrar → vista con contenido → ruteo SPA →
sin errores, 5 checks por motor.

**DLP/DRP medidos**: RNF-03 disparando de verdad (endpoint remoto sin
autorización impide arrancar), gitleaks sobre el árbol versionado (`no leaks
found`), y la cola de BullMQ sobreviviendo a la caída del worker con
health gate `degraded` visible para el operador.

## 4. Resultados medidos

| Prueba | Resultado |
|---|---|
| Navegadores (Chromium 159, Firefox 159, WebKit 27.2) | 200 OK · 5/5 checks · sin errores, ×3 motores |
| Multidispositivo (1920/1440/820/390) | 5/5 checks · layout responde |
| Funcionales | e2e 12/12 (65 asertos) · navegador 15/15 · IA en vivo 27/27 · verify verde |
| Respaldo + restauración | OK: tree idéntico + 26 tablas con conteos idénticos, **14 s** |
| DLP | RNF-03 bloquea arranque · OCR/embeddings/scoring locales · TLSv1.3 + 301 · sin secretos versionados |
| DRP | restauración verificada · cola sobrevive a la caída del worker · app reconstruible desde el bundle |

## 5. Relación con los issues abiertos

- **#132 (Kira)**: la sesión real de la web sigue abierta; este trabajo probó
  el login real a nivel API por el proxy TLS.
- **#61 (Carlos/Emmanuel)**: los umbrales de la cascada se afinan contra el
  dataset; el gate `seed:check` ya está en verify.
- **#136**: el OCR local tarda ~100 s por página — límite conocido, no
  bloquea.

## 6. Referencias

- `docs/operacion/ETAPA-4-PRUEBAS-Y-DESPLIEGUE.md` — el entregable.
- `docs/operacion/evidencias/etapa4/` — capturas y logs crudos.
- `scripts/backup.sh` · `scripts/restore-check.sh` — el procedimiento.
- `docs/ingenieria/EVALUACION-EMULADOR-AWS.md` — el veredicto del emulador.
