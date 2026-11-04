---
name: docu-frontend
description: Frontend conventions for DOCU in Angular 22 zoneless - structure (core/ui/features), design tokens, ApiState pattern, RBAC guards, testing patterns, and how to add a screen or connect to the backend. Use when building or reviewing anything in apps/web.
---
<!--
owner: reeinhardd
trigger: when building or reviewing anything in apps/web
purpose: Frontend conventions, structure and patterns for DOCU
-->

# Frontend in DOCU (Angular 22 zoneless + Tailwind 4)

Source of truth: `docs/briefs/BRIEF-84-plataforma-frontend.md` (the base) and
`docs/diseno/DESIGN-SYSTEM.md` (the design). If they disagree, the brief wins.

## Structure (where each thing goes)

| If it is... | It goes in |
|---|---|
| Screen of the case | `app/features/<name>/<name>-page.ts` + `.html` |
| Reusable presentational piece | `app/ui/<component>/` (PageHeader, StateView, StatusBadge are there) |
| Service, model, guard, interceptor | `app/core/` |
| Types shared with the backend | `app/core/models/` — when `packages/` exists they move there untouched |

## Hard rules

1. **Identifiers in English** (classes, functions, variables, route paths,
   permission keys); **UI text in Spanish** (RNF-01). Same TypeScript as the
   backend: type names match the ER vocabulary (`OfficialRecord`,
   `ValidationRule`, `Session`, `Permission`).
2. **Zero global CSS outside tokens.** Colors, spacing, radius, shadows come
   from `styles/tokens.css` (`--color-*`, `--text-*`). A screen never invents
   a color: if two screens need it, it is a token.
3. **Every read goes through `ApiClient`** and renders through
   `StateView` — the loading/empty/error contract is not optional.
4. **Permissions are keys, not UI decisions**: routes use
   `requiresPermission(ROUTE_PERMISSIONS.x)`; the server (RF-06) decides for
   real. Client-side guards only avoid rendering.
5. **DEMO data is transient**: `signInDemo()`, `DEMO_PERMISSIONS` and any
   hardcoded fixture are marked DEMO ONLY and die when #12 lands. The final
   version is fully dynamic from the backend.
6. **Errors follow the `ApiError` contract** (`core/models/api-error.ts`):
   codes are stable values, `message` is Spanish and safe to show. The
   401/403 flows live in the interceptors — never handle them per screen.
7. **Notifications (toasts) are for ACTIONS**, reads speak through
   `StateView`. Use `NotificationService.notify(message, kind)` after a
   mutation succeeds or fails — never inside a read.
8. **Security frontier**: token in memory only (never `localStorage`), never
   `bypassSecurityTrust`/`innerHTML`, no secrets in the front, client
   validation is UX (the server is the authority). Contract:
   `docs/ingenieria/ALCANCE-SOLUCION.md` §2.1.
9. **Tests first** (ADR-0018): a screen without its spec does not enter.
   Route specs use `RouterTestingHarness.navigateByUrl`; HTTP specs use
   `HttpTestingController`; presentational specs use `setInput`.

## How to add a screen (checklist)

1. Folder `app/features/<name>/` with `<name>-page.ts` + `.html`.
2. Route in `app.routes.ts` with `title` (Spanish), lazy `loadComponent`,
   `canActivate: [authGuard, requiresPermission(...)]`.
3. Add the permission key to `ROUTE_PERMISSIONS` if it is a new one.
4. Nav link in `app.ts` if it belongs in the main navigation.
5. Spec first: navigation renders the title, and every `ApiClient` call is
   covered for ready/empty/error.

## How the backend connects (when #12 lands)

- URL base: `core/config/api-url.ts` (one token, one place).
- Auth: `POST /v1/auth/login` -> `AuthService` stores `Session.token`;
  `authInterceptor` attaches it. Replace `signInDemo()` and delete demo data.
- Reads: `ApiClient.get('/quarantine')` etc. — endpoints in
  `docs/ingenieria/ALCANCE-SOLUCION.md` §2.
- Errors: the interceptor normalizes; `StateView` renders. Nothing else.
