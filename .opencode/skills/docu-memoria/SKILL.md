---
name: docu-memoria
description: How to use Engram (the project memory) in DOCU - when to search, when to save and what never goes to memory. Use when starting (/inicio, /tarea) and when closing work.
---
<!--
owner: reeinharddd
trigger: when starting (/inicio, /tarea) and when closing work
purpose: How to use Engram, the project memory
-->

# Project memory in DOCU

Engram stores **session context**: what was costly to find, decisions with
their rationale and the index to find them again. Project: `docu`
(`ENGRAM_PROJECT` in `.env`). Local requirement: `engram` binary on the PATH;
the MCP comes from the repo (`opencode.json`, see `docs/operacion/BOOTSTRAP.md`).
Full policy: `docs/integraciones/ENGRAM.md`. If they disagree, the document wins.

## When starting (/inicio, /tarea)

1. Search the memory before reading docs: `engram_mem_search` with the issue or
   task topic (2-3 distinct queries, not just one).
2. If a finding contradicts the repo, **the repo wins** and the memory is fixed.
3. What already lives in `docs/` is read from the file, not re-saved.

## When closing

Save **only what was costly to find** with `engram_mem_save` (real version, API
gotcha, column name, decision with its rationale). Format:

- Short, searchable title.
- `What / Why / Where (repo file) / Learned`.
- Every memory with a decision **points to the repo file** that backs it.

## Never in memory

Secrets or `.env` values, personal or single-machine paths, ADRs or stack
versions (they live in `docs/`), task state (lives in GitHub Issues).
