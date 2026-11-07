-- CreateExtension
CREATE EXTENSION IF NOT EXISTS vector;

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "config";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "core";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "graph";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "ingest";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "platform";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "truth";

-- CreateTable
CREATE TABLE "core"."facility" (
    "id" UUID NOT NULL,
    "parent_facility_id" UUID,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'America/Mexico_City',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "facility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."department" (
    "id" UUID NOT NULL,
    "facility_id" UUID NOT NULL,
    "parent_department_id" UUID,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."app_user" (
    "id" UUID NOT NULL,
    "facility_id" UUID NOT NULL,
    "department_id" UUID,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "relation_type" TEXT NOT NULL DEFAULT 'interno',
    "reports_to_id" UUID,
    "reports_to_external" TEXT,
    "scope" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'activo',
    "valid_until" TIMESTAMPTZ(6),
    "password_hash" TEXT,
    "last_login_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "created_by_id" UUID,
    "updated_by_id" UUID,

    CONSTRAINT "app_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."role" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_system" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."user_role" (
    "app_user_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "granted_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "granted_by_id" UUID,

    CONSTRAINT "user_role_pkey" PRIMARY KEY ("app_user_id","role_id")
);

-- CreateTable
CREATE TABLE "core"."permission" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."role_permission" (
    "role_id" UUID NOT NULL,
    "permission_id" UUID NOT NULL,

    CONSTRAINT "role_permission_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- CreateTable
CREATE TABLE "core"."domain" (
    "id" UUID NOT NULL,
    "facility_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "domain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."user_domain" (
    "app_user_id" UUID NOT NULL,
    "domain_id" UUID NOT NULL,

    CONSTRAINT "user_domain_pkey" PRIMARY KEY ("app_user_id","domain_id")
);

-- CreateTable
CREATE TABLE "core"."access_grant" (
    "id" UUID NOT NULL,
    "facility_id" UUID NOT NULL,
    "grantee_id" UUID NOT NULL,
    "permission_id" UUID NOT NULL,
    "scope" TEXT NOT NULL,
    "domain_id" UUID,
    "target_entity_id" UUID,
    "is_denial" BOOLEAN NOT NULL DEFAULT false,
    "is_emergency" BOOLEAN NOT NULL DEFAULT false,
    "delegated_from_id" UUID,
    "reason" TEXT NOT NULL,
    "valid_from" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valid_until" TIMESTAMPTZ(6) NOT NULL,
    "granted_by_id" UUID NOT NULL,
    "granted_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "access_grant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingest"."source_file" (
    "id" UUID NOT NULL,
    "facility_id" UUID NOT NULL,
    "family_config_id" UUID NOT NULL,
    "original_name" TEXT NOT NULL,
    "sha256" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "byte_size" BIGINT NOT NULL,
    "storage_path" TEXT NOT NULL,
    "is_ocr_required" BOOLEAN NOT NULL DEFAULT false,
    "received_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "received_by_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "source_file_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingest"."parsed_record" (
    "id" UUID NOT NULL,
    "facility_id" UUID NOT NULL,
    "source_file_id" UUID NOT NULL,
    "record_index" BIGINT NOT NULL,
    "family_config_id" UUID NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'parsed',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_id" UUID NOT NULL,

    CONSTRAINT "parsed_record_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingest"."quarantine" (
    "id" UUID NOT NULL,
    "facility_id" UUID NOT NULL,
    "source_file_id" UUID,
    "parsed_record_id" UUID,
    "rule_code" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "resolved_by_id" UUID,
    "resolved_at" TIMESTAMPTZ(6),
    "resolution_note" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quarantine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingest"."ocr_result" (
    "id" UUID NOT NULL,
    "facility_id" UUID NOT NULL,
    "source_file_id" UUID NOT NULL,
    "parsed_record_id" UUID,
    "page_number" BIGINT NOT NULL DEFAULT 1,
    "engine" TEXT NOT NULL,
    "engine_version" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "text_content" TEXT NOT NULL,
    "metrics" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ocr_result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "graph"."entity_type" (
    "id" UUID NOT NULL,
    "facility_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "schema_definition" JSONB NOT NULL,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "created_by_id" UUID NOT NULL,

    CONSTRAINT "entity_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "graph"."entity" (
    "id" UUID NOT NULL,
    "facility_id" UUID NOT NULL,
    "entity_type_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "data" JSONB NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "confirmed_by_id" UUID,
    "confirmed_at" TIMESTAMPTZ(6),
    "source_file_id" UUID,
    "version" BIGINT NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "created_by_id" UUID NOT NULL,
    "updated_by_id" UUID,

    CONSTRAINT "entity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "graph"."relation" (
    "id" UUID NOT NULL,
    "facility_id" UUID NOT NULL,
    "source_entity_id" UUID NOT NULL,
    "target_entity_id" UUID NOT NULL,
    "relation_type" TEXT NOT NULL,
    "role" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_id" UUID NOT NULL,

    CONSTRAINT "relation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "truth"."origin_history" (
    "id" UUID NOT NULL,
    "facility_id" UUID NOT NULL,
    "entity_id" UUID NOT NULL,
    "version" BIGINT NOT NULL,
    "source_file_id" UUID NOT NULL,
    "parsed_record_id" UUID,
    "rule_code" TEXT,
    "rule_severity" TEXT,
    "calculation" JSONB,
    "confirmed_by_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_id" UUID NOT NULL,

    CONSTRAINT "origin_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "truth"."audit_log" (
    "id" UUID NOT NULL,
    "facility_id" UUID NOT NULL,
    "actor_id" UUID,
    "action" TEXT NOT NULL,
    "target_table" TEXT NOT NULL,
    "target_id" UUID NOT NULL,
    "details" JSONB NOT NULL DEFAULT '{}',
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "config"."family_config" (
    "id" UUID NOT NULL,
    "facility_id" UUID NOT NULL,
    "family_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "schema_definition" JSONB NOT NULL,
    "parser_key" TEXT NOT NULL,
    "is_ocr_required" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "created_by_id" UUID NOT NULL,
    "updated_by_id" UUID,

    CONSTRAINT "family_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "config"."validation_rule" (
    "id" UUID NOT NULL,
    "facility_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "expression" JSONB NOT NULL,
    "message" TEXT NOT NULL,
    "applies_to" JSONB NOT NULL DEFAULT '{}',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "created_by_id" UUID NOT NULL,
    "updated_by_id" UUID,

    CONSTRAINT "validation_rule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform"."memory_embedding" (
    "id" UUID NOT NULL,
    "facility_id" UUID NOT NULL,
    "entity_id" UUID,
    "source_file_id" UUID,
    "chunk" TEXT NOT NULL,
    "embedding" vector(768) NOT NULL,
    "model" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "memory_embedding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform"."job_run" (
    "id" UUID NOT NULL,
    "facility_id" UUID NOT NULL,
    "queue" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "attempt" BIGINT NOT NULL DEFAULT 0,
    "input" JSONB NOT NULL DEFAULT '{}',
    "output" JSONB,
    "error" TEXT,
    "started_at" TIMESTAMPTZ(6),
    "finished_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_run_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform"."session" (
    "id" UUID NOT NULL,
    "facility_id" UUID NOT NULL,
    "app_user_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "issued_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "last_seen_at" TIMESTAMPTZ(6),
    "revoked_at" TIMESTAMPTZ(6),
    "ip_address" TEXT,
    "user_agent" TEXT,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform"."engram_ref" (
    "id" UUID NOT NULL,
    "facility_id" UUID NOT NULL,
    "project" TEXT NOT NULL,
    "observation_id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "entity_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_id" UUID,

    CONSTRAINT "engram_ref_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "facility_code_key" ON "core"."facility"("code");

-- CreateIndex
CREATE INDEX "department_facility_id_idx" ON "core"."department"("facility_id");

-- CreateIndex
CREATE UNIQUE INDEX "department_facility_id_code_key" ON "core"."department"("facility_id", "code");

-- CreateIndex
CREATE INDEX "app_user_facility_id_idx" ON "core"."app_user"("facility_id");

-- CreateIndex
CREATE INDEX "app_user_department_id_idx" ON "core"."app_user"("department_id");

-- CreateIndex
CREATE INDEX "app_user_reports_to_id_idx" ON "core"."app_user"("reports_to_id");

-- CreateIndex
CREATE UNIQUE INDEX "app_user_facility_id_username_key" ON "core"."app_user"("facility_id", "username");

-- CreateIndex
CREATE UNIQUE INDEX "app_user_facility_id_email_key" ON "core"."app_user"("facility_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "role_code_key" ON "core"."role"("code");

-- CreateIndex
CREATE UNIQUE INDEX "permission_code_key" ON "core"."permission"("code");

-- CreateIndex
CREATE INDEX "domain_facility_id_idx" ON "core"."domain"("facility_id");

-- CreateIndex
CREATE UNIQUE INDEX "domain_facility_id_code_key" ON "core"."domain"("facility_id", "code");

-- CreateIndex
CREATE INDEX "access_grant_facility_id_idx" ON "core"."access_grant"("facility_id");

-- CreateIndex
CREATE INDEX "access_grant_grantee_id_permission_id_idx" ON "core"."access_grant"("grantee_id", "permission_id");

-- CreateIndex
CREATE INDEX "access_grant_target_entity_id_idx" ON "core"."access_grant"("target_entity_id");

-- CreateIndex
CREATE INDEX "source_file_facility_id_idx" ON "ingest"."source_file"("facility_id");

-- CreateIndex
CREATE INDEX "source_file_family_config_id_idx" ON "ingest"."source_file"("family_config_id");

-- CreateIndex
CREATE INDEX "source_file_facility_id_received_at_idx" ON "ingest"."source_file"("facility_id", "received_at");

-- CreateIndex
CREATE UNIQUE INDEX "source_file_facility_id_sha256_key" ON "ingest"."source_file"("facility_id", "sha256");

-- CreateIndex
CREATE INDEX "parsed_record_facility_id_idx" ON "ingest"."parsed_record"("facility_id");

-- CreateIndex
CREATE INDEX "parsed_record_family_config_id_idx" ON "ingest"."parsed_record"("family_config_id");

-- CreateIndex
CREATE INDEX "parsed_record_source_file_id_idx" ON "ingest"."parsed_record"("source_file_id");

-- CreateIndex
CREATE UNIQUE INDEX "parsed_record_source_file_id_record_index_key" ON "ingest"."parsed_record"("source_file_id", "record_index");

-- CreateIndex
CREATE INDEX "quarantine_facility_id_idx" ON "ingest"."quarantine"("facility_id");

-- CreateIndex
CREATE INDEX "quarantine_facility_id_status_idx" ON "ingest"."quarantine"("facility_id", "status");

-- CreateIndex
CREATE INDEX "quarantine_rule_code_idx" ON "ingest"."quarantine"("rule_code");

-- CreateIndex
CREATE INDEX "quarantine_source_file_id_idx" ON "ingest"."quarantine"("source_file_id");

-- CreateIndex
CREATE INDEX "quarantine_parsed_record_id_idx" ON "ingest"."quarantine"("parsed_record_id");

-- CreateIndex
CREATE INDEX "ocr_result_facility_id_idx" ON "ingest"."ocr_result"("facility_id");

-- CreateIndex
CREATE INDEX "ocr_result_source_file_id_idx" ON "ingest"."ocr_result"("source_file_id");

-- CreateIndex
CREATE UNIQUE INDEX "ocr_result_source_file_id_page_number_key" ON "ingest"."ocr_result"("source_file_id", "page_number");

-- CreateIndex
CREATE INDEX "entity_type_facility_id_idx" ON "graph"."entity_type"("facility_id");

-- CreateIndex
CREATE UNIQUE INDEX "entity_type_facility_id_code_key" ON "graph"."entity_type"("facility_id", "code");

-- CreateIndex
CREATE INDEX "entity_facility_id_idx" ON "graph"."entity"("facility_id");

-- CreateIndex
CREATE INDEX "entity_entity_type_id_idx" ON "graph"."entity"("entity_type_id");

-- CreateIndex
CREATE INDEX "entity_facility_id_status_idx" ON "graph"."entity"("facility_id", "status");

-- CreateIndex
CREATE INDEX "entity_source_file_id_idx" ON "graph"."entity"("source_file_id");

-- CreateIndex
CREATE INDEX "entity_confirmed_by_id_idx" ON "graph"."entity"("confirmed_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "entity_facility_id_entity_type_id_code_key" ON "graph"."entity"("facility_id", "entity_type_id", "code");

-- CreateIndex
CREATE INDEX "relation_facility_id_idx" ON "graph"."relation"("facility_id");

-- CreateIndex
CREATE INDEX "relation_target_entity_id_relation_type_idx" ON "graph"."relation"("target_entity_id", "relation_type");

-- CreateIndex
CREATE UNIQUE INDEX "relation_source_entity_id_target_entity_id_relation_type_key" ON "graph"."relation"("source_entity_id", "target_entity_id", "relation_type");

-- CreateIndex
CREATE INDEX "origin_history_facility_id_idx" ON "truth"."origin_history"("facility_id");

-- CreateIndex
CREATE INDEX "origin_history_entity_id_idx" ON "truth"."origin_history"("entity_id");

-- CreateIndex
CREATE INDEX "origin_history_source_file_id_idx" ON "truth"."origin_history"("source_file_id");

-- CreateIndex
CREATE UNIQUE INDEX "origin_history_entity_id_version_key" ON "truth"."origin_history"("entity_id", "version");

-- CreateIndex
CREATE INDEX "audit_log_facility_id_idx" ON "truth"."audit_log"("facility_id");

-- CreateIndex
CREATE INDEX "audit_log_target_table_target_id_idx" ON "truth"."audit_log"("target_table", "target_id");

-- CreateIndex
CREATE INDEX "audit_log_actor_id_idx" ON "truth"."audit_log"("actor_id");

-- CreateIndex
CREATE INDEX "family_config_facility_id_idx" ON "config"."family_config"("facility_id");

-- CreateIndex
CREATE UNIQUE INDEX "family_config_facility_id_family_code_key" ON "config"."family_config"("facility_id", "family_code");

-- CreateIndex
CREATE INDEX "validation_rule_facility_id_idx" ON "config"."validation_rule"("facility_id");

-- CreateIndex
CREATE UNIQUE INDEX "validation_rule_facility_id_code_key" ON "config"."validation_rule"("facility_id", "code");

-- CreateIndex
CREATE INDEX "memory_embedding_facility_id_idx" ON "platform"."memory_embedding"("facility_id");

-- CreateIndex
CREATE INDEX "memory_embedding_entity_id_idx" ON "platform"."memory_embedding"("entity_id");

-- CreateIndex
CREATE INDEX "memory_embedding_source_file_id_idx" ON "platform"."memory_embedding"("source_file_id");

-- CreateIndex
CREATE INDEX "job_run_facility_id_idx" ON "platform"."job_run"("facility_id");

-- CreateIndex
CREATE INDEX "job_run_facility_id_status_idx" ON "platform"."job_run"("facility_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "job_run_queue_job_id_key" ON "platform"."job_run"("queue", "job_id");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_hash_key" ON "platform"."session"("token_hash");

-- CreateIndex
CREATE INDEX "session_facility_id_idx" ON "platform"."session"("facility_id");

-- CreateIndex
CREATE INDEX "session_app_user_id_idx" ON "platform"."session"("app_user_id");

-- CreateIndex
CREATE INDEX "session_expires_at_idx" ON "platform"."session"("expires_at");

-- CreateIndex
CREATE INDEX "engram_ref_facility_id_idx" ON "platform"."engram_ref"("facility_id");

-- CreateIndex
CREATE INDEX "engram_ref_entity_id_idx" ON "platform"."engram_ref"("entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "engram_ref_facility_id_project_observation_id_key" ON "platform"."engram_ref"("facility_id", "project", "observation_id");

-- AddForeignKey
ALTER TABLE "core"."facility" ADD CONSTRAINT "facility_parent_facility_id_fkey" FOREIGN KEY ("parent_facility_id") REFERENCES "core"."facility"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."department" ADD CONSTRAINT "department_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "core"."facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."department" ADD CONSTRAINT "department_parent_department_id_fkey" FOREIGN KEY ("parent_department_id") REFERENCES "core"."department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."app_user" ADD CONSTRAINT "app_user_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "core"."facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."app_user" ADD CONSTRAINT "app_user_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "core"."department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."app_user" ADD CONSTRAINT "app_user_reports_to_id_fkey" FOREIGN KEY ("reports_to_id") REFERENCES "core"."app_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."app_user" ADD CONSTRAINT "app_user_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "core"."app_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."app_user" ADD CONSTRAINT "app_user_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "core"."app_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."user_role" ADD CONSTRAINT "user_role_app_user_id_fkey" FOREIGN KEY ("app_user_id") REFERENCES "core"."app_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."user_role" ADD CONSTRAINT "user_role_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "core"."role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."user_role" ADD CONSTRAINT "user_role_granted_by_id_fkey" FOREIGN KEY ("granted_by_id") REFERENCES "core"."app_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."role_permission" ADD CONSTRAINT "role_permission_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "core"."role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."role_permission" ADD CONSTRAINT "role_permission_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "core"."permission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."domain" ADD CONSTRAINT "domain_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "core"."facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."user_domain" ADD CONSTRAINT "user_domain_app_user_id_fkey" FOREIGN KEY ("app_user_id") REFERENCES "core"."app_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."user_domain" ADD CONSTRAINT "user_domain_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "core"."domain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."access_grant" ADD CONSTRAINT "access_grant_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "core"."facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."access_grant" ADD CONSTRAINT "access_grant_grantee_id_fkey" FOREIGN KEY ("grantee_id") REFERENCES "core"."app_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."access_grant" ADD CONSTRAINT "access_grant_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "core"."permission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."access_grant" ADD CONSTRAINT "access_grant_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "core"."domain"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."access_grant" ADD CONSTRAINT "access_grant_target_entity_id_fkey" FOREIGN KEY ("target_entity_id") REFERENCES "graph"."entity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."access_grant" ADD CONSTRAINT "access_grant_delegated_from_id_fkey" FOREIGN KEY ("delegated_from_id") REFERENCES "core"."app_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."access_grant" ADD CONSTRAINT "access_grant_granted_by_id_fkey" FOREIGN KEY ("granted_by_id") REFERENCES "core"."app_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingest"."source_file" ADD CONSTRAINT "source_file_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "core"."facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingest"."source_file" ADD CONSTRAINT "source_file_family_config_id_fkey" FOREIGN KEY ("family_config_id") REFERENCES "config"."family_config"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingest"."source_file" ADD CONSTRAINT "source_file_received_by_id_fkey" FOREIGN KEY ("received_by_id") REFERENCES "core"."app_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingest"."parsed_record" ADD CONSTRAINT "parsed_record_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "core"."facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingest"."parsed_record" ADD CONSTRAINT "parsed_record_source_file_id_fkey" FOREIGN KEY ("source_file_id") REFERENCES "ingest"."source_file"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingest"."parsed_record" ADD CONSTRAINT "parsed_record_family_config_id_fkey" FOREIGN KEY ("family_config_id") REFERENCES "config"."family_config"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingest"."parsed_record" ADD CONSTRAINT "parsed_record_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "core"."app_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingest"."quarantine" ADD CONSTRAINT "quarantine_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "core"."facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingest"."quarantine" ADD CONSTRAINT "quarantine_source_file_id_fkey" FOREIGN KEY ("source_file_id") REFERENCES "ingest"."source_file"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingest"."quarantine" ADD CONSTRAINT "quarantine_parsed_record_id_fkey" FOREIGN KEY ("parsed_record_id") REFERENCES "ingest"."parsed_record"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingest"."quarantine" ADD CONSTRAINT "quarantine_resolved_by_id_fkey" FOREIGN KEY ("resolved_by_id") REFERENCES "core"."app_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingest"."ocr_result" ADD CONSTRAINT "ocr_result_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "core"."facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingest"."ocr_result" ADD CONSTRAINT "ocr_result_source_file_id_fkey" FOREIGN KEY ("source_file_id") REFERENCES "ingest"."source_file"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingest"."ocr_result" ADD CONSTRAINT "ocr_result_parsed_record_id_fkey" FOREIGN KEY ("parsed_record_id") REFERENCES "ingest"."parsed_record"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graph"."entity_type" ADD CONSTRAINT "entity_type_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "core"."facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graph"."entity_type" ADD CONSTRAINT "entity_type_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "core"."app_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graph"."entity" ADD CONSTRAINT "entity_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "core"."facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graph"."entity" ADD CONSTRAINT "entity_entity_type_id_fkey" FOREIGN KEY ("entity_type_id") REFERENCES "graph"."entity_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graph"."entity" ADD CONSTRAINT "entity_confirmed_by_id_fkey" FOREIGN KEY ("confirmed_by_id") REFERENCES "core"."app_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graph"."entity" ADD CONSTRAINT "entity_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "core"."app_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graph"."entity" ADD CONSTRAINT "entity_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "core"."app_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graph"."entity" ADD CONSTRAINT "entity_source_file_id_fkey" FOREIGN KEY ("source_file_id") REFERENCES "ingest"."source_file"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graph"."relation" ADD CONSTRAINT "relation_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "core"."facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graph"."relation" ADD CONSTRAINT "relation_source_entity_id_fkey" FOREIGN KEY ("source_entity_id") REFERENCES "graph"."entity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graph"."relation" ADD CONSTRAINT "relation_target_entity_id_fkey" FOREIGN KEY ("target_entity_id") REFERENCES "graph"."entity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graph"."relation" ADD CONSTRAINT "relation_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "core"."app_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "truth"."origin_history" ADD CONSTRAINT "origin_history_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "core"."facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "truth"."origin_history" ADD CONSTRAINT "origin_history_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "graph"."entity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "truth"."origin_history" ADD CONSTRAINT "origin_history_source_file_id_fkey" FOREIGN KEY ("source_file_id") REFERENCES "ingest"."source_file"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "truth"."origin_history" ADD CONSTRAINT "origin_history_parsed_record_id_fkey" FOREIGN KEY ("parsed_record_id") REFERENCES "ingest"."parsed_record"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "truth"."origin_history" ADD CONSTRAINT "origin_history_confirmed_by_id_fkey" FOREIGN KEY ("confirmed_by_id") REFERENCES "core"."app_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "truth"."origin_history" ADD CONSTRAINT "origin_history_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "core"."app_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "truth"."audit_log" ADD CONSTRAINT "audit_log_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "core"."facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "truth"."audit_log" ADD CONSTRAINT "audit_log_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "core"."app_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "config"."family_config" ADD CONSTRAINT "family_config_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "core"."facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "config"."family_config" ADD CONSTRAINT "family_config_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "core"."app_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "config"."family_config" ADD CONSTRAINT "family_config_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "core"."app_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "config"."validation_rule" ADD CONSTRAINT "validation_rule_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "core"."facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "config"."validation_rule" ADD CONSTRAINT "validation_rule_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "core"."app_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "config"."validation_rule" ADD CONSTRAINT "validation_rule_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "core"."app_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."memory_embedding" ADD CONSTRAINT "memory_embedding_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "core"."facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."memory_embedding" ADD CONSTRAINT "memory_embedding_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "graph"."entity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."memory_embedding" ADD CONSTRAINT "memory_embedding_source_file_id_fkey" FOREIGN KEY ("source_file_id") REFERENCES "ingest"."source_file"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."job_run" ADD CONSTRAINT "job_run_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "core"."facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."session" ADD CONSTRAINT "session_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "core"."facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."session" ADD CONSTRAINT "session_app_user_id_fkey" FOREIGN KEY ("app_user_id") REFERENCES "core"."app_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."engram_ref" ADD CONSTRAINT "engram_ref_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "core"."facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."engram_ref" ADD CONSTRAINT "engram_ref_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "graph"."entity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."engram_ref" ADD CONSTRAINT "engram_ref_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "core"."app_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ─────────────────────────────────────────────────────────────────────────────
-- Parte que Prisma no modela (migration.sql, sección 2 de 2).
-- Prisma no expresa CHECK constraints, vistas, triggers ni índices de pgvector:
-- viven aquí, en SQL crudo, y son parte de la migración, como el resto.
-- Autoría de cada bloque: ver docs/ingenieria/DIAGRAMA-BD-v0.md (§Vistas,
-- §Triggers, §Trazabilidad) y docs/decisiones/ADR-0019.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── CHECK constraints: el vocabulario fijo del motor va como CHECK, no como
--    tipo enum nativo (§0.5). Ningún CHECK menciona a un cliente: solo el
--    vocabulario del motor (roles, permisos, alcances, severidades, estados,
--    colas). Los códigos que declara cada instalación (familias, reglas, tipos
--    de entidad) son datos y no se restringen aquí.

-- core
ALTER TABLE "core"."app_user" ADD CONSTRAINT "app_user_relation_type_check" CHECK ("relation_type" IN ('interno', 'externo'));
ALTER TABLE "core"."app_user" ADD CONSTRAINT "app_user_scope_check" CHECK ("scope" IN ('organizacion', 'instalacion', 'departamento', 'propio'));
ALTER TABLE "core"."app_user" ADD CONSTRAINT "app_user_status_check" CHECK ("status" IN ('activo', 'suspendido', 'baja'));
ALTER TABLE "core"."app_user" ADD CONSTRAINT "app_user_externo_vigencia_check" CHECK ("relation_type" <> 'externo' OR "valid_until" IS NOT NULL);
ALTER TABLE "core"."role" ADD CONSTRAINT "role_code_check" CHECK ("code" IN ('admin', 'manager', 'member', 'guest'));
ALTER TABLE "core"."permission" ADD CONSTRAINT "permission_code_check" CHECK ("code" IN ('read', 'download', 'create', 'update', 'submit', 'confirm', 'release', 'quarantine', 'manage_users', 'manage_permissions', 'manage_config', 'view_audit'));
ALTER TABLE "core"."access_grant" ADD CONSTRAINT "access_grant_scope_check" CHECK ("scope" IN ('organizacion', 'instalacion', 'departamento', 'propio'));
ALTER TABLE "core"."access_grant" ADD CONSTRAINT "access_grant_vigencia_check" CHECK ("valid_until" > "valid_from");

-- ingest
ALTER TABLE "ingest"."source_file" ADD CONSTRAINT "source_file_byte_size_check" CHECK ("byte_size" > 0);
ALTER TABLE "ingest"."parsed_record" ADD CONSTRAINT "parsed_record_status_check" CHECK ("status" IN ('parsed', 'validated', 'quarantined', 'accepted'));
ALTER TABLE "ingest"."quarantine" ADD CONSTRAINT "quarantine_severity_check" CHECK ("severity" IN ('BLOQUEO', 'AVISO'));
ALTER TABLE "ingest"."quarantine" ADD CONSTRAINT "quarantine_status_check" CHECK ("status" IN ('pending', 'resolved', 'dismissed'));

-- graph
ALTER TABLE "graph"."entity" ADD CONSTRAINT "entity_status_check" CHECK ("status" IN ('draft', 'pending_confirmation', 'official', 'rejected', 'superseded'));
ALTER TABLE "graph"."entity" ADD CONSTRAINT "entity_oficial_confirmada_check" CHECK ("status" <> 'official' OR ("confirmed_by_id" IS NOT NULL AND "confirmed_at" IS NOT NULL));
ALTER TABLE "graph"."entity" ADD CONSTRAINT "entity_confirmada_fecha_check" CHECK ("confirmed_by_id" IS NULL OR "confirmed_at" IS NOT NULL);

-- config
ALTER TABLE "config"."validation_rule" ADD CONSTRAINT "validation_rule_severity_check" CHECK ("severity" IN ('BLOQUEO', 'AVISO'));

-- platform
ALTER TABLE "platform"."job_run" ADD CONSTRAINT "job_run_queue_check" CHECK ("queue" IN ('ingest', 'text', 'reports', 'alerts'));
ALTER TABLE "platform"."job_run" ADD CONSTRAINT "job_run_status_check" CHECK ("status" IN ('queued', 'running', 'done', 'failed'));
ALTER TABLE "platform"."session" ADD CONSTRAINT "session_expiry_check" CHECK ("expires_at" > "issued_at");

-- ── Índice vectorial: la búsqueda semántica es Should (REQUISITOS §MoSCoW) y
--    el vector no lo escribe Prisma (ADR-0004). HNSW con distancia coseno.

CREATE INDEX "memory_embedding_embedding_hnsw_idx" ON "platform"."memory_embedding" USING hnsw ("embedding" vector_cosine_ops);

-- ── Vistas de lectura. Son el contrato de salida del dato oficial: una fila
--    confirmada con su responsable, y el encadenamiento hasta el documento.

CREATE OR REPLACE VIEW "truth"."official_record" AS
SELECT
    e."id" AS "id",
    e."facility_id" AS "facility_id",
    t."code" AS "entity_type_code",
    t."name" AS "entity_type_name",
    e."code" AS "code",
    e."data" AS "data",
    e."version" AS "version",
    e."confirmed_by_id" AS "confirmed_by_id",
    u."username" AS "confirmed_by_username",
    u."full_name" AS "confirmed_by_name",
    e."confirmed_at" AS "confirmed_at",
    e."source_file_id" AS "source_file_id",
    e."updated_at" AS "updated_at"
FROM "graph"."entity" e
JOIN "graph"."entity_type" t ON t."id" = e."entity_type_id"
LEFT JOIN "core"."app_user" u ON u."id" = e."confirmed_by_id"
WHERE e."status" = 'official';

CREATE OR REPLACE VIEW "truth"."entity_lineage" AS
SELECT
    e."id" AS "entity_id",
    e."facility_id" AS "facility_id",
    t."code" AS "entity_type_code",
    e."code" AS "entity_code",
    e."status" AS "entity_status",
    h."version" AS "version",
    h."rule_code" AS "rule_code",
    h."rule_severity" AS "rule_severity",
    h."calculation" AS "calculation",
    h."confirmed_by_id" AS "confirmed_by_id",
    h."created_at" AS "recorded_at",
    f."id" AS "source_file_id",
    f."original_name" AS "source_name",
    f."sha256" AS "source_sha256",
    f."family_config_id" AS "family_config_id",
    r."id" AS "parsed_record_id",
    r."record_index" AS "record_index"
FROM "graph"."entity" e
JOIN "graph"."entity_type" t ON t."id" = e."entity_type_id"
JOIN "truth"."origin_history" h ON h."entity_id" = e."id"
JOIN "ingest"."source_file" f ON f."id" = h."source_file_id"
LEFT JOIN "ingest"."parsed_record" r ON r."id" = h."parsed_record_id";

-- ── Solo-insert (ADR-0010): la base lo garantiza, no solo el código. Una
--    corrección es una fila nueva, nunca una edición. La guarda vive en core
--    porque todos los esquemas dependen de core.

CREATE OR REPLACE FUNCTION "core"."reject_mutation"() RETURNS trigger AS $$
BEGIN
    RAISE EXCEPTION '%"."% es solo-insert: la historia no se reescribe (ADR-0010)', TG_TABLE_SCHEMA, TG_TABLE_NAME
        USING ERRCODE = 'restrict_violation';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "source_file_solo_insert" BEFORE UPDATE OR DELETE ON "ingest"."source_file" FOR EACH ROW EXECUTE FUNCTION "core"."reject_mutation"();
CREATE TRIGGER "origin_history_solo_insert" BEFORE UPDATE OR DELETE ON "truth"."origin_history" FOR EACH ROW EXECUTE FUNCTION "core"."reject_mutation"();
CREATE TRIGGER "audit_log_solo_insert" BEFORE UPDATE OR DELETE ON "truth"."audit_log" FOR EACH ROW EXECUTE FUNCTION "core"."reject_mutation"();
CREATE TRIGGER "engram_ref_solo_insert" BEFORE UPDATE OR DELETE ON "platform"."engram_ref" FOR EACH ROW EXECUTE FUNCTION "core"."reject_mutation"();
