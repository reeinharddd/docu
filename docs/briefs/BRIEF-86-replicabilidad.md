# BRIEF #86 — Replicabilidad: que otra persona ejecute el caso de principio a fin

## 0. Encabezado

- Issue: #86 — https://github.com/reeinharddd/docu/issues/86
- Dueño: Carlos Ariel Martín Rojas (`WearyBerry`)
- Fechas: 2026-11-17 → 2026-11-19 · Sprint 4 · hito `C1 vertical completa` (19-nov)
- Prioridad / Tipo / Épica / Módulo: alta / tarea / QA-Documentación / replicabilidad
- Requisitos: RNF-02, RNF-07
- Bloqueado por: #61, #59, #45 · Bloquea a: #89

## 1. Contexto

Un sistema que solo su autor puede instalar y operar no es entregable. Este
brief produce el **guion de una pasada**: una persona que no conoce el
proyecto lo ejecuta de principio a fin, sin ayuda, y obtiene el resultado
esperado. Si el guion falla, lo que falla está en el sistema, no en quien lo
usa.

## 2. Por qué importa tu parte

La demo del 24-nov (#89) la ejecuta alguien que no escribió el sistema, y el
profesor puede querer correrlo. Si el camino no está escrito y probado, la
demo se convierte en una sesión de depuración en vivo. Además, este brief es
la prueba final de que lo construido en las dos semanas anteriores sirve de
algo.

## 3. Objetivo y resultado esperado

| Entregable | Evidencia |
|---|---|
| Guion de una pasada | `docs/operacion/REPLICAR.md`: los comandos, en orden, desde el clone limpio hasta el resultado esperado |
| Comprobación de entorno | Los pasos de arranque del entorno (base, Redis, variables) con su verificación |
| Corrida en frío | La corrida completa, desde cero, con su salida y su tiempo |
| Lista de errores conocidos | Lo que se rompió en la corrida y cómo se resolvió, para el próximo |

## 4. Actividades específicas

1. Escribir el guion desde el clone limpio: instalar, configurar variables de
   ejemplo, levantar el entorno, migrar, sembrar, arrancar y comprobar.
   Terminado: no hay paso ambiguo ni supuesto.
2. Probar cada comando en frío y anotar su salida. Terminado: cada paso tiene
   lo que se espera ver.
3. Correr el guion entero de una sentada, sin ayuda. Terminado: el resultado
   es el esperado y el tiempo está medido.
4. Registrar cada error encontrado y su solución. Terminado: la lista de
   errores conocidos está en el documento.
5. Dejar el guion ejecutable como script. Terminado: una persona corre un
   comando y obtiene lo mismo.

## 5. Entradas y salidas

- Recibe: el dataset del mes (#61), el seed (#59), la suite y el arranque
  (#45), y `docs/operacion/BOOTSTRAP.md`.
- Entrega: `docs/operacion/REPLICAR.md` y el script de una pasada, por PR con
  `Closes #86`.

## 6. Referencias y caja de herramientas

- `docs/operacion/BOOTSTRAP.md`: el arranque que ya existe y su diagnóstico.
- `docs/proyecto/EQUIPO.md`: quién es cada persona, para no dejar supuestos
  implícitos.
- `docs/gestion/REPLAN-2026-10-30.md` §6: el dataset no se versiona, se
  regenera.
- `docs/decisiones/ADR-0002-bun-como-runtime-y-gestor.md`: Bun, no npm.
- `docs/ingenieria/STACK.md`: lo que hay que tener instalado.
- `scripts/`: los scripts de arranque que ya existen.

## 7. Cómo trabajar

- Se escribe para alguien que no conoce el repo: si un paso necesita un
  supuesto, el supuesto va explícito.
- Nada de "si ya lo tienes instalado, sáltate esto": el guion es de una
  pasada, desde cero.
- La IA propone el guion; Carlos lo ejecuta en frío y lo corrige con lo que
  se encuentre.

## 8. Criterios de aceptación

- [ ] El guion existe, con pasos numerados y la salida esperada de cada uno.
- [ ] La corrida en frío terminó sin ayuda, con el resultado esperado.
- [ ] El tiempo total está medido.
- [ ] La lista de errores conocidos está escrita.
- [ ] El script de una pasada existe y corre.

### 8.1 Contrato, pruebas y criterio de listo

**Contrato.** Cualquier persona con el repo y Bun puede llevar el caso de
principio a fin siguiendo el guion, sin preguntar nada.

**Criterios (Given/When/Then).**

1. **Given** un clone limpio y el guion, **when** una persona sigue los pasos,
   **then** llega al resultado esperado sin ayuda.
2. **Given** el entorno sin base de datos, **when** se sigue el guion, **then**
   las variables y el arranque están indicados y verificados.
3. **Given** el guion, **when** se ejecuta el script, **then** hace lo mismo que
   la lista de pasos.

**Plan de pruebas.** La corrida en frío completa, cronometrada, con la salida
completa pegada; y la corrida del script.

**Evidencia.** La salida de la corrida en frío, el tiempo medido, la lista de
errores encontrados y el documento final.

**Listo cuando.** La corrida en frío pasó sin ayuda y el guion está en el
repo para el siguiente.

## 9. Riesgos nombrados

Que el guion dependa del entorno de quien lo escribe: la mitigación es que la
corrida en frío se hace en un directorio limpio y sin variables del shell de
desarrollo.

## 10. Revisión

Miércoles 19-nov en el sync: se ve la corrida en frío y se afirma o se
devuelve con motivos. Después: #89 (demo del 24-nov) lo usa como plan B.

## Versión corta (descripción del issue)

> [86] Replicabilidad — WearyBerry, 17→19-nov. Que otra persona ejecute el caso de principio a fin sin ayuda, con un guion probado en frío. Entradas recibidas del dataset (#61), del seed (#59) y del arranque (#45). Entregable: guion de una pasada, corrida en frío medida y script ejecutable. Revisión el 19-nov. Detalle: `docs/briefs/BRIEF-86-replicabilidad.md`.
