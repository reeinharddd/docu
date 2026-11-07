-- Prueba 1 — solo-insert (ADR-0010).
-- Las cuatro tablas append-only deben rechazar UPDATE y DELETE.
-- Cada bloque espera el error del trigger; si la mutacion se cuela, el bloque
-- revienta con su propio mensaje y la prueba falla.

DO $$
BEGIN
  -- ingest.source_file
  BEGIN
    UPDATE "ingest"."source_file" SET "original_name" = 'reescrito.pdf'
    WHERE "id" = '44444444-4444-4444-8444-444444444444';
    RAISE EXCEPTION 'FALLO: ingest.source_file acepta UPDATE';
  EXCEPTION WHEN restrict_violation THEN
    RAISE NOTICE 'OK: ingest.source_file rechaza UPDATE';
  END;

  BEGIN
    DELETE FROM "ingest"."source_file" WHERE "id" = '44444444-4444-4444-8444-444444444444';
    RAISE EXCEPTION 'FALLO: ingest.source_file acepta DELETE';
  EXCEPTION WHEN restrict_violation THEN
    RAISE NOTICE 'OK: ingest.source_file rechaza DELETE';
  END;

  -- truth.origin_history
  BEGIN
    UPDATE "truth"."origin_history" SET "rule_code" = 'R-X9'
    WHERE "id" = '88888888-8888-4888-8888-888888888888';
    RAISE EXCEPTION 'FALLO: truth.origin_history acepta UPDATE';
  EXCEPTION WHEN restrict_violation THEN
    RAISE NOTICE 'OK: truth.origin_history rechaza UPDATE';
  END;

  BEGIN
    DELETE FROM "truth"."origin_history" WHERE "id" = '88888888-8888-4888-8888-888888888888';
    RAISE EXCEPTION 'FALLO: truth.origin_history acepta DELETE';
  EXCEPTION WHEN restrict_violation THEN
    RAISE NOTICE 'OK: truth.origin_history rechaza DELETE';
  END;

  -- truth.audit_log
  BEGIN
    UPDATE "truth"."audit_log" SET "action" = 'borrado'
    WHERE "id" = '99999999-9999-4999-8999-999999999999';
    RAISE EXCEPTION 'FALLO: truth.audit_log acepta UPDATE';
  EXCEPTION WHEN restrict_violation THEN
    RAISE NOTICE 'OK: truth.audit_log rechaza UPDATE';
  END;

  BEGIN
    DELETE FROM "truth"."audit_log" WHERE "id" = '99999999-9999-4999-8999-999999999999';
    RAISE EXCEPTION 'FALLO: truth.audit_log acepta DELETE';
  EXCEPTION WHEN restrict_violation THEN
    RAISE NOTICE 'OK: truth.audit_log rechaza DELETE';
  END;

  -- platform.engram_ref
  BEGIN
    UPDATE "platform"."engram_ref" SET "summary" = 'otra cosa'
    WHERE "id" = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    RAISE EXCEPTION 'FALLO: platform.engram_ref acepta UPDATE';
  EXCEPTION WHEN restrict_violation THEN
    RAISE NOTICE 'OK: platform.engram_ref rechaza UPDATE';
  END;

  BEGIN
    DELETE FROM "platform"."engram_ref" WHERE "id" = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    RAISE EXCEPTION 'FALLO: platform.engram_ref acepta DELETE';
  EXCEPTION WHEN restrict_violation THEN
    RAISE NOTICE 'OK: platform.engram_ref rechaza DELETE';
  END;
END $$;

-- El INSERT si debe funcionar: append-only significa insertar y consultar.
DO $$
DECLARE
  v_count integer;
BEGIN
  SELECT count(*) INTO v_count FROM "truth"."audit_log"
  WHERE "id" = '99999999-9999-4999-8999-999999999999';
  IF v_count <> 1 THEN
    RAISE EXCEPTION 'FALLO: el INSERT append-only no quedo persistido';
  END IF;
  RAISE NOTICE 'OK: el INSERT append-only si se persiste';
END $$;
