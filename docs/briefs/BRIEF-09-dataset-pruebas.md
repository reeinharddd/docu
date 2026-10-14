# BRIEF #9 — Diseño de documentos: formatos, fuentes y marcos de error

## 0. Encabezado

- Issue: #9
- Dueño: Carlos.
- Fechas: 2026-10-16 → 2026-10-19 · Sprint 1.
- Prioridad / Tipo / Épica: alta / tarea / QA-Documentación.
- Requisitos: RNF-02 (datos de prueba).
- Bloqueado por: #29 · Bloquea a: #61
- Este brief piensa los documentos; construir el sistema que los genera en masa es #61. No escribas el generador aquí.

## 1. Contexto

Antes de automatizar hay que saber qué se automatiza: qué formatos existen, qué lleva cada uno, de qué fuentes salen, cómo se distinguen, qué marcos de error cubren y qué forma tiene su *ground truth*. Este brief produce esas fichas. Sin muestras manuales: pierden tiempo en esta etapa; el OCR se verifica con pruebas genéricas de lenguaje (#32). Entregable rápido y contenido, mejor que extenso y chocante.

## 2. Por qué importa tu parte

El generador (#61) solo ejecuta fichas: si la ficha está mal, miles de documentos salen mal. Las muestras del 16-oct desbloquean a Erik (#32) sin esperar al sistema completo. Si sale bien, #61 construye sin adivinar y #3 sabe qué esperar.

## 3. Objetivo y resultado esperado

| Entregable | Evidencia |
|---|---|
| 1 ficha por familia (5–6 fichas) | Tablas/JSON/esquemas: campos, conteos, fuentes, distinciones, marcos de error, forma del *ground truth* (aprobadas 17-oct) |

Cada ficha responde: ¿qué documentos de este formato existen? ¿qué campo lleva cada uno? ¿de qué fuentes sale (sistema, correo, escáner, mano)? ¿cómo se distingue de los demás? ¿qué errores realistas admite (por regla R-P1..T1)? ¿qué *ground truth* lo acompaña?

## 4. Actividades específicas

1. Escribir la ficha de cada formato (tablas o JSON versionados, no prosa suelta). Terminado: fichas aprobadas el 17-oct.
2. Definir los marcos de error por familia ligados a reglas (qué error, qué motivo de cuarentena). Terminado: cada error apunta a su R-###.

Siguiente paso → #61 (no lo desarrolles aquí): con fichas aprobadas, #61 construye el generador y produce cuantos documentos se quieran.

## 5. Entradas y salidas

- Recibe: perfiles y mapeo (#29), familias (v0 #58), reglas R-P1..T1.
- Entrega: fichas a #61. Todo por PR desde `feat/9-diseno-documentos`.

## 6. Referencias y caja de herramientas (tú eliges cuáles usar)

Principio: este brief te da contexto y criterio, no las fichas hechas. Tú
decides formatos, marcos y ground truth; la revisión del 17-oct los afirma
o los devuelve con motivos. Nada se cierra antes de que propongas.

Para decidir sola, sin depender de nadie:

- Skill `docu-dominio` (obligatoria primero: flujo de planta, glosario,
  ideas, generadores, simulación) + `docu-documentar` (tablas/JSON
  versionados, estándares MD del repo).
- Plantilla `docs/plantillas/FICHA.md` — una por familia, con marcos de
  error y volumen para #61.
- Perfiles y mapeo (#29, tuyo también): cada ficha dice qué perfiles la
  usan y qué resultado esperan — sin esto la ficha no sirve a #61.
- Familias del v0 (#58): 6 familias base; tus fichas las refinan, no las
  inventan de cero.
- `docs/proyecto/CASO.md` — formatos reales, fuentes (sistema, correo,
  escáner, mano), reglas R-P1..T1 para los marcos de error.
- `docs/proyecto/REQUISITOS.md` — RNF-02 (qué exigen los datos de prueba),
  RF-02 (lenguaje/español).
- ADR-0009 (reglas como datos: cada marco de error apunta a su regla).
- Skill `docu-documentar` (tablas/JSON versionados, estándares MD del repo).
- Medir después (solo referencia, no construyas): https://tesseract-ocr.github.io ·
  https://github.com/docling-project/docling.
- Patrones de folio/medida: https://regex101.com. Ground truth como
  grafo: https://jsoncrack.com.

Lo que NO te limitamos: formato de ficha (tabla o JSON), redacción,
cuántos documentos pedirá cada una. Lo que sí se devuelve con motivos:
empezar el generador (eso es #61), ficha en prosa sin esquema, marco de
error sin regla, muestras manuales.

## 7. Cómo trabajar

- `/tarea 9`, 1 issue En progreso. Fichas versionadas; nada a mano, nada de muestras.
- No usar el nombre real de ninguna planta.

## 8. Criterios de aceptación

- [ ] 1 ficha por familia con campos, fuentes, distinciones, marcos de error y ground truth (aprobadas 17-oct).
- [ ] Cada error apunta a su regla; cada ficha dice cuántos documentos pedirá #61.
- [ ] `bun run verify` verde.

No es done si: se empezó el generador; una ficha es prosa sin esquema; falta un marco de error.

## 9. Riesgos nombrados

Las fichas se vuelven tratado y no salen el 17-oct. Mitigación: tabla o JSON por familia, nada más; el detalle vive en las muestras.

## 10. Revisión

17-oct (async ok): fichas aprobadas. Después: #61 genera.

## Versión corta (descripción del issue)

> [9] Diseño documentos — Carlos, 16→19-oct. Fichas por formato (aprobadas 17-oct). Sin muestras manuales ni generador. Detalle: `docs/briefs/BRIEF-09-dataset-pruebas.md`.
