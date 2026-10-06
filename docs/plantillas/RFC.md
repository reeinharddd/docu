# RFC-NNNN: título de la propuesta

> Plantilla. Copia a `docs/decisiones/RFC-NNNN-slug.md` y borra las instrucciones
> entre paréntesis.

Estado: Propuesta (Aceptada | Rechazada | Reemplazada por ADR-NNNN)
Fecha: YYYY-MM-DD
Autor: nombre
Revisor: nombre (obligatorio, `docs/REGLAS.md`)

## Problema

Qué está mal hoy, con evidencia. No con la solución que ya trajiste en mente.
Incluye el enlace a la tarjeta de Monday o al issue.

## Alcance

Lo que entra. Explícito y corto.

Fuera de alcance, también explícito: lo que entra después.

## Opciones

Mínimo dos, o no hay decisión. Para cada una:

### Opción A: nombre

- Qué resuelve bien
- Qué cuesta: dinero, tiempo, contexto, complejidad
- Riesgo principal

### Opción B: nombre

- Qué resuelve bien
- Qué cuesta
- Riesgo principal

## Recomendación

Cuál y por qué, en una frase. Si no hay recomendación, no hay RFC.

## Reversibilidad

Qué pasa si nos equivocamos. Si la decisión es difícil de revertir, eso es
información para el revisor, no un detalle.

## Impacto

| Área | Efecto |
|---|---|
| Requisitos afectados | RF-NNN, o ninguno |
| Módulo | API, Documentos, Auditoría, Permisos, Base de datos, Infraestructura |
| Archivos | rutas concretas |
| Datos | migración sí/no, y si es irreversible |
| Seguridad o datos | sí/no. Si sí, requiere confirmación explícita del líder |

## Evidencia

Enlaces, salidas de comando, o el enlace de Drive. Sin evidencia no hay
propuesta.

---

Al aceptarse, esta RFC se convierte en ADR y se archiva en
`docs/decisiones/`. Una decisión de ingeniería es una ADR, no un párrafo en un
README (`docs/README.md`).
