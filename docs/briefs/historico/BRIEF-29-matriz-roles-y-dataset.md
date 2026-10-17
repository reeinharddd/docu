# BRIEF #29 — Matriz de roles y perfiles ficticios

## 0. Encabezado

- Issue: #29 Matriz roles, permisos.
- Dueño: Carlos.
- Fechas: 2026-10-13 → 2026-10-16 · Sprint 1.
- Prioridad / Tipo / Épica: alta / tarea / Autenticación.
- Requisitos: RF-06 (planta → departamento → rol → persona + bitácora).
- Bloqueado por: `proyecto/CASO.md` (organigrama), `#58` (familias del v0).
- Bloquea a: #5 RBAC, #9 dataset (le da perfiles y resultados esperados).

## 1. Contexto

Este brief delimita los usuarios ficticios de la compañía —roles, responsabilidades, perfiles— y su mapeo al sistema fijo. No genera ningún documento ni dataset: eso es #9. Su conclusión alimenta #9 (qué crear y qué esperar) y #5 (qué autorizar).

## 2. Por qué importa tu parte

Sin perfiles, el generador inventa datos incoherentes y nadie sabe qué resultado esperar. Con perfiles + mapeo, cada documento falso tiene un dueño verosímil y cada prueba un resultado esperado: así se comprueba si el sistema cumple.

## 3. Objetivo y resultado esperado

| Entregable | Evidencia |
|---|---|
| `docs/proyecto/ROLES.md` | Distinción planta/sistema, catálogo base, tabla rol × acción × alcance, receta de mapeo para C2 |
| 3 usuarios demo con perfil | Descritos en `ROLES.md`: puesto ficticio, responsabilidades, rol base, alcance |
| Mapeo puesto→rol del organigrama | Cada puesto del `CASO.md` cae en un rol base, con ejemplo worked |

## 4. Cómo hacerlo (pasos, con ejemplo)

1. Extrae los puestos del organigrama (`CASO.md`): Planeación, Calidad, Almacén, Admin y sus responsabilidades.
2. Describe 3–5 perfiles ficticios (nombre, puesto, qué hace cada día, qué documentos toca). Idea: un almacenista que registra recepciones, una jefa de calidad que libera rollos, un planeador que emite programas.
3. Mapea cada puesto a un rol base (`admin`, `planeacion`, `calidad`, `almacen`) con alcance (propio, departamento, planta). Ejemplo: almacenista → `almacen` con alcance propio (solo sus recepciones); jefa de calidad → `calidad` con alcance planta (libera R-Q1). Si un puesto no encaja, cae al rol más restrictivo + aviso; jamás se crea un rol en código.
4. Arma la tabla rol × acción (ver, subir, confirmar, configurar) × alcance. Terminado: cada regla R-P1..T1 y R-Q1 tiene un rol responsable.
5. Revisa con Kira (qué ve cada rol) y Emmanuel (#5) antes del 15-oct. Terminado: objeciones resueltas o anotadas.

Siguiente paso → #9 (no lo desarrolles aquí): con estos perfiles y resultados esperados, #9 define los formatos y genera los documentos. Sin esta matriz, #9 no sabe qué crear.

## 5. Entradas y salidas

- Recibe: organigrama y reglas (`CASO.md`), familias (v0 #58), RF-06.
- Entrega: matriz a Emmanuel (#5) y Kira; perfiles a #9. Todo por PR desde `feat/29-9-matriz-dataset`.

## 6. Referencias y caja de herramientas (tú eliges cuáles usar)

Principio: este brief te da contexto y criterio, no soluciones. Tú decides
los roles, los alcances y el mapeo con tu criterio; la revisión del 16-oct
afirma o devuelve con motivos. Nada se cierra antes de que propongas.

Para decidir sola, sin depender de nadie:

- `docs/proyecto/CASO.md` — organigrama y responsabilidades. Tu materia
  prima: extrae los puestos de aquí (Planeación, Calidad, Almacén, Admin).
  No inventes departamentos que el caso no tiene.
- `docs/proyecto/REQUISITOS.md` — RF-06 (qué debe poder hacer cada rol:
  ver, subir, confirmar, configurar) y RF-08 (qué familias toca cada
  perfil). Si un requisito no te dice el alcance, tú lo propones y lo
  justificas en una línea.
- ADR-0009 (`docs/decisiones/ADR-0009-reglas-del-caso-como-datos.md`) —
  las reglas viven como datos, nunca como `if` en código. Tu tabla debe
  poder leerse como datos.
- ADR-0006 (`docs/decisiones/ADR-0006-ia-propone-humano-dispone.md`) —
  tus perfiles son propuesta experta que el equipo afirma; documenta por
  qué elegiste cada mapeo.
- `docs/gestion/PLAN-EPICAS.md` orden 5 — qué esperan #5 (RBAC) y #9
  (dataset) de ti: matriz + 3 usuarios demo con resultado esperado.
- Modelo de permisos (solo lectura, sin instalar nada): OWASP
  Authorization Cheat Sheet
  (https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
  + NIST SP 800-162 (https://csrc.nist.gov/pubs/sp/800/162/upd2/final).
  Referencia de motor, no dependencia: https://casbin.org.
- Patrones de folio y medida para tus ejemplos: https://regex101.com.
- Redacción: español claro, como lo explicarías en el sync. Sin formato
  impuesto para los perfiles.

Lo que NO te limitamos: nombres de los perfiles ficticios, si son 3 o 5,
redacción de responsabilidades, orden de la tabla. Lo que sí se devuelve
con motivos (no se cierra en falso): rol inventado en código, puesto del
organigrama sin mapear, o documentos generados (eso es #9).

## 7. Cómo trabajar

- `/tarea 29`, 1 issue En progreso. Español. Duda 30 min en el issue; bloqueo >24 h con `bloqueado`.

## 8. Criterios de aceptación

- [ ] `ROLES.md` cubre 4 roles, 4 acciones, 3 alcances y las 7 reglas con responsable.
- [ ] 3 usuarios demo con perfil completo y mapeo justificado.
- [ ] Kira y Emmanuel revisaron (objeciones cerradas).
- [ ] `bun run verify` verde.

No es done si: un rol se inventó en código; un puesto quedó sin mapear; se generaron documentos (eso es #9).

## 9. Riesgos nombrados

#29 vencía 30-sep. Mitigación: alcance recortado a matriz (el dataset ya es #9); cierra 16-oct o es bloqueo.

## 10. Revisión

Viernes 16-oct con Erik: matriz afirmada. Después: #9 genera, #5 autoriza.

## Versión corta (descripción del issue)

> [29] Matriz + perfiles — Carlos, 13→16-oct. ROLES.md, mapeo puesto→rol, 3 usuarios demo. Sin generar documentos (eso es #9). Detalle: `docs/briefs/BRIEF-29-matriz-roles-y-dataset.md`.
