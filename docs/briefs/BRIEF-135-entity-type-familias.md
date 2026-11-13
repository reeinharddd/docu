# BRIEF #135 — El tipo de entidad lo declara la familia, y el seed lo deja escrito

## 0. Encabezado

- Issue: #135
- Responsable: Erik Beltrán (Líder, infra y pipeline) — ejecución de cierre con
  el mapa publicado por el líder en el issue; el carril de Emmanuel (#59, seed
  reproducible) sigue siendo suyo y toma este archivo como entrada.
- Fechas: 2026-11-13 → 2026-11-13 · Sprint 3 · hito `C1 vertical completa`
- Prioridad / Tipo / Épica / Módulo: crítica / bug / back / capa
  `apps/api/prisma/seed/`
- Requisitos: RNF-02
- Bloqueado por: — · Bloquea a: el carril de la web (#132/#133), el dataset
  (#61/#147) y la demo (el dato oficial nunca se crea)

## 1. Contexto

La instalación C1 sembraba las seis familias del caso sin declarar el tipo de
entidad que propone:

```sql
INSERT INTO "config"."family_config" ... VALUES
  (..., 'correo_hermana', 'Correo de planta hermana', '{"fields":[]}', ...),
```

El worker crea la propuesta con el tipo que la familia declara en su
`schema_definition` (`ingest.processor.ts`, función `declaredEntityType`). Sin
`entityType`, `proposeEntity` devuelve `null`:

```ts
const entityTypeCode = declaredEntityType(source.familySchema)
if (entityTypeCode === null) {
  return null // ← no hay propuesta
}
```

El archivo se extraía, se clasificaba y se puntuaba… y **nada llegaba a la
bandeja**. La instalación parecía sana (`/health` en verde, sin errores en el
worker) mientras el producto no proponía nada.

## 2. Por qué importa tu parte

Este bug se llevaba por delante la vertical completa del caso: sin propuesta no
hay bandeja, sin bandeja no hay dato oficial, sin dato oficial no hay nada que
demostrar en la presentación del 17 de noviembre. Y no lo atrapaba ninguna
prueba: el e2e fabrica su propia familia con `entityType` declarado, así que
el pipeline se veía verde mientras la instalación real no proponía.

## 3. Objetivo y resultado esperado

| Entregable | Evidencia |
|---|---|
| Las seis familias declaran su tipo de entidad | `c1.sql` + `families.entity-type.json` |
| El tipo existe en `graph.entity_type` | el gate `seed:check` lo exige |
| Resiembrar una instalación rota la repara | prueba de convergencia en la base viva |
| Una instalación con esquema propio no se pisa | prueba del `ON CONFLICT` |
| Nada vuelve a romper en silencio | gate `seed:check` en `verify` y en CI |

## 4. Diagnóstico

Dos piezas que no encajaban:

1. **El dato faltaba.** `c1.sql` declaraba `'{"fields":[]}'` en las seis
   familias: el tipo de entidad nunca llegaba al worker.
2. **Reseedar no arreglaba nada.** El insert terminaba en
   `ON CONFLICT ("id") DO NOTHING`: una base ya sembrada conservaba para
   siempre el esquema sin tipo, aunque el seed trajera el dato correcto. El
   parche manual en la base viva (13-nov) tapaba el síntoma, no la causa: un
   reseed en cualquier máquina volvía a la bandeja vacía.

Por eso ningún test lo atrapaba: el e2e crea su familia con
`{"entityType":"document",...}` y comprueba el pipeline, no el seed de la
instalación.

## 5. Solución

### 5.1 El dato, en un archivo canónico

`apps/api/prisma/seed/families.entity-type.json` es el mapa canónico
familia → tipo de entidad. Los códigos son los que ya existen en
`graph.entity_type` (**no se crean códigos nuevos por familia**):

| Familia | `entityType` |
|---|---|
| `excel_turno` | `shift` |
| `recepcion_rollo` | `goods_receipt` |
| `inventario` | `material` |
| `correo_hermana` | `quality_release` |
| `escaneado` | `scan_record` |
| `programa_planeacion` | `production_order` |

El mismo archivo es el que debe leer la semilla del dataset
(`dataset/config1/semilla/semilla.json`, issue #61): la instalación y el corpus
declaran el mismo tipo, y no se divergen.

### 5.2 El seed converge

El insert de familias termina así:

```sql
ON CONFLICT ("id") DO UPDATE
  SET "schema_definition" = EXCLUDED."schema_definition",
      "updated_at" = now()
  WHERE NOT ("config"."family_config"."schema_definition" ? 'entityType');
```

- Una familia **sin** tipo (el síntoma) recibe el tipo canónico al resiembrar.
- Una familia que **ya** declara su tipo no se toca: el esquema configurado por
  la instalación manda (ADR-0019).

### 5.3 Un gate que lo vigila

`bun run seed:check` (scripts/seed-check.ts) corre en `bun run verify` y en
CI. Exige:

1. que el mapa canónico y `c1.sql` declaren el mismo tipo para la misma
   familia;
2. que todo tipo declarado exista en `graph.entity_type` en el mismo seed;
3. que el seed **converge** (que exista el `ON CONFLICT ... DO UPDATE` que
   rellena el tipo que falta);
4. que la semilla del dataset, cuando exista, declare el mismo tipo.

## 6. Actividades específicas

1. Declarar el `entityType` de las seis familias en `c1.sql`.
2. Publicar el mapa canónico en `families.entity-type.json`.
3. Hacer que el seed repare una familia sin tipo y respete la que ya lo tiene.
4. Escribir el gate `seed:check` y engancharlo a `verify` y a CI.
5. Verificar el ciclo completo sobre la base sembrada por el repo.

## 7. Evidencia

**El gate detecta los tres fallos** (estado correcto y luego cada rotura):

```
$ bun run seed:check
seed: 6 families declare their entity type (11 entity types in the seed)

# sin entityType en una familia
seed: 1 finding(s)
  - ...: family excel_turno declares no entityType: its proposal never reaches the inbox (#135)

# con un tipo que el seed no crea
seed: 2 finding(s)

# sin la convergencia (ON CONFLICT DO NOTHING)
seed: 1 finding(s)
  - ...: the family insert does not converge (no ON CONFLICT ... DO UPDATE that fills a missing entityType): re-seeding an installation would not repair it
```

**El seed repara la instalación rota** (base viva, 13-nov):

```
$ psql ... -c "UPDATE config.family_config SET schema_definition = '{\"fields\":[]}'::jsonb WHERE facility_id='...'"
UPDATE 6

$ bun run db:seed
families      6
entity_types  11
seed C1 aplicado (idempotente)

$ psql ... -tAc "select family_code, schema_definition from config.family_config order by family_code"
correo_hermana|{"fields": [], "entityType": "quality_release"}
escaneado|{"fields": [], "entityType": "scan_record"}
excel_turno|{"fields": [], "entityType": "shift"}
inventario|{"fields": [], "entityType": "material"}
programa_planeacion|{"fields": [], "entityType": "production_order"}
recepcion_rollo|{"fields": [], "entityType": "goods_receipt"}
```

**Y no pisa el esquema de una instalación** (familia con campos propios):

```
$ psql ... -c "UPDATE config.family_config SET schema_definition =
  '{\"entityType\":\"material\",\"fields\":[{\"name\":\"custom\",\"type\":\"string\"}]}'::jsonb
  WHERE family_code='inventario'"
$ bun run db:seed
$ psql ... -tAc "select schema_definition from config.family_config where family_code='inventario'"
{"fields": [{"name": "custom", "type": "string"}], "entityType": "material"}
```

**El ciclo completo sobre la base sembrada por el repo** (motores reales:
Ollama local + scoring local):

```
=== 3. subir PNG (multipart) ===
status 201 {"sourceFileId":"a797ac8d-…","sha256":"7959bd28…"}
=== 4. esperar propuesta en bandeja ===
intento 66: propuesta de este archivo en la bandeja
  {"id":"f80fd724-…","status":"pending_confirmation","entityType":{"code":"quality_release","name":"Liberación de calidad"}}
=== 5. confirmar ===
status 200 {"id":"f80fd724-…","status":"official","version":2}
=== 6. oficial ===
status 200 [{"id":"f80fd724-…","entityType":{"code":"quality_release",…},"confirmedBy":{"username":"marta","fullName":"Marta"}}]
```

La propuesta llega **con su tipo de entidad**, que es justo lo que no pasaba.

## 8. Relación con los issues abiertos

- **#59 (seed reproducible desde el dataset)**: el mapa canónico es el dato
  que la semilla del dataset debe replicar. El gate lo verifica cuando la
  semilla exista.
- **#61 (dataset)**: idem; el archivo a leer es
  `apps/api/prisma/seed/families.entity-type.json`.
- **#132/#133 (web↔API)**: la web ya puede mostrar propuestas con su tipo.
- **#147 (evals)**: los evals por familia ahora pueden agrupar por tipo de
  entidad.

## 9. Referencias

- `apps/api/prisma/seed/c1.sql` — las familias con su tipo y la convergencia.
- `apps/api/prisma/seed/families.entity-type.json` — el mapa canónico.
- `scripts/seed-check.ts` — el gate.
- `apps/api/src/worker/ingest.processor.ts` — quién lee `entityType`.
- `docs/operacion/BITACORA.md` — entrada del 2026-11-13.
