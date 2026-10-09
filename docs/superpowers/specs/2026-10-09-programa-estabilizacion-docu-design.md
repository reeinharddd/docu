# Spec: Programa de estabilización, estandarización y automatización de DOCU

- Fecha: 2026-10-09
- Enfoque elegido: A — programa monolítico, 8 fases secuenciales, directo en `main`
- Estado: Aprobado por el usuario (brainstorming §1–§6)

## 1. Objetivo y resultado final

Convertir DOCU en un proyecto documentado, trazable, automatizado y portable:
cualquiera de los 4 integrantes puede clonarlo, entender el contexto, trabajar
con agentes de IA y continuar el trabajo de otro sin depender de ordenadores,
memorias locales ni conocimientos particulares.

No es solo corregir Markdown: es un sistema reproducible donde requisitos,
decisiones, calendario, responsables, herramientas, pruebas y evidencias están
conectados con fuente de verdad identificable.

## 2. Reglas de juego y rulings

- Rama: trabajo directo en `main` (autorización explícita del usuario el
  2026-10-09). Se salta REGLAS.md #1/#7 y AGENTS.md #9 solo por etapa inicial.
  Las reglas se mantienen vigentes como objetivo; costo si sale mal: `main` a
  medias sin revisión. Mitigación: un commit lógico convencional por ola con
  tabla archivo/línea/cambio/motivo/evidencia.
- GitHub: lectura y escritura autorizadas (issues, etiquetas, milestones,
  Project). Los cambios de fechas duras, responsables y alcance requieren
  aprobación humana registrada.
- E1 sin lógica de negocio. Español en docs, inglés en código/config. Bun como
  herramienta principal. Commits convencionales (`feat:`, `fix:`, `docs:`,
  `chore:`), sin atribución a AI, un cambio lógico por commit.
- `originales/` solo lectura. Nada destructivo sin orden explícita. Secretos
  jamás al repo; `.env.example` documenta nombres, nunca valores.

## 3. Arquitectura documental (fuentes de verdad)

| Información | Fuente de verdad |
| --- | --- |
| Visión, alcance, requisitos (RF/RNF) | `docs/proyecto/` |
| Decisiones técnicas | `docs/decisiones/ADR-*.md` (inmutables) |
| Estado, responsables, fechas | GitHub Issues y Projects |
| Alcance delegado | `docs/briefs/` + issue enlazado (molde §0–10) |
| Calendario y dependencias | GitHub + `docs/gestion/` (explica, no duplica) |
| Configuración herramientas | Archivos versionados del repo |
| Evidencias | PR, CI, artefactos vinculados |
| Memoria agentes | Fuente compartida versionada (resume y enlaza) |

Sin reorganización física masiva inicial: inventario → reglas de clasificación
→ mover/consolidar por cambios revisables. Antes de crear cada archivo nuevo
(`CONTRIBUTING.md`, `GUIA-INICIO.md`, `CALENDARIO-MAESTRO.md`,
`MATRIZ-CONTROL.md`, `ESTANDARES.md`, `AGENTES-IA.md`, `INCIDENCIAS.md`,
`REGISTRO-RIESGOS.md`) comprobar si el contenido ya tiene dueño; si existe, se
mejora ese documento y se enlaza desde los índices.

## 4. Olas de ejecución (secuenciales en `main`)

1. **Ola 01 (9–11 oct) Auditoría y línea base.** SHA `main`, inventario
   docs/scripts/issues/milestones/etiquetas/PRs, `verify`+`doctor`+`doc-index`
   en clon limpio, rotos/duplicados/rutas personales. Salida: informe línea base.
2. **Ola 02 (12–14 oct) Gobierno documental y calendario.** Fechas (contrato
   30-oct), links obsoletos, encabezados/índices, `PROPUESTO` visible. Salida:
   docs coherentes + calendario contrastado.
3. **Ola 03 (12–16 oct) Briefs y equipo.** Molde §0–10 a los 10 briefs,
   recursos neutrales, sin rutas personales, guía incorporación. Salida: 10/10
   briefs ejecutables desde clon limpio.
4. **Ola 04 (15–18 oct) Calidad y trazabilidad.** Verificadores en `scripts/` +
   CI sin duplicar: enlaces, esquema briefs, RF/RNF, dependencias circulares,
   fechas, PR-evidencia, índice. Salida: errores detectados antes del merge.
5. **Ola 05 (19–23 oct) Entorno y agentes.** Bootstrap/diagnóstico único,
   jerarquía AGENTS.md, MCP/Engram con permisos mínimos, prueba en máquina
   limpia. Salida: arranque reproducible.
6. **Ola 06 (24–30 oct) Congelación del contrato.** Resolver dependencias de
   modelo y configuración; congelar contrato 30-oct. Salida: contrato
   versionado y aprobado.
7. **Ola 07 (2–20 nov) Cierre de desarrollo.** Pruebas, rendimiento, seguridad,
   evidencias por requisito, manuales. Salida: desarrollo terminado.
8. **Ola 08 (23 nov–1 dic) Liberación.** Aceptación 27-nov, revisión final,
   presentación 1-dic. Salida: paquete defendible.

Hitos duros intactos: 30-oct, 20-nov, 27-nov, 1-dic.

## 5. Correcciones prioritarias (§5 del plan)

- `docs/proyecto/REQUISITOS.md` ~l65: fecha contrato → 30-oct, sin contradecir hitos.
- `docs/gestion/TRAZABILIDAD.md`: nueva fecha de verificación solo tras
  contrastar issues reales.
- `docs/proyecto/EQUIPO.md` (Emmanuel): Configuración 1 (#7), fecha y relación
  con modelo de datos.
- `docs/integraciones/GITHUB-GESTION.md`: explicar solapamiento S1/S2 sin
  redefinir sprints; corregir sección migración (no afirmar que
  `academico/EC0935.md` es destino vigente).
- `docs/integraciones/DRIVE.md`, `BRIEF-13-srs.md` (2 refs),
  `ADR-0008`, `INVESTIGACION-HERRAMIENTAS.md`: corregir/anotar refs a
  `EC0935.md` y al brief eliminado sin restaurar archivos eliminados.
- 10 briefs: normalizar estructura, neutralidad, recursos, fechas, bloqueos,
  requisitos, aceptación.

Condición por referencia: destino existe o se justifica como histórica;
autoridad apropiada; nada restaurado contra orden expresa; índice actualizado
vía script oficial; sin contradicción con issues/ADR/plantillas.

## 6. Trazabilidad (flujo y controles)

Flujo: RF/RNF → épica → issue GitHub → brief versionado → commit → CI →
evidencia verificable → cierre → matriz actualizada. Lo que falla vuelve a
verificar, no se marca terminado por existir un link o etiqueta.

Controles: integridad documental (rotos), esquema briefs, RF/RNF válidos,
issues sin requisito/brief/aceptación cuando apliquen, dependencias
circulares, fechas (fin<inicio, cambios de hito), PR sin issue/falta de
pruebas-evidencia, índice desactualizado, Project desincronizado, calidad
técnica (lint, typecheck, pruebas, `/health`, secretos, reglas repo/PR).

## 7. Agentes IA, memoria y portabilidad

- Jerarquía: raíz `AGENTS.md` → `docs/README.md`+`REGLAS.md` →
  `STACK.md`+ADRs → guías operación → configs versionadas → instrucciones
  locales solo si necesarias.
- Ciclo agente: orientarse → planificar → ejecutar (mínimo coherente) →
  verificar (salidas reales) → documentar → entregar (cambios, pruebas,
  límites, riesgos, siguientes).
- Prohibido al agente sin autorización: cerrar issues, cambiar fechas duras o
  responsables, eliminar docs, tocar ADR históricos, publicar datos oficiales.
- Memoria en 3 capas: (1) oficial versionada, (2) continuidad con procedencia
  y fecha, (3) efímera no-oficial. Cada MCP con ficha: propósito, versión,
  instalación, env (nombres), permisos mínimos, prueba, dependencias,
  alternativa, responsable.
- Portabilidad: buscar rutas `/Users/`, `/home/`, `C:\Users\`, usuarios
  locales, env implícitos, scripts dependientes de cwd, configs ignoradas
  necesarias, secretos accidentales, refs a cuentas personales, MCP locales,
  "usa tu archivo / chat anterior", datos de prueba solo-locales. Tratamiento
  según tabla §10 del plan; nunca copiar secretos al repo.
- Prueba: integrante B continúa desde entorno limpio sin archivos de A.

## 8. Estándares y puertas de calidad

TypeScript estricto, sin `any` injustificado, commits convencionales, sin
lógica en E1, sin `npm`/`bunx` (salvo `prisma migrate dev`), sin dependencias
sin evaluar, DI NestJS con clases runtime (no `import type` en providers
inyectados por constructor). Cambios de comportamiento con pruebas y evidencia.

Puertas por ola: `bash scripts/doc-index.sh --fix` (cuando aplique) +
`bun run verify` + `bun run doctor` en verde con salidas reales. `verify` hoy
solo smoke `/health` (0 pruebas en `apps/api` = deuda visible).

## 9. Decisiones PROPUESTO (no aplicar sin dueño)

Fecha #13 (12 vs 19-oct, carga Erik), responsable #36, responsable #39
(dueño RF-05), usuarios GitHub de 3 integrantes, eliminar `docs/diseno/*.txt`
(verificar migración a BRIEF-41), UI kit Angular (PrimeNG vs Material vs Taiga
según BRIEF-42), secreto Docker Hub para CI. Cada una con motivo, impacto,
quién aprueba y fecha límite; nada se considera aprobado por repetición.

## 10. Aceptación del programa

Docs 100% clasificados y cubiertos; 0 rotos injustificados; 10/10 briefs;
2/2 entornos limpios; 100% trazabilidad o excepción aprobada;
`doc-index`+`verify`+`doctor`+controles en verde con resultados reales.
Umbrales RF: cobertura 80% donde aplique, OCR ≥90% campos clave, CER ≤10%
(confirmar qué mide cada uno antes de reportar). Cierre por ola: tabla
archivo/línea/cambio/motivo/evidencia + PROPUESTOs + estado briefs +
trazabilidad + calendario + rutas no-portables + guía inicio + salidas verify +
limitaciones + commits + confirmación de alcance (main directo autorizado,
sin PR por etapa inicial).
