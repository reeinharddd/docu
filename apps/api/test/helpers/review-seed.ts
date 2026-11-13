// Semilla del escenario de revisión humana (BRIEF #12).
//
// El worker (#3/#46) es quien propone; para probar la bandeja hace falta una
// propuesta en `pending_confirmation` y el catálogo de permisos y roles que
// el motor define (prisma/seed/engine.sql). Este helper deja la base scratch
// en ese estado, sin tocar la base de desarrollo.

import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Client } from 'pg'
import {
  type FacilitySeed,
  repoRoot,
} from '../../prisma/tests/helpers/spec-db.js'

const MANAGER_ROLE_ID = 'c1000000-0000-4000-8000-000000000042'

/** Aplica el catálogo fijo del motor: permisos, roles y matriz rol→permiso. */
export async function applyEngineCatalog(client: Client): Promise<void> {
  const sql = readFileSync(
    join(repoRoot(), 'apps', 'api', 'prisma', 'seed', 'engine.sql'),
    'utf8',
  )
  await client.query(sql)
}

/** Le da un rol al usuario: es lo que traduce el guard en permisos. */
export async function grantRole(
  client: Client,
  appUserId: string,
  roleId: string = MANAGER_ROLE_ID,
): Promise<void> {
  await client.query(
    `INSERT INTO "core"."user_role" ("app_user_id", "role_id")
     VALUES ($1, $2) ON CONFLICT DO NOTHING`,
    [appUserId, roleId],
  )
}

export interface ReviewProposal {
  entityId: string
  sourceFileId: string
  parsedRecordId: string
  entityTypeId: string
}

/**
 * Deja una propuesta en revisión: tipo de entidad, original, registro
 * extraído y la entidad en `pending_confirmation` con versión 1.
 *
 * `entityTypeId` reutiliza un tipo de entidad ya creado: `graph.entity_type`
 * es unique por (facility_id, code), así que una segunda propuesta de la
 * misma familia no puede crear otro `turno`.
 * `code` permite proponer varias entidades del mismo tipo: `graph.entity`
 * es unique por (facility_id, entity_type_id, code).
 */
export async function seedReviewProposal(
  client: Client,
  seed: FacilitySeed,
  familyCode = 'turno',
  entityTypeId?: string,
  code = 'R-001',
): Promise<ReviewProposal> {
  const familyId = seed.familyIds[familyCode]
  if (familyId === undefined) {
    throw new Error(
      `la instalación de la spec no tiene la familia «${familyCode}»`,
    )
  }

  if (entityTypeId === undefined) {
    entityTypeId = randomUUID()
    await client.query(
      `INSERT INTO "graph"."entity_type"
         ("id", "facility_id", "code", "name", "schema_definition", "is_system",
          "is_active", "created_by_id", "updated_at")
       VALUES ($1, $2, 'turno', 'Turno', '{"fields":[]}', false, true, $3, now())`,
      [entityTypeId, seed.facilityId, seed.workerId],
    )
  }

  const sourceFileId = randomUUID()
  await client.query(
    `INSERT INTO "ingest"."source_file"
       ("id", "facility_id", "family_config_id", "original_name", "sha256",
        "mime_type", "byte_size", "storage_path", "received_at", "received_by_id")
     VALUES ($1, $2, $3, 'recepcion.xlsx', $4, 'application/pdf', 1024, $5,
             now(), $6)`,
    [
      sourceFileId,
      seed.facilityId,
      familyId,
      randomUUID().replace(/-/g, ''),
      `originales/${sourceFileId}.pdf`,
      seed.workerId,
    ],
  )

  const parsedRecordId = randomUUID()
  await client.query(
    `INSERT INTO "ingest"."parsed_record"
       ("id", "facility_id", "source_file_id", "record_index", "family_config_id",
        "payload", "status", "created_by_id")
     VALUES ($1, $2, $3, 0, $4, '{"turno":"nocturno"}', 'accepted', $5)`,
    [parsedRecordId, seed.facilityId, sourceFileId, familyId, seed.workerId],
  )

  const entityId = randomUUID()
  await client.query(
    `INSERT INTO "graph"."entity"
       ("id", "facility_id", "entity_type_id", "code", "data", "status",
        "source_file_id", "version", "created_by_id", "updated_at")
     VALUES ($1, $2, $3, $4, '{"turno":"nocturno"}', 'pending_confirmation',
             $5, 1, $6, now())`,
    [
      entityId,
      seed.facilityId,
      entityTypeId,
      code,
      sourceFileId,
      seed.workerId,
    ],
  )

  return { entityId, sourceFileId, parsedRecordId, entityTypeId }
}
