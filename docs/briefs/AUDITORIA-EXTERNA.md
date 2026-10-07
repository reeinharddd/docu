# Auditoría externa de DOCU — prompt de trabajo

> Este archivo es el encargo. Quien lo ejecuta (persona o agente) tiene todo el
> contexto del proyecto aquí. No hace falta contexto previo en la conversación:
> el repositorio y este documento son la entrada.

---

## 0. Qué eres y qué no eres

Eres un auditor externo. Tu valor está en **lo que no ven los que hicieron el
proyecto**: la ley que el equipo se autoimpuso y el equipo ya no está mirando.

No eres coautor. No escribas código de producto, no commitees, no abras PR, no
toques `.env`, no escribas en Monday, Drive ni GitHub. Entregas un informe.

Excepción: puedes **leer** todo, **ejecutar** los comandos de solo lectura y
`bun run verify` / `bun run doctor` / `bash scripts/doc-index.sh`. Si un comando
modifica el repo, no lo corras.

---

## 1. Qué es DOCU

Repositorio de Documentación Digital. Configuración 1: Baja SterilPack.

Monorepo Bun: `apps/api` (NestJS 12 + Prisma 7 + BullMQ 6), `apps/web`
(Angular 22 zoneless + Tailwind 4), `infra/`, `dataset/`.

**Qué hace el producto (del requirement al que sirve):** empleados de Baja
SterilPack fotografían documentación técnica de riesgos (etiquetas, fichas de
seguridad, diagramas), el sistema la extrae, la indexa y les devuelve una
respuesta con fuente citable. El valor está en la trazabilidad, no en el chat.

Etapa actual: **E1, solo infraestructura**. Regla dura número 6 — *E1 es solo
configs: sin lógica de negocio hasta M1/K1/C1*. Si encuentras lógica de negocio
en E1, eso es un hallazgo de máxima severidad.

---

## 2. Por qué se hizo esta ola, y qué se corrigió

La ola anterior cerró gaps de autosuficiencia. El punto de partida era un
repositorio que **prometía cosas que no existían**. Esto importa: parte de
tu trabajo es verificar que las promesas nuevas sí se sostienen.

| Antes | Ahora |
|---|---|
| `bunx biome` en los hooks: versión del registro en cada corrida | `@biomejs/biome@2.5.4` como dependencia exacta |
| Linter `preset: "none"` (no revisaba nada) | `recommended` + `--error-on-warnings` |
| README apuntaba a `db:migrate`, `db:seed`: scripts inexistentes | `scripts/dev.sh` es la entrada real |
| `packages/contracts` citado como si existiera | Workspaces `apps/*`; el paquete está declarado como futuro |
| Documentación afirmaba milestones sin fecha | Los 4 sí tienen fecha; el doc lo dice |
| Documentación afirmaba una tarjeta "E1" | No existe tal tarjeta |
| Fecha de congelación del contrato (2026-10-23) solo en Monday | Ahora en `PLAN-EPICAS.md` y `REQUISITOS.md` |
| Sin puerta documental | `docs/.indice` + `scripts/doc-index.sh` |

Dos decisiones que conviene que juzgues sin que nadie te las explique de nuevo:

**El índice documental es la ley, y ahora es un gate.** `docs/.indice` lista los
39 documentos. `scripts/doc-index.sh` falla si lo listado no existe, y también
falla si queda un `.md` sin listar. Corre en CI y en `doctor`. La intención es
que "el índice es la ley" deje de ser una frase buena.

**Cero MCP, y `.mcp.json` versionado vacío.** Ningún servidor candidato pasó los
siete criterios de `docs/integraciones/HERRAMIENTAS-AGENTE.md` (oficialidad,
mantenimiento, licencia, credenciales, versionado, ancho de contexto, encaje).
Versionar el archivo vacío es intencional: declara que la decisión existe y es
revisable.

---

## 3. El incidente que dimensiona todo el resto

Esto ya rompió producción una vez y defines el estándar de qué es un bug serio.

Al activar el linter de Biome, su autofix `useImportType` convirtió un
`import { PrismaService }` en `import type { PrismaService }`. El `tsconfig` de
`apps/api` tiene `emitDecoratorMetadata: true`, así que NestJS necesita la clase
**en runtime** para resolver el constructor por inyección de dependencias. Al
borrarla en compilación, la dependencia llegaba como `[Function: Object]` y la API
no arrancaba. `bun run typecheck` pasaba. `bun run lint` pasaba. Solo moría en
runtime, y lo cazó el job de CI.

De ahí salieron dos decisiones:

1. La supresión documentada en `apps/api/src/health/health.controller.ts`, que
   establece la regla general: en `apps/api`, ningún provider inyectado por
   constructor se importa con `import type`.
2. `scripts/smoke-api.sh`, que **arranca la API de verdad** y espera por
   condición hasta que `/health` responde `ok`. Reemplaza al `sleep 12` fijo de
   CI, que escondía el fallo. Está en `verify` y en `doctor`.

**Este es el tipo de hallazgo que buscamos.** Pregunta que guía todo lo demás:

> ¿Qué otra clase de fallo pasa `typecheck` y `lint`, y solo se manifiesta en
> runtime, en el arranque, o contra un servicio real?

---

## 4. Gaps conocidos y aceptados

No los descubras comoitoneal. Ya se saben. Tu trabajo es decir si el
razonamiento que detrás es sólido, o si alguno es una excusa disfrazada.

| Gap | Estado declarado | Dónde se dice |
|---|---|---|
| `apps/api` tiene **0 pruebas** | RNF-07 lo pide en Sprint 4 | `ENTORNO.md`, `doctor.sh` avisa |
| No hay rama `dev` | `EQUIPO.md` la exige, no existe | requiere escritura Git |
| MCP vacío | decisión registrada | `MCP.md`, `HERRAMIENTAS-AGENTE.md` |
| Sin UI kit Angular | no hay elección verificada | `STACK.md` |
| `.mcp.json` sin servidor | intencional | `.mcp.json` |

Cinco rutas bajo `apps/web/` están **untracked y no son del equipo que escribió
esta ola**. No las toques, no las commitees, no las asumas perdidas. Si crees que
deberían estar versionadas, dilo; borrarlas, no.

---

## 5. Reglas duras del proyecto

Están en `AGENTS.md` y `docs/REGLAS.md`. Resúmelas para saber qué violarías:

1. `.env` y secretos nunca al repo. `.env.example` documenta cada variable.
2. Commits convencionales, sin atribución a IA.
3. Español en docs, inglés en código y config.
4. TypeScript estricto. Nada de `any` sin justificación escrita.
5. `originales/` es solo lectura. Nada se borra en silencio.
6. **E1 es solo configs.** Sin lógica de negocio hasta M1/K1/C1.
7. **Drive y Docs solo lectura en vivo.** Monday solo con petición explícita.
8. Definición de Hecho: PR aprobado + pruebas del RF en verde + evidencia + tarjeta etiquetada con su RF.
9. Nada destructivo sin orden explícita. `main` protegida, todo por PR con revisor.

La 7 merece atención especial. Es tentación natural para un agente con acceso a
integraciones externas. Si tu informe sugiere escribir a Monday o Drive sin que
alguien lo pida, esa sugerencia viola la regla 7 por más razonable que parezca.

---

## 6. El encargo concreto

Tres ejes. El tercero es el que más rinde y el que más descuidan.

### Eje 1 — Corrección

¿Falta algo? Contrasta las promesas contra la realidad:

- Lee `docs/.indice` y contrasta con `docs/` real.
- Ejecuta `bun run verify`, `bun run doctor`, `bash scripts/doc-index.sh`.
  Pega la salida. Si algo falla, es hallazgo de primer nivel.
- Busca afirmaciones en la documentación que la evidencia contradiga. El
  precedente existe: cinco afirmaciones de Monday resultaron refutadas.
- Revisa los 7 ADRs de `docs/decisiones/`: ¿hay alguno cuya razón ya no se
  sostenga con el código actual? ¿Falta alguno por decisiones ya tomadas?
- `docs/ingenieria/STACK.md` tiene una tabla de 13 "marcas de investigación".
  ¿Sigue siendo útil o ya es ruido acumulado?

### Eje 2 — Coherencia

¿Las piezas se contradicen entre sí?

- Un comando documentado que no exista, o que exista y no esté documentado.
- Versiones en `package.json` vs. las citadas en `STACK.md` y los ADRs.
- `.github/workflows/ci.yml` vs. los scripts de `package.json`: ¿corren
  exactamente lo mismo? Una puerta que difiere entre local y remoto es una
  puerta que no existe.
- El contrato de herramientas: ¿`opencode.json`, `CLAUDE.md`, `.mcp.json`,
  `AGENTS.md` y `docs/` cuentan la misma historia? Un agente nuevo los lee todos
  y no debería encontrar contradicciones.
- ¿Los hooks de `lefthook.yml` se ejecutan en el mismo orden que las puertas
  documentadas?

### Eje 3 — Consumo de tokens y experiencia del agente

**Este es el eje prioritario.** El objetivo declarado es: *que todos podamos
trabajar de manera intuitiva y alineada, usando OpenCode y similares, con el
menor consumo de tokens desde el inicio.*

Cada línea que un agente lee al arrancar es un costo recurrente. El repo tiene
`AGENTS.md` (raíz) + `AGENTS.md` (docs) + `docs/REGLAS.md` +
`docs/decisiones/README.md`, todos cargados o alcanzables desde el inicio.
Mide y critica:

- **¿Qué se carga al inicio y cuánto cuesta?** Cuenta líneas y bytes de lo que
  un agente lee antes de hacer nada útil. ¿Hay algo que pueda ser *bajo
  demanda* en vez de *siempre*? El patrón es: índice corto que dice dónde está
  cada cosa, detalle que se lee solo cuando hace falta.
- **¿Hay duplicación?** Una regla en dos sitios se va a desincronizar. Ya pasó:
  la regla de `import type` existe hoy en `health.controller.ts`, en `AGENTS.md`
  y en la memoria del proyecto.
- **¿Qué es recuperable en un golpe de búsqueda pero está escrito largo?**
  Tablas de equivalencias, listas de "si ves X, mira Y".
- **¿Falta el mapa que un agente necesita para no perderse?** Un agente que no
  sabe que existe `docs/integraciones/` va a improvisar.
- **¿Cada puerta puede ejecutarse en un solo comando?** Fracción de gates que
  hoy requieren recordar una secuencia de tres pasos.
- ¿`doctor.sh` es legible para alguien que no lo escribió? ¿Su salida señala
  la acción a tomar, o solo el síntoma?

### Eje 4 — Lo que falta y nadie está pidiendo

Surge de lo anterior. Lo que **no** se puede pedir a un humano que ya conoce el
proyecto porque no le duele.

---

## 7. El problema del tiempo

Hay una fecha en el repo: **2026-10-23, congelación del contrato de datos**.
Verifícala en `PLAN-EPICAS.md` y `REQUISITOS.md`, y cruza contra lo que hoy es
scaffold. El contrato de datos congelado sin modelo de datos aprobado es un
bloqueo con fecha, no una observación.

---

## 8. Cómo entregar

Un informe en Markdown. Empieza por lo que puede romper algo.

```markdown
# Auditoría externa de DOCU — <fecha>

## Veredicto en cinco líneas
¿El repositorio está en el estado en que dice estar? ¿Los gates significan algo?

## Eje 1 — Corrección
### Hallazgos
Para cada uno:
- **Qué** — la afirmación o el archivo
- **Evidencia** — comando y salida, o archivo y línea
- **Impacto** — qué se rompe si no se corrige
- **Acción** — el cambio mínimo
Ordenados por impacto. Un hallazgo sin evidencia es una opinión.

## Eje 2 — Coherencia
Mismas reglas. Una tabla de contradicciones si las hay.

## Eje 3 — Consumo de tokens y experiencia
- Medición: líneas y bytes cargados al inicio
- Redundancia: qué regla vive en varios sitios
- Propuesta concreta de reorg, con el antes y el después medidos
- Fracción de gates que caben en un comando

## Eje 4 — Lo que falta y nadie pide

## Lo que NO es un hallazgo
En explícito, con el motivo. Sirve para que no se reabra el debate.
```

Sé escéptico contigo mismo. Un hallazgo sin evidencia ejecutable es una
opinión con formato de hallazgo, y es peor que no escribir nada. Si algo te
parece sospechoso pero no lo puedes demostrar, ponlo en una sección aparte
titulada *Sospechas sin confirmar* y di qué comando lo confirmaría.

Cero emojis. Español en el informe, nombres de código y comandos en inglés.
Si el informe contradice algo que este documento afirma, **gana el informe**,
y es un hallazgo sobre el propio proceso.
