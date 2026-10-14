# BRIEF #7 — Verificación intermedia: carga directa con datos crudos

## 0. Encabezado

- Issue: #7
- Dueño: Emmanuel Valenzuela Cruz (Backend).
- Fechas: 2026-10-23 → 2026-10-30 · Sprint 2 · hito Contrato flexible
- Prioridad / Tipo / Épica / Módulo: media / historia / Base de datos / base de datos.
- Requisitos: RF-08, RF-02, RNF-05, RNF-06
- Bloqueado por: #59, #10 · Bloquea a: #8, #3, #23

## 1. Contexto

El diagrama v1 está afirmado y el seed escrito (#59). Este brief es el paso de verificación intermedio: un script de carga directa mete los datos crudos de las simulaciones (#9) en la BD sin pasar por la API (que aún no existe), y comprueba cadena, cuarentena y reporte. Si algo falla, se devuelve a #59 con motivos: nunca se parcha aquí.

## 2. Por qué importa tu parte

Es la prueba de RF-08: si C1 carga con `git diff` de código vacío, C2 (#8) es solo otra carga. Si algo exige parche de código, el modelo está mal y se devuelve a #59, no se parcha aquí.

## 3. Objetivo y resultado esperado

| Entregable | Evidencia |
|---|---|
| Script carga-directa | Carga datos crudos del dataset en la BD sin API; corre con un comando |
| C1 cargada solo con datos | Seed corrido + `git diff` de código vacío |
| Cadena probada | CSV de corrida: 1 caso por regla R-P1..T1 (pasa o cuarentena con motivo) |
| 1 reporte funcionando | Salida adjunta al PR |
| Reporte de verificación | Qué pasó, qué falló y qué se devuelve a #59 (o "modelo apto para backend") |
| Nota para C2 | Comentario en #8 de qué reutiliza sin código |

## 4. Actividades específicas

1. Escribir el script de carga directa (datos crudos de #9 → BD, sin API). Terminado: corre con un comando y es repetible.
2. Cargar familias, reglas, roles y umbrales como datos (seed de #59). Terminado: seed reproducible con semilla.
3. Probar la cadena con los datos crudos. Terminado: CSV de corrida + cuarentenas motivadas.
4. Sacar 1 reporte mínimo y documentar qué es dato y qué sería código. Terminado: salida adjunta.
5. Escribir el reporte de verificación (apto para backend o devolución a #59 con motivos). Terminado: comentario en #59 o luz verde a #12.
4. Integrar la matriz de Carlos (#29) como datos. Terminado: mapeo aplicado sin código.
5. Escribir la nota para #8. Terminado: comentario con qué reutiliza C2.

## 5. Entradas y salidas

- Recibe: v1 + seed (#59), entorno (#10), dataset (#9), matriz (#29).
- Entrega: a #8, #3 y #23, por PR desde `feat/7-carga`, C1 + reporte. Comenta en #3, #8 y #23.

## 6. Referencias y caja de herramientas (tú eliges cuáles usar)

Principio: este brief te da contexto y criterio, no las respuestas. Tú
decides el script, la corrida y el veredicto; la revisión del 30-oct lo
afirma o lo devuelve con motivos. Nada se cierra antes de que propongas.
Si algo falla, se devuelve a #59 con motivos: nunca se parcha aquí.

Para decidir solo, sin depender de nadie:

- v1 + seed afirmados (#59) — tu materia prima; sin v1 afirmado no se
  carga (bloqueo, no parche).
- Dataset crudo y fichas de Carlos (#9) + matriz (#29): de ahí salen los
  datos y el mapeo puesto→rol como datos.
- `docs/proyecto/CASO.md` — organigrama, 6 familias, 7 reglas R-P1..T1.
- `docs/proyecto/REQUISITOS.md` — RF-08 (qué probar), RF-02 (OCR/lenguaje),
  RNF-05/06 (offline, recursos mínimos).
- ADR-0009 (reglas como datos), ADR-0010 (solo-insert: lo inválido va a
  cuarentena con motivo, jamás se borra en silencio).
- Skill `docu-basedatos` (mecanismos y estándares) + `ecc-prisma-patterns` (trampas de Prisma/transacciones).
- Carga y CSV: https://www.prisma.io/docs/orm/prisma-migrate/workflows/seeding ·
  https://papaparse.com (CSV de corrida).
- Comandos: `bunx prisma migrate dev` desde `apps/api`, `bun run verify`.

Lo que NO te limitamos: forma del script, formato del reporte, orden de
la corrida. Lo que sí se devuelve con motivos: parche de código por una
familia (viola RF-08), inválido borrado en silencio, `.env` al repo.

## 7. Cómo trabajar

- `/tarea 7`, rama `feat/7-carga`. Todo con semilla/versión.
- EMMANUEL NO DEBE: parchear código por una familia (viola RF-08, se devuelve a #59); borrar inválidos en silencio; subir `.env`.
- TypeScript estricto. 1 issue En progreso; bloqueo >24 h con `bloqueado`.

## 8. Criterios de aceptación

- [ ] Script de carga directa con datos crudos, repetible con un comando.
- [ ] C1 carga con `git diff` de código vacío.
- [ ] Cada regla R-P1..T1 con 1 caso que pasa o va a cuarentena motivada.
- [ ] 1 reporte sale sobre C1 (salida adjunta).
- [ ] Todo en local/offline.
- [ ] `bun run verify` verde; PR con `Closes #7`.

No es done si: una familia exigió código; un inválido se borró en silencio.

## 9. Riesgos nombrados

El contrato se mueve (30-oct flexible) o el seed falla contra v1. Mitigación: seed probado desde el 23-oct; sin v1 afirmado no se carga (bloqueo, no parche).

## 10. Revisión

Viernes 30-oct con Erik y Carlos: demo de carga + reporte. Después: #8 C2.

## Versión corta (descripción del issue)

> [7] Verificación con carga directa — Emmanuel, 23→30-oct. Script con datos crudos + cadena + reporte; si falla se devuelve a #59. Requiere #59 + #10. Detalle: `docs/briefs/BRIEF-07-configuracion-1.md`.
