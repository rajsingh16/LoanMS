import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import dotenv from 'dotenv';

const { Client } = pg;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const migrationsDir = path.join(root, 'migrations');
dotenv.config({ path: path.resolve(root, '..', '.env') });
const target = process.env.LOANMS_TEST_DATABASE_URL;
const command = process.argv[2] || 'up';

function fail(message) { console.error(message); process.exitCode = 1; }
function testDatabaseName(url) {
  try { return decodeURIComponent(new URL(url).pathname.replace(/^\//, '')); } catch { return ''; }
}
function assertSafeTarget() {
  if (!target) throw new Error('LOANMS_TEST_DATABASE_URL is required');
  const database = testDatabaseName(target);
  if (!/^loanms_test(?:[_-][a-z0-9_]+)?$/i.test(database)) throw new Error('Refusing target: test database name must match loanms_test or loanms_test_<name>');
  if (process.env.DATABASE_URL && target === process.env.DATABASE_URL) throw new Error('Refusing target: test database URL matches DATABASE_URL');
  return database;
}
async function migrationFiles() {
  return (await fs.readdir(migrationsDir)).filter(name => /^\d+_.+\.sql$/i.test(name)).sort((a, b) => Number(a.match(/^\d+/)[0]) - Number(b.match(/^\d+/)[0]) || a.localeCompare(b));
}
function requiresSpecialHandling(sql) { return /CREATE\s+INDEX\s+CONCURRENTLY|DROP\s+INDEX\s+CONCURRENTLY|VACUUM\b|ALTER\s+TYPE[\s\S]*ADD\s+VALUE/i.test(sql); }

try {
  const database = assertSafeTarget();
  if (!['up', 'status'].includes(command)) throw new Error('Usage: node server/scripts/migrate-test-database.js [up|status]');
  const client = new Client({ connectionString: target });
  await client.connect();
  await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (filename TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())`);
  const applied = new Set((await client.query('SELECT filename FROM schema_migrations')).rows.map(row => row.filename));
  const files = await migrationFiles();
  if (command === 'status') {
    for (const file of files) console.log(`${applied.has(file) ? 'applied' : 'pending'} ${file}`);
  } else {
    for (const file of files) {
      if (applied.has(file)) continue;
      const sql = await fs.readFile(path.join(migrationsDir, file), 'utf8');
      if (requiresSpecialHandling(sql)) throw new Error(`${file} requires manual transaction handling and was not applied`);
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations(filename) VALUES($1)', [file]);
        await client.query('COMMIT');
        console.log(`applied ${file}`);
      } catch (error) { await client.query('ROLLBACK'); throw new Error(`${file} failed: ${error.message}`); }
    }
  }
  await client.end();
  console.log(`target ${database}: complete`);
} catch (error) { fail(`Migration runner failed: ${error.message}`); }
