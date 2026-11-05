# dataset/config1 — datos del caso C1

Aqui vive lo que produce el trabajo del caso (issue #61). El dataset **generado
no se versiona**: es grande y desechable (ver `.gitignore`). Solo se versionan:

- `.gitkeep`
- este `README.md`
- `esquemas/` — el contrato de maquina de las 6 familias (issue #9). Es diseno,
  no dato generado, y **si** se versiona.
- `esperado.json` — el volumen aprobado del mes, transcrito de
  `docs/ingenieria/fichas/CONTRATO.md` §8 (archivos por familia) y §9 (ruido).
  Es la cifra contra la que se mide el corpus emitido.
- `semilla/semilla.json` — la semilla versionada del generador: con la misma
  semilla, el mismo corpus.
- `manifiesto.sha256` — una linea por archivo generado (`<hash>  <ruta>`), que
  describe el corpus emitido.

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

## semilla/

La entrada de la reproducibilidad. `semilla.json` tiene tres campos:

| Campo | Que es |
|---|---|
| `seed` | Numero de la semilla que usa el generador |
| `version` | Version del contrato de la semilla (cambia si cambia la forma) |
| `vocabulary.names` | Nombres sinteticos (planta, operarios, ordenes): nunca nombres reales |

## manifiesto.sha256

El hash de cada archivo emitido, en el formato de `sha256sum`:

```
<hash>  <ruta relativa a dataset/config1>
```

Sirve para dos cosas: probar que el corpus es reproducible (misma semilla,
mismos hashes) y detectar que un archivo generado cambio.

## Layout del corpus emitido

El generador cuelga los archivos de `dataset/config1/corpus/<familia>/`, y lo
que no pertenezca a una familia conocida se cuenta como ruido. El corpus **no**
se versiona: se regenera con la semilla y se describe con el manifiesto.

## La puerta: `bun run dataset:check`

Corre en `bun run verify` y en CI, y falla si:

- falta el esquema de alguna de las 6 familias, o un ejemplo valido/invalido;
- `esperado.json` no cuadra con los 6 esquemas o su `total_files` no es la
  suma de las familias;
- hay manifiesto sin semilla (un corpus sin semilla no es reproducible);
- un hash del manifiesto no cuadra con el archivo en disco;
- el conteo por familia del manifiesto no es el de `esperado.json`, o el ruido
  queda fuera del rango 30-40.

Con solo los 6 esquemas y `esperado.json` la puerta esta en verde y dice
`seed pending`: el generador todavia no ha emitido nada.
