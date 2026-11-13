# Carriles de C1 — quién trabaja en qué, desde dónde y con qué puerta

Estado: vigente. Última actualización: 2026-11-13. Plan vigente:
`gestion/REPLAN-2026-10-30.md` (v2). Hitos: modelo y BD 12-nov (cumplido) ·
presentación **17-nov** (movida desde el 24-nov) · final 3-dic.

Esta página es el arranque de los **tres carriles que arrancan ahora** (el plan
completo de C1 tiene ocho; ver `gestion/REPLAN-2026-10-30.md`). El detalle de
cada tarea está en su brief; el estado real vive en el issue, nunca aquí.

## Los tres carriles

| Carril | Persona | Issue | Rama | Fechas | Entregable | Revisa |
|---|---|---|---|---|---|---|
| H. Frontend | Kira (`kirxllix`) | #11 | `feat/11-prototipos-ui-ux` | 13→16-nov | Cinco pantallas funcionales del flujo del caso (captura, bandeja, programa, búsqueda, reporte), con specs, `FLUJO.md` y `CATEGORIAS.md` | Erik |
| D. Base de datos | Emmanuel (`Agent3835`) | #58 | `feat/58-diagrama-v0` | 2→**10**-nov | ER híbrido (draw.io + texto derivado), DDL, vistas, triggers, migración aplicada y contrato con SHA | Erik |
| F. Dataset | Carlos (`WearyBerry`) | #61 | `feat/61-generador-dataset` | 3→**16**-nov | Generador determinista con specs, semilla versionada, manifiesto SHA-256 y el corpus del mes | Erik |

Erik conduce el resto (arquitectura #60, modelo #62, plataforma #84, IA #85,
guardas #87, limpieza #88, demo #89) y **revisa todos los PRs** (issue #106).
Las tres ramas existen desde `main`; nadie trabaja en `main`.

## Estado de hoy (13-nov)

- **Base de datos y backend base: integrados en `main`.** ER (#58), modelo y
  contrato (#62, #23), IA (#85), plataforma (#84), puerta TDD (#45) y la fase B
  de la API (#12: bandeja, confirmación, rechazo y dato oficial) ya están
  merged; la disposición es condicional en SQL (409 real bajo doble envío).
- **Backend (#3, #46, #59, #44, #5, #7): Emmanuel continúa.** La cadena crítica
  de la demo es pipeline (#3) → worker (#46) → seed (#59): sin worker la
  bandeja queda vacía por diseño.
- **Dataset (#61, #86): Carlos, en progreso en sesión paralela del líder.**
  Entrega 17-nov; el seed y la replicabilidad dependen de su corpus.
- **Frontend (#11, #4): en pausa por decisión del líder (13-nov).** Esta semana
  no se trabaja frontend; la rama `feat/11-prototipos-ui-ux` de Kira queda como
  está y se retoma después de la presentación.
- **Revisión (#106, Erik):** cada PR de carril se revisa contra la Definición
  de Hecho de `docs/REGLAS.md` al llegar; sin evidencia no hay merge.
- La presentación es el **martes 17-nov**: freeze y ensayo el lunes 16; el
  alcance se congela a la vertical mínima demostrable.

## Cómo se trabaja

1. **`bloqueado por` es dependencia de integración, no barrera para empezar.**
   Cada bloque se construye en paralelo, contra el contrato, el DDL o las
   specs; no cierra hasta que su bloqueador entrega. El día de entrega es el
   día de la integración.
2. **Las fechas son estimaciones.** Con apoyo de IA se espera anticiparlas.
   El líder ve todos los bloques y ajusta el orden y las fechas en el tablero
   para que las piezas conecten sin fricción.
3. **Una persona, un issue `En progreso`** en el tablero (regla de higiene del
   tracker, no de serialización del trabajo).

## Reglas de los carriles

1. **Una persona, un issue `En progreso`.** Si necesitas dos, terminas el
   primero (`docs/REGLAS.md`).
2. **`main` está protegida.** Todo entra por PR con `Closes #N`, `bun run
   verify` en verde y evidencia (captura, bitácora o video).
3. **Nadie hace push sin revisión del líder.** Antes de commitear se revisa
   todo con Erik; sin su visto bueno explícito, no hay commit ni push.
4. **Duda de 30 minutos → pregunta.** Bloqueo de más de 24 h → etiqueta
   `bloqueado` en el issue. No se avanza a ciegas.
5. **El repo manda:** `AGENTS.md`, `docs/README.md`, `docs/REGLAS.md` y el
   brief del carril. Si dos fuentes discrepan, se corrige la que no tiene
   autoridad en el PR mismo.

## Cómo se arranca un carril

```bash
bash scripts/rama-env.sh 11 feat/11-prototipos-ui-ux   # o 58 / 61
source .docu/rama/<slug>/env                            # config local, nunca se commitea
opencode
/inicio        # quién eres, tus tareas y las reglas
/tarea 11      # abre el brief del carril
```

La config local (`.docu/rama/<slug>/`) es de la persona y muere con la rama:
en el commit solo viaja el entregable.

## Puertas que todo carril tiene que pasar

| Puerta | Qué exige |
|---|---|
| `bun run lint` | Biome con `recommended`; un aviso es fallo |
| `bun run typecheck` | TypeScript estricto en `apps/api` y `apps/web` |
| `bun run harness:check` | Metadata y catálogo del harness en verde |
| `bun run diagramas:check` | Mermaid válido y `drawio` ↔ texto derivado sin desincronía |
| `bun run dataset:check` | Los 6 esquemas, el volumen aprobado (`esperado.json`), la semilla y los hashes y conteos del manifiesto |
| `bash scripts/doc-index.sh` | Índice documental honesto (si el carril toca `docs/`) |
| `bun --filter web test` | Pruebas web en verde (carril H) |
| `bun run prisma:check` | Toolchain de Prisma listo; cuando existe el schema: schema válido, cliente generado y migración baseline con la extensión `vector` |
| puerta TDD | Spec junto al código nuevo (carriles D y F: `apps/api/src/**` y `dataset/**`) |

## Qué pasa si un carril se traba

| Carril | Si no llega lo que depende | Qué haces |
|---|---|---|
| H. Frontend | #84 (plataforma) no está integrado | Trabajas sobre `main` y rebaseas cuando se integre |
| H. Frontend | #61 (corpus) no llega | Entras con fixtures versionados y marcados; el intercambio fixture→corpus está en `BRIEF-11` §8.1 |
| D. Base de datos | El caso no aclara una tabla | Pregunta en el issue; sin respuesta escrita, la tabla no se afirma |
| D. Base de datos | La migración no aplica en una base limpia | No es `done`: se devuelve con el error de la salida |
| F. Dataset | Las fichas cambian después | Se abre issue; la ficha cerrada solo cambia con issue |
| F. Dataset | El corpus no cuadra con `CONTRATO.md` §8 | Se devuelve con el conteo que no cuadra; no se maquilla el número |
| D. Base de datos | Las familias finales (#58) o las reglas (#23) se mueven | Se regenera el manifiesto; el generador no se rehace |
| F. Dataset | #58 o #23 siguen abiertas el 14-nov | Se entrega generador + semilla + plantillas; el manifiesto se regenera al cerrar |

Un carril no se "entrega a medias": o cumple su criterio de listo del brief, o
se queda abierto con el motivo escrito.

## Lo que no se mezcla

- El ER es de Emmanuel; la API es de Emmanuel; el frontend es de Kira; el
  dataset es de Carlos. Nadie edita el carril de otro sin avisar en el PR.
- Un PR toca un carril. Si necesita dos, se parte en dos PRs.
- El corpus generado no se versiona: lo que viaja es la semilla, las
  plantillas, el volumen aprobado (`esperado.json`) y el manifiesto
  (`dataset/config1/README.md`).
