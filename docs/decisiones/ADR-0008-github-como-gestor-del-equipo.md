# ADR 0008 — GitHub Issues y Projects como gestor del equipo, en lugar de Monday

Fecha: 2026-10-06 · Estado: Aceptada
> Vigencia 2026-10-30: los hitos y fechas que este ADR menciona fueron sustituidos por
> `docs/gestion/REPLAN-2026-10-30.md` §9. La decisión no cambia; lo que cambió es el calendario.
Decide: Erik · Revisa: Erik (excepción autorizada: equipo de 4, sin revisor disponible)

## Contexto

El equipo son 4 personas y una materia con fechas duras (23-oct contrato de
datos, 1-dic presentación). Monday era el gestor: tablero `18432808588`, 19
tarjetas y 9 subelementos. En la práctica:

- La cadena requisito → tarea → PR → evidencia (REGLAS 7) se mantenía a mano
  entre dos sistemas y estaba rota: 12 de 19 tarjetas sin requisito, columna
  `Depende de` vacía en las 19, una fecha dura escondida en un subelemento.
- El MCP oficial de Monday exige credencial privada y fue rechazado
  (`integraciones/MCP.md`); el agente leía el tablero con GraphQL a mano y
  se quedaba sin presupuesto de complejidad con facilidad.
- El plan gratuito de Monday no cubre automatizaciones ni integraciones útiles
  para 4 personas.

El agente ya opera GitHub con `gh` y el servidor MCP de GitHub, sin
credenciales nuevas.

## Decisión

El estado del trabajo vive en **GitHub**, en el mismo repositorio que el código:

- **Issues** = tareas, historias y entregables. Subtareas como *sub-issues*.
- **Dependencias** = relación nativa *blocked by* entre issues.
- **Milestones** = hitos con fecha (`Cierre de diseño`, `Contrato de datos
  congelado`, `Fin del desarrollo`, `Listos para presentar`, `Presentación de
  diciembre`).
- **Etiquetas** = `tipo:*`, `epica:*`, `sprint:*`, `prioridad:*`, `RF-0n`,
  `RNF-0n`, `req:pendiente`, `bloqueado`.
- **Project** (tablero de usuario `reeinharddd`) = vistas de tablero, tabla y
  roadmap, con los campos `Estado`, `Inicio` y `Fin`.

Monday queda congelado como histórico de solo lectura. No se borra
(REGLAS 5) y no se vuelve a escribir.

## Alternativas consideradas

| Alternativa | Por qué no |
|---|---|
| Seguir en Monday | Trazabilidad manual en dos sistemas, MCP rechazado, funciones útiles detrás de pago |
| Plane Cloud (gratis hasta 12 personas, MCP oficial) | Mejor interfaz de gestión, pero otra cuenta, otro login y la trazabilidad con PR se arma a mano |
| Linear (gratis, personas ilimitadas, MCP oficial) | Tope de 250 issues activos y 2 equipos: bloquea crear tareas a mitad de sprint |
| Jira Free | Pesado para 4 personas; curva de configuración sin beneficio frente a GitHub |

## Consecuencias

- **A favor**: un PR que dice `Closes #N` cierra la tarea y deja la evidencia
  enlazada sola. Cero credenciales nuevas: basta la cuenta de GitHub. El agente
  lee y escribe con `gh` o el MCP de GitHub. Sin tope de tareas.
- **En contra**: el Project de un repositorio de usuario no tiene permisos
  finos por campo; los compañeros deben ser colaboradores del repositorio.
  Los campos de Project necesitan el scope `project` en el token de `gh`.
- **Riesgo residual**: que la gente siga mirando Monday. Mitigación: el tablero
  de Monday se marca como histórico y `integraciones/MONDAY.md` apunta aquí.

## Evidencia

- Migración del 2026-10-06: 15 tarjetas → issues #3–#17, 9 subelementos →
  sub-issues #18–#26, 4 milestones de Monday + la fecha del contrato → 5
  milestones, 8 dependencias *blocked by*. Las 4 tarjetas `Listo` quedaron
  cerradas como `completed`.
- Exportación cruda de Monday conservada fuera del repositorio; los IDs de
  tarjeta de Monday quedan en el cuerpo de cada issue.

## Qué nos haría revertirla

Que el equipo crezca a más de 12 personas con roles que no deban ver el código,
o que la materia exija un gestor específico. En ese caso, Plane es el siguiente
candidato.

## Enmienda 2026-10-06: baja total de Monday

La cuenta de Monday llegó al límite del plan gratuito y se da de baja. Cambia
una consecuencia, no la decisión: en lugar de conservar Monday como histórico de
solo lectura, se extrajo todo su contenido y se eliminan del repositorio el
archivo de integración y sus variables de entorno.

Qué se extrajo y a dónde fue:

| En Monday | En GitHub o en el repositorio |
|---|---|
| 19 tarjetas de "Gestión del proyecto" | Issues #3–#17 y milestones |
| 9 subelementos | Sub-issues #18–#26 |
| 17 comentarios con objetivo, alcance y criterios de hecho | Sección "Alcance y criterios" de cada issue |
| 23 actividades del plan académico EC0935 | `academico/EC0935.md` + 8 issues nuevos (#28–#35) con etiqueta `ec0935` para lo que no tenía equivalente |
| Tablero "Proveedores" | Vacío (5 ítems de plantilla de 2025). Nada que migrar |
| Workdocs y archivos adjuntos | Ninguno |

> Nota 2026-10-09: `academico/EC0935.md` se dio de baja del repo por orden del
> líder. La tabla histórica no cambia.

## Enmienda 2026-10-19: retiro del plan académico ajeno

El plan EC0935 pertenece a **Administración de Proyectos**, no a DOCU, y se
coló en la migración de Monday. Se retiraron sus etiquetas (`ec0935`,
`fase:1..6`), las líneas `Fase EC0935` de los issues cerrados #28–#35 y el
directorio `docs/academico/`. La decisión de este ADR no cambia; DOCU se alinea
solo a sus materias y a `docs/`.
