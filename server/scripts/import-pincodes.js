import fs from 'fs';
import path from 'path';
import { pool } from '../db.js';
import dotenv from "dotenv";
dotenv.config();
function normalizeHeader(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function parseCsvLine(line) {
  const cells = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      cells.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
}

function findColumnIndex(headers, candidates) {
  const normalized = headers.map(normalizeHeader);
  return normalized.findIndex((header) => candidates.includes(header));
}

async function ensurePincodeTable() {
  await pool.query(`
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
    CREATE TABLE IF NOT EXISTS pincodes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      pincode TEXT NOT NULL UNIQUE,
      state TEXT,
      district TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
      created_by UUID REFERENCES user_profiles (id) ON DELETE SET NULL,
      updated_by UUID REFERENCES user_profiles (id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

async function main() {
  const csvPath = process.argv[2];

  if (!csvPath) {
    console.error('Usage: node server/scripts/import-pincodes.js <csv-file-path>');
    process.exit(1);
  }

  const resolvedPath = path.resolve(process.cwd(), csvPath);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`CSV file not found: ${resolvedPath}`);
    process.exit(1);
  }

  await ensurePincodeTable();

  const raw = fs.readFileSync(resolvedPath, 'utf8').replace(/^\uFEFF/, '');
  const lines = raw.split(/\r?\n/).filter((line) => line.trim().length > 0);

  if (lines.length < 2) {
    console.error('CSV file is empty or missing data rows.');
    process.exit(1);
  }

  const headers = parseCsvLine(lines[0]);
  const pincodeIndex = findColumnIndex(headers, ['pincode', 'pincodeid', 'pin', 'pincodecode']);
  const districtIndex = findColumnIndex(headers, ['district', 'districtname']);
  const stateIndex = findColumnIndex(headers, ['state', 'statename', 'circlename']);

  if (pincodeIndex === -1 || districtIndex === -1 || stateIndex === -1) {
    console.error('Required columns not found. Expected pincode, district, and state-like columns.');
    console.error(`Headers detected: ${headers.join(', ')}`);
    process.exit(1);
  }

  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (let lineNumber = 1; lineNumber < lines.length; lineNumber += 1) {
    const row = parseCsvLine(lines[lineNumber]);
    const pincode = String(row[pincodeIndex] || '').trim();
    const district = String(row[districtIndex] || '').trim();
    const state = String(row[stateIndex] || '').trim();

    if (!/^\d{6}$/.test(pincode) || !district || !state) {
      skipped += 1;
      continue;
    }

    const result = await pool.query(
      `INSERT INTO pincodes (pincode, district, state, status)
       VALUES ($1, $2, $3, 'active')
       ON CONFLICT (pincode) DO UPDATE
       SET district = EXCLUDED.district,
           state = EXCLUDED.state,
           status = 'active',
           updated_at = now()
       RETURNING (xmax = 0) AS inserted`,
      [pincode, district, state]
    );

    if (result.rows[0]?.inserted) {
      inserted += 1;
    } else {
      updated += 1;
    }
  }

  console.log(`Imported pincodes from ${path.relative(process.cwd(), resolvedPath)}`);
  console.log(`Inserted: ${inserted}`);
  console.log(`Updated: ${updated}`);
  console.log(`Skipped: ${skipped}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
