# Gestión: trazabilidad requisito → épica → issue → PR → evidencia

Estado: vigente. Verificado contra GitHub el 2026-11-08 (post-cierre de #23 y
#85): 26 issues abiertos (19 con milestone + 7 épicas sin milestone a
propósito), 30 cerrados, 4 milestones abiertos (C1 modelo y BD 12-nov con 3
abiertos — #58, #62 y #45 —, C1 vertical completa 19-nov con 13, Avances
profesor 24-nov con 1) y 5 cerrados — incluye `Contrato de datos congelado`,
cerrado vacío el 2026-11-03 por ser reliquia de Monday (su alcance real vive
en `C1 modelo y BD`: #62 y #23). Los
contadores de la API de milestones mienten (stale): los números de arriba se
miden con queries directas, no con `open_issues`. La migración desde Monday
está en (`decisiones/ADR-0008-github-como-gestor-del-equipo.md`).

## La cadena

Requisito (etiqueta `RF-0n`) → épica (etiqueta `epica:*`) → issue → PR con
`Closes #N` → evidencia adjunta al PR. `RF-07` y `RNF-07` son de calidad
transversal; el resto mapea a épica.

```bash
gh issue list --state all --label RF-01   # todo lo que implementa RF-01
gh issue list --label req:pendiente       # huecos de trazabilidad
```

| Requisito | Módulo | Épica | Sprint | Issue |
|---|---|---|---|---|
| RF-01 | API | Backend / Frontend | 3 | #12, #3, #4, #46, #85 |
| RF-02 | API / Permisos | Backend / Autenticación | 3 | #3, #5, #85 |
| RF-03 | API | Backend / Frontend | 3 | #12, #4, #44 |
| RF-04 | Documentos | Frontend | 3 | #4, #85 |
| RF-05 | `agent/tools` | Backend | 3 | #39 |
| RF-06 | Permisos / Infraestructura | Autenticación / Infraestructura | 3 | #5, #44 |
| RF-07 | — | transversal (Could) | — | Sin issue, a propósito |
| RF-08 | Infraestructura | Infraestructura / Base de datos | 3–4 | #7, #8, #58, #59, #60, #62 |
| RNF-01 | — | Diseño / Frontend | 3 | #11, #84 |
| RNF-02 | — | QA/Documentación | 3 | #61 |
| RNF-03 | Permisos | Autenticación | 3–4 | #5, #8 |
| RNF-04 | Asíncrono | Backend | 3 | #46 |
| RNF-05 | Infraestructura | Infraestructura | 2 | #87 |
| RNF-06 | Infraestructura | Infraestructura | 2 | #87 |
| RNF-07 | Auditoría | QA/Documentación | 2–4 | #6, #61, #83, #86, #87, #88, #89 |

## Huecos que siguen abiertos

| # | Hueco | Acción propuesta | Estado |
|---|---|---|---|
| 1 | `RF-05` no tiene issue | — | **Cerrado**: #39 (Emmanuel, `Agent3835`) |
| 2 | `RF-08` sin etiqueta en Configuración 2 | — | **Cerrado**: #8 lleva `RF-08` |
| 3 | #7, #9, #13, #30 sin requisito | — | **Cerrado**: `RF-08`, `RNF-02`/`RNF-07`, `RNF-07`, `RNF-07` (tomados de los criterios de cada issue) |
| 6 | RF-07 y RF-08 sin módulo | Definir módulo o declararlos transversales | Abierto: RF-08 es transversal (modelo, seed, contrato y configuración) |
| 7 | Dependencias vacías o invertidas | — | **Cerrado 2026-11-03**: los *blocked by* que apuntaban a issues cerrados (#9, #10, #17, #32, #41) se retiraron; las aristas invertidas se corrigieron (#60 y #62 ya no esperan a #59; #61 espera a #23, #39 espera a #46). El grafo de `PLAN-EPICAS.md` ahora es igual al de GitHub |
| 8 | #18–#26 sin etiquetas propias | Heredan requisito, épica y sprint del padre (#3, #4, #5, #9, #12). Monday dado de baja total el 2026-10-09: nada vive ahí, todo se opera en GitHub | **Cerrado**; #18/#19/#20 (sub-issues auto de #3 con cronograma heredado) se cerraron *not planned* el 2026-11-03 |

## Reglas

1. Un issue sin etiqueta de requisito no entra a un sprint cerrado. Los
   entregables académicos (`tipo:entregable`) y los hitos quedan exentos.
2. Un requisito sin issue no se considera empezado, por muy avanzado que esté el
   código.
3. Un issue se cierra con un PR fusionado que lo referencie o con evidencia en
   el comentario de cierre.
4. Esta tabla se corrige en el mismo PR en que cambian las etiquetas.
5. Un sub-issue hereda requisito, épica y sprint de su padre salvo etiqueta
   propia en contra. Monday no es fuente de nada: está dado de baja y solo se
   cita como procedencia histórica.
