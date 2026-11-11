-- Seed C1 — la capa que se adapta al caso pero sigue siendo fija.
--
-- Configuración 1 (Baja SterilPack, caso sintético): facility, departamentos,
-- las 9 personas del caso con sus roles, dominios y su asignación, las 6
-- familias, las 7 reglas R-P1..R-T1 como datos (ADR-0009), los tipos de
-- entidad que C1 necesita (semilla de #59) y las 5 máquinas.
-- Lo fijo del MOTOR (permisos, roles y su matriz) vive en engine.sql y aplica
-- a cualquier instalación. El corpus del mes NO va aquí: lo emite #59 con el
-- dataset de #61.
--
-- Requiere engine.sql aplicado antes (user_role une por código de rol).
-- Idempotente: UUIDs fijos y ON CONFLICT DO NOTHING. Nunca contiene datos de
-- un cliente real (el caso es sintético).

-- ── Instalación ──────────────────────────────────────────────────────────────
INSERT INTO "core"."facility" ("id", "code", "name", "timezone", "is_active")
VALUES
  ('c1000000-0000-4000-8000-000000000001', 'C1',
   'Configuración 1 — Baja SterilPack (sintética)', 'America/Mexico_City', true)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "core"."department" ("id", "facility_id", "code", "name")
VALUES
  ('c1000000-0000-4000-8000-000000000011', 'c1000000-0000-4000-8000-000000000001', 'planeacion', 'Planeación'),
  ('c1000000-0000-4000-8000-000000000012', 'c1000000-0000-4000-8000-000000000001', 'almacen', 'Almacén'),
  ('c1000000-0000-4000-8000-000000000013', 'c1000000-0000-4000-8000-000000000001', 'calidad', 'Calidad'),
  ('c1000000-0000-4000-8000-000000000014', 'c1000000-0000-4000-8000-000000000001', 'produccion', 'Producción'),
  ('c1000000-0000-4000-8000-000000000015', 'c1000000-0000-4000-8000-000000000001', 'materiales', 'Materiales'),
  ('c1000000-0000-4000-8000-000000000016', 'c1000000-0000-4000-8000-000000000001', 'mantenimiento', 'Mantenimiento')
ON CONFLICT ("id") DO NOTHING;

-- ── Personas del caso (CASO.md §Personas) ───────────────────────────────────
INSERT INTO "core"."app_user"
  ("id", "facility_id", "department_id", "username", "email", "full_name",
   "position", "relation_type", "scope", "status", "reports_to_id", "updated_at")
VALUES
  ('c1000000-0000-4000-8000-000000000021', 'c1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000011', 'ana', 'ana@docu.invalid', 'Ana', 'Planeadora', 'interno', 'instalacion', 'activo', 'c1000000-0000-4000-8000-000000000029', now()),
  ('c1000000-0000-4000-8000-000000000022', 'c1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000011', 'sergio', 'sergio@docu.invalid', 'Sergio', 'Auxiliar de planeación', 'interno', 'instalacion', 'activo', 'c1000000-0000-4000-8000-000000000029', now()),
  ('c1000000-0000-4000-8000-000000000023', 'c1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000012', 'pedro', 'pedro@docu.invalid', 'Pedro', 'Jefe de Almacén', 'interno', 'instalacion', 'activo', NULL, now()),
  ('c1000000-0000-4000-8000-000000000024', 'c1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000012', 'luis', 'luis@docu.invalid', 'Luis', 'Almacenista de recepción', 'interno', 'instalacion', 'activo', 'c1000000-0000-4000-8000-000000000023', now()),
  ('c1000000-0000-4000-8000-000000000025', 'c1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000013', 'marta', 'marta@docu.invalid', 'Marta', 'Jefa de Calidad', 'interno', 'instalacion', 'activo', NULL, now()),
  ('c1000000-0000-4000-8000-000000000026', 'c1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000014', 'jorge', 'jorge@docu.invalid', 'Jorge', 'Jefe de Producción', 'interno', 'instalacion', 'activo', NULL, now()),
  ('c1000000-0000-4000-8000-000000000027', 'c1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000014', 'carmen', 'carmen@docu.invalid', 'Carmen', 'Operadora TP-01', 'interno', 'instalacion', 'activo', 'c1000000-0000-4000-8000-000000000026', now()),
  ('c1000000-0000-4000-8000-000000000028', 'c1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000016', 'miguel', 'miguel@docu.invalid', 'Miguel', 'Jefe de Mantenimiento e Ingeniería', 'interno', 'instalacion', 'activo', NULL, now()),
  ('c1000000-0000-4000-8000-000000000029', 'c1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000015', 'andres', 'andres@docu.invalid', 'Andrés', 'Jefe de Materiales', 'interno', 'instalacion', 'activo', NULL, now())
ON CONFLICT ("id") DO NOTHING;

-- ── Roles de las personas del caso (el catálogo de roles vive en engine.sql) ──
-- Quién puede qué es dato del CASO, no del motor: por eso vive aquí y no en
-- la capa fija. `granted_by_id` es Andrés (Jefe de Materiales), que otorga.
INSERT INTO "core"."user_role" ("app_user_id", "role_id", "granted_by_id")
SELECT u."id", r."id", 'c1000000-0000-4000-8000-000000000029'
FROM (
  VALUES
    ('andres', 'admin'),
    ('marta', 'manager'),
    ('jorge', 'manager'),
    ('pedro', 'manager'),
    ('miguel', 'manager'),
    ('ana', 'member'),
    ('sergio', 'member'),
    ('luis', 'member'),
    ('carmen', 'member')
) AS ur(username, role_code)
JOIN "core"."app_user" u ON u."username" = ur.username
  AND u."facility_id" = 'c1000000-0000-4000-8000-000000000001'
JOIN "core"."role" r ON r."code" = ur.role_code
ON CONFLICT DO NOTHING;

-- ── Dominios y su asignación (RF-06: nadie lee lo de otro departamento) ─────
INSERT INTO "core"."domain" ("id", "facility_id", "code", "name")
VALUES
  ('c1000000-0000-4000-8000-000000000091', 'c1000000-0000-4000-8000-000000000001', 'planeacion', 'Planeación'),
  ('c1000000-0000-4000-8000-000000000092', 'c1000000-0000-4000-8000-000000000001', 'almacen', 'Almacén'),
  ('c1000000-0000-4000-8000-000000000093', 'c1000000-0000-4000-8000-000000000001', 'calidad', 'Calidad'),
  ('c1000000-0000-4000-8000-000000000094', 'c1000000-0000-4000-8000-000000000001', 'produccion', 'Producción'),
  ('c1000000-0000-4000-8000-000000000095', 'c1000000-0000-4000-8000-000000000001', 'materiales', 'Materiales'),
  ('c1000000-0000-4000-8000-000000000096', 'c1000000-0000-4000-8000-000000000001', 'mantenimiento', 'Mantenimiento')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "core"."user_domain" ("app_user_id", "domain_id", "facility_id")
SELECT u."id", d."id", u."facility_id"
FROM "core"."app_user" u
JOIN "core"."department" dep ON dep."id" = u."department_id"
JOIN "core"."domain" d ON d."facility_id" = u."facility_id" AND d."code" = dep."code"
ON CONFLICT DO NOTHING;

-- El jefe de Materiales ve su dominio y los que coordina (CASO.md §Personas).
INSERT INTO "core"."user_domain" ("app_user_id", "domain_id", "facility_id")
VALUES
  ('c1000000-0000-4000-8000-000000000029', 'c1000000-0000-4000-8000-000000000091', 'c1000000-0000-4000-8000-000000000001'),
  ('c1000000-0000-4000-8000-000000000029', 'c1000000-0000-4000-8000-000000000092', 'c1000000-0000-4000-8000-000000000001')
ON CONFLICT DO NOTHING;

-- ── Familias del caso (CONTRATO.md §1) ──────────────────────────────────────
INSERT INTO "config"."family_config"
  ("id", "facility_id", "family_code", "name", "schema_definition",
   "parser_key", "is_ocr_required", "created_by_id", "updated_at")
VALUES
  ('c1000000-0000-4000-8000-000000000061', 'c1000000-0000-4000-8000-000000000001', 'excel_turno', 'Excel de turno', '{"fields":[]}', 'excel_turno.v1', false, 'c1000000-0000-4000-8000-000000000029', now()),
  ('c1000000-0000-4000-8000-000000000062', 'c1000000-0000-4000-8000-000000000001', 'recepcion_rollo', 'Recepción de rollo', '{"fields":[]}', 'recepcion_rollo.v1', false, 'c1000000-0000-4000-8000-000000000029', now()),
  ('c1000000-0000-4000-8000-000000000063', 'c1000000-0000-4000-8000-000000000001', 'inventario', 'Inventario', '{"fields":[]}', 'inventario.v1', false, 'c1000000-0000-4000-8000-000000000029', now()),
  ('c1000000-0000-4000-8000-000000000064', 'c1000000-0000-4000-8000-000000000001', 'correo_hermana', 'Correo de planta hermana', '{"fields":[]}', 'correo_hermana.v1', false, 'c1000000-0000-4000-8000-000000000029', now()),
  ('c1000000-0000-4000-8000-000000000065', 'c1000000-0000-4000-8000-000000000001', 'escaneado', 'Escaneado', '{"fields":[]}', 'escaneado.v1', true, 'c1000000-0000-4000-8000-000000000029', now()),
  ('c1000000-0000-4000-8000-000000000066', 'c1000000-0000-4000-8000-000000000001', 'programa_planeacion', 'Programa de planeación', '{"fields":[]}', 'programa_planeacion.v1', false, 'c1000000-0000-4000-8000-000000000029', now())
ON CONFLICT ("id") DO NOTHING;

-- ── Reglas del caso como datos (ADR-0009, CASO.md §Reglas, 2026-10-12) ──────
-- `expression` es la forma que evaluará el carril de backend (#12); la semilla
-- la marca como tal y no simula un evaluador.
INSERT INTO "config"."validation_rule"
  ("id", "facility_id", "code", "name", "severity", "expression", "message",
   "applies_to", "created_by_id", "updated_at")
VALUES
  ('c1000000-0000-4000-8000-000000000067', 'c1000000-0000-4000-8000-000000000001', 'R-P1', 'Rollo sin certificado no se programa', 'BLOQUEO', '{"seeded":"c1","version":1}', 'El rollo no tiene certificado: no entra al programa', '{"families":["recepcion_rollo","programa_planeacion"]}', 'c1000000-0000-4000-8000-000000000029', now()),
  ('c1000000-0000-4000-8000-000000000068', 'c1000000-0000-4000-8000-000000000001', 'R-P2', 'Medida distinta a la pedida no se programa', 'BLOQUEO', '{"seeded":"c1","version":1}', 'La medida del rollo no coincide con la pedida', '{"families":["recepcion_rollo","programa_planeacion"]}', 'c1000000-0000-4000-8000-000000000029', now()),
  ('c1000000-0000-4000-8000-000000000069', 'c1000000-0000-4000-8000-000000000001', 'R-P3', 'Material ausente en almacén bloquea la fecha', 'BLOQUEO', '{"seeded":"c1","version":1}', 'El material no está en almacén para la fecha', '{"families":["inventario","programa_planeacion"]}', 'c1000000-0000-4000-8000-000000000029', now()),
  ('c1000000-0000-4000-8000-000000000070', 'c1000000-0000-4000-8000-000000000001', 'R-P4', 'Cambio de planta hermana dispara replan', 'AVISO', '{"seeded":"c1","version":1}', 'La hermana cambió el pedido: revisar el programa', '{"families":["correo_hermana","programa_planeacion"]}', 'c1000000-0000-4000-8000-000000000029', now()),
  ('c1000000-0000-4000-8000-000000000071', 'c1000000-0000-4000-8000-000000000001', 'R-Q1', 'Solo calidad libera; producción no se auto-libera', 'BLOQUEO', '{"seeded":"c1","version":1}', 'Solo Calidad puede liberar el lote', '{"families":["escaneado"]}', 'c1000000-0000-4000-8000-000000000029', now()),
  ('c1000000-0000-4000-8000-000000000072', 'c1000000-0000-4000-8000-000000000001', 'R-A1', 'Paro mayor a 30 min exige motivo', 'BLOQUEO', '{"seeded":"c1","version":1}', 'El paro de más de 30 minutos no tiene motivo', '{"families":["excel_turno"]}', 'c1000000-0000-4000-8000-000000000029', now()),
  ('c1000000-0000-4000-8000-000000000073', 'c1000000-0000-4000-8000-000000000001', 'R-T1', 'Stock mínimo de film o Tyvek bloquea la orden', 'BLOQUEO', '{"seeded":"c1","version":1}', 'El stock de film o Tyvek está bajo el mínimo', '{"families":["inventario"]}', 'c1000000-0000-4000-8000-000000000029', now())
ON CONFLICT ("id") DO NOTHING;

-- ── Tipos de entidad que C1 necesita (mapa de derivación, CASO.md) ──────────
-- Los códigos van en inglés (regla del repo); la semilla completa es #59.
INSERT INTO "graph"."entity_type"
  ("id", "facility_id", "code", "name", "schema_definition", "created_by_id", "updated_at")
VALUES
  ('c1000000-0000-4000-8000-000000000075', 'c1000000-0000-4000-8000-000000000001', 'production_schedule', 'Programa de producción', '{"fields":[]}', 'c1000000-0000-4000-8000-000000000029', now()),
  ('c1000000-0000-4000-8000-000000000076', 'c1000000-0000-4000-8000-000000000001', 'production_order', 'Orden de producción', '{"fields":[]}', 'c1000000-0000-4000-8000-000000000029', now()),
  ('c1000000-0000-4000-8000-000000000077', 'c1000000-0000-4000-8000-000000000001', 'material', 'Material', '{"fields":[]}', 'c1000000-0000-4000-8000-000000000029', now()),
  ('c1000000-0000-4000-8000-000000000078', 'c1000000-0000-4000-8000-000000000001', 'machine', 'Máquina', '{"fields":[]}', 'c1000000-0000-4000-8000-000000000029', now()),
  ('c1000000-0000-4000-8000-000000000079', 'c1000000-0000-4000-8000-000000000001', 'shift', 'Turno', '{"fields":[]}', 'c1000000-0000-4000-8000-000000000029', now()),
  ('c1000000-0000-4000-8000-00000000007a', 'c1000000-0000-4000-8000-000000000001', 'roll', 'Rollo', '{"fields":[]}', 'c1000000-0000-4000-8000-000000000029', now()),
  ('c1000000-0000-4000-8000-00000000007b', 'c1000000-0000-4000-8000-000000000001', 'goods_receipt', 'Recepción de rollo', '{"fields":[]}', 'c1000000-0000-4000-8000-000000000029', now()),
  ('c1000000-0000-4000-8000-00000000007c', 'c1000000-0000-4000-8000-000000000001', 'quality_release', 'Liberación de calidad', '{"fields":[]}', 'c1000000-0000-4000-8000-000000000029', now()),
  ('c1000000-0000-4000-8000-00000000007d', 'c1000000-0000-4000-8000-000000000001', 'scan_record', 'Registro de escaneado', '{"fields":[]}', 'c1000000-0000-4000-8000-000000000029', now()),
  ('c1000000-0000-4000-8000-00000000007e', 'c1000000-0000-4000-8000-000000000001', 'scrap', 'Merma', '{"fields":[]}', 'c1000000-0000-4000-8000-000000000029', now()),
  ('c1000000-0000-4000-8000-00000000007f', 'c1000000-0000-4000-8000-000000000001', 'downtime', 'Paro de línea', '{"fields":[]}', 'c1000000-0000-4000-8000-000000000029', now())
ON CONFLICT ("id") DO NOTHING;

-- ── Las 5 máquinas del caso (CASO.md §Compañía) ─────────────────────────────
INSERT INTO "graph"."entity"
  ("id", "facility_id", "entity_type_id", "code", "data", "created_by_id", "updated_at")
VALUES
  ('c1000000-0000-4000-8000-000000000081', 'c1000000-0000-4000-8000-000000000001',
   (SELECT "id" FROM "graph"."entity_type" WHERE "facility_id" = 'c1000000-0000-4000-8000-000000000001' AND "code" = 'machine'),
   'TP-01', '{"kind":"pouch"}', 'c1000000-0000-4000-8000-000000000029', now()),
  ('c1000000-0000-4000-8000-000000000082', 'c1000000-0000-4000-8000-000000000001',
   (SELECT "id" FROM "graph"."entity_type" WHERE "facility_id" = 'c1000000-0000-4000-8000-000000000001' AND "code" = 'machine'),
   'TP-02', '{"kind":"pouch"}', 'c1000000-0000-4000-8000-000000000029', now()),
  ('c1000000-0000-4000-8000-000000000083', 'c1000000-0000-4000-8000-000000000001',
   (SELECT "id" FROM "graph"."entity_type" WHERE "facility_id" = 'c1000000-0000-4000-8000-000000000001' AND "code" = 'machine'),
   'TB-01', '{"kind":"bag"}', 'c1000000-0000-4000-8000-000000000029', now()),
  ('c1000000-0000-4000-8000-000000000084', 'c1000000-0000-4000-8000-000000000001',
   (SELECT "id" FROM "graph"."entity_type" WHERE "facility_id" = 'c1000000-0000-4000-8000-000000000001' AND "code" = 'machine'),
   'TB-02', '{"kind":"bag"}', 'c1000000-0000-4000-8000-000000000029', now()),
  ('c1000000-0000-4000-8000-000000000085', 'c1000000-0000-4000-8000-000000000001',
   (SELECT "id" FROM "graph"."entity_type" WHERE "facility_id" = 'c1000000-0000-4000-8000-000000000001' AND "code" = 'machine'),
   'TB-03', '{"kind":"bag"}', 'c1000000-0000-4000-8000-000000000029', now())
ON CONFLICT ("id") DO NOTHING;
