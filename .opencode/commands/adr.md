---
description: Propose a new ADR with the template and the next free number
---
<!--
owner: reeinharddd
trigger: when deciding and recording an engineering decision
purpose: Propose a new ADR with the template and the next free number
-->

Decision to record: $ARGUMENTS

Existing ADRs:
!`ls docs/decisiones/`

1. Read @docs/decisiones/README.md: if the decision does not meet the "When to open an ADR" criteria, say so and stop.
2. If it belongs to the pending table, use that number; otherwise the next free one.
3. Copy @docs/plantillas/ADR.md to `docs/decisiones/ADR-NNNN-<slug>.md` with `Estado: Propuesta`. At least two real alternatives, honest consequences and a reversal criterion.
4. Versions: only the real ones from the `package.json` files.
5. Add the row to the index in the decisiones README and run `bash scripts/doc-index.sh --fix`.
