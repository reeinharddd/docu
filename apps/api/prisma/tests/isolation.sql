-- Prueba 3 — aislamiento por instalación e integridad histórica (ADR-0019).
-- Toda FK entre tablas con instalación es compuesta (facility_id, id): la base
-- rechaza cruzar instalaciones aunque el código se equivoque (auditoría
-- 2026-11-07, A-01). También prueba el snapshot histórico (A-04) y la
-- confirmación humana completa (A-08).

-- ── Segunda instalación con sus propios objetos ──────────────────────────────
INSERT INTO "core"."facility"
  ("id", "code", "name", "timezone", "is_active", "created_at")
VALUES
  ('12121212-1212-4212-8121-121212121212', 'C2', 'Configuracion 2', 'America/Mexico_City', true, now());

-- Permiso global (catalogo fijo) para las pruebas de access_grant: sin el,
-- las FK cruzadas podrian fallar por el permiso y no por el aislamiento.
INSERT INTO "core"."permission"
  ("id", "code", "name")
VALUES
  ('00000000-0000-4000-8000-000000000000', 'read', 'Leer');

INSERT INTO "core"."app_user"
  ("id", "facility_id", "username", "email", "full_name", "position", "relation_type", "scope", "status", "created_at", "updated_at")
VALUES
  ('23232323-2323-4323-8323-232323232323', '12121212-1212-4212-8121-121212121212', 'otra.planta', 'otra@example.invalid', 'Otra', 'Operador', 'interno', 'instalacion', 'activo', now(), now());

INSERT INTO "core"."department"
  ("id", "facility_id", "code", "name", "is_active", "created_at")
VALUES
  ('34343434-3434-4343-8343-343434343434', '12121212-1212-4212-8121-121212121212', 'OTRA', 'Departamento de otra planta', true, now());

INSERT INTO "core"."domain"
  ("id", "facility_id", "code", "name", "is_active", "created_at")
VALUES
  ('45454545-4545-4545-8545-454545454545', '12121212-1212-4212-8121-121212121212', 'OTRO', 'Dominio de otra planta', true, now());

INSERT INTO "config"."family_config"
  ("id", "facility_id", "family_code", "name", "schema_definition", "parser_key", "is_ocr_required", "is_active", "created_at", "updated_at", "created_by_id")
VALUES
  ('b1b1b1b1-b1b1-4b1b-8b1b-b1b1b1b1b1b1', '12121212-1212-4212-8121-121212121212', 'otra-familia', 'Familia de otra planta', '{}', 'generic.v1', false, true, now(), now(), '23232323-2323-4323-8323-232323232323');

INSERT INTO "ingest"."source_file"
  ("id", "facility_id", "family_config_id", "original_name", "sha256", "mime_type", "byte_size", "storage_path", "is_ocr_required", "received_at", "received_by_id", "created_at")
VALUES
  ('b2b2b2b2-b2b2-4b2b-8b2b-b2b2b2b2b2b2', '12121212-1212-4212-8121-121212121212', 'b1b1b1b1-b1b1-4b1b-8b1b-b1b1b1b1b1b1', 'otra-planta.pdf', 'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc', 'application/pdf', 512, 'originales/otra-planta.pdf', false, now(), '23232323-2323-4323-8323-232323232323', now());

INSERT INTO "graph"."entity_type"
  ("id", "facility_id", "code", "name", "schema_definition", "is_system", "is_active", "created_at", "updated_at", "created_by_id")
VALUES
  ('56565656-5656-4656-8656-565656565656', '12121212-1212-4212-8121-121212121212', 'lote', 'Lote', '{}', false, true, now(), now(), '23232323-2323-4323-8323-232323232323');

INSERT INTO "graph"."entity"
  ("id", "facility_id", "entity_type_id", "code", "data", "status", "confirmed_by_id", "confirmed_at", "version", "created_at", "updated_at", "created_by_id")
VALUES
  ('67676767-6767-4676-8767-676767676767', '12121212-1212-4212-8121-121212121212', '56565656-5656-4656-8656-565656565656', 'L-X', '{"codigo":"L-X"}', 'official', '23232323-2323-4323-8323-232323232323', now(), 1, now(), now(), '23232323-2323-4323-8323-232323232323');

-- ── FK compuestas: cruzar instalaciones debe reventar con FK violation ───────

-- app_user de C1 con departamento de C2 (auditoría: Hallazgo 1).
DO $$
BEGIN
  BEGIN
    UPDATE "core"."app_user" SET "department_id" = '34343434-3434-4343-8343-343434343434'
    WHERE "id" = '22222222-2222-4222-8222-222222222222';
    RAISE EXCEPTION 'FALLO: app_user acepta departamento de otra instalacion';
  EXCEPTION WHEN foreign_key_violation THEN
    RAISE NOTICE 'OK: app_user rechaza departamento de otra instalacion';
  END;
END $$;

-- user_domain de C1 con dominio de C2.
DO $$
BEGIN
  BEGIN
    INSERT INTO "core"."user_domain"
      ("app_user_id", "domain_id", "facility_id")
    VALUES
      ('22222222-2222-4222-8222-222222222222', '45454545-4545-4545-8545-454545454545', '11111111-1111-4111-8111-111111111111');
    RAISE EXCEPTION 'FALLO: user_domain acepta dominio de otra instalacion';
  EXCEPTION WHEN foreign_key_violation THEN
    RAISE NOTICE 'OK: user_domain rechaza dominio de otra instalacion';
  END;
END $$;

-- access_grant de C1 con usuario beneficiario de C2.
DO $$
BEGIN
  BEGIN
    INSERT INTO "core"."access_grant"
      ("id", "facility_id", "grantee_id", "permission_id", "scope", "reason", "valid_from", "valid_until", "granted_by_id", "granted_at")
    VALUES
      ('78787878-7878-4787-8787-787878787878', '11111111-1111-4111-8111-111111111111', '23232323-2323-4323-8323-232323232323', '00000000-0000-4000-8000-000000000000', 'propio', 'prueba', now(), now() + interval '1 day', '22222222-2222-4222-8222-222222222222', now());
    RAISE EXCEPTION 'FALLO: access_grant acepta usuario de otra instalacion';
  EXCEPTION WHEN foreign_key_violation THEN
    RAISE NOTICE 'OK: access_grant rechaza usuario de otra instalacion';
  END;
END $$;

-- access_grant de C1 sobre una entidad de C2 (auditoría: Hallazgo 1).
DO $$
BEGIN
  BEGIN
    INSERT INTO "core"."access_grant"
      ("id", "facility_id", "grantee_id", "permission_id", "scope", "reason", "valid_from", "valid_until", "granted_by_id", "granted_at", "target_entity_id")
    VALUES
      ('9e9e9e9e-9e9e-49e9-89e9-9e9e9e9e9e9e', '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', '00000000-0000-4000-8000-000000000000', 'propio', 'prueba entidad cruzada', now(), now() + interval '1 day', '22222222-2222-4222-8222-222222222222', now(), '67676767-6767-4676-8767-676767676767');
    RAISE EXCEPTION 'FALLO: access_grant acepta entidad de otra instalacion';
  EXCEPTION WHEN foreign_key_violation THEN
    RAISE NOTICE 'OK: access_grant rechaza entidad de otra instalacion';
  END;
END $$;

-- session de C1 con usuario de C2 (auditoría: session → usuario).
DO $$
BEGIN
  BEGIN
    INSERT INTO "platform"."session"
      ("id", "facility_id", "app_user_id", "token_hash", "issued_at", "expires_at")
    VALUES
      ('89898989-8989-4989-8989-898989898989', '11111111-1111-4111-8111-111111111111', '23232323-2323-4323-8323-232323232323', 'hash-sesion-cruzada', now(), now() + interval '1 day');
    RAISE EXCEPTION 'FALLO: session acepta usuario de otra instalacion';
  EXCEPTION WHEN foreign_key_violation THEN
    RAISE NOTICE 'OK: session rechaza usuario de otra instalacion';
  END;
END $$;

-- entity de C1 con entity_type de C2 (auditoría: entity → entity_type).
DO $$
BEGIN
  BEGIN
    INSERT INTO "graph"."entity"
      ("id", "facility_id", "entity_type_id", "code", "data", "status", "version", "created_at", "updated_at", "created_by_id")
    VALUES
      ('9a9a9a9a-9a9a-49a9-89a9-9a9a9a9a9a9a', '11111111-1111-4111-8111-111111111111', '56565656-5656-4656-8656-565656565656', 'L-CRUZADA', '{}', 'draft', 1, now(), now(), '22222222-2222-4222-8222-222222222222');
    RAISE EXCEPTION 'FALLO: entity acepta entity_type de otra instalacion';
  EXCEPTION WHEN foreign_key_violation THEN
    RAISE NOTICE 'OK: entity rechaza entity_type de otra instalacion';
  END;
END $$;

-- relation de C1 cuyo destino vive en C2 (auditoría: Hallazgo 5).
DO $$
BEGIN
  BEGIN
    INSERT INTO "graph"."relation"
      ("id", "facility_id", "source_entity_id", "target_entity_id", "relation_type", "created_at", "created_by_id")
    VALUES
      ('9b9b9b9b-9b9b-49b9-89b9-9b9b9b9b9b9b', '11111111-1111-4111-8111-111111111111', '77777777-7777-4777-8777-777777777777', '67676767-6767-4676-8767-676767676767', 'compone', now(), '22222222-2222-4222-8222-222222222222');
    RAISE EXCEPTION 'FALLO: relation acepta entidades de instalaciones distintas';
  EXCEPTION WHEN foreign_key_violation THEN
    RAISE NOTICE 'OK: relation rechaza entidades de instalaciones distintas';
  END;
END $$;

-- origin_history de C1 apuntando al archivo de C2 (auditoría: origen → archivo).
DO $$
BEGIN
  BEGIN
    INSERT INTO "truth"."origin_history"
      ("id", "facility_id", "entity_id", "version", "data_snapshot", "source_file_id", "created_at", "created_by_id")
    VALUES
      ('9c9c9c9c-9c9c-49c9-89c9-9c9c9c9c9c9c', '11111111-1111-4111-8111-111111111111', '77777777-7777-4777-8777-777777777777', 99, '{}', 'b2b2b2b2-b2b2-4b2b-8b2b-b2b2b2b2b2b2', now(), '22222222-2222-4222-8222-222222222222');
    RAISE EXCEPTION 'FALLO: origin_history acepta archivo de otra instalacion';
  EXCEPTION WHEN foreign_key_violation THEN
    RAISE NOTICE 'OK: origin_history rechaza archivo de otra instalacion';
  END;
END $$;

-- parsed_record de C1 apuntando al archivo de C2.
DO $$
BEGIN
  BEGIN
    INSERT INTO "ingest"."parsed_record"
      ("id", "facility_id", "source_file_id", "record_index", "family_config_id", "payload", "status", "created_at", "created_by_id")
    VALUES
      ('9d9d9d9d-9d9d-49d9-89d9-9d9d9d9d9d9d', '11111111-1111-4111-8111-111111111111', 'b2b2b2b2-b2b2-4b2b-8b2b-b2b2b2b2b2b2', 1, '33333333-3333-4333-8333-333333333333', '{}', 'parsed', now(), '22222222-2222-4222-8222-222222222222');
    RAISE EXCEPTION 'FALLO: parsed_record acepta archivo de otra instalacion';
  EXCEPTION WHEN foreign_key_violation THEN
    RAISE NOTICE 'OK: parsed_record rechaza archivo de otra instalacion';
  END;
END $$;

-- quarantine de C1 apuntando al archivo de C2.
DO $$
BEGIN
  BEGIN
    INSERT INTO "ingest"."quarantine"
      ("id", "facility_id", "source_file_id", "parsed_record_id", "rule_code", "severity", "reason", "status", "created_at")
    VALUES
      ('a4a4a4a4-a4a4-44a4-84a4-a4a4a4a4a4a4', '11111111-1111-4111-8111-111111111111', 'b2b2b2b2-b2b2-4b2b-8b2b-b2b2b2b2b2b2', NULL, 'R-P1', 'BLOQUEO', 'prueba cruzada', 'pending', now());
    RAISE EXCEPTION 'FALLO: quarantine acepta archivo de otra instalacion';
  EXCEPTION WHEN foreign_key_violation THEN
    RAISE NOTICE 'OK: quarantine rechaza archivo de otra instalacion';
  END;
END $$;

-- ocr_result de C1 apuntando al archivo de C2.
DO $$
BEGIN
  BEGIN
    INSERT INTO "ingest"."ocr_result"
      ("id", "facility_id", "source_file_id", "parsed_record_id", "page_number", "engine", "engine_version", "language", "text_content", "metrics", "created_at", "updated_at")
    VALUES
      ('a5a5a5a5-a5a5-45a5-85a5-a5a5a5a5a5a5', '11111111-1111-4111-8111-111111111111', 'b2b2b2b2-b2b2-4b2b-8b2b-b2b2b2b2b2b2', NULL, 1, 'tesseract', '5', 'spa', '', '{}', now(), now());
    RAISE EXCEPTION 'FALLO: ocr_result acepta archivo de otra instalacion';
  EXCEPTION WHEN foreign_key_violation THEN
    RAISE NOTICE 'OK: ocr_result rechaza archivo de otra instalacion';
  END;
END $$;

-- memory_embedding de C1 con entidad de C2.
DO $$
BEGIN
  BEGIN
    INSERT INTO "platform"."memory_embedding"
      ("id", "facility_id", "entity_id", "chunk", "embedding", "model", "created_at")
    VALUES
      ('9f9f9f9f-9f9f-49f9-89f9-9f9f9f9f9f9f', '11111111-1111-4111-8111-111111111111', '67676767-6767-4676-8767-676767676767', 'prueba', (array_fill(0.0, ARRAY[768]))::vector, 'test-model', now());
    RAISE EXCEPTION 'FALLO: memory_embedding acepta entidad de otra instalacion';
  EXCEPTION WHEN foreign_key_violation THEN
    RAISE NOTICE 'OK: memory_embedding rechaza entidad de otra instalacion';
  END;
END $$;

-- engram_ref de C1 con entidad de C2.
DO $$
BEGIN
  BEGIN
    INSERT INTO "platform"."engram_ref"
      ("id", "facility_id", "project", "observation_id", "kind", "summary", "entity_id", "created_at", "created_by_id")
    VALUES
      ('a0a0a0a0-a0a0-40a0-80a0-a0a0a0a0a0a0', '11111111-1111-4111-8111-111111111111', 'docu', 'observacion-cruzada', 'decision', 'prueba', '67676767-6767-4676-8767-676767676767', now(), '22222222-2222-4222-8222-222222222222');
    RAISE EXCEPTION 'FALLO: engram_ref acepta entidad de otra instalacion';
  EXCEPTION WHEN foreign_key_violation THEN
    RAISE NOTICE 'OK: engram_ref rechaza entidad de otra instalacion';
  END;
END $$;

-- source_file de C1 con familia de C2 (auditoría: source_file → family_config).
DO $$
BEGIN
  BEGIN
    INSERT INTO "ingest"."source_file"
      ("id", "facility_id", "family_config_id", "original_name", "sha256", "mime_type", "byte_size", "storage_path", "is_ocr_required", "received_at", "received_by_id", "created_at")
    VALUES
      ('a6a6a6a6-a6a6-46a6-86a6-a6a6a6a6a6a6', '11111111-1111-4111-8111-111111111111', 'b1b1b1b1-b1b1-4b1b-8b1b-b1b1b1b1b1b1', 'cruzado.pdf', 'ddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd1', 'application/pdf', 128, 'originales/cruzado.pdf', false, now(), '22222222-2222-4222-8222-222222222222', now());
    RAISE EXCEPTION 'FALLO: source_file acepta familia de otra instalacion';
  EXCEPTION WHEN foreign_key_violation THEN
    RAISE NOTICE 'OK: source_file rechaza familia de otra instalacion';
  END;
END $$;

-- ── Confirmación humana completa (A-08) ──────────────────────────────────────

-- Oficial con responsable pero SIN fecha: debe rechazarse.
DO $$
BEGIN
  BEGIN
    INSERT INTO "graph"."entity"
      ("id", "facility_id", "entity_type_id", "code", "data", "status", "confirmed_by_id", "confirmed_at", "version", "created_at", "updated_at", "created_by_id")
    VALUES
      ('a1a1a1a1-a1a1-41a1-81a1-a1a1a1a1a1a1', '11111111-1111-4111-8111-111111111111', '66666666-6666-4666-8666-666666666666', 'L-SIN-FECHA', '{}', 'official', '22222222-2222-4222-8222-222222222222', NULL, 1, now(), now(), '22222222-2222-4222-8222-222222222222');
    RAISE EXCEPTION 'FALLO: entidad oficial con responsable y sin fecha se acepta';
  EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'OK: el CHECK rechaza oficial con responsable pero sin fecha';
  END;
END $$;

-- Borrador con responsable y fecha ya puestos: confirmación prematura.
DO $$
BEGIN
  BEGIN
    INSERT INTO "graph"."entity"
      ("id", "facility_id", "entity_type_id", "code", "data", "status", "confirmed_by_id", "confirmed_at", "version", "created_at", "updated_at", "created_by_id")
    VALUES
      ('a2a2a2a2-a2a2-42a2-82a2-a2a2a2a2a2a2', '11111111-1111-4111-8111-111111111111', '66666666-6666-4666-8666-666666666666', 'L-PREMATURA', '{}', 'draft', '22222222-2222-4222-8222-222222222222', now(), 1, now(), now(), '22222222-2222-4222-8222-222222222222');
    RAISE EXCEPTION 'FALLO: borrador con confirmacion prematura se acepta';
  EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'OK: el CHECK rechaza confirmacion prematura en un borrador';
  END;
END $$;

-- ── Snapshot histórico (A-04): la versión vieja conserva su valor ────────────

-- La entidad L-1 (fixtures) está oficial en versión 1 con data
-- '{"codigo":"L-1"}' y su origin_history v1 lleva ese snapshot. Se publica la
-- versión 2 con otro valor y su propio snapshot: el snapshot v1 debe seguir
-- siendo el valor v1, aunque la entidad ya no lo tenga.
UPDATE "graph"."entity"
SET "data" = '{"codigo":"L-1-v2"}', "version" = 2, "updated_at" = now()
WHERE "id" = '77777777-7777-4777-8777-777777777777';

INSERT INTO "truth"."origin_history"
  ("id", "facility_id", "entity_id", "version", "data_snapshot", "source_file_id", "parsed_record_id", "rule_code", "rule_severity", "calculation", "confirmed_by_id", "created_at", "created_by_id")
VALUES
  ('a3a3a3a3-a3a3-43a3-83a3-a3a3a3a3a3a3', '11111111-1111-4111-8111-111111111111', '77777777-7777-4777-8777-777777777777', 2, '{"codigo":"L-1-v2"}', '44444444-4444-4444-8444-444444444444', '55555555-5555-4555-8555-555555555555', 'R-P1', 'BLOQUEO', '{"pasos":2}', '22222222-2222-4222-8222-222222222222', now(), '22222222-2222-4222-8222-222222222222');

DO $$
DECLARE
  v_v1 text;
  v_v2 text;
  v_actual text;
BEGIN
  SELECT h."data_snapshot" ->> 'codigo' INTO v_v1
  FROM "truth"."origin_history" h
  WHERE h."entity_id" = '77777777-7777-4777-8777-777777777777' AND h."version" = 1;
  SELECT h."data_snapshot" ->> 'codigo' INTO v_v2
  FROM "truth"."origin_history" h
  WHERE h."entity_id" = '77777777-7777-4777-8777-777777777777' AND h."version" = 2;
  SELECT e."data" ->> 'codigo' INTO v_actual
  FROM "graph"."entity" e
  WHERE e."id" = '77777777-7777-4777-8777-777777777777';

  IF v_v1 IS NULL OR v_v1 <> 'L-1' THEN
    RAISE EXCEPTION 'FALLO: el snapshot de la version 1 no conserva su valor (% en lugar de L-1)', v_v1;
  END IF;
  IF v_v2 <> 'L-1-v2' THEN
    RAISE EXCEPTION 'FALLO: el snapshot de la version 2 no coincide con su valor';
  END IF;
  IF v_actual <> 'L-1-v2' THEN
    RAISE EXCEPTION 'FALLO: la entidad vigente no es la version 2';
  END IF;
  RAISE NOTICE 'OK: el historial reconstruye cada version publicada (v1=%, v2=%, vigente=%)', v_v1, v_v2, v_actual;
END $$;

-- La vista de linaje expone el snapshot por versión.
DO $$
DECLARE
  v_count integer;
BEGIN
  SELECT count(*) INTO v_count
  FROM "truth"."entity_lineage"
  WHERE "entity_id" = '77777777-7777-4777-8777-777777777777' AND "data_snapshot" ->> 'codigo' = 'L-1';
  IF v_count <> 1 THEN
    RAISE EXCEPTION 'FALLO: entity_lineage no expone el snapshot de la version 1';
  END IF;
  RAISE NOTICE 'OK: entity_lineage expone el snapshot de cada version';
END $$;
