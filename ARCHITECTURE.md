# LoanMS architecture reference

## Project overview

LoanMS is a Vite/React single-page application backed by an Express API and PostgreSQL. The current implementation is production-oriented but still consolidates most server responsibilities in one entrypoint.

## Frontend architecture

`src/main.tsx` mounts `App`. `src/App.tsx` defines React Router routes and composes the theme and authentication providers. `MainLayout` owns the authenticated shell, while pages are grouped by Loan master, transaction, report, and dashboard domains. Shared controls live under `src/components/Common`; API wrappers live under `src/services` and `src/lib/api.ts`.

Frontend permissions control navigation and affordances. They are convenience checks only; the API is the security boundary.

## Backend architecture

`server/index.js` currently owns Express startup, JWT authentication, authorization checks, route handlers, row mapping, validation, and SQL. `server/db.js` owns the PostgreSQL pool. Migrations are in `server/migrations`.

The safe target architecture is incremental:

```text
server entry -> middleware -> domain routes/controllers -> selected services -> repositories -> PostgreSQL
```

Simple CRUD should not gain unnecessary layers. Complex workflows such as assignment and permission management are good extraction candidates.

## Authentication

Registration is public and always creates a `viewer` profile. Login verifies bcrypt password hashes for active profiles and returns a seven-day JWT. Protected routes require `Authorization: Bearer <token>`. `/api/auth/me` validates the session by looking up the credential record.

## Authorization

Authorization is based on the profile role and `user_permissions`. Administrators are represented by `admin` or `administrator` role values. Current hardened rules:

- User profile and permission reads are limited to the same user or an administrator.
- User listing and role endpoints require an administrator.
- Profile updates by non-administrators cannot change role, branch, status, or employee assignment fields.
- Other domain routes remain authenticated but require a follow-up route-by-route permission mapping before adding restrictive middleware, because the existing frontend permission names and business workflows are not uniformly represented in server code.

## Database architecture

PostgreSQL migrations define credentials, profiles, roles, permissions, branches, areas, centers, pincodes, villages, clients, and master catalogs. UUIDs are used broadly. Foreign keys generally preserve or remove dependent records deliberately (`SET NULL` for branch/profile references and `CASCADE` for credentials/permissions).

## API architecture

Routes are under `/api`. Response shapes are historically mixed (`data/error`, `user`, and top-level error forms); preserving them is important for incremental refactoring. SQL values are parameterized. Dynamic identifiers are quoted by `quoteIdent` after schema discovery.

## Important business rules

- Registration cannot create privileged users.
- Administrators have broader access than ordinary users.
- Normal-user visibility and actions are intended to follow explicit permissions and assignment relationships.
- UI visibility must not substitute for backend authorization.

## Known constraints

- No database-backed automated test environment is configured in the repository.
- The backend has no complete centralized route permission map yet.
- Several frontend routes are placeholders for future modules.
- Token storage uses localStorage, which makes XSS prevention especially important.

## Future refactoring opportunities

1. Complete the permission matrix and enforce it server-side by domain.
2. Add object-level assignment checks for tasks, projects, files, and transactions.
3. Extract auth/users, master data, and transaction route modules from `server/index.js`.
4. Normalize safe error responses without changing successful response contracts.
5. Add API authorization tests using a disposable PostgreSQL database.
