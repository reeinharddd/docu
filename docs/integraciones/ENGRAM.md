# Integración: Engram (memoria del proyecto)

Estado: vigente. Verificado el 2026-10-05.
Variable: `ENGRAM_PROYECTO=docu` (no es secreto).

## Qué es y qué no es

Engram guarda **contexto de sesión**: lo que se descubrió, lo que se decidió y
por qué, y el índice para encontrarlo después. Vive fuera del repositorio.

No es fuente de verdad de nada canónico. Si un dato debe ser verdad en el
tiempo, va en `docs/` y se versiona. La memoria indexa, no reemplaza
(`docs/README.md`).

| Fuente | Autoridad sobre |
|---|---|
| `docs/` | Código, reglas, decisiones, contrato operativo |
| GitHub Issues y Project | Estado, responsable, fechas |
| Engram | Contexto de sesión y descubrimientos |

## Reglas de escritura

1. **Se guarda lo que costó trabajo averiguar**, no lo que ya está en el repo.
   Una versión de paquete, un nombre de columna, un gotcha de la API: eso sí.
   Un ADR: no, ese va en `docs/decisiones/`.
2. **Toda memoria con decisión apunta al archivo del repo** que la sostiene. Una
   memoria sin archivo asociado es conocimiento que solo vive en una máquina, que
   es justo lo prohibido.
3. **Nada de secretos.** Ni valores, ni prefijos, ni longitudes de token.
4. **Nada de rutas personales ni de una sola máquina.** El repositorio tiene que
   funcionar en cualquier lado (`README.md`).
5. Si una memoria contradice al repo, **gana el repo** y la memoria se corrige.

## Qué no debe pasar a memoria

| Contenido | Dónde va |
|---|---|
| Por qué se eligió X sobre Y | `docs/decisiones/ADR-NNNN-*.md` |
| Versiones fijadas del stack | `docs/ingenieria/STACK.md` |
| Cómo se gestiona el trabajo | `docs/integraciones/GITHUB-GESTION.md` |
| Cómo se levanta el entorno | `docs/operacion/BOOTSTRAP.md` |
| Qué herramienta se eligió y por qué | `docs/integraciones/HERRAMIENTAS-AGENTE.md` |
| Estado de una tarea | GitHub Issues |

## Descubrimientos que ya están en el repo

No volver a guardarlos en memoria: se consultan en el archivo.

- El listado de Drive exige `fields=files(...)`; el de un archivo no
  (`integraciones/DRIVE.md`).
- `@prisma/cli@latest` es `8.0.0-rc.20` y el proyecto usa Prisma `7.10.0`
  (`integraciones/HERRAMIENTAS-AGENTE.md`).
