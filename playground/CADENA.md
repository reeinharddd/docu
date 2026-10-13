# Cadena de contexto — de dónde viene y a dónde va lo de esta rama

> Ninguna tarea vive sola. Antes de construir, el agente recorre esta cadena
> y trae los insumos. `/tarea N` la recorre siempre.

## La cadena

```
#41-fase1 (3 direcciones + PDF, Kira, 13-oct, REVISA HOY)
  → equipo elige 1
    → /fijar-marca (fija la ganadora en DESIGN.md + tokens + brand kit)
      → #41-fase2 (design system + tokens afirmados, 23-oct)
      → #11 (prototipos y flujo de pantallas, 23-oct) + #28 (categorías)
        → PROMOCION.md → docs/diseno/ por PR (puerta 1 de ADR-0012)
          → #4 Frontend Angular real en main (20-nov)
```

## De la entrega anterior (PDF de Kira)

El PDF de Fase 1 es insumo, no archivo muerto. `/fijar-marca` extrae de él
(el agente lee PDFs): dirección elegida, slogan, paleta hex por token,
tipografías Display/Body/Mono, concepto de logo, razonamiento por decisión,
preview de pantalla clave. Lo que el PDF no traiga queda `Pendiente`
explícito en `DESIGN.md`; prohibido inventarlo.

## Insumos cruzados (otras tareas que alimentan el diseño)

| De | Qué trae el agente | Para qué pantalla/decisión |
|---|---|---|
| #29 matriz (Carlos) | Qué ve/sube/confirma cada rol | Pantallas por rol; qué acciones muestra cada una |
| #58/#59 diagrama (Emmanuel) | 6 familias, qué dato guarda cada tabla | Qué datos simulan los mocks; qué cita cada cifra |
| #7 Configuración 1 | Datos reales C1 (cuando existan) | Reemplazan mocks; validan el flujo |
| #23 contrato de datos | Qué consume la maqueta | Límite de lo que las pantallas prometen |
| BRIEF-41-fase1 §11 | Recursos de inspiración, iconos, herramientas | Direcciones y brand kit |

## A la tarea siguiente

Lo afirmado aquí viaja a `docs/diseno/DESIGN-SYSTEM.md` (vía `PROMOCION.md`)
y de ahí a #4: un componente por función, reusable, con atomic design. El
frontend real no rediseña: implementa lo afirmado.
