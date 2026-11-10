# BRIEF #23 — Contrato de datos de C1 congelado

## 0. Encabezado

- Issue: #23
- Dueño: Erik Alfonso Beltrán Ramírez (`reeinharddd`).
- Fechas: 2026-11-12 → 2026-11-12 · Sprint 3 · hito `C1 modelo y BD` (12-nov).
- Prioridad / Tipo / Épica / Módulo: alta / tarea / Infraestructura / datos.
- Requisitos: RNF-07
- Bloqueado por: #58 (ER y DDL de C1) · Bloquea a: #61 (dataset), #59 (seed), #12 (API), #7 (C1).

## 1. Contexto

El contrato de datos es el idioma que hablan el dataset, el seed y la API: si
cada uno interpreta los campos por su lado, el corpus que Carlos genera no
servye para probar la API de Emmanuel. `docs/ingenieria/fichas/CONTRATO.md`
ya está aprobado (issue #9, 17-oct) y describe familias, reglas, volumen y
ruido del mes de octubre; lo que faltaba era **congelarlo** para que nadie lo
mueva sin que quede registrado.

Congelar es calcular un SHA-256 de los archivos que forman el contrato y
publicarlo junto con la forma de volver a verificarlo. Sin eso, "el contrato
cambió" es una opinión; con eso, es un hash que no cuadra.

## 2. Por qué importa tu parte

Sin SHA congelado, el `dataset:check` de Carlos valida contra un texto que
puede haber cambiado, y la API de Emmanuel interpreta un contrato que nadie
firmó. El congelado es lo que convierte tres trabajos paralelos en uno solo.

## 3. Objetivo y resultado esperado

| Entregable | Evidencia |
|---|---|
| SHA-256 del contrato (8 archivos) | `dataset/config1/contrato-sha.json` con `contract_sha` |
| Forma de verificar y de re-congelar | `bun run contrato:check` y `bun run contrato:freeze` |
| Puerta en el `verify` | `contrato:check` corre en `bun run verify` y en CI |
| Contrato atado al caso real | `esperado.json` v1.1.0 con calendario, incidente, fallos crónicos, reglas y ruido |
| Trazabilidad | `docs/ingenieria/CONTRATO-CONGELADO.md` |

## 4. Actividades específicas

1. Versionar el manifiesto del contrato con el SHA de cada archivo y el
   SHA del conjunto. Terminado: `dataset/config1/contrato-sha.json`.
2. Script de verificación en modo CI (falla si un archivo cambió) y modo
   freeze (recalcula y escribe). Terminado: `scripts/contrato-sha.ts`.
3. Enganchar la puerta al `verify`. Terminado: `contrato:check` en la cadena.
4. Atar el contrato al caso de Baja SterilPack. Terminado: `esperado.json`
   v1.1.0 con el plus de calendario del 12-oct, el incidente del 26-oct, los
   seis fallos crónicos, la cobertura de las siete reglas (válido, inválido y
   ambiguo) y los tres tipos de ruido con su enrutamiento.

## 5. Entradas y salidas

- Recibe: `docs/ingenieria/fichas/CONTRATO.md` (§2, §7, §8, §9), los JSON
  Schemas de las 6 familias (`dataset/config1/esquemas/`) y el modelo de
  datos (#62).
- Entrega: el contrato congelado con SHA, la puerta que lo verifica y la
  documentación del congelado, por PR con `Closes #23`.

## 6. Referencias

- `docs/ingenieria/fichas/CONTRATO.md`: el contrato aprobado.
- `docs/ingenieria/CONTRATO-CONGELADO.md`: cómo se congela y cómo se verifica.
- `docs/briefs/BRIEF-61-generador-dataset.md`: el generador que se emite
  contra este contrato.
- `docs/gestion/REPLAN-2026-10-30.md` §5: el contrato se cierra con evidencia.

## 7. Cómo trabajar

- El SHA se recalcula a mano y solo con motivo (`bun run contrato:freeze`),
  y el motivo queda en el mensaje de commit.
- Si un archivo del contrato cambia, la puerta falla: el congelado es la
  alarma, no un adorno.
- Nada del corpus se versiona aquí: el generador de #61 produce los archivos
  y su manifiesto SHA-256.

## 8. Criterios de aceptación

- [x] `bun run contrato:check` falla si cualquier archivo del contrato cambia.
- [x] `bun run contrato:freeze` recalcula y registra el SHA del conjunto.
- [x] La puerta corre dentro de `bun run verify` y en CI.
- [x] El manifiesto declara los 8 archivos que forman el contrato.
- [x] `esperado.json` refleja el caso real de Baja SterilPack (calendario,
      incidente, fallos crónicos, reglas y ruido).
- [x] La documentación dice cómo verificar y cómo re-congelar.
