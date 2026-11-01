# Plantilla ROLES — matriz de perfiles y mapeo a puestos

> Para #29 y las que la usen (#5, #7). Español. Sin código, solo datos
> (ADR-0009). Sin nombres reales de personas.

## Matriz (3–5 perfiles ficticios)

| Perfil | Responsabilidades | Alcance | Mapeo → puesto CASO |
|---|---|---|---|
| `perfil_ejemplo` | Qué hace (verbos) | Qué familias toca | Puesto del organigrama (`CASO.md`) o `—` justificado |

Reglas: todo puesto del organigrama queda mapeado o justificado; ningún rol
vive en código (los permisos se implementan desde esta tabla en #5).

## Usuarios demo (para #5 y pruebas)

| Usuario | Perfil | Resultado esperado |
|---|---|---|
| `demo_1` | `perfil_ejemplo` | Qué ve / qué no ve |

## Validación

- [ ] Sin puestos sin mapear ni justificar.
- [ ] Sin roles inventados en código.
- [ ] Cada perfil dice qué documentos genera o toca (alimenta #9).
