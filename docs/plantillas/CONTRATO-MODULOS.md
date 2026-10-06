# Contrato de módulos: NOMBRE-DEL-MODULO

> Plantilla. Copia dentro del módulo del código, por ejemplo
> `apps/api/src/documentos/CONTRATO.md`, y enlázalo desde
> `docs/ingenieria/API.md`. Un módulo sin contrato escrito no está terminado.

Módulo: NOMBRE | Épica: NOMBRE | Requisitos: RF-NNN | Responsable: nombre

## Responsabilidad

Una frase. Qué hace este módulo y, sobre todo, qué no hace.

## Frontera

| Pertenece a este módulo | No pertenece a este módulo |
|---|---|
| Lo que sí resuelve | Lo que resuelve otro y este consume |

Un módulo que necesita "y además" está mal partido. Dos módulos que necesitan el
mismo dato tienen un modelo compartido, no una importación cruzada.

## Contrato de entrada

Lo que recibe. Para HTTP: método, ruta, cuerpo validado. Para cola: nombre del
trabajo y forma del payload.

## Contrato de salida

Lo que devuelve. Para HTTP: estado, forma del cuerpo, códigos de error. Para
trabajo: qué escribe y con qué `estado` deja cada entidad.

## Errores

| Situación | Código | Dónde se reporta |
|---|---|---|
| Entrada inválida | | |
| Entidad no encontrada | | |
| Regla `BLOQUEO` violada | | `Cuarentena`, `Alerta` |
| Dependencia caída | | `Bitacora` |

Un error de negocio no es un 500. Y todo error con efecto sobre datos va a
`Bitacora` (`docs/ingenieria/MODELO-DATOS.md`).

## Auditoría

Qué acciones escribe en `Bitacora` con qué `accion`. Es append-only: no se
actualiza ni se borra.

## Trabajo asíncrono

Qué trabajos encola y en qué cola. Si no encola nada, se escribe "ninguno".

## Pruebas

Qué casos cubren los requisitos asignados. Cada `Prueba.queCubre` apunta a un
RF. Un módulo sin pruebas es un módulo sin contrato real.

## Dependencias

| Depende de | Para qué |
|---|---|
| | |

## Al cambiar este módulo

Qué se actualiza junto: `docs/ingenieria/API.md`, `docs/REQUISITOS.md` o una ADR
nueva. Si el cambio es de política y no de implementación, es una ADR.
