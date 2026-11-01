# Plantilla FICHA — diseño de un formato documental

> Para #9 (una por familia) y las que la usen (#61 genera desde aquí).
> Tabla o JSON versionado, no prosa suelta. Sin muestras manuales.

## Formato

| Campo | Valor |
|---|---|
| Familia | `programa_planeacion` \| `recepcion_rollo` \| `inventario` \| `excel_turno` \| `correo_hermana` \| `escaneado` |
| Documentos del formato | Qué variantes existen |
| Campos | Campo, tipo, obligatorio (sí/no) |
| Fuentes | sistema \| correo \| escáner \| mano |
| Distinción | Cómo se diferencia de los demás formatos |
| Perfiles que la usan | De `plantillas/ROLES.md` |

## Marcos de error (uno por fila, cada uno apunta a su regla)

| Error realista | Regla R-### | Motivo de cuarentena |
|---|---|---|
| `ej: certificado nulo` | `R-P1` | `ej: rollo sin certificado` |

## Ground truth

Forma del ground truth que acompaña cada documento generado (JSON/CSV +
esquema). Debe reconstruir la respuesta correcta sin el documento.

## Volumen para #61

| Válidos | Con error | Escaneados |
|---|---|---|
| `n` | `n` | `n` |

## Validación

- [ ] Cada error apunta a su regla; cada campo dice fuente y obligatoriedad.
- [ ] Dice cuántos documentos pedirá #61.
- [ ] Sin generador aquí (eso es #61); sin muestras manuales.
