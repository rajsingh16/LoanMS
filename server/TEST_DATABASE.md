# Isolated database workflow

The migration runner only accepts `LOANMS_TEST_DATABASE_URL` pointing to a
database named `loanms_test` or `loanms_test_<name>`. It refuses an URL equal
to the application `DATABASE_URL`; it never targets `LoanMS`, `ShanConnects`,
or `postgres` by name.

Provision the empty disposable database outside this repository using the
team-approved PostgreSQL administration process, then set its URL only in the
current shell. Do not add it to `.env` or commit credentials.

```powershell
$env:LOANMS_TEST_DATABASE_URL = 'postgresql://…/loanms_test_phase8'
npm run db:test:migrate
npm run db:test:status
```

The runner discovers numbered SQL files in `server/migrations`, runs them in
numeric order, records successful filenames in `schema_migrations`, and wraps
each ordinary migration in its own transaction. It aborts rather than silently
handling SQL that needs non-transactional execution.

Cleanup is intentionally not automated. Drop the disposable database only
through the same approved administration process after integration tests have
finished. The runner is not a baseline tool for manually migrated shared
databases: establish a baseline only after separately verifying their schema.
