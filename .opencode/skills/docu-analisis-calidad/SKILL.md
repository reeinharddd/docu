---
name: docu-analisis-calidad
description: Judge the quality of DOCU frontend and backend work with the vendored analysis skills, each one aimed at the axis it covers - legibility, function and fluidity plus visual style for apps/web; speed, coordination and execution for apps/api. Use when reviewing a screen, a service, a job or a change and you need to say what is wrong with evidence, not taste.
license: MIT (own; see docs/decisiones)
---
<!--
owner: reeinharddd
trigger: when reviewing a screen, a service, a job or a change for quality
purpose: Route a quality review to the right analysis skill and hold the output to the project's evidence rules
-->

# Quality analysis in DOCU

The project already vendors the analysis skills. This one says **which to load,
for which axis, and what a finding must look like** so the review is not taste.

Full source of the conventions: `docs/REGLAS.md` and `docs/HARNESS.md`.

## The axes and the skill that covers each

| Axis | What it asks | Load |
|---|---|---|
| Legibility | Can a person read and operate it? Contrast, labels, focus, error text | `ao-frontend-ui-engineering` |
| Function | Does the screen do its job with the real data, including empty, error and forbidden states? | `ao-frontend-ui-engineering` + `docu-frontend` |
| Fluidity | Does the interaction flow without dead ends, lost state or unexplained waiting? | `ao-frontend-ui-engineering` |
| Visual style | Does the result look like this product, or like a generic one? | `pp-ai-slop` + the brand tokens |
| Speed | Where is the real bottleneck, measured? | `ao-performance-optimization` |
| Coordination | Do the parts line up: API, queue, worker, database, isolation per facility? | `docu-frontend` + `ao-observability-and-instrumentation` |
| Execution | Does it leave evidence of what it did, and fail with a visible reason? | `ao-observability-and-instrumentation` |

Load the vendored skill, then apply it with the DOCU calibration already stated
in its `metadata.adaptacion`. Do not restate its checklists from memory: the
skill is the source, and its `references/` files are the detail.

## What counts as a finding

A finding is an **objective defect with evidence**, not a preference. Every
finding carries:

1. **Axis**: legibility, function, fluidity, visual style, speed, coordination
   or execution.
2. **Where**: the file and the line, or the route and the state.
3. **Evidence**: the failing command, the console error, the measured latency,
   the screenshot, the record in the database. If it cannot be shown, it is a
   hypothesis, and hypotheses are listed apart from findings.
4. **Impact**: who notices it, in which requirement (RF/RNF) it breaks.

## Severity, in this project's terms

| Severity | Meaning in DOCU |
|---|---|
| Blocked | The path cannot complete: the cycle fails, data is lost, or a requirement has no answer. |
| Important | The path completes but the result is wrong, unverifiable, or unfalsifiable for a third party. |
| Minor | The path completes and is verifiable, but the experience or the maintenance cost suffers. |

Anything that does not block the cycle and has no evidence stays out of the
report. `pp-code-reviewer` applies the same confidence filter to code; this
skill applies it to the axes above.

## Rules when reviewing apps/web

- Judge against the **real** backend where one exists: a screen that only
  works against a fixture is not a working screen (#132 connects them).
- Judge the states that the fixture never shows: empty, error, forbidden, and
  the slow one. A fixture proves the happy path and nothing else.
- A finding about visual style cites the token or the brand rule it breaks
  (`docs/diseno/DESIGN-SYSTEM.md`), never a personal aesthetic.
- Accessibility findings are defects, not preferences: contrast, visible focus,
  labels tied to controls, and error text a person can act on (RNF-01).

## Rules when reviewing apps/api and the worker

- Measure before judging speed. A review that says "this is slow" without a
  measurement is a hypothesis.
- A job that fails silently is an execution defect even when the happy path
  works. The worker owes a visible reason (RF-02) and a ledger entry.
- Coordination defects are cross-part: name the two parts that disagree (the
  API and the worker, the worker and the database, the web and the API) and the
  contract between them.
- Isolation per facility is not optional (ADR-0014, ADR-0019): any finding
  about data crossing facilities is Blocked by default.

## Output contract

Report in this order:

```text
AXIS: <one of the seven axes>
WHERE: <file:line | route + state>
EVIDENCE: <command output | console error | measurement | screenshot | db row>
IMPACT: <who notices it, RF/RNF affected>
SEVERITY: Blocked | Important | Minor
```

Then, at the end, a short **Hypotheses** section for anything suspected but not
shown, and a **Not covered** section naming what was not reviewed and why.
An analysis that does not say what it did not look at overstates itself.

## What this skill does not do

- It does not replace `pp-code-reviewer` for defects in the code itself.
- It does not replace `docu-frontend` for the conventions of `apps/web`.
- It does not measure: it routes to the skill that measures and holds the
  finding to the evidence rule above.
