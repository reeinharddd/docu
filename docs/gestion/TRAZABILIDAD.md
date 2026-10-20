# Gestión: trazabilidad requisito → épica → issue → PR → evidencia

Estado: vigente. Verificado contra GitHub el 2026-10-17 (54 issues: 29
abiertos / 25 cerrados, 5 milestones: Cierre de diseño 23-oct, Contrato de datos
30-oct, Fin del desarrollo 20-nov, Listos 27-nov, Presentación 1-dic), tras la
migración desde Monday
(`decisiones/ADR-0008-github-como-gestor-del-equipo.md`).

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
| RF-01 | API | Backend / Frontend | 1–2 | #12, #3, #4 |
| RF-02 | API / Permisos | Backend / Autenticación | 2 | #3, #5 |
| RF-03 | API | Backend / Frontend | 1–2 | #12, #4 |
| RF-04 | Documentos | Frontend | 2 | #4 |
| RF-05 | `agent/tools` | Backend | 3 | #39 |
| RF-06 | Permisos / Infraestructura | Autenticación / Infraestructura | 1–2 | #10, #5 |
| RF-07 | — | transversal (Could) | — | Sin issue, a propósito |
| RF-08 | Infraestructura | Infraestructura / Base de datos | 2–3 | #7, #8 |
| RNF-01 | — | Diseño / Frontend | 1 | #11, #41 |
| RNF-05 | Infraestructura | Infraestructura | 1 | #10 |
| RNF-06 | Infraestructura | Infraestructura | 1 | #10 |
| RNF-02 | — | QA/Documentación | 1 | #9 |
| RNF-03 | Permisos | Autenticación | 2–3 | #5, #8 |
| RNF-07 | Auditoría | QA/Documentación | 1–4 | #6, #9, #13, #30, #74 |

## Huecos que siguen abiertos

| # | Hueco | Acción propuesta | Estado |
|---|---|---|---|
| 1 | `RF-05` no tiene issue | — | **Cerrado**: #39 (Emmanuel, `Agent3835`) |
| 2 | `RF-08` sin etiqueta en Configuración 2 | — | **Cerrado**: #8 lleva `RF-08` |
| 3 | #7, #9, #13, #30 sin requisito | — | **Cerrado**: `RF-08`, `RNF-02`/`RNF-07`, `RNF-07`, `RNF-07` (tomados de los criterios de cada issue) |
| 6 | RF-07 y RF-08 sin módulo | Definir módulo o declararlos transversales | Abierto |
| 7 | Dependencias vacías | — | **Cerrado**: 10 *blocked by* nativos (ver `PLAN-EPICAS.md`) |
| 8 | #18–#26 sin etiquetas propias | Heredan requisito, épica y sprint del padre (#3, #4, #5, #9, #12). Monday dado de baja total el 2026-10-09: nada vive ahí, todo se opera en GitHub | **Cerrado** |

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
