# dataset/config1 — datos del caso C1

Aqui vive lo que produce el trabajo del caso (issue #61). El dataset **generado
no se versiona**: es grande y desechable (ver `.gitignore`). Solo se versionan:

- `.gitkeep`
- este `README.md`
- `esquemas/` — el contrato de maquina de las 6 familias (issue #9). Es diseno,
  no dato generado, y **si** se versiona.

## esquemas/

Por cada familia (`excel_turno`, `recepcion_rollo`, `programa_planeacion`,
`inventario`, `correo_hermana`, `escaneado`):

| Archivo | Que es |
|---|---|
| `<familia>.schema.json` | JSON Schema draft 2020-12 (forma de maquina de la ficha) |
| `<familia>.valido.json` | ejemplo que pasa |
| `<familia>.invalido.json` | ejemplo que falla |

La forma humana de cada familia es su ficha en `docs/ingenieria/fichas/`; el
esquema no reinventa nombres de campo. Ventana y volumen del mes, en
`docs/ingenieria/fichas/CONTRATO.md` (§8).
