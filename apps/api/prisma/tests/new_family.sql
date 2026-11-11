-- Prueba 2 -- familia nueva (ADR-0009: las reglas del caso son datos).
-- Una familia de documento y una regla de validacion nuevas se insertan como
-- DATOS: no hay que tocar el esquema ni el codigo para soportarlas. Ninguna
-- tabla, columna ni CHECK menciona el vocabulario del caso.

INSERT INTO "config"."family_config"
  ("id", "facility_id", "family_code", "name", "schema_definition", "parser_key", "is_ocr_required", "is_active", "created_at", "updated_at", "created_by_id")
VALUES
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '11111111-1111-4111-8111-111111111111', 'recepcion', 'Recepcion', '{"fields":[{"name":"referencia","type":"text","required":true}]}', 'generic.v1', false, true, now(), now(), '22222222-2222-4222-8222-222222222222');

-- La regla se acota a una familia con "applies_to" (JSON), no con una FK:
-- una regla puede aplicar a varias familias o a ninguna.
INSERT INTO "config"."validation_rule"
  ("id", "facility_id", "code", "name", "severity", "expression", "message", "applies_to", "is_active", "created_at", "updated_at", "created_by_id")
VALUES
  ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', '11111111-1111-4111-8111-111111111111', 'R-P9', 'Referencia obligatoria', 'BLOQUEO', '{"field":"referencia","op":"required"}', 'Falta la referencia', '{"family_code":"recepcion"}', true, now(), now(), '22222222-2222-4222-8222-222222222222');

INSERT INTO "ingest"."source_file"
  ("id", "facility_id", "family_config_id", "original_name", "sha256", "mime_type", "byte_size", "storage_path", "is_ocr_required", "received_at", "received_by_id", "created_at")
VALUES
  ('dddddddd-dddd-4ddd-8ddd-dddddddddddd', '11111111-1111-4111-8111-111111111111', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'recepcion-1.pdf', 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', 'application/pdf', 2048, 'originales/recepcion-1.pdf', false, now(), '22222222-2222-4222-8222-222222222222', now());

INSERT INTO "ingest"."quarantine"
  ("id", "facility_id", "source_file_id", "parsed_record_id", "rule_code", "severity", "reason", "status", "created_at")
VALUES
  ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', '11111111-1111-4111-8111-111111111111', 'dddddddd-dddd-4ddd-8ddd-dddddddddddd', NULL, 'R-P9', 'BLOQUEO', 'Falta la referencia en la fila 3', 'pending', now());

-- La familia nueva debe ser usable de punta a punta sin tocar el esquema.
DO $$
DECLARE
  v_count integer;
BEGIN
  SELECT count(*) INTO v_count
  FROM "config"."validation_rule" r
  JOIN "config"."family_config" f
    ON f."family_code" = r."applies_to" ->> 'family_code' AND f."facility_id" = r."facility_id"
  WHERE r."code" = 'R-P9' AND f."family_code" = 'recepcion';
  IF v_count <> 1 THEN
    RAISE EXCEPTION 'FALLO: la familia nueva no se enlaza con su regla';
  END IF;
  RAISE NOTICE 'OK: la familia nueva se declara y se enlaza con su regla';
END $$;

-- La cuarentena debe mostrar SIEMPRE la regla que la disparo y el motivo.
DO $$
DECLARE
  v_count integer;
BEGIN
  SELECT count(*) INTO v_count
  FROM "ingest"."quarantine" q
  JOIN "config"."validation_rule" r
    ON r."code" = q."rule_code" AND r."facility_id" = q."facility_id"
  WHERE q."status" = 'pending' AND q."severity" = 'BLOQUEO' AND length(q."reason") > 0;
  IF v_count <> 1 THEN
    RAISE EXCEPTION 'FALLO: la cuarentena no enlaza con una regla visible y con motivo';
  END IF;
  RAISE NOTICE 'OK: la cuarentena enlaza con la regla y muestra su motivo';
END $$;

-- El dato oficial exige confirmacion humana: sin confirmed_by_id no existe.
DO $$
BEGIN
  BEGIN
    INSERT INTO "graph"."entity"
      ("id", "facility_id", "entity_type_id", "code", "data", "status", "confirmed_by_id", "confirmed_at", "version", "created_at", "updated_at", "created_by_id")
    VALUES
      ('ffffffff-ffff-4fff-8fff-ffffffffffff', '11111111-1111-4111-8111-111111111111', '66666666-6666-4666-8666-666666666666', 'L-2', '{"codigo":"L-2"}', 'official', NULL, now(), 1, now(), now(), '22222222-2222-4222-8222-222222222222');
    RAISE EXCEPTION 'FALLO: una entidad oficial sin confirmacion humana se acepta';
  EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'OK: el CHECK de confirmacion rechaza una entidad oficial sin confirmed_by_id';
  END;
END $$;

-- Y con confirmacion, si se acepta: la IA propone, el humano dispone.
INSERT INTO "graph"."entity"
  ("id", "facility_id", "entity_type_id", "code", "data", "status", "confirmed_by_id", "confirmed_at", "version", "created_at", "updated_at", "created_by_id")
VALUES
  ('ffffffff-ffff-4fff-8fff-ffffffffffff', '11111111-1111-4111-8111-111111111111', '66666666-6666-4666-8666-666666666666', 'L-2', '{"codigo":"L-2"}', 'official', '22222222-2222-4222-8222-222222222222', now(), 1, now(), now(), '22222222-2222-4222-8222-222222222222');

DO $$
BEGIN
  RAISE NOTICE 'OK: la entidad oficial con confirmacion humana se acepta';
END $$;
