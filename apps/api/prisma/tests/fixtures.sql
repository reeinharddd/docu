-- Fixture mínimo para las pruebas de schema: lo justo para que haya sobre qué
-- operar. Datos de una planta de ejemplo, sin vocabulario de ningún cliente:
-- el tipo de entidad se llama "lote" porque es genérico, no porque el modelo
-- lo imponga.

INSERT INTO "core"."facility"
  ("id", "code", "name", "timezone", "is_active", "created_at")
VALUES
  ('11111111-1111-4111-8111-111111111111', 'C1', 'Configuracion 1', 'America/Mexico_City', true, now());

INSERT INTO "core"."app_user"
  ("id", "facility_id", "username", "email", "full_name", "position", "relation_type", "scope", "status", "created_at", "updated_at")
VALUES
  ('22222222-2222-4222-8222-222222222222', '11111111-1111-4111-8111-111111111111', 'marta.calidad', 'marta@example.invalid', 'Marta', 'Jefa de Calidad', 'interno', 'instalacion', 'activo', now(), now());

INSERT INTO "config"."family_config"
  ("id", "facility_id", "family_code", "name", "schema_definition", "parser_key", "is_ocr_required", "is_active", "created_at", "updated_at", "created_by_id")
VALUES
  ('33333333-3333-4333-8333-333333333333', '11111111-1111-4111-8111-111111111111', 'escaneado', 'Escaneado', '{"fields":[{"name":"lote","type":"text","required":true}]}', 'scan.v1', true, true, now(), now(), '22222222-2222-4222-8222-222222222222');

INSERT INTO "ingest"."source_file"
  ("id", "facility_id", "family_config_id", "original_name", "sha256", "mime_type", "byte_size", "storage_path", "is_ocr_required", "received_at", "received_by_id", "created_at")
VALUES
  ('44444444-4444-4444-8444-444444444444', '11111111-1111-4111-8111-111111111111', '33333333-3333-4333-8333-333333333333', 'hoja-1.pdf', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 'application/pdf', 1024, 'originales/hoja-1.pdf', true, now(), '22222222-2222-4222-8222-222222222222', now());

INSERT INTO "ingest"."parsed_record"
  ("id", "facility_id", "source_file_id", "record_index", "family_config_id", "payload", "status", "created_at", "created_by_id")
VALUES
  ('55555555-5555-4555-8555-555555555555', '11111111-1111-4111-8111-111111111111', '44444444-4444-4444-8444-444444444444', 1, '33333333-3333-4333-8333-333333333333', '{"lote":"L-1"}', 'parsed', now(), '22222222-2222-4222-8222-222222222222');

INSERT INTO "graph"."entity_type"
  ("id", "facility_id", "code", "name", "schema_definition", "is_system", "is_active", "created_at", "updated_at", "created_by_id")
VALUES
  ('66666666-6666-4666-8666-666666666666', '11111111-1111-4111-8111-111111111111', 'lote', 'Lote', '{"fields":[{"name":"codigo","type":"text","required":true}]}', false, true, now(), now(), '22222222-2222-4222-8222-222222222222');

INSERT INTO "graph"."entity"
  ("id", "facility_id", "entity_type_id", "code", "data", "status", "confirmed_by_id", "confirmed_at", "version", "created_at", "updated_at", "created_by_id")
VALUES
  ('77777777-7777-4777-8777-777777777777', '11111111-1111-4111-8111-111111111111', '66666666-6666-4666-8666-666666666666', 'L-1', '{"codigo":"L-1"}', 'official', '22222222-2222-4222-8222-222222222222', now(), 1, now(), now(), '22222222-2222-4222-8222-222222222222');

INSERT INTO "truth"."origin_history"
  ("id", "facility_id", "entity_id", "version", "source_file_id", "parsed_record_id", "rule_code", "rule_severity", "calculation", "confirmed_by_id", "created_at", "created_by_id")
VALUES
  ('88888888-8888-4888-8888-888888888888', '11111111-1111-4111-8111-111111111111', '77777777-7777-4777-8777-777777777777', 1, '44444444-4444-4444-8444-444444444444', '55555555-5555-4555-8555-555555555555', 'R-P1', 'BLOQUEO', '{"pasos":1}', '22222222-2222-4222-8222-222222222222', now(), '22222222-2222-4222-8222-222222222222');

INSERT INTO "truth"."audit_log"
  ("id", "facility_id", "actor_id", "action", "target_table", "target_id", "details", "created_at")
VALUES
  ('99999999-9999-4999-8999-999999999999', '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', 'upload', 'ingest.source_file', '44444444-4444-4444-8444-444444444444', '{"familia":"escaneado"}', now());

INSERT INTO "platform"."engram_ref"
  ("id", "facility_id", "project", "observation_id", "kind", "summary", "created_at", "created_by_id")
VALUES
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '11111111-1111-4111-8111-111111111111', 'docu', 'observacion-1', 'decision', 'El original nunca se borra', now(), '22222222-2222-4222-8222-222222222222');
