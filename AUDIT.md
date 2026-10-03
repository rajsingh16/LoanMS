# LoanMS codebase audit

Date: 2026-10-03

This document records the repository understanding and the changes made during the initial audit. It is intentionally focused on the current implementation, not an idealized rewrite.

## Current architecture

```text
React/Vite
  App.tsx -> React Router -> MainLayout/Pages -> services -> src/lib/api.ts
                                                        |
                                                        v
                                               Express server/index.js
                                                        |
                                               pg pool in server/db.js
                                                        |
                                                   PostgreSQL
```

The backend currently combines startup, authentication, route registration, request validation, SQL, row mapping, and business rules in `server/index.js`. It has no explicit service or repository layer. SQL is generally parameterized, with a small number of dynamically quoted table identifiers used for legacy center-table discovery.

## Frontend knowledge base

- `src/main.tsx` is the Vite/React entry point; `src/App.tsx` owns the router and composes `ThemeProvider` and `AuthProvider`.
- `MainLayout`, `Header`, and `Sidebar` provide the authenticated shell. Sidebar visibility is controlled by frontend role/module-permission checks.
- Loan master pages cover areas, centers, villages, clients, products, product groups, districts, insurance, pincodes, IFSC, and purposes.
- Loan transaction pages cover applications, details, credit bureau, NEFT, write-off, transfer, meetings, day close, death cases, verification, mapping, and audit. Several report/dashboard routes remain placeholders.
- `src/services` contains domain-oriented API wrappers, including a nested transaction-service group. `src/lib/api.ts` provides token storage, authenticated fetch, auth operations, and a database-like compatibility facade.
- `src/hooks/useAuth.ts` loads `/api/auth/me`, then profile and permissions. Admin is treated as having all frontend permissions. `ProtectedRoute` protects the authenticated route tree.
- Shared UI is in `src/components/Common` and `src/components/Layout`; forms are mostly separated from pages. Pagination, filtering, modals, tables, CSV upload, and theme support are reusable pieces.
- The frontend uses local state and context rather than Redux. Tokens are stored in localStorage, so XSS protection and short token lifetimes remain important operational concerns.

## Backend knowledge base

- `server/index.js` starts Express, configures CORS and JSON parsing, defines JWT middleware, then registers all routes.
- Authentication endpoints are `/api/auth/register`, `/api/auth/login`, and `/api/auth/me`. Passwords use bcrypt and JWTs expire after seven days.
- Public branch lookup supports registration. Most domain endpoints are protected only by `authMiddleware`; route-level authorization is not consistently enforced server-side.
- Domains present in the endpoint file include users/profiles, branches, centers, areas, pincodes, villages, master catalogs, loan transactions, reports, clients, and roles.
- `server/db.js` owns the PostgreSQL pool. Migrations under `server/migrations` define credentials, roles, profiles, permissions, branches, areas, centers, pincodes, villages, clients, and master catalogs.

## Database and business rules observed

- UUIDs are used for most entity identifiers. Profiles reference branches with `ON DELETE SET NULL`; credentials and permissions cascade from profiles.
- User permissions are unique per `(user_id, module, permission)` and limited to read/write/delete/admin. Profile roles are stored as text and are also represented by a roles master table, so role and permission semantics are currently split across two models.
- The frontend assumes administrators bypass permission checks. Normal users are expected to receive explicit module permissions, but the backend does not yet provide a complete equivalent enforcement layer.
- Existing API response shapes are mixed: some endpoints return `{data, error}`, others return `{data}`, `{user}`, `{ok}`, or top-level `{error}`. This is a compatibility constraint for incremental work.

## Architecture assessment

### Strengths

- Clear frontend domain/page grouping and a reusable component/service vocabulary.
- Parameterized SQL for normal values and explicit database migrations.
- JWT verification and bcrypt password hashing are present.
- Database constraints cover several important uniqueness, status, and foreign-key relationships.
- Existing API paths are simple and mostly REST-like.

### Weaknesses and risks

- **P0: authorization gap.** Most protected routes authenticate a user but do not verify that the user may perform the requested operation. Frontend guards are not a security boundary.
- **P1: monolithic backend.** `server/index.js` contains approximately 2,254 lines of unrelated route, mapping, validation, and data-access code. This increases regression and review risk.
- **P1: inconsistent error contracts.** Some handlers return raw database error messages and some return HTTP 200 for failures, exposing internals and complicating client behavior.
- **P1: registration privilege risk (fixed).** The public registration payload could previously choose its stored role. Registration now always creates a `viewer` profile while retaining payload compatibility.
- **P2: startup secret exposure (fixed).** `server/db.js` previously logged `DATABASE_URL`; that output is removed.
- **P2: split role model.** `user_profiles.role`, `roles`, and `user_permissions` coexist without one documented source of truth.
- **P2: scalability risk.** Many list endpoints fetch whole tables and filtering/pagination appears primarily client-driven.
- **P2: test coverage gap.** No test suite or automated API authorization regression suite is present in the repository.

## Proposed incremental architecture

```text
app.js/server entry
  -> middleware (auth, authorization, errors)
  -> routes by domain
  -> controllers (HTTP extraction/response only)
  -> services (only for real workflows/business rules)
  -> repositories (SQL/data access)
  -> PostgreSQL
```

Recommended extraction order is auth/users, master data, and transactions. Preserve current route paths and response shapes while moving one domain at a time. Do not introduce services for simple CRUD until a workflow or duplicated rule justifies them.

## Priority refactoring plan

| Priority | Problem | Current location | Proposed solution | Risk |
| --- | --- | --- | --- | --- |
| P0 | Missing backend authorization on many authenticated routes | `server/index.js` | Add centralized permission middleware and apply it per route/domain; add negative tests first | High; must map existing permissions carefully |
| P1 | Monolithic server file | `server/index.js` | Extract middleware, auth routes/controller, master-data routes, transaction routes, and repositories incrementally | Medium |
| P1 | Raw/internal errors returned to clients | `server/index.js` | Add safe error normalization and a final error handler; preserve success payloads | Medium |
| P1 | No automated regression coverage | Repository | Add API smoke tests for login, permissions, CRUD, and admin/normal-user cases | Low/medium |
| P2 | Whole-table list queries | Domain handlers and services | Add server-side filters/pagination only where data volume warrants it | Medium |
| P2 | Role model duplication | migrations, auth hooks, role APIs | Document and converge semantics after compatibility analysis | High |
| P3 | Type duplication between frontend and backend | `src/types`, API payloads | Introduce shared contracts only after endpoint shapes stabilize | Medium |

## Changes made in this audit

- Removed the database connection-string startup log from `server/db.js`.
- Changed public registration to persist the least-privileged `viewer` role regardless of a caller-supplied `role` value. Existing request payloads and response shape remain compatible.
- Added this knowledge base, architecture map, prioritized plan, and remaining-risk record.

## Authorization Audit — Phase 2

### Routes reviewed

All route declarations in `server/index.js` were enumerated. The endpoint groups are authentication, public branches, users/profiles, centers, areas, pincodes, villages, master catalogs, clients, and roles. Most domain routes previously had authentication only.

### Authorization issues found

- `GET /api/users/:id/profile` and `GET /api/users/:id/permissions` accepted any authenticated user ID, creating an IDOR/data-disclosure risk.
- `PATCH /api/users/:id/profile` accepted access-bearing fields including `role`, `status`, `branch_id`, and `employee_id` without checking the caller, creating a privilege/assignment escalation risk.
- `GET /api/users`, user-by-role lookup, and all role-management endpoints were authenticated but not administrator-restricted.
- Remaining domain endpoints still need a complete permission matrix and object-level assignment audit.

### Authorization fixes

- Added server-side authorization context lookup from active profiles and user permissions.
- Added `requireAdministrator` and `requireSelfOrAdministrator` middleware with 403 responses.
- Scoped profile and permission reads to the caller or administrator.
- Restricted user listing, role lookup, role creation, role updates, and role bulk-upsert to administrators.
- Prevented non-administrators from changing access-bearing profile fields.

### Object-level authorization

The user/profile object boundary is now enforced. Task, project, file, folder, and transaction object-level checks remain outstanding because those domains are not represented by corresponding route groups in the current server file and require a separate schema/query review.

### Routes changed

Only middleware composition changed; URLs and successful response payloads were preserved. Unauthorized access now returns 403 for the hardened user/role routes.

### Refactoring performed

- Added reusable authorization middleware in `server/index.js` as a minimal-risk step.
- Added `ARCHITECTURE.md` as the ongoing reference document.
- Large-file domain extraction was intentionally deferred until the permission matrix is complete, to avoid moving security-sensitive behavior without tests.

## Regression review performed

- Static inspection completed for routes, auth flow, frontend routing, services, types, migrations, and configuration.
- `npm run build` and `npm run lint` should be run after this audit change; a live PostgreSQL-backed workflow was not exercised because no database test environment was started.
- No UI components, Tailwind classes, routes, database migrations, or frontend API contracts were changed.

### Testing performed

- Static route enumeration and source inspection.
- ESLint previously completed without reported errors.
- Runtime authorization and database-backed tests were not performed because no test database is configured.
- Vite build remains environment-blocked by esbuild `spawn EPERM`.

## Remaining issues

- Backend authorization is still incomplete and should be the next security-focused change.
- The server remains monolithic; extraction should be done with route-by-route smoke tests.
- Error response normalization, rate limiting, request validation, and security headers need a dedicated pass.
- No schema changes were made.
