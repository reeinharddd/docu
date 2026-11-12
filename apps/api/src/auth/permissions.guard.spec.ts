// Offline unit tests of the permission guard (ADR-0009): the route declares
// what it needs through metadata, the guard checks the session's permissions
// against it. Several required permissions mean ALL of them.
import { describe, expect, test } from 'bun:test'
import { ApiError } from '../common/api-error.js'
import { PermissionsGuard } from './permissions.guard.js'
import type { SessionRequest } from './session.guard.js'

function guardWith(
  required: string[] | undefined,
  permissions: string[],
): {
  result: () => boolean
} {
  // The guard only uses getAllAndOverride from the Reflector: a minimal stub
  // keeps the rule under test without Nest internals.
  const reflector = { getAllAndOverride: () => required }
  const guard = new PermissionsGuard(reflector as never)
  const request = {
    sessionUser: {
      sessionId: 's1',
      userId: 'u1',
      facilityId: 'f1',
      facilityCode: 'C1',
      username: 'andres',
      fullName: 'Andrés',
      roles: ['operador'],
      permissions,
    },
    headers: {},
  } as SessionRequest
  return {
    result: () =>
      guard.canActivate({
        switchToHttp: () => ({ getRequest: () => request }),
        getHandler: () => undefined,
        getClass: () => undefined,
      } as never),
  }
}

function errorOf(run: () => boolean): ApiError {
  try {
    run()
  } catch (e) {
    return e as ApiError
  }
  throw new Error('the guard allowed the request')
}

describe('permissions guard', () => {
  test('sin metadata la ruta solo exige la sesión (guard anterior)', () => {
    const { result } = guardWith(undefined, [])
    expect(result()).toBe(true)
  })

  test('con el permiso exacto pasa', () => {
    const { result } = guardWith(['read'], ['read', 'confirm'])
    expect(result()).toBe(true)
  })

  test('sin el permiso lanza 403 nombrando el permiso que falta', () => {
    const error = errorOf(guardWith(['confirm'], ['read']).result)
    expect(error.code).toBe('FORBIDDEN')
    expect(error.message).toContain('confirm')
  })

  test('varios permisos exigidos: con todos pasa', () => {
    const { result } = guardWith(
      ['create', 'submit'],
      ['read', 'create', 'submit'],
    )
    expect(result()).toBe(true)
  })

  test('varios permisos exigidos: si falta uno lanza 403 (POST /v1/files exige create + submit)', () => {
    const error = errorOf(
      guardWith(['create', 'submit'], ['read', 'create']).result,
    )
    expect(error.code).toBe('FORBIDDEN')
    expect(error.message).toContain('submit')
  })
})
