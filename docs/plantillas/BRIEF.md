# Plantilla de brief (delegación de tarea)

Se copia a `docs/briefs/BRIEF-<ID>-<slug>.md` y la tarjeta de Monday lo
enlaza en la columna `Enlace`. Sin brief no hay delegación. El mensaje de
WhatsApp es solo el aviso; el brief es la fuente de verdad.

## 0. Encabezado

- ID Monday / enlace:
- Dueño:
- Fechas (inicio-fin) / Sprint:
- Prioridad / Tipo / Épica / Módulo:
- Requisitos asociados (RF-/RNF-):
- Depende de (IDs) / Bloquea a (IDs):

## 1. Contexto

Dos a cuatro líneas: qué problema del caso toca esta tarea y con qué estrategia
se resuelve. Sin jerga sin explicar.

## 2. Por qué importa tu parte

Qué se rompe aguas abajo si esto sale mal o tarde, nombrando las tareas
afectadas y a sus dueños. Qué gana el equipo si sale bien.

## 3. Objetivo y resultado esperado

Una frase de objetivo más la lista de entregables, cada uno con su evidencia
concreta: archivo, URL, captura, video o el comando que debe pasar. Nada es
"ya quedó" sin evidencia.

## 4. Actividades específicas

Pasos numerados. Cada paso: verbo, objeto, entregable y criterio de terminado.
Un paso sin entregable no es un paso, es ruido.

## 5. Entradas y salidas

- Recibe (de quién, dónde, en qué formato):
- Entrega (a quién, dónde, en qué formato):

## 6. Referencias y caja de herramientas

Links exactos, no "busca en Google". Documentos vivos del proyecto
(`docs/proyecto/`, `docs/integraciones/`), ADRs aplicables, y qué usar de cada
uno. Incluir la alternativa automatizable obligatoria para no hacer a mano lo
que un script resuelve.

## 7. Cómo trabajar

- La IA genera y varía; no decide reglas, permisos, dato oficial ni diseño
  final.
- Todo lo generado lleva seed o versión: reproducible o no existe.
- Duda de 30 minutos = preguntar al equipo. Bloqueo de 24 horas = escalar al
  líder con etiqueta.
- PRs pequeños, 1 revisor, evidencia adjunta.

## 8. Criterios de aceptación

Casillas verificables por un tercero en diez minutos o menos. La tarea pasa a
`En revisión` solo con todas marcadas y evidencia adjunta.

## 9. Riesgos nombrados

El riesgo principal, su mitigación y desde qué fecha es bloqueo.

## 10. Revisión

Cuándo se revisa, con quién y en qué formato.

## Versión corta (descripción de Monday)

> [ID] Título — dueño, fechas. Objetivo en una línea. Entradas recibidas de X.
> Entregable + evidencia. Revisión el día D. Detalle: `<enlace>`.

---

Ejemplo real de los tamaños esperados: `docs/proyecto/REQUISITOS.md` como
"entradas" y `docs/decisiones/` como "referencias". Un brief que no puede
apuntar a un documento del repo es un brief que va a repetir contexto.