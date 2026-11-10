---
name: docu-frontend
description: Frontend conventions for DOCU in Angular 22 zoneless - structure (core types/services/middleware, features with their own routes, ui atoms/molecules/organisms), Tailwind tokens, ApiState pattern, RBAC guards, testing patterns, and how to add a screen or connect to the backend. Use when building or reviewing anything in apps/web.
---
<!--
owner: reeinharddd
trigger: when building or reviewing anything in apps/web
purpose: Frontend conventions, structure and patterns for DOCU
-->

# Frontend in DOCU (Angular 22 zoneless + Tailwind 4)

Source of truth: `docs/briefs/historico/BRIEF-84-plataforma-frontend.md` (the base) and
`docs/diseno/DESIGN-SYSTEM.md` (the design). If they disagree, the brief wins.

## Structure (where each thing goes)

A feature IS a domain and owns its part: its routes, its screens and, when
they exist, its service and its types. `core/` holds what crosses features and
is sorted by KIND first, DOMAIN second.

| If it is... | It goes in |
|---|---|
| Routes of a feature | `app/features/<domain>/<domain>.routes.ts` (URL, title, permission) |
| Screen of a feature | `app/features/<domain>/views/<name>-view.ts` + `.html` |
| Service of a feature | `app/features/<domain>/data/` (only when it exists) |
| Types of a feature | `app/features/<domain>/model/` (only when they exist) |
| Cross-cutting types | `app/core/types/` (`api-error`, `api-state`, `permissions`) |
| Cross-cutting services | `app/core/services/<domain>/` (`api`, `auth`, `notifications`) |
| Cross-cutting middleware | `app/core/middleware/<domain>/` (`auth/guards`, `permissions/guard`, `api/interceptors`) |
| Configuration | `app/core/config/` (`api-url`) |
| UI atom | `app/ui/atoms/` (button, status-badge) |
| UI molecule | `app/ui/molecules/` (page-header, state-view) |
| UI organism | `app/ui/organisms/` (toasts) |
| Types shared with the backend | `app/core/types/` — when `packages/` exists they move there untouched |

Levels are not decoration: an atom never imports a molecule, a molecule may
compose atoms, an organism mounts the app.

## Hard rules

1. **Identifiers in English** (classes, functions, variables, route paths,
   permission keys, CSS class names); **UI text in Spanish** (RNF-01). Same
   TypeScript as the backend: type names match the ER vocabulary
   (`OfficialRecord`, `ValidationRule`, `Session`, `Permission`).
2. **Tailwind only, no CSS files.** Utilities in the template, tokens from
   `styles/tokens.css`. A component with its own `.css` file is wrong unless
   the design system says so. Host-level styles go in `host: { class: ... }`.
   Colors, spacing, radius and shadows come from the tokens (`--color-*`,
   `--text-*`): a screen never invents a color.
3. **Every read goes through `ApiClient`** and renders through
   `StateView` — the loading/empty/error contract is not optional.
4. **Permissions are keys, not UI decisions**: routes use
   `requiresPermission(ROUTE_PERMISSIONS.x)`; the server (RF-06) decides for
   real. Client-side guards only avoid rendering.
5. **DEMO data is transient**: `signInDemo()`, `DEMO_PERMISSIONS` and any
   hardcoded fixture are marked DEMO ONLY and die when #12 lands. The final
   version is fully dynamic from the backend.
6. **Errors follow the `ApiError` contract** (`core/types/api-error.ts`):
   codes are stable values, `message` is Spanish and safe to show. The
   401/403 flows live in the interceptors — never handle them per screen.
7. **Notifications (toasts) are for ACTIONS**, reads speak through
   `StateView`. Use `NotificationService.notify(message, kind)` after a
   mutation succeeds or fails — never inside a read.
8. **Security frontier**: token in memory only (never `localStorage`), never
   `bypassSecurityTrust`/`innerHTML`, no secrets in the front, client
   validation is UX (the server is the authority). Contract:
   `docs/ingenieria/ALCANCE-SOLUCION.md` §2.1.
9. **A feature owns its routes**: `app.routes.ts` only mounts features with a
   lazy `loadChildren`; URL, Spanish title and `requiresPermission(...)` live
   in the feature's `<domain>.routes.ts`. One route, one file to trace.
10. **Buttons are atomic**: use `ui/atoms/button/` (`<app-button
    variant="..." size="...">`). A screen never writes button CSS — one change
    reaches every button.
11. **Tests first** (ADR-0018): a screen without its spec does not enter.
    Route specs use `RouterTestingHarness.navigateByUrl`; HTTP specs use
    `HttpTestingController`; presentational specs use `setInput`. Assert on
    semantics (`data-test`, `data-kind`, `data-variant`) or native behavior,
    never on styling internals.

## How to add a screen (checklist)

1. Folder `app/features/<domain>/views/` with `<name>-view.ts` + `.html`.
2. Routes in `app/features/<domain>/<domain>.routes.ts` with `title`
   (Spanish), `canActivate: [requiresPermission(...)]` and the component.
3. Mount the feature in `app.routes.ts` with a lazy `loadChildren`
   (plus `canActivate: [authGuard]` when it needs a session).
4. Add the permission key to `ROUTE_PERMISSIONS` if it is a new one.
5. Nav link in `app.ts` if it belongs in the main navigation.
6. Spec first: navigation renders the title, and every `ApiClient` call is
   covered for ready/empty/error.

## How the backend connects (when #12 lands)

- URL base: `core/config/api-url.ts` (one token, one place).
- Auth: `POST /v1/auth/login` -> `AuthService` stores `Session.token`;
  `authInterceptor` attaches it. Replace `signInDemo()` and delete demo data.
- Reads: `ApiClient.get('/quarantine')` etc. — endpoints in
  `docs/ingenieria/ALCANCE-SOLUCION.md` §2.
- Errors: the interceptor normalizes; `StateView` renders. Nothing else.
