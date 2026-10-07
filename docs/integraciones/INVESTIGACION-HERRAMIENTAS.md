# Investigación de herramientas para agentes y modelos

Entregable de
[`docs/briefs/BRIEF-INVESTIGACION-HERRAMIENTAS.md`](../briefs/BRIEF-INVESTIGACION-HERRAMIENTAS.md).
Consultado el 2026-10-05. Toda afirmación lleva fuente y fecha. Lo que no se pudo
confirmar dice **no confirmado** y no se rellena por suposición (regla 3 del brief).

Conclusión corta: **no se instala ningún servidor MCP**. Ninguno pasa los siete
criterios. Lo que sí entra son dos skills oficiales, cuando haya alguien que las
instale y las revise.

## 1. Informe por candidata

### 1.1 Skills oficiales de Angular

- Mantiene: Angular (el dueño de la tecnología).
- Enlace: <https://angular.dev/ai/agent-skills>. Repositorio:
  <https://github.com/angular/skills>
- Commit verificado: `2051adcd10bb`
- Licencia: **no demostrada.** La ruta `LICENSE` del repositorio devuelve
  HTTP 404. Una afirmación anterior de que era MIT no tiene respaldo.
- Actividad: repositorio oficial, con releases de la rama 22.
- Requisitos: cliente de agente que soporte skills; Node o el CLI de Angular.

| # | Criterio | Respuesta |
|---|---|---|
| 1 | Oficialidad | Sí. La publica Angular |
| 2 | Mantenimiento | Sí |
| 3 | Licencia | **No confirmado.** Sin LICENSE verificable |
| 4 | Credenciales | Sí, ninguna |
| 5 | Versionable | Sí, por commit |
| 6 | Ancho de contexto | Sí, no agrega herramientas al contexto |
| 7 | Encaje | Sí. El front es Angular 22 zoneless |

**Veredicto: pendiente, no descartada.** Falla el 3 por una razón formal y
superable: confirmar la licencia en el repositorio. Responsable: Kira, K1.

### 1.2 Skills oficiales de Prisma

- Mantiene: Prisma.
- Enlace: <https://github.com/prisma/skills>
- Commit verificado: `be16a8740d013`
- Licencia: MIT, verificada.
- Instalación: `bunx @prisma/cli@7.10.0 agent install`.
- Requisitos: Prisma 7. El CLI se fija a 7.10.0, nunca `@latest`.
- Skills que aplican aquí: `prisma-postgres-setup`,
  `prisma-driver-adapter-implementation` (el proyecto usa `PrismaPg`),
  `prisma-client-api`, `prisma-cli`, `prisma-upgrade-v7`.

| # | Criterio | Respuesta |
|---|---|---|
| 1 | Oficialidad | Sí |
| 2 | Mantenimiento | Sí |
| 3 | Licencia | Sí, MIT |
| 4 | Credenciales | Sí, ninguna |
| 5 | Versionable | Sí |
| 6 | Ancho de contexto | Sí |
| 7 | Encaje | Sí, alta: `prisma.config.ts` y el driver adapter son territorio E1 |

**Veredicto: entra.** Es la candidata con mejor encaje: cubre exactamente la
complejidad que este proyecto ya tiene y que menos gente domina (adaptador de
driver en Prisma 7). Responsable: Emmanuel, M1.

### 1.3 MCP del CLI de Angular

- Enlace: <https://angular.dev/ai/mcp>. Verificado: HTTP 200 el 2026-10-05.
- Licencia, versión y capacidades: **no confirmado.** No se comprobó si el
  endpoint entrega un servidor MCP ejecutable o es documentación. El brief
  prohíbe afirmar capacidades sin evidencia.

| # | Criterio | Respuesta |
|---|---|---|
| 1 | Oficialidad | Sí |
| 2 | Mantenimiento | Sí |
| 3 | Licencia | No confirmado |
| 4 | Credenciales | No confirmado |
| 5 | Versionable | No confirmado |
| 6 | Ancho de contexto | No confirmado. Un servidor de CLI suele exponer muchas herramientas |
| 7 | Encaje | Sí, si es lo que dice |

**Veredicto: sin verificar.** Si se confirma que expone menos de unas 10
herramientas útiles, se reevalúa. Queda como pregunta abierta, no como descarte.

### 1.5 Context7

- Qué es: MCP remoto de documentación de librerías, siempre "lo actual".

| # | Criterio | Respuesta |
|---|---|---|
| 1 | Oficialidad | No. Es un tercero |
| 2 | Mantenimiento | Sí |
| 3 | Licencia | No confirmado |
| 4 | Credenciales | Depende del plan |
| 5 | Versionable | **No.** Consulta contenido no fijado por diseño |
| 6 | Ancho de contexto | Alto |
| 7 | Encaje | Parcial |

**Veredicto: descartado por el criterio 5.** Contradice directamente el punto 5
de ADR-0007: una referencia a un remoto tiene que apuntar a una revisión exacta.
Una herramienta cuyo valor es no estar fijada no puede estar en un contrato
compartido por cuatro personas. Además no es reproducible: dos personas
preguntando el mismo día reciben respuestas distintas.

### 1.6 Harnesses: superpowers, gstack, ECC

**superpowers** (`obra/superpowers`): release `v6.4.2`, commit
`8ca22dba9a94`. Conjunto de skills de flujo de trabajo para agentes. Es el que
manda el propio harness de desarrollo del equipo.

| Criterio | Respuesta |
|---|---|
| 1 | Oficialidad | No. Es un tercero |
| 5 | Versionable | Sí, por tag y commit |
| Contradicción con `AGENTS.md` | **Parcial.** Sus skills de proceso presuponen un flujo de trabajo y priorizan el uso de skills sobre la lectura del repositorio. `docs/REGLAS.md` manda lo contrario: el repositorio es la autoridad y el agente debe leer `AGENTS.md` primero |

**gstack** y **ECC**: **no confirmados.** No se localizó fuente oficial
verificable de ninguno en esta consulta. Sin fuente, no hay candidato.

**Veredicto: superpowers no se declara como dependencia del proyecto.** Se usa
en el entorno del equipo, fuera del repositorio, y en ese papel no viola nada.
Lo que no puede hacer es_replace el contrato del repositorio. La tensión está
documentada aquí para que sea visible, no para discutirla de nuevo cada semana.

### 1.7 Modelos de IA

Estrategia y criterios en [`docs/ingenieria/IA.md`](../ingenieria/IA.md). Lo que
esta investigación añade, verificado:

- `DatoOficial.embedding` es `vector(768)`. **La dimensión está fijada en el
  esquema**, así que el modelo de embeddings se elige antes de poblar la tabla, y
  cambiarlo después implica migrar los vectores.
- El criterio que decide no es la calidad del modelo: es si produce 768
  dimensiones y si admite salida estructurada con esquema.
- Proveedores en nube: **no confirmados en esta consulta.** No se verificaron
  precios, límites de datos ni condiciones de retención. Sin eso, y sin la
  autorización explícita que `integraciones/ACCESOS.md` exige para
  `IA_NUBE_ACTIVADA`, no se proposes ninguno.

**Veredicto: ninguna herramienta de modelos entra ahora.** El trabajo real es
elegir el modelo y escribir el ADR, no instalar nada.

## 2. Tabla comparativa, ordenada por recomendación

| # | Candidata | Recomendación | Motivo en una línea |
|---|---|---|---|
| 1 | Skills oficiales de Prisma | **Instalar** | Encaje exacto con el driver adapter y `prisma.config.ts`. MIT. Fijada a 7.10.0 |
| 2 | Skills oficiales de Angular | Instalar, con confirmación de licencia | Sin LICENSE verificable. Resolver antes |
| 3 | MCP del CLI de Angular | Verificar primero | No se sabe si es servidor o documentación |
| 4 | Engram | Seguir usando | Ya está. No es MCP del proyecto |
| 5 | Modelos locales (Ollama) | Más adelante | No hay modelo que validar ni `ValidationPipe` |
| 7 | Context7 | **Descartar** | No es versionable. Contradice ADR-0007 |
| 8 | Harnesses externos | **No usar como contrato** | No escriben en el repo y chocan con `REGLAS.md` |
| 9 | Modelos en nube | **Fuera de alcance** | Sin autorización ni datos de costo verificados |

## 3. Herramientas nuevas que el catálogo no contemplaba

Encontradas al revisar el conjunto de repositorios marcados con estrella por el
equipo. **Ninguna entra**: se anotan para cuando haya hueco y hay que evaluarlas
con los mismos siete criterios, no antes.

| Herramienta | Qué resolvería | Por qué no ahora |
|---|---|---|
| `Gentleman-Programming/gentle-ai` | Configuración multiproyecto para distintos clientes de agente | Es justo lo que hace `CLAUDE.md` + `opencode.json`. Duplicaría una capa que ya existe |
| `DeusData/codebase-memory-mcp` | Contexto del código por grafo | Criterio 5 sin verificar. El proyecto tiene 5 commits; no hay código que recordar todavía |
| `tirth8205/code-review-graph` | Revisión con grafo | No confirmado. Depende del anterior |
| `zai-org/GLM-OCR`, `opendataloader-pdf`, `bytedance/Dolphin` | OCR y extracción de PDF | `RF-02` exige 90 % de precisión en escaneados reales. Ninguno se ha medido contra los datos del proyecto |
| `Tarquinen/opencode-dynamic-context-pruning` | Recorte de contexto | El proyecto cabe de sobra en el contexto. No es un problema aquí |

**Sobre el conteo de estrellas: no se usa para ordenar.** Los contadores del
índice del equipo son anómalos y no corresponden a repositorios reales. Ordenar
por estrellas es ordenar por ruido.

## 4. Descartes, con motivo

| Descartes | Criterio | Motivo |
|---|---|---|
| Context7 | 5 | No versionable por diseño |
| PostgreSQL MCP | 1 | Habla de otro PostgreSQL, no del del proyecto |
| BullMQ MCP / Redis MCP | 1 | Idem: el BullMQ y el Redis son del proyecto |
| Observabilidad de Bull (`@nestjs/bull`) | 1 | Observa `Bull`, no `BullMQ`, que es lo que usa el proyecto |
| Documentación de Redis | — | Es documentación, no un servidor MCP |
| Harnesses como contrato del proyecto | 7 | No escriben en el repo y sus reglas compiten con `AGENTS.md` |

## 5. Ubicación propuesta

| Herramienta aprobada | Dónde vive | Cómo |
|---|---|---|
| Skills de Prisma | Máquina de cada persona, más la versión base fijada en `ingenieria/STACK.md` | Enlace a `prisma/skills` con commit. **No se copian al repositorio** mientras no necesiten adaptación: criterio de copia es "necesita modificación" |
| Skills de Angular | Igual | Igual. Fijadas por commit en `STACK.md` |
| Configuración del cliente | `opencode.json` (versionado), `CLAUDE.md` (versionado), `.mcp.json` (versionado) | Ya aplicado |
| Credenciales | `.env` local | Nombres en `.env.example`, valores nunca versionados |

## 6. Riesgos por herramienta

| Herramienta | Coste de contexto | Credenciales | Mantenimiento | Deprecación |
|---|---|---|---|---|
| Skills de Prisma | Bajo: se cargan por tarea | Ninguna | Alto, oficial | Baja, siguen a Prisma |
| Skills de Angular | Bajo | Ninguna | Alto, oficial | Media:/license sinclarar |
| Engram | Medio: entra el contexto de sesión | Propia, del proyecto | Medio | Media: no es estándar del stack |

## 7. Preguntas abiertas

Cosas que esta investigación **no** pudo confirmar. Cada una es el motivo de una
decisión que todavía no se toma:

1. ¿Licencia real de `angular/skills`? Sin eso, K1 no puede instalarlas.
2. ¿`angular.dev/ai/mcp` es un servidor ejecutable? Define si vale la pena
   evaluarlo.
3. ¿`gstack` y `ECC` existen como proyectos mantenidos? No se halló fuente.
4. ¿Qué modelo de embeddings produce exactamente 768 dimensiones y admite
   salida estructurada? Sin esto, `DatoOficial.embedding` no se puebla.
5. ¿Qué presupuesto de datos y de costo tendría un modelo en nube? Sin
   autorización de `IA_NUBE_ACTIVADA` y sin cifras, no se propone ninguno.
6. ¿Dónde vive el directorio de skills del equipo? ADR-0007 lo dejó pendiente y
   sigue pendiente. No es bloqueante para los candidatos 1 y 2, que se enlazan
   sin copiar.

## 8. Fuentes

Todas consultadas el 2026-10-05:

| Fuente | Qué confirmó |
|---|---|
| <https://github.com/obra/superpowers> | `v6.4.2`, commit `8ca22dba9a94` |
| <https://github.com/angular/skills> | commit `2051adcd10bb`; LICENSE responde 404 |
| <https://github.com/prisma/skills> | commit `be16a8740d013`, MIT |
| <https://angular.dev/ai/mcp> | HTTP 200 |
| Registro de npm | `@nestjs/observe@latest` = 0.3.6; `@prisma/cli@latest` = 8.0.0-rc.20; `prisma@prev` = 7.10.0; `skills` CLI = 1.7.0 |
| Índice personal de marcadores | 196 marcadores, 0 de herramientas de agente, 12 kits de UI de Angular |
