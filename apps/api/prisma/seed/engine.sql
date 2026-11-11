-- Seed del MOTOR — lo fijo y estándar que existe sin importar el caso.
--
-- Catálogo cerrado del ER v1: permisos y roles del vocabulario fijo
-- (los valores que los CHECK de la migración aceptan). Aplica a CUALQUIER
-- instalación: C1, C2 o la que opere cada compañía. Lo específico del caso
-- vive en c1.sql; lo dinámico (corpus del mes) lo emite #59.
--
-- Idempotente: UUIDs fijos y ON CONFLICT DO NOTHING.

-- ── Permisos (catálogo fijo, permission_code_check) ─────────────────────────
INSERT INTO "core"."permission" ("id", "code", "name")
VALUES
  ('c1000000-0000-4000-8000-000000000031', 'read', 'Leer'),
  ('c1000000-0000-4000-8000-000000000032', 'download', 'Descargar original'),
  ('c1000000-0000-4000-8000-000000000033', 'create', 'Crear dato'),
  ('c1000000-0000-4000-8000-000000000034', 'update', 'Corregir dato propio'),
  ('c1000000-0000-4000-8000-000000000035', 'submit', 'Enviar a revisión'),
  ('c1000000-0000-4000-8000-000000000036', 'confirm', 'Confirmar dato oficial'),
  ('c1000000-0000-4000-8000-000000000037', 'release', 'Liberar calidad'),
  ('c1000000-0000-4000-8000-000000000038', 'quarantine', 'Cuarentenar'),
  ('c1000000-0000-4000-8000-000000000039', 'manage_users', 'Gestionar usuarios'),
  ('c1000000-0000-4000-8000-00000000003a', 'manage_permissions', 'Gestionar permisos'),
  ('c1000000-0000-4000-8000-00000000003b', 'manage_config', 'Gestionar configuración'),
  ('c1000000-0000-4000-8000-00000000003c', 'view_audit', 'Ver bitácora')
ON CONFLICT ("id") DO NOTHING;

-- ── Roles (catálogo fijo, role_code_check) ──────────────────────────────────
INSERT INTO "core"."role" ("id", "code", "name", "description", "is_system")
VALUES
  ('c1000000-0000-4000-8000-000000000041', 'admin', 'Administrador', 'Todo el sistema (instalación)', true),
  ('c1000000-0000-4000-8000-000000000042', 'manager', 'Jefe', 'Confirma y libera dentro de su dominio', true),
  ('c1000000-0000-4000-8000-000000000043', 'member', 'Miembro', 'Captura y envía a revisión', true),
  ('c1000000-0000-4000-8000-000000000044', 'guest', 'Invitado', 'Solo lectura', true)
ON CONFLICT ("id") DO NOTHING;

-- ── Matriz rol → permiso ────────────────────────────────────────────────────
INSERT INTO "core"."role_permission" ("role_id", "permission_id")
SELECT r."id", p."id"
FROM (
  VALUES
    ('admin', ARRAY['read', 'download', 'create', 'update', 'submit', 'confirm', 'release', 'quarantine', 'manage_users', 'manage_permissions', 'manage_config', 'view_audit']),
    ('manager', ARRAY['read', 'download', 'create', 'update', 'submit', 'confirm', 'release', 'quarantine', 'view_audit']),
    ('member', ARRAY['read', 'download', 'create', 'update', 'submit']),
    ('guest', ARRAY['read'])
) AS rp(role_code, perms)
JOIN "core"."role" r ON r."code" = rp.role_code
JOIN "core"."permission" p ON p."code" = ANY (rp.perms)
ON CONFLICT DO NOTHING;
