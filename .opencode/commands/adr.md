---
description: Proponer una ADR nueva con la plantilla y el siguiente numero libre
dueno: reeinharddd
disparador: al decidir y registrar una decision de ingenieria
proposito: Genera una ADR nueva con la plantilla y el siguiente numero libre
---

Decision a registrar: $ARGUMENTS

ADRs existentes:
!`ls docs/decisiones/`

1. Lee @docs/decisiones/README.md: si la decision no cumple los criterios de "Cuando abrir un ADR", dilo y para.
2. Si es una de las pendientes de la tabla, usa ese numero; si no, el siguiente libre.
3. Copia @docs/plantillas/ADR.md a `docs/decisiones/ADR-NNNN-<slug>.md` con `Estado: Propuesta`. Minimo dos alternativas reales, consecuencias honestas y criterio de reversion.
4. Versiones: solo las reales de los `package.json`.
5. Agrega la fila al indice del README de decisiones y corre `bash scripts/doc-index.sh --fix`.
