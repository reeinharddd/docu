# BRIEF — Investigación de herramientas para agentes y modelos

Estado: listo para asignar. Formato según `docs/plantillas/BRIEF.md`.

## 0. Encabezado

- Identificador: investigación de herramientas del agente
- Dueño: por asignar (lo define quien lo delega)
- Tipo: investigación, sin escritura de código
- Requisitos relacionados: ninguno directamente; sostiene
  [ADR-0007](../decisiones/ADR-0007-contrato-de-herramientas-del-agente.md)
- Depende de: nada. Bloquea: la capa de herramientas del proyecto

## 1. Contexto y por qué importa

DOCU es un monolito modular: front Angular, API NestJS, datos PostgreSQL con
Prisma, cola BullMQ sobre Redis, y modelos de IA para clasificación y consulta.
El equipo trabaja con agentes de programación, y cada teammate tiene un cliente
distinto con herramientas distintas.

El repositorio decidió que **las herramientas del agente son parte del
repositorio o se referencian a un remoto con versión fijada**. Ya existe un
catálogo de candidatas en
[`docs/integraciones/HERRAMIENTAS-AGENTE.md`](../integraciones/HERRAMIENTAS-AGENTE.md)
y un criterio de selección de siete puntos. Falta la investigación que
compruebe si esas candidatas sirven, y si hay mejores.

Si esta investigación sale mal, el equipo sigue trabajando, pero con
herramientas distintas por máquina: eso ya pasó y es el problema que se quiere
cerrar.

## 2. Qué tienes disponible para trabajar

**Solo el repositorio.** No hay contexto previo, no hay sesiones anteriores y no
hay otras rutas que consultar. Todo lo que necesitas está en el repositorio y en
las fuentes públicas que el repositorio referencia.

Documentos que debes leer antes de empezar:

| Documento | Qué te da |
|---|---|
| `AGENTS.md` | Reglas del proyecto y comandos |
| `docs/README.md` | Taxonomía documental y reglas de ubicación |
| `docs/decisiones/ADR-0007` | La decisión que esta investigación sirve |
| `docs/ingenieria/STACK.md` | Stack con versiones confirmadas y enlaces oficiales |
| `docs/ingenieria/IA.md` | Estrategia de modelos, capa de designación de categorías |
| `docs/proyecto/REQUISITOS.md` | Qué tiene que hacer el sistema, incluido el corte de alcance |
| `docs/integraciones/HERRAMIENTAS-AGENTE.md` | Candidatas y criterio de evaluación |
| `docs/ACCESOS.md` | Variables de entorno disponibles y política de permisos |

## 3. Objetivo y entregables

**Objetivo:** entregar un informe evaluado, con fuentes verificables y
versiones confirmadas, de las herramientas de agente y de modelos que este
proyecto debería adoptar, y de las que debe descartar.

Entregables, todos obligatorios:

1. **Informe por herramienta candidata**, una sección por herramienta, con:
   nombre, quién la mantiene, enlace oficial, versión o commit actual, licencia,
   estado de mantenimiento con fecha, requisitos para usarla, y las respuestas a
   los siete criterios de `HERRAMIENTAS-AGENTE.md` con sí o no y motivo.
2. **Tabla comparativa final** con las candidatas ordenadas por recomendación.
3. **Lista de herramientas nuevas** que la investigación descubra y que el
   catálogo actual no contempla.
4. **Lista de herramientas descartadas** con el motivo concreto del descarte.
5. **Propuesta de ubicación** para cada herramienta aprobada: enlace con versión
   fijada, copia en el repositorio, o solo configuración.
6. **Riesgos** por herramienta: coste de contexto, dependencia de credenciales,
   riesgo de mantenimiento y de deprecación.

## 4. Alcance exacto de la investigación

### 4.1 Herramientas oficiales por tecnología

Para **cada** tecnología de esta lista: ¿existe algo oficial para agentes? ¿Qué
cubre exactamente? ¿Con qué versión actual? ¿Cómo se instala y cómo se fija la
versión?

- **Angular 22**: skills para agentes, servidor MCP del CLI, y cualquier otra
  publicación oficial reciente.
- **Prisma 7**: skills oficiales, incluido lo relativo a *driver adapters*, que
  este proyecto usa; y configuración por `prisma.config.ts`.
- **NestJS 12**: guías oficiales para agentes, así como las configuraciones
  modernas que la versión trae y el proyecto aún no usa.
- **Bun 1.4.2**: herramientas oficiales de diagnóstico y cualquier skill
  oficial.
- **PostgreSQL 18 con pgvector**: guías oficiales y herramientas de apoyo.
- **Redis 8 y BullMQ 6**: herramientas oficiales, y requisitos operativos que
  la cola impone.
- **Monday**: qué ofrece el MCP oficial en lectura y en escritura, con sus
  límites reales.

### 4.2 Harnesses y flujos de trabajo

Investiga y compara, con enlaces verificables: **superpowers**, **gstack**,
**ECC** y cualquier otro harness equivalente que aparezca con nuestro
mantenimiento. Para cada uno: qué incluye, cómo se instala, si escribe dentro
del repositorio, licencia, actividad reciente y qué reglas impone.

Pregunta obligatoria de cada uno: ¿sus reglas contradicen las de `AGENTS.md` y
`docs/REGLAS.md` de este proyecto? Si las contradice, queda descartado y se dice
por qué.

### 4.3 Modelos de IA

Sin proponer marcas concretas todavía: primero **criterios**. Investiga qué
criterios aplican para elegir un modelo de clasificación de documentos y uno de
consulta en lenguaje natural sobre datos estructurados, considerando: calidad
en español, salidas estructuradas, umbral de hardware razonable para laptops,
licencia, capacidad de *embeddings* y control de versiones para reproducibilidad.

Incluye: qué familias de modelos disponibles en ejecución local admiten salidas
estructuradas con esquema y qué dimensión de vectores produce cada una, porque
el esquema de datos del proyecto fija una dimensión y ambos deben coincidir.

Investiga también las alternativas en la nube que se considerarían con
autorización explícita: requisitos de credencial, de datos y de costo, y qué
implican para la reproducibilidad de la evidencia.

### 4.4 Antipatrones y calidad de herramientas

Investiva qué se ha publicado sobre herramientas de agente de mala calidad
para poder fijar reglas propias: código generado sin verificación, documentación
que describe lo que debería existir en lugar de lo que existe, pruebas que se
adaptan al código en lugar de al revés, y casos de herramientas que rompen
proyectos por depender de versiones no fijadas.

## 5. Reglas de la investigación

1. **Solo fuentes oficiales o de la comunidad mantenida.** Nada de tutoriales de
   agregador, listas de enlaces sin autor o respuestas de foro.
2. **Toda afirmación lleva enlace y fecha.** Un dato sin fuente no existe.
3. **Versiones confirmadas, no recordadas.** Si no puedes confirmar la versión
   actual, escribe "no confirmado" en lugar de suponer.
4. **No inventes capacidades.** Si no hay evidencia de que una herramienta haga
   algo, no lo afirmes.
5. **No ejecutes instalaciones.** Esta investigación es de lectura. No modifiques
   el repositorio, no crees archivos fuera de tu informe y no hagas commits.
6. **No busques credenciales.** Los nombres de las variables están en
   `docs/ACCESOS.md` y en `.env.example`. Si necesitas valor para algo, lo
   pides; no lo busques ni lo infieras.
7. **Sin rutas personales.** Tu informe describe el proyecto, no la estructura de
   ninguna máquina.

## 6. Dónde escribir el resultado

Un solo archivo: `docs/integraciones/INVESTIGACION-HERRAMIENTAS.md`, siguiendo el
formato de la sección 3 de este brief.

Estilo de escritura del proyecto: español en documentos, inglés en código y
nombres. Nada de rutas personales, nada de nombres de máquina, nada de emojis.
Tono directo, sin relleno.

## 7. Criterios de aceptación

- [ ] Cada candidata tiene un enlace oficial y una fecha de consulta.
- [ ] Cada candidata responde los siete criterios con motivo.
- [ ] La tabla comparativa ordena por recomendación, no por orden de lectura.
- [ ] Hay una lista explícita de descartes con su motivo.
- [ ] No hay una sola afirmación sin fuente.
- [ ] No hay una sola versión recordada en lugar de confirmada.
- [ ] El informe no menciona rutas ni máquinas.
- [ ] El informe no instala ni modificó nada del repositorio.

## 8. Qué debes devolver al delegar

Un mensaje corto con: el archivo que escribiste, la recomendación principal en
tres líneas, las dos herramientas que más conviene añadir y las dos que conviene
descartar, y la lista de dudas que quedaron abiertas.

Si una duda impide cerrar una recomendación, esa duda va explícita en el
informe con la pregunta exacta, no resuelta por suposición.

## 9. Riesgos de esta tarea

| Riesgo | Mitigación |
|---|---|
| Que la lista de candidatas sea demasiado corta y se pierdan herramientas buenas | El entregable 3 exige buscar herramientas nuevas |
| Que un harness parezca útil y termine siendo subjetividad | Criterio 7 del harness: si contradice las reglas del repo, no entra |
| Que se confundan herramientas oficiales con wrappers de terceros | Exigir que quien mantiene la herramienta sea quien mantiene la tecnología |
| Que el informe se quede en teoría sin decisiones | Cada sección termina en sí o no con motivo |

## 10. Cómo trabajar

- Investiga por capas: primero lo oficial de cada tecnología, luego la
  comunidad, luego los harnesses, luego los modelos.
- Contrasta dos fuentes antes de afirmar un hecho sobre versiones.
- Si algo cambió después de la última fecha registrada en el repositorio,
  dilo: es un hallazgo valioso.
- Ante la duda, escribe la pregunta en el informe. Una pregunta es un resultado
  válido; una suposición, no.