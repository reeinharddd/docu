## Qué cambia
<!-- 1-3 líneas -->

## Spec
<!-- Obligatorio (ADR-0018): enlace al brief de la tarea: docs/briefs/BRIEF-<N>-*.md -->
<!-- Mantenimiento: etiqueta `sin-issue` y borra esta sección -->

## Test rojo primero
<!-- Pega la salida del test fallando ANTES del código verde (TDD, ADR-0018) -->
<!-- Si no aplica, etiqueta `sin-test` en la PR y explica por qué aquí -->

## RF / tarea
<!-- Closes #N · RF-01.. · etiqueta del requisito en el issue -->

## Checklist (todo marcado o el PR se devuelve)
- [ ] Spec enlazada arriba (o `sin-spec`/`sin-issue` con motivo)
- [ ] Test rojo antes del verde: salida pegada (o `sin-test` con motivo)
- [ ] `tsc --noEmit` y `biome check` en verde
- [ ] Pruebas del RF en verde
- [ ] Evidencia adjunta (comando, captura o video)
- [ ] Sin secretos ni `.env` en el diff
- [ ] Issue enlazado (`Closes #N`) y etiquetado con su RF
- [ ] 1 revisor asignado
