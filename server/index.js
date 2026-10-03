import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { pool } from './db.js';

const PORT = Number(process.env.PORT) || 3001;
const JWT_SECRET = process.env.JWT_SECRET;
const BCRYPT_ROUNDS = 10;

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}
if (!JWT_SECRET) {
  console.error('JWT_SECRET is required');
  process.exit(1);
}

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));

function authMiddleware(req, res, next) {
  const h = req.headers.authorization;
  if (!h?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const payload = jwt.verify(h.slice(7), JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// --- Auth ---
app.post('/api/auth/register', async (req, res) => {
  const {
    email,
    password,
    username,
    first_name,
    last_name,
    role,
    branch_id,
    phone,
    employee_id,
  } = req.body || {};

  if (!email || !password || !username || !first_name || !last_name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const client = await pool.connect();
  try {
    const dup = await client.query('SELECT 1 FROM user_credentials WHERE lower(email) = lower($1)', [
      email,
    ]);
    if (dup.rows.length) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const id = randomUUID();
    const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    await client.query('BEGIN');
    await client.query(
      `INSERT INTO user_profiles (
        id, username, first_name, last_name, role, branch_id, status, phone, employee_id
      ) VALUES ($1, $2, $3, $4, $5, $6, 'active', $7, $8)`,
      [id, username, first_name, last_name, role || 'viewer', branch_id || null, phone || null, employee_id || null]
    );
    await client.query(
      `INSERT INTO user_credentials (user_id, email, password_hash) VALUES ($1, lower($2), $3)`,
      [id, email, hash]
    );
    await client.query('COMMIT');
    return res.json({ ok: true });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(e);
    return res.status(500).json({ error: e.message || 'Registration failed' });
  } finally {
    client.release();
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const { rows } = await pool.query(
      `SELECT uc.user_id, uc.password_hash, uc.email
       FROM user_credentials uc
       JOIN user_profiles up ON up.id = uc.user_id
       WHERE lower(uc.email) = lower($1) AND up.status = 'active'`,
      [email]
    );
    if (!rows.length) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const { user_id, password_hash, email: dbEmail } = rows[0];
    const ok = await bcrypt.compare(password, password_hash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = jwt.sign({ sub: user_id }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({
      token,
      user: { id: user_id, email: dbEmail },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT uc.email FROM user_credentials uc WHERE uc.user_id = $1`,
      [req.userId]
    );
    if (!rows.length) {
      return res.status(401).json({ error: 'User not found' });
    }
    return res.json({
      user: { id: req.userId, email: rows[0].email },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to load session' });
  }
});

// --- Public branches (registration form) ---
app.get('/api/branches', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM branches WHERE status = 'active' ORDER BY branch_name`
    );
    return res.json({ data: rows });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to load branches', data: null });
  }
});

async function getActiveBranchById(branchId) {
  if (!branchId) return null;
  const { rows } = await pool.query(
    `SELECT id, branch_code, branch_name FROM branches WHERE id = $1 AND status = 'active'`,
    [branchId]
  );
  return rows[0] || null;
}

async function syncBranchFromArea(area) {
  if (String(area.area_type || '').toLowerCase() !== 'branch') {
    return;
  }

  await pool.query(
    `INSERT INTO branches (branch_code, branch_name, location, status)
     VALUES ($1, $2, $3, 'active')
     ON CONFLICT (branch_code) DO UPDATE
     SET branch_name = EXCLUDED.branch_name,
         location = EXCLUDED.location,
         status = 'active',
         updated_at = now()`,
    [
      area.area_code,
      area.area_name,
      [area.address1, area.district, area.state].filter(Boolean).join(', ') || null,
    ]
  );
}

function profileWithBranch(row) {
  if (!row) return null;
  const branches = row.branch_id
    ? {
        id: row.branch_id,
        branch_name: row.branch_name,
        branch_code: row.branch_code,
        location: row.location,
      }
    : null;
  const {
    branch_name: _bn,
    branch_code: _bc,
    location: _loc,
    ...profile
  } = row;
  return { ...profile, branches };
}

let resolvedCenterTable = null;

function quoteIdent(identifier) {
  return `"${String(identifier).replace(/"/g, '""')}"`;
}

async function getCenterTableName() {
  if (resolvedCenterTable) {
    return resolvedCenterTable;
  }

  // First prefer expected names.
  const preferred = await pool.query(
    `SELECT tablename
     FROM pg_catalog.pg_tables
     WHERE schemaname = 'public' AND tablename IN ('centers', 'center')
     ORDER BY CASE tablename WHEN 'centers' THEN 0 WHEN 'center' THEN 1 ELSE 2 END
     LIMIT 1`
  );
  if (preferred.rows[0]?.tablename) {
    resolvedCenterTable = preferred.rows[0].tablename;
    return resolvedCenterTable;
  }

  // Fallback: detect by required columns.
  const fallback = await pool.query(
    `SELECT table_name
     FROM information_schema.columns
     WHERE table_schema = 'public'
       AND column_name IN ('center_code', 'center_name', 'branch_id')
     GROUP BY table_name
     HAVING COUNT(DISTINCT column_name) = 3
     ORDER BY table_name
     LIMIT 1`
  );
  if (fallback.rows[0]?.table_name) {
    resolvedCenterTable = fallback.rows[0].table_name;
    return resolvedCenterTable;
  }

  throw new Error('Center table not found in database schema');
}

// --- Users / profiles ---
app.get('/api/users/:id/profile', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT up.*, b.branch_name, b.branch_code, b.location
       FROM user_profiles up
       LEFT JOIN branches b ON b.id = up.branch_id
       WHERE up.id = $1`,
      [req.params.id]
    );
    if (!rows.length) {
      return res.json({ data: null, error: { message: 'Not found' } });
    }
    return res.json({ data: profileWithBranch(rows[0]), error: null });
  } catch (e) {
    console.error(e);
    return res.json({ data: null, error: { message: e.message } });
  }
});

app.patch('/api/users/:id/profile', authMiddleware, async (req, res) => {
  const allowed = [
    'username',
    'first_name',
    'last_name',
    'role',
    'branch_id',
    'status',
    'phone',
    'employee_id',
  ];
  const updates = req.body || {};
  const sets = [];
  const vals = [];
  let i = 1;
  for (const key of allowed) {
    if (updates[key] !== undefined) {
      sets.push(`${key} = $${i++}`);
      vals.push(updates[key]);
    }
  }
  if (!sets.length) {
    return res.status(400).json({ error: 'No valid fields' });
  }
  vals.push(req.params.id);
  try {
    const { rows } = await pool.query(
      `UPDATE user_profiles SET ${sets.join(', ')}, updated_at = now() WHERE id = $${i} RETURNING *`,
      vals
    );
    if (!rows.length) {
      return res.status(404).json({ error: 'Not found' });
    }
    return res.json({ data: rows[0], error: null });
  } catch (e) {
    console.error(e);
    return res.json({ data: null, error: { message: e.message } });
  }
});

app.get('/api/users', authMiddleware, async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT up.*, b.branch_name, b.branch_code, b.location
       FROM user_profiles up
       LEFT JOIN branches b ON b.id = up.branch_id
       ORDER BY up.created_at DESC`
    );
    return res.json({ data: rows.map(profileWithBranch), error: null });
  } catch (e) {
    console.error(e);
    return res.json({ data: null, error: { message: e.message } });
  }
});

app.get('/api/users/:id/permissions', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM user_permissions WHERE user_id = $1`,
      [req.params.id]
    );
    return res.json({ data: rows, error: null });
  } catch (e) {
    console.error(e);
    return res.json({ data: null, error: { message: e.message } });
  }
});

app.get('/api/users/by-role/:role', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, first_name, last_name FROM user_profiles WHERE role = $1 AND status = 'active'`,
      [req.params.role]
    );
    return res.json({ data: rows });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ data: null, error: e.message });
  }
});

// --- Centers ---
app.get('/api/centers', authMiddleware, async (_req, res) => {
  try {
    const centerTable = quoteIdent(await getCenterTableName());
    const { rows } = await pool.query(`
      SELECT c.*,
        b.id AS b_id, b.branch_name AS b_branch_name, b.branch_code AS b_branch_code,
        u1.id AS a_id, u1.first_name AS a_fn, u1.last_name AS a_ln,
        u2.id AS c_id, u2.first_name AS c_fn, u2.last_name AS c_ln
      FROM ${centerTable} c
      LEFT JOIN branches b ON c.branch_id = b.id
      LEFT JOIN user_profiles u1 ON c.assigned_to = u1.id
      LEFT JOIN user_profiles u2 ON c.created_by = u2.id
      ORDER BY c.created_at DESC
    `);
    const data = rows.map((r) => ({
      ...stripJoinAliases(r),
      branches: r.b_id
        ? { id: r.b_id, branch_name: r.b_branch_name, branch_code: r.b_branch_code }
        : null,
      assigned_user: r.a_id ? { id: r.a_id, first_name: r.a_fn, last_name: r.a_ln } : null,
      created_user: r.c_id ? { id: r.c_id, first_name: r.c_fn, last_name: r.c_ln } : null,
    }));
    return res.json({ data, error: null });
  } catch (e) {
    console.error(e);
    return res.json({ data: null, error: { message: e.message } });
  }
});

function stripJoinAliases(r) {
  const out = { ...r };
  delete out.b_id;
  delete out.b_branch_name;
  delete out.b_branch_code;
  delete out.a_id;
  delete out.a_fn;
  delete out.a_ln;
  delete out.c_id;
  delete out.c_fn;
  delete out.c_ln;
  return out;
}

app.post('/api/centers', authMiddleware, async (req, res) => {
  const b = req.body;
  try {
    const centerTable = quoteIdent(await getCenterTableName());
    const branch = await getActiveBranchById(b.branch_id);
    if (!branch) {
      return res.status(400).json({
        data: null,
        error: { message: 'Please select a valid active branch before creating a center.' },
      });
    }
    const branchCode = branch.branch_code || 'CTR';
    const centerCode = `${branchCode}${String(Date.now()).slice(-4)}`;

    const { rows } = await pool.query(
      `INSERT INTO ${centerTable} (
        center_code, center_name, branch_id, village, assigned_to, center_day, center_time,
        contact_person_name, contact_person_number, meeting_place, address1, address2, landmark,
        pincode, city, district, state, latitude, longitude, status, blacklisted, bc_center_id, parent_center_id, created_by
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24
      ) RETURNING *`,
      [
        centerCode,
        b.center_name,
        b.branch_id,
        b.village ?? null,
        b.assigned_to ?? null,
        b.center_day ?? null,
        b.center_time ?? null,
        b.contact_person_name ?? null,
        b.contact_person_number ?? null,
        b.meeting_place ?? null,
        b.address1 ?? null,
        b.address2 ?? null,
        b.landmark ?? null,
        b.pincode ?? null,
        b.city ?? null,
        b.district ?? null,
        b.state ?? null,
        b.latitude ?? null,
        b.longitude ?? null,
        b.status ?? 'active',
        b.blacklisted ?? false,
        b.bc_center_id ?? null,
        b.parent_center_id ?? null,
        req.userId,
      ]
    );
    const id = rows[0].id;
    const full = await pool.query(
      `
      SELECT c.*,
        b.id AS b_id, b.branch_name AS b_branch_name, b.branch_code AS b_branch_code,
        u1.id AS a_id, u1.first_name AS a_fn, u1.last_name AS a_ln
      FROM ${centerTable} c
      LEFT JOIN branches b ON c.branch_id = b.id
      LEFT JOIN user_profiles u1 ON c.assigned_to = u1.id
      WHERE c.id = $1
    `,
      [id]
    );
    const r = full.rows[0];
    const data = {
      ...stripJoinAliases(r),
      branches: r.b_id
        ? { id: r.b_id, branch_name: r.b_branch_name, branch_code: r.b_branch_code }
        : null,
      assigned_user: r.a_id ? { id: r.a_id, first_name: r.a_fn, last_name: r.a_ln } : null,
    };
    return res.json({ data, error: null });
  } catch (e) {
    console.error(e);
    return res.json({ data: null, error: { message: e.message } });
  }
});

app.patch('/api/centers/:id', authMiddleware, async (req, res) => {
  const b = req.body;
  const fields = [
    'center_name',
    'branch_id',
    'village',
    'assigned_to',
    'center_day',
    'center_time',
    'contact_person_name',
    'contact_person_number',
    'meeting_place',
    'address1',
    'address2',
    'landmark',
    'pincode',
    'city',
    'district',
    'state',
    'latitude',
    'longitude',
    'status',
    'blacklisted',
    'bc_center_id',
    'parent_center_id',
  ];
  const sets = [];
  const vals = [];
  let i = 1;
  for (const f of fields) {
    if (b[f] !== undefined) {
      sets.push(`${f} = $${i++}`);
      vals.push(b[f]);
    }
  }
  if (!sets.length) {
    return res.status(400).json({ error: 'No fields' });
  }
  vals.push(req.params.id);
  try {
    if (b.branch_id !== undefined) {
      const branch = await getActiveBranchById(b.branch_id);
      if (!branch) {
        return res.status(400).json({
          data: null,
          error: { message: 'Please select a valid active branch before updating this center.' },
        });
      }
    }

    const centerTable = quoteIdent(await getCenterTableName());
    await pool.query(
      `UPDATE ${centerTable} SET ${sets.join(', ')}, updated_at = now() WHERE id = $${i}`,
      vals
    );
    const { rows } = await pool.query(
      `
      SELECT c.*,
        b.id AS b_id, b.branch_name AS b_branch_name, b.branch_code AS b_branch_code,
        u1.id AS a_id, u1.first_name AS a_fn, u1.last_name AS a_ln,
        u2.id AS c_id, u2.first_name AS c_fn, u2.last_name AS c_ln
      FROM ${centerTable} c
      LEFT JOIN branches b ON c.branch_id = b.id
      LEFT JOIN user_profiles u1 ON c.assigned_to = u1.id
      LEFT JOIN user_profiles u2 ON c.created_by = u2.id
      WHERE c.id = $1
    `,
      [req.params.id]
    );
    if (!rows.length) {
      return res.status(404).json({ error: 'Not found' });
    }
    const r = rows[0];
    const data = {
      ...stripJoinAliases(r),
      branches: r.b_id
        ? { id: r.b_id, branch_name: r.b_branch_name, branch_code: r.b_branch_code }
        : null,
      assigned_user: r.a_id ? { id: r.a_id, first_name: r.a_fn, last_name: r.a_ln } : null,
      created_user: r.c_id ? { id: r.c_id, first_name: r.c_fn, last_name: r.c_ln } : null,
    };
    return res.json({ data, error: null });
  } catch (e) {
    console.error(e);
    return res.json({ data: null, error: { message: e.message } });
  }
});

app.delete('/api/centers/:id', authMiddleware, async (req, res) => {
  try {
    const centerTable = quoteIdent(await getCenterTableName());
    await pool.query(`DELETE FROM ${centerTable} WHERE id = $1`, [req.params.id]);
    return res.json({ error: null });
  } catch (e) {
    console.error(e);
    return res.json({ error: { message: e.message } });
  }
});

// --- Areas ---
app.get('/api/areas', authMiddleware, async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT a.*, u.first_name AS cu_fn, u.last_name AS cu_ln
      FROM areas a
      LEFT JOIN user_profiles u ON a.created_by = u.id
      ORDER BY a.created_at DESC
    `);
    const data = rows.map((r) => {
      const { cu_fn, cu_ln, ...rest } = r;
      return {
        ...rest,
        created_user:
          cu_fn != null ? { first_name: cu_fn, last_name: cu_ln } : null,
      };
    });
    return res.json({ data, error: null });
  } catch (e) {
    console.error(e);
    return res.json({ data: null, error: { message: e.message } });
  }
});

app.post('/api/areas', authMiddleware, async (req, res) => {
  const b = req.body;
  try {
    const areaCode =
      b.area_code ||
      `${String(b.area_type || 'AR').substring(0, 2).toUpperCase()}${String(Date.now()).slice(-3)}`;
    const { rows } = await pool.query(
      `INSERT INTO areas (
        area_type, area_code, area_name, parent_area_code, branch_manager_id,
        address1, address2, phone_number, email_id, pincode, district, state,
        mandatory_document, branch_rating, min_center_clients, max_center_clients,
        bc_branch_id, business_partner, cashless_disb_partner, nach_partner,
        branch_opening_date, disb_on_meeting_date, cross_sell_allowed,
        is_disb_active, is_cash_disb_active, is_sub_product_enabled,
        is_client_sourcing_enabled, is_center_formation_enabled, status, created_by
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30
      ) RETURNING *`,
      [
        b.area_type,
        areaCode,
        b.area_name,
        b.parent_area_code ?? null,
        b.branch_manager_id ?? null,
        b.address1,
        b.address2 ?? null,
        b.phone_number ?? null,
        b.email_id ?? null,
        b.pincode,
        b.district,
        b.state ?? null,
        b.mandatory_document ?? null,
        b.branch_rating ?? null,
        b.min_center_clients ?? 0,
        b.max_center_clients ?? 0,
        b.bc_branch_id ?? null,
        b.business_partner,
        b.cashless_disb_partner ?? null,
        b.nach_partner ?? null,
        b.branch_opening_date,
        b.disb_on_meeting_date ?? false,
        b.cross_sell_allowed ?? false,
        b.is_disb_active ?? true,
        b.is_cash_disb_active ?? false,
        b.is_sub_product_enabled ?? false,
        b.is_client_sourcing_enabled ?? false,
        b.is_center_formation_enabled ?? false,
        'active',
        req.userId,
      ]
    );
    await syncBranchFromArea(rows[0]);
    return res.json({ data: rows[0], error: null });
  } catch (e) {
    console.error(e);
    return res.json({ data: null, error: { message: e.message } });
  }
});

app.patch('/api/areas/:id', authMiddleware, async (req, res) => {
  const b = req.body;
  const fields = [
    'area_type',
    'area_name',
    'parent_area_code',
    'branch_manager_id',
    'address1',
    'address2',
    'phone_number',
    'email_id',
    'pincode',
    'district',
    'state',
    'mandatory_document',
    'branch_rating',
    'min_center_clients',
    'max_center_clients',
    'bc_branch_id',
    'business_partner',
    'cashless_disb_partner',
    'nach_partner',
    'branch_opening_date',
    'disb_on_meeting_date',
    'cross_sell_allowed',
    'is_disb_active',
    'is_cash_disb_active',
    'is_sub_product_enabled',
    'is_client_sourcing_enabled',
    'is_center_formation_enabled',
  ];
  const sets = [];
  const vals = [];
  let i = 1;
  for (const f of fields) {
    if (b[f] !== undefined) {
      sets.push(`${f} = $${i++}`);
      vals.push(b[f]);
    }
  }
  if (!sets.length) {
    return res.status(400).json({ error: 'No fields' });
  }
  vals.push(req.params.id);
  try {
    const { rows } = await pool.query(
      `UPDATE areas SET ${sets.join(', ')}, updated_at = now() WHERE id = $${i} RETURNING *`,
      vals
    );
    if (!rows.length) {
      return res.status(404).json({ error: 'Not found' });
    }
    await syncBranchFromArea(rows[0]);
    return res.json({ data: rows[0], error: null });
  } catch (e) {
    console.error(e);
    return res.json({ data: null, error: { message: e.message } });
  }
});

app.delete('/api/areas/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query(`DELETE FROM areas WHERE id = $1`, [req.params.id]);
    return res.json({ error: null });
  } catch (e) {
    console.error(e);
    return res.json({ error: { message: e.message } });
  }
});

app.post('/api/areas/bulk-upsert', authMiddleware, async (req, res) => {
  const { rows: inputRows } = req.body || {};
  if (!Array.isArray(inputRows)) {
    return res.status(400).json({ error: 'rows array required' });
  }
  let created = 0;
  let updated = 0;
  let errors = 0;
  const errorDetails = [];

  for (let idx = 0; idx < inputRows.length; idx++) {
    const b = inputRows[idx];
    try {
      const areaCode = b.area_code;
      const ex = await pool.query(`SELECT id FROM areas WHERE area_code = $1`, [areaCode]);
      const payload = { ...b, created_by: req.userId };
      if (ex.rows.length) {
        const id = ex.rows[0].id;
        const fields = Object.keys(payload).filter(
          (k) => k !== 'area_code' && k !== 'id' && payload[k] !== undefined
        );
        const sets = fields.map((f, i) => `${f} = $${i + 1}`);
        const vals = fields.map((f) => payload[f]);
        vals.push(id);
        await pool.query(
          `UPDATE areas SET ${sets.join(', ')}, updated_at = now() WHERE id = $${fields.length + 1}`,
          vals
        );
        await syncBranchFromArea(payload);
        updated++;
      } else {
        await pool.query(
          `INSERT INTO areas (
            area_type, area_code, area_name, parent_area_code, branch_manager_id,
            address1, address2, phone_number, email_id, pincode, district, state,
            mandatory_document, branch_rating, min_center_clients, max_center_clients,
            bc_branch_id, business_partner, cashless_disb_partner, nach_partner,
            branch_opening_date, disb_on_meeting_date, cross_sell_allowed,
            is_disb_active, is_cash_disb_active, is_sub_product_enabled,
            is_client_sourcing_enabled, is_center_formation_enabled, status, created_by
          ) VALUES (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30
          )`,
          [
            payload.area_type,
            payload.area_code,
            payload.area_name,
            payload.parent_area_code ?? null,
            payload.branch_manager_id ?? null,
            payload.address1,
            payload.address2 ?? null,
            payload.phone_number ?? null,
            payload.email_id ?? null,
            payload.pincode,
            payload.district,
            payload.state ?? null,
            payload.mandatory_document ?? null,
            payload.branch_rating ?? null,
            payload.min_center_clients ?? 0,
            payload.max_center_clients ?? 0,
            payload.bc_branch_id ?? null,
            payload.business_partner,
            payload.cashless_disb_partner ?? null,
            payload.nach_partner ?? null,
            payload.branch_opening_date,
            payload.disb_on_meeting_date ?? false,
            payload.cross_sell_allowed ?? false,
            payload.is_disb_active ?? true,
            payload.is_cash_disb_active ?? false,
            payload.is_sub_product_enabled ?? false,
            payload.is_client_sourcing_enabled ?? false,
            payload.is_center_formation_enabled ?? false,
            payload.status || 'active',
            req.userId,
          ]
        );
        await syncBranchFromArea(payload);
        created++;
      }
    } catch (e) {
      errors++;
      errorDetails.push(`Row ${idx + 2}: ${e.message}`);
    }
  }

  return res.json({
    success: errors === 0,
    created,
    updated,
    errors,
    errorDetails: errorDetails.slice(0, 10),
  });
});

function mapPincodeRow(row) {
  return {
    id: row.id,
    pincode: row.pincode,
    state: row.state ?? '',
    district: row.district,
    status: row.status,
    insertedOn: row.created_at,
    insertedBy: row.inserted_by_name || row.inserted_by_email || 'System',
    updatedOn: row.updated_at,
    updatedBy: row.updated_by_name || row.updated_by_email || undefined,
  };
}

app.get('/api/pincodes/lookup/:pincode', authMiddleware, async (req, res) => {
  const pincode = String(req.params.pincode || '').trim();
  if (!/^\d{6}$/.test(pincode)) {
    return res.status(400).json({ error: 'Valid 6-digit pincode required' });
  }

  try {
    const { rows } = await pool.query(
      `SELECT
         p.*,
         trim(concat(cu.first_name, ' ', cu.last_name)) AS inserted_by_name,
         cuc.email AS inserted_by_email,
         trim(concat(uu.first_name, ' ', uu.last_name)) AS updated_by_name,
         uuc.email AS updated_by_email
       FROM pincodes p
       LEFT JOIN user_profiles cu ON cu.id = p.created_by
       LEFT JOIN user_credentials cuc ON cuc.user_id = p.created_by
       LEFT JOIN user_profiles uu ON uu.id = p.updated_by
       LEFT JOIN user_credentials uuc ON uuc.user_id = p.updated_by
       WHERE p.pincode = $1
       LIMIT 1`,
      [pincode]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Pincode not found' });
    }

    return res.json({ data: mapPincodeRow(rows[0]), error: null });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ data: null, error: { message: e.message } });
  }
});

app.get('/api/pincodes', authMiddleware, async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT
         p.*,
         trim(concat(cu.first_name, ' ', cu.last_name)) AS inserted_by_name,
         cuc.email AS inserted_by_email,
         trim(concat(uu.first_name, ' ', uu.last_name)) AS updated_by_name,
         uuc.email AS updated_by_email
       FROM pincodes p
       LEFT JOIN user_profiles cu ON cu.id = p.created_by
       LEFT JOIN user_credentials cuc ON cuc.user_id = p.created_by
       LEFT JOIN user_profiles uu ON uu.id = p.updated_by
       LEFT JOIN user_credentials uuc ON uuc.user_id = p.updated_by
       ORDER BY p.created_at DESC`
    );
    return res.json({ data: rows.map(mapPincodeRow), error: null });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ data: null, error: { message: e.message } });
  }
});

app.post('/api/pincodes', authMiddleware, async (req, res) => {
  const { pincode, state, district, status } = req.body || {};

  if (!pincode || !district || !state) {
    return res.status(400).json({ error: 'Pincode, district, and state are required' });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO pincodes (pincode, state, district, status, created_by, updated_by)
       VALUES ($1, $2, $3, $4, $5, $5)
       RETURNING *`,
      [String(pincode).trim(), state?.trim() || null, String(district).trim(), status || 'active', req.userId]
    );
    const created = rows[0];
    return res.status(201).json({
      data: mapPincodeRow({
        ...created,
        inserted_by_name: null,
        inserted_by_email: null,
        updated_by_name: null,
        updated_by_email: null,
      }),
      error: null,
    });
  } catch (e) {
    console.error(e);
    if (e.code === '23505') {
      return res.status(409).json({ error: 'Pincode already exists' });
    }
    return res.status(500).json({ error: e.message || 'Failed to create pincode' });
  }
});

async function updatePincode(req, res) {
  const { pincode, state, district, status } = req.body || {};
  const fields = [];
  const values = [];
  let index = 1;

  if (pincode !== undefined) {
    fields.push(`pincode = $${index++}`);
    values.push(String(pincode).trim());
  }
  if (state !== undefined) {
    fields.push(`state = $${index++}`);
    values.push(state ? String(state).trim() : null);
  }
  if (district !== undefined) {
    fields.push(`district = $${index++}`);
    values.push(String(district).trim());
  }
  if (status !== undefined) {
    fields.push(`status = $${index++}`);
    values.push(status);
  }

  if (!fields.length) {
    return res.status(400).json({ error: 'No fields' });
  }

  values.push(req.userId, req.params.id);

  try {
    const { rows } = await pool.query(
      `UPDATE pincodes
       SET ${fields.join(', ')}, updated_by = $${index++}, updated_at = now()
       WHERE id = $${index}
       RETURNING *`,
      values
    );
    if (!rows.length) {
      return res.status(404).json({ error: 'Not found' });
    }
    return res.json({
      data: mapPincodeRow({
        ...rows[0],
        inserted_by_name: null,
        inserted_by_email: null,
        updated_by_name: null,
        updated_by_email: null,
      }),
      error: null,
    });
  } catch (e) {
    console.error(e);
    if (e.code === '23505') {
      return res.status(409).json({ error: 'Pincode already exists' });
    }
    return res.status(500).json({ error: e.message || 'Failed to update pincode' });
  }
}

app.put('/api/pincodes/:id', authMiddleware, updatePincode);
app.patch('/api/pincodes/:id', authMiddleware, updatePincode);

app.delete('/api/pincodes/:id', authMiddleware, async (req, res) => {
  try {
    const { rowCount } = await pool.query(`DELETE FROM pincodes WHERE id = $1`, [req.params.id]);
    if (!rowCount) {
      return res.status(404).json({ error: 'Not found' });
    }
    return res.json({ error: null });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message || 'Failed to delete pincode' });
  }
});

function mapVillageRow(row) {
  return {
    id: row.id,
    village_id: row.village_id,
    village_name: row.village_name,
    village_code: row.village_code,
    branch_id: row.branch_id,
    status: row.status,
    village_classification: row.village_classification,
    pincode: row.pincode,
    city: row.city,
    country_name: row.country_name,
    district: row.district,
    post_office: row.post_office,
    mohalla_name: row.mohalla_name,
    panchayat_name: row.panchayat_name,
    police_station: row.police_station,
    contact_person_name: row.contact_person_name,
    contact_person_number: row.contact_person_number,
    language: row.language,
    customer_base_expected: row.customer_base_expected,
    distance_from_branch: row.distance_from_branch,
    bank_distance: row.bank_distance,
    nearest_bank_name: row.nearest_bank_name,
    hospital_distance: row.hospital_distance,
    nearest_hospital_name: row.nearest_hospital_name,
    police_station_distance: row.police_station_distance,
    population: row.population,
    road_type: row.road_type,
    school_type: row.school_type,
    hospital_type: row.hospital_type,
    religion_majority: row.religion_majority,
    category: row.category,
    is_primary_health_centre: row.is_primary_health_centre,
    is_politically_influenced: row.is_politically_influenced,
    number_of_schools: row.number_of_schools,
    total_clinics: row.total_clinics,
    total_kiryana_stores: row.total_kiryana_stores,
    total_kutcha_houses: row.total_kutcha_houses,
    total_pakka_houses: row.total_pakka_houses,
    latitude: row.latitude,
    longitude: row.longitude,
    created_at: row.created_at,
    updated_at: row.updated_at,
    branches: row.b_id
      ? { id: row.b_id, branch_name: row.b_branch_name, branch_code: row.b_branch_code }
      : null,
    created_user: row.c_id ? { id: row.c_id, first_name: row.c_fn, last_name: row.c_ln } : null,
  };
}

app.get('/api/villages', authMiddleware, async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT v.*,
        b.id AS b_id, b.branch_name AS b_branch_name, b.branch_code AS b_branch_code,
        u.id AS c_id, u.first_name AS c_fn, u.last_name AS c_ln
      FROM villages v
      LEFT JOIN branches b ON v.branch_id = b.id
      LEFT JOIN user_profiles u ON v.created_by = u.id
      ORDER BY v.created_at DESC
    `);
    return res.json({ data: rows.map(mapVillageRow), error: null });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ data: null, error: { message: e.message } });
  }
});

app.post('/api/villages', authMiddleware, async (req, res) => {
  const b = req.body || {};
  try {
    const villageId = `VIL${String(Date.now()).slice(-6)}`;
    const villageCode = `${String(b.village_name || 'VIL').replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 4) || 'VIL'}${String(Date.now()).slice(-4)}`;

    const { rows } = await pool.query(
      `INSERT INTO villages (
        village_id, village_name, village_code, branch_id, status, village_classification,
        pincode, city, country_name, district, post_office, mohalla_name, panchayat_name,
        police_station, contact_person_name, contact_person_number, language, customer_base_expected,
        distance_from_branch, bank_distance, nearest_bank_name, hospital_distance, nearest_hospital_name,
        police_station_distance, population, road_type, school_type, hospital_type, religion_majority,
        category, created_by
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31
      ) RETURNING *`,
      [
        villageId,
        b.village_name,
        villageCode,
        b.branch_id,
        b.status ?? 'active',
        b.village_classification,
        b.pincode,
        b.city ?? null,
        b.country_name ?? 'India',
        b.district,
        b.post_office,
        b.mohalla_name,
        b.panchayat_name,
        b.police_station,
        b.contact_person_name,
        b.contact_person_number ?? null,
        b.language,
        b.customer_base_expected ?? 0,
        b.distance_from_branch ?? 0,
        b.bank_distance ?? 0,
        b.nearest_bank_name,
        b.hospital_distance ?? 0,
        b.nearest_hospital_name,
        b.police_station_distance ?? 0,
        b.population ?? 0,
        b.road_type,
        b.school_type,
        b.hospital_type,
        b.religion_majority,
        b.category,
        req.userId,
      ]
    );

    const full = await pool.query(`
      SELECT v.*,
        b.id AS b_id, b.branch_name AS b_branch_name, b.branch_code AS b_branch_code,
        u.id AS c_id, u.first_name AS c_fn, u.last_name AS c_ln
      FROM villages v
      LEFT JOIN branches b ON v.branch_id = b.id
      LEFT JOIN user_profiles u ON v.created_by = u.id
      WHERE v.id = $1
    `, [rows[0].id]);

    return res.status(201).json({ data: mapVillageRow(full.rows[0]), error: null });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ data: null, error: { message: e.message } });
  }
});

app.put('/api/villages/:id', authMiddleware, async (req, res) => {
  const b = req.body || {};
  const fields = [
    'branch_id',
    'status',
    'village_name',
    'village_classification',
    'pincode',
    'city',
    'country_name',
    'district',
    'post_office',
    'mohalla_name',
    'panchayat_name',
    'police_station',
    'contact_person_name',
    'contact_person_number',
    'language',
    'customer_base_expected',
    'distance_from_branch',
    'bank_distance',
    'nearest_bank_name',
    'hospital_distance',
    'nearest_hospital_name',
    'police_station_distance',
    'population',
    'road_type',
    'school_type',
    'hospital_type',
    'religion_majority',
    'category',
  ];
  const sets = [];
  const vals = [];
  let i = 1;
  for (const field of fields) {
    if (b[field] !== undefined) {
      sets.push(`${field} = $${i++}`);
      vals.push(b[field]);
    }
  }
  if (!sets.length) {
    return res.status(400).json({ error: 'No fields' });
  }
  vals.push(req.params.id);

  try {
    const { rowCount } = await pool.query(
      `UPDATE villages SET ${sets.join(', ')}, updated_at = now() WHERE id = $${i}`,
      vals
    );
    if (!rowCount) {
      return res.status(404).json({ error: 'Not found' });
    }

    const full = await pool.query(`
      SELECT v.*,
        b.id AS b_id, b.branch_name AS b_branch_name, b.branch_code AS b_branch_code,
        u.id AS c_id, u.first_name AS c_fn, u.last_name AS c_ln
      FROM villages v
      LEFT JOIN branches b ON v.branch_id = b.id
      LEFT JOIN user_profiles u ON v.created_by = u.id
      WHERE v.id = $1
    `, [req.params.id]);

    return res.json({ data: mapVillageRow(full.rows[0]), error: null });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ data: null, error: { message: e.message } });
  }
});

app.delete('/api/villages/:id', authMiddleware, async (req, res) => {
  try {
    const { rowCount } = await pool.query(`DELETE FROM villages WHERE id = $1`, [req.params.id]);
    if (!rowCount) {
      return res.status(404).json({ error: 'Not found' });
    }
    return res.json({ error: null });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: { message: e.message } });
  }
});

// --- Master catalog modules ---
function actorName(row, prefix) {
  const first = row[`${prefix}_first_name`];
  const last = row[`${prefix}_last_name`];
  return [first, last].filter(Boolean).join(' ') || null;
}

function auditFields(row) {
  return {
    insertedOn: row.created_at,
    insertedBy: actorName(row, 'created') || row.created_by || 'System',
    updatedOn: row.updated_at,
    updatedBy: actorName(row, 'updated') || row.updated_by || null,
  };
}

function jsonData(row) {
  if (!row.data) return {};
  return typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
}

function masterDuplicateResponse(res, fallback) {
  return res.status(409).json({
    data: null,
    error: { message: fallback },
    message: fallback,
  });
}

function masterError(res, e, fallback = 'Request failed') {
  console.error(e);
  if (e.code === '23505') {
    return masterDuplicateResponse(res, 'A record with this code already exists.');
  }
  return res.status(500).json({
    data: null,
    error: { message: e.message || fallback },
    message: e.message || fallback,
  });
}

function unsupportedCsvUpload(_req, res) {
  return res.status(501).json({
    success: false,
    created: 0,
    updated: 0,
    errors: 1,
    message: 'CSV upload is not configured on the server yet. Please create records from the form.',
  });
}

function mapProductGroupRow(row) {
  return {
    ...jsonData(row),
    id: row.id,
    productGroupCode: row.product_group_code,
    productGroupName: row.product_group_name,
    productGroupSegment: row.product_group_segment,
    productGroupType: row.product_group_type,
    status: row.status,
    ...auditFields(row),
  };
}

function mapProductRow(row) {
  return {
    ...jsonData(row),
    id: row.id,
    productId: row.product_id,
    productCode: row.product_code,
    productName: row.product_name,
    productGroupId: row.product_group_id,
    status: row.status,
    ...auditFields(row),
  };
}

function mapDistrictRow(row) {
  return {
    id: row.id,
    districtCode: row.district_code,
    districtName: row.district_name,
    countryId: row.country_id,
    stateId: row.state_id,
    stateName: row.state_name,
    ...auditFields(row),
  };
}

function mapInsuranceRow(row) {
  return {
    ...jsonData(row),
    id: row.id,
    insuranceId: row.insurance_id,
    insuranceCode: row.insurance_code,
    insuranceType: row.insurance_type,
    insuranceName: row.insurance_name,
    status: row.status,
    ...auditFields(row),
  };
}

function mapIfscRow(row) {
  return {
    id: row.id,
    ifscCode: row.ifsc_code,
    bankName: row.bank_name,
    bankBranch: row.bank_branch,
    branchAddress: row.branch_address,
    bankAddress: row.branch_address,
    city: row.city,
    state: row.state,
    mobileNumber: row.mobile_number,
    ...auditFields(row),
  };
}

function mapPurposeRow(row) {
  return {
    id: row.id,
    purposeId: row.purpose_id,
    purposeCode: row.purpose_code,
    purposeName: row.purpose_name,
    mainPurposeId: row.main_purpose_id,
    isMainPurpose: row.is_main_purpose,
    status: row.status,
    ...auditFields(row),
  };
}

const masterAuditJoin = `
  LEFT JOIN user_profiles cb ON cb.id = t.created_by
  LEFT JOIN user_profiles ub ON ub.id = t.updated_by
`;

const masterAuditSelect = `
  cb.first_name AS created_first_name,
  cb.last_name AS created_last_name,
  ub.first_name AS updated_first_name,
  ub.last_name AS updated_last_name
`;

app.get('/api/product-groups', authMiddleware, async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT t.*, ${masterAuditSelect}
      FROM product_groups t
      ${masterAuditJoin}
      ORDER BY t.created_at DESC
    `);
    return res.json({ data: rows.map(mapProductGroupRow), error: null });
  } catch (e) {
    return masterError(res, e, 'Failed to load product groups');
  }
});

app.post('/api/product-groups/upload-csv', authMiddleware, unsupportedCsvUpload);

app.post('/api/product-groups', authMiddleware, async (req, res) => {
  const b = req.body || {};
  if (!b.productGroupCode || !b.productGroupName) {
    return res.status(400).json({ data: null, error: { message: 'Product group code and name are required.' } });
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO product_groups (
        product_group_code, product_group_name, product_group_segment, product_group_type,
        status, data, created_by, updated_by
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$7)
      RETURNING *`,
      [
        String(b.productGroupCode).trim(),
        String(b.productGroupName).trim(),
        b.productGroupSegment || null,
        b.productGroupType || null,
        b.status || 'active',
        JSON.stringify(b),
        req.userId,
      ]
    );
    return res.status(201).json({ data: mapProductGroupRow(rows[0]), error: null });
  } catch (e) {
    return masterError(res, e, 'Failed to create product group');
  }
});

app.put('/api/product-groups/:id', authMiddleware, async (req, res) => {
  const b = req.body || {};
  if (!b.productGroupCode || !b.productGroupName) {
    return res.status(400).json({ data: null, error: { message: 'Product group code and name are required.' } });
  }
  try {
    const { rows } = await pool.query(
      `UPDATE product_groups
       SET product_group_code = $1,
           product_group_name = $2,
           product_group_segment = $3,
           product_group_type = $4,
           status = $5,
           data = $6,
           updated_by = $7,
           updated_at = now()
       WHERE id = $8
       RETURNING *`,
      [
        String(b.productGroupCode).trim(),
        String(b.productGroupName).trim(),
        b.productGroupSegment || null,
        b.productGroupType || null,
        b.status || 'active',
        JSON.stringify(b),
        req.userId,
        req.params.id,
      ]
    );
    if (!rows.length) return res.status(404).json({ data: null, error: { message: 'Not found' } });
    return res.json({ data: mapProductGroupRow(rows[0]), error: null });
  } catch (e) {
    return masterError(res, e, 'Failed to update product group');
  }
});

app.delete('/api/product-groups/:id', authMiddleware, async (req, res) => {
  try {
    const { rowCount } = await pool.query(`DELETE FROM product_groups WHERE id = $1`, [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: { message: 'Not found' } });
    return res.json({ error: null });
  } catch (e) {
    return masterError(res, e, 'Failed to delete product group');
  }
});

app.get('/api/products', authMiddleware, async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT t.*, ${masterAuditSelect}
      FROM products t
      ${masterAuditJoin}
      ORDER BY t.created_at DESC
    `);
    return res.json({ data: rows.map(mapProductRow), error: null });
  } catch (e) {
    return masterError(res, e, 'Failed to load products');
  }
});

app.post('/api/products/upload-csv', authMiddleware, unsupportedCsvUpload);
app.post('/api/products/process', authMiddleware, (_req, res) => {
  return res.json({ success: true, message: 'Products processed successfully.' });
});

app.post('/api/products', authMiddleware, async (req, res) => {
  const b = req.body || {};
  if (!b.productGroupId || !b.productCode || !b.productName) {
    return res.status(400).json({ data: null, error: { message: 'Product group, code and name are required.' } });
  }
  try {
    const productId = b.productId || `PROD${String(Date.now()).slice(-8)}`;
    const { rows } = await pool.query(
      `INSERT INTO products (
        product_id, product_code, product_name, product_group_id, status, data, created_by, updated_by
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$7)
      RETURNING *`,
      [
        productId,
        String(b.productCode).trim(),
        String(b.productName).trim(),
        String(b.productGroupId).trim(),
        b.status || 'active',
        JSON.stringify({ ...b, productId }),
        req.userId,
      ]
    );
    return res.status(201).json({ data: mapProductRow(rows[0]), error: null });
  } catch (e) {
    return masterError(res, e, 'Failed to create product');
  }
});

app.put('/api/products/:id', authMiddleware, async (req, res) => {
  const b = req.body || {};
  if (!b.productGroupId || !b.productCode || !b.productName) {
    return res.status(400).json({ data: null, error: { message: 'Product group, code and name are required.' } });
  }
  try {
    const { rows: current } = await pool.query(`SELECT product_id FROM products WHERE id = $1`, [req.params.id]);
    if (!current.length) return res.status(404).json({ data: null, error: { message: 'Not found' } });
    const productId = b.productId || current[0].product_id;
    const { rows } = await pool.query(
      `UPDATE products
       SET product_id = $1,
           product_code = $2,
           product_name = $3,
           product_group_id = $4,
           status = $5,
           data = $6,
           updated_by = $7,
           updated_at = now()
       WHERE id = $8
       RETURNING *`,
      [
        productId,
        String(b.productCode).trim(),
        String(b.productName).trim(),
        String(b.productGroupId).trim(),
        b.status || 'active',
        JSON.stringify({ ...b, productId }),
        req.userId,
        req.params.id,
      ]
    );
    return res.json({ data: mapProductRow(rows[0]), error: null });
  } catch (e) {
    return masterError(res, e, 'Failed to update product');
  }
});

app.delete('/api/products/:id', authMiddleware, async (req, res) => {
  try {
    const { rowCount } = await pool.query(`DELETE FROM products WHERE id = $1`, [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: { message: 'Not found' } });
    return res.json({ error: null });
  } catch (e) {
    return masterError(res, e, 'Failed to delete product');
  }
});

app.get('/api/districts', authMiddleware, async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT t.*, ${masterAuditSelect}
      FROM districts t
      ${masterAuditJoin}
      ORDER BY t.created_at DESC
    `);
    return res.json({ data: rows.map(mapDistrictRow), error: null });
  } catch (e) {
    return masterError(res, e, 'Failed to load districts');
  }
});

app.post('/api/districts/upload-csv', authMiddleware, unsupportedCsvUpload);

app.post('/api/districts', authMiddleware, async (req, res) => {
  const b = req.body || {};
  if (!b.districtCode || !b.districtName || !b.countryId || !b.stateId || !b.stateName) {
    return res.status(400).json({ data: null, error: { message: 'District code, name, country, state and state name are required.' } });
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO districts (
        district_code, district_name, country_id, state_id, state_name, created_by, updated_by
      ) VALUES ($1,$2,$3,$4,$5,$6,$6)
      RETURNING *`,
      [b.districtCode, b.districtName, b.countryId, b.stateId, b.stateName, req.userId]
    );
    return res.status(201).json({ data: mapDistrictRow(rows[0]), error: null });
  } catch (e) {
    return masterError(res, e, 'Failed to create district');
  }
});

app.put('/api/districts/:id', authMiddleware, async (req, res) => {
  const b = req.body || {};
  if (!b.districtCode || !b.districtName || !b.countryId || !b.stateId || !b.stateName) {
    return res.status(400).json({ data: null, error: { message: 'District code, name, country, state and state name are required.' } });
  }
  try {
    const { rows } = await pool.query(
      `UPDATE districts
       SET district_code = $1,
           district_name = $2,
           country_id = $3,
           state_id = $4,
           state_name = $5,
           updated_by = $6,
           updated_at = now()
       WHERE id = $7
       RETURNING *`,
      [b.districtCode, b.districtName, b.countryId, b.stateId, b.stateName, req.userId, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ data: null, error: { message: 'Not found' } });
    return res.json({ data: mapDistrictRow(rows[0]), error: null });
  } catch (e) {
    return masterError(res, e, 'Failed to update district');
  }
});

app.delete('/api/districts/:id', authMiddleware, async (req, res) => {
  try {
    const { rowCount } = await pool.query(`DELETE FROM districts WHERE id = $1`, [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: { message: 'Not found' } });
    return res.json({ error: null });
  } catch (e) {
    return masterError(res, e, 'Failed to delete district');
  }
});

app.get('/api/insurance', authMiddleware, async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT t.*, ${masterAuditSelect}
      FROM insurance t
      ${masterAuditJoin}
      ORDER BY t.created_at DESC
    `);
    return res.json({ data: rows.map(mapInsuranceRow), error: null });
  } catch (e) {
    return masterError(res, e, 'Failed to load insurance');
  }
});

app.post('/api/insurance/upload-csv', authMiddleware, unsupportedCsvUpload);

app.post('/api/insurance', authMiddleware, async (req, res) => {
  const b = req.body || {};
  if (!b.insuranceCode || !b.insuranceType || !b.insuranceName) {
    return res.status(400).json({ data: null, error: { message: 'Insurance code, type and name are required.' } });
  }
  try {
    const insuranceId = b.insuranceId || `INS${String(Date.now()).slice(-8)}`;
    const { rows } = await pool.query(
      `INSERT INTO insurance (
        insurance_id, insurance_code, insurance_type, insurance_name, status, data, created_by, updated_by
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$7)
      RETURNING *`,
      [insuranceId, b.insuranceCode, b.insuranceType, b.insuranceName, b.status || 'active', JSON.stringify({ ...b, insuranceId }), req.userId]
    );
    return res.status(201).json({ data: mapInsuranceRow(rows[0]), error: null });
  } catch (e) {
    return masterError(res, e, 'Failed to create insurance');
  }
});

app.put('/api/insurance/:id', authMiddleware, async (req, res) => {
  const b = req.body || {};
  if (!b.insuranceCode || !b.insuranceType || !b.insuranceName) {
    return res.status(400).json({ data: null, error: { message: 'Insurance code, type and name are required.' } });
  }
  try {
    const { rows: current } = await pool.query(`SELECT insurance_id FROM insurance WHERE id = $1`, [req.params.id]);
    if (!current.length) return res.status(404).json({ data: null, error: { message: 'Not found' } });
    const insuranceId = b.insuranceId || current[0].insurance_id;
    const { rows } = await pool.query(
      `UPDATE insurance
       SET insurance_id = $1,
           insurance_code = $2,
           insurance_type = $3,
           insurance_name = $4,
           status = $5,
           data = $6,
           updated_by = $7,
           updated_at = now()
       WHERE id = $8
       RETURNING *`,
      [insuranceId, b.insuranceCode, b.insuranceType, b.insuranceName, b.status || 'active', JSON.stringify({ ...b, insuranceId }), req.userId, req.params.id]
    );
    return res.json({ data: mapInsuranceRow(rows[0]), error: null });
  } catch (e) {
    return masterError(res, e, 'Failed to update insurance');
  }
});

app.delete('/api/insurance/:id', authMiddleware, async (req, res) => {
  try {
    const { rowCount } = await pool.query(`DELETE FROM insurance WHERE id = $1`, [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: { message: 'Not found' } });
    return res.json({ error: null });
  } catch (e) {
    return masterError(res, e, 'Failed to delete insurance');
  }
});

app.get('/api/ifsc', authMiddleware, async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT t.*, ${masterAuditSelect}
      FROM ifsc_codes t
      ${masterAuditJoin}
      ORDER BY t.created_at DESC
    `);
    return res.json({ data: rows.map(mapIfscRow), error: null });
  } catch (e) {
    return masterError(res, e, 'Failed to load IFSC codes');
  }
});

app.post('/api/ifsc/upload-csv', authMiddleware, unsupportedCsvUpload);

app.post('/api/ifsc', authMiddleware, async (req, res) => {
  const b = req.body || {};
  const branchAddress = b.branchAddress || b.bankAddress;
  if (!b.ifscCode || !b.bankName || !b.bankBranch || !branchAddress || !b.city || !b.state) {
    return res.status(400).json({ data: null, error: { message: 'IFSC code, bank, branch, address, city and state are required.' } });
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO ifsc_codes (
        ifsc_code, bank_name, bank_branch, branch_address, city, state, mobile_number, created_by, updated_by
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$8)
      RETURNING *`,
      [b.ifscCode, b.bankName, b.bankBranch, branchAddress, b.city, b.state, b.mobileNumber || null, req.userId]
    );
    return res.status(201).json({ data: mapIfscRow(rows[0]), error: null });
  } catch (e) {
    return masterError(res, e, 'Failed to create IFSC code');
  }
});

app.put('/api/ifsc/:id', authMiddleware, async (req, res) => {
  const b = req.body || {};
  const branchAddress = b.branchAddress || b.bankAddress;
  if (!b.ifscCode || !b.bankName || !b.bankBranch || !branchAddress || !b.city || !b.state) {
    return res.status(400).json({ data: null, error: { message: 'IFSC code, bank, branch, address, city and state are required.' } });
  }
  try {
    const { rows } = await pool.query(
      `UPDATE ifsc_codes
       SET ifsc_code = $1,
           bank_name = $2,
           bank_branch = $3,
           branch_address = $4,
           city = $5,
           state = $6,
           mobile_number = $7,
           updated_by = $8,
           updated_at = now()
       WHERE id = $9
       RETURNING *`,
      [b.ifscCode, b.bankName, b.bankBranch, branchAddress, b.city, b.state, b.mobileNumber || null, req.userId, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ data: null, error: { message: 'Not found' } });
    return res.json({ data: mapIfscRow(rows[0]), error: null });
  } catch (e) {
    return masterError(res, e, 'Failed to update IFSC code');
  }
});

app.delete('/api/ifsc/:id', authMiddleware, async (req, res) => {
  try {
    const { rowCount } = await pool.query(`DELETE FROM ifsc_codes WHERE id = $1`, [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: { message: 'Not found' } });
    return res.json({ error: null });
  } catch (e) {
    return masterError(res, e, 'Failed to delete IFSC code');
  }
});

app.get('/api/purposes', authMiddleware, async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT t.*, ${masterAuditSelect}
      FROM purposes t
      ${masterAuditJoin}
      ORDER BY t.created_at DESC
    `);
    return res.json({ data: rows.map(mapPurposeRow), error: null });
  } catch (e) {
    return masterError(res, e, 'Failed to load purposes');
  }
});

app.post('/api/purposes/upload-csv', authMiddleware, unsupportedCsvUpload);

app.post('/api/purposes', authMiddleware, async (req, res) => {
  const b = req.body || {};
  if (!b.purposeCode || !b.purposeName) {
    return res.status(400).json({ data: null, error: { message: 'Purpose code and name are required.' } });
  }
  try {
    const purposeId = b.purposeId || `PUR${String(Date.now()).slice(-8)}`;
    const { rows } = await pool.query(
      `INSERT INTO purposes (
        purpose_id, purpose_code, purpose_name, main_purpose_id, is_main_purpose,
        status, created_by, updated_by
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$7)
      RETURNING *`,
      [purposeId, b.purposeCode, b.purposeName, b.mainPurposeId || null, b.isMainPurpose ?? !b.mainPurposeId, b.status || 'active', req.userId]
    );
    return res.status(201).json({ data: mapPurposeRow(rows[0]), error: null });
  } catch (e) {
    return masterError(res, e, 'Failed to create purpose');
  }
});

app.put('/api/purposes/:id', authMiddleware, async (req, res) => {
  const b = req.body || {};
  if (!b.purposeCode || !b.purposeName) {
    return res.status(400).json({ data: null, error: { message: 'Purpose code and name are required.' } });
  }
  try {
    const { rows: current } = await pool.query(`SELECT purpose_id FROM purposes WHERE id = $1`, [req.params.id]);
    if (!current.length) return res.status(404).json({ data: null, error: { message: 'Not found' } });
    const purposeId = b.purposeId || current[0].purpose_id;
    const { rows } = await pool.query(
      `UPDATE purposes
       SET purpose_id = $1,
           purpose_code = $2,
           purpose_name = $3,
           main_purpose_id = $4,
           is_main_purpose = $5,
           status = $6,
           updated_by = $7,
           updated_at = now()
       WHERE id = $8
       RETURNING *`,
      [purposeId, b.purposeCode, b.purposeName, b.mainPurposeId || null, b.isMainPurpose ?? !b.mainPurposeId, b.status || 'active', req.userId, req.params.id]
    );
    return res.json({ data: mapPurposeRow(rows[0]), error: null });
  } catch (e) {
    return masterError(res, e, 'Failed to update purpose');
  }
});

app.delete('/api/purposes/:id', authMiddleware, async (req, res) => {
  try {
    const { rowCount } = await pool.query(`DELETE FROM purposes WHERE id = $1`, [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: { message: 'Not found' } });
    return res.json({ error: null });
  } catch (e) {
    return masterError(res, e, 'Failed to delete purpose');
  }
});

// --- Clients ---
function calcClientAge(dateOfBirth) {
  const birth = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

function mapClientRow(row) {
  return {
    id: row.id,
    client_id: row.client_id,
    first_name: row.first_name,
    last_name: row.last_name,
    aadhaar_number: row.aadhaar_number,
    voter_card_number: row.voter_card_number,
    kyc_type: row.kyc_type,
    kyc_id: row.kyc_id,
    cycle: row.cycle,
    date_of_birth: row.date_of_birth,
    age: row.age,
    father_name: row.father_name,
    mother_name: row.mother_name,
    gender: row.gender,
    marital_status: row.marital_status,
    mobile_number: row.mobile_number,
    status: row.status,
    qualification: row.qualification,
    language: row.language,
    caste: row.caste,
    religion: row.religion,
    occupation: row.occupation,
    land_holding: row.land_holding,
    monthly_income: row.monthly_income,
    annual_income: row.annual_income,
    household_income: row.household_income,
    monthly_expense: row.monthly_expense,
    monthly_obligation: row.monthly_obligation,
    created_at: row.created_at,
    updated_at: row.updated_at,
    created_user: row.c_id
      ? { id: row.c_id, first_name: row.c_fn, last_name: row.c_ln }
      : null,
  };
}

function normalizeClientPayload(b) {
  return {
    first_name: b.first_name ?? b.firstName,
    last_name: b.last_name ?? b.lastName,
    aadhaar_number: b.aadhaar_number ?? b.aadhaarNumber,
    voter_card_number: b.voter_card_number ?? b.voterCardNumber,
    kyc_type: b.kyc_type ?? b.kycType,
    kyc_id: b.kyc_id ?? b.kycId,
    cycle: b.cycle,
    date_of_birth: b.date_of_birth ?? b.dateOfBirth,
    father_name: b.father_name ?? b.fatherName,
    mother_name: b.mother_name ?? b.motherName,
    gender: b.gender,
    marital_status: b.marital_status ?? b.maritalStatus,
    mobile_number: b.mobile_number ?? b.mobileNumber,
    status: b.status,
    qualification: b.qualification,
    language: b.language,
    caste: b.caste,
    religion: b.religion,
    occupation: b.occupation,
    land_holding: b.land_holding ?? b.landHolding,
    monthly_income: b.monthly_income ?? b.monthlyIncome,
    annual_income: b.annual_income ?? b.annualIncome,
    household_income: b.household_income ?? b.householdIncome,
    monthly_expense: b.monthly_expense ?? b.monthlyExpense,
    monthly_obligation: b.monthly_obligation ?? b.monthlyObligation,
  };
}

app.get('/api/clients', authMiddleware, async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT c.*,
        u.id AS c_id, u.first_name AS c_fn, u.last_name AS c_ln
      FROM clients c
      LEFT JOIN user_profiles u ON c.created_by = u.id
      ORDER BY c.created_at DESC
    `);
    return res.json({ data: rows.map(mapClientRow), error: null });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ data: null, error: { message: e.message } });
  }
});

app.get('/api/clients/:id', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `
      SELECT c.*,
        u.id AS c_id, u.first_name AS c_fn, u.last_name AS c_ln
      FROM clients c
      LEFT JOIN user_profiles u ON c.created_by = u.id
      WHERE c.id = $1
    `,
      [req.params.id]
    );
    if (!rows.length) {
      return res.status(404).json({ data: null, error: { message: 'Not found' } });
    }
    return res.json({ data: mapClientRow(rows[0]), error: null });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ data: null, error: { message: e.message } });
  }
});

app.post('/api/clients', authMiddleware, async (req, res) => {
  const b = normalizeClientPayload(req.body || {});
  const required = [
    'first_name',
    'last_name',
    'aadhaar_number',
    'voter_card_number',
    'kyc_type',
    'kyc_id',
    'date_of_birth',
    'father_name',
    'mother_name',
    'gender',
    'marital_status',
    'mobile_number',
    'qualification',
    'language',
    'caste',
    'religion',
    'occupation',
    'land_holding',
  ];
  const missing = required.filter((field) => !b[field]);
  if (missing.length) {
    return res.status(400).json({
      data: null,
      error: { message: `Missing required fields: ${missing.join(', ')}` },
    });
  }

  try {
    const clientId = `CL${String(Date.now()).slice(-6)}`;
    const age = calcClientAge(b.date_of_birth);

    const { rows } = await pool.query(
      `INSERT INTO clients (
        client_id, first_name, last_name, aadhaar_number, voter_card_number, kyc_type, kyc_id,
        cycle, date_of_birth, age, father_name, mother_name, gender, marital_status, mobile_number,
        status, qualification, language, caste, religion, occupation, land_holding,
        monthly_income, annual_income, household_income, monthly_expense, monthly_obligation, created_by
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28
      ) RETURNING *`,
      [
        clientId,
        b.first_name,
        b.last_name,
        b.aadhaar_number,
        b.voter_card_number,
        b.kyc_type,
        b.kyc_id,
        b.cycle ?? 1,
        b.date_of_birth,
        age,
        b.father_name,
        b.mother_name,
        b.gender,
        b.marital_status,
        b.mobile_number,
        b.status ?? 'active',
        b.qualification,
        b.language,
        b.caste,
        b.religion,
        b.occupation,
        b.land_holding,
        b.monthly_income ?? 0,
        b.annual_income ?? 0,
        b.household_income ?? 0,
        b.monthly_expense ?? 0,
        b.monthly_obligation ?? 0,
        req.userId,
      ]
    );

    const full = await pool.query(
      `
      SELECT c.*,
        u.id AS c_id, u.first_name AS c_fn, u.last_name AS c_ln
      FROM clients c
      LEFT JOIN user_profiles u ON c.created_by = u.id
      WHERE c.id = $1
    `,
      [rows[0].id]
    );

    return res.status(201).json({ data: mapClientRow(full.rows[0]), error: null });
  } catch (e) {
    console.error(e);
    if (e.code === '23505') {
      return res.status(409).json({
        data: null,
        error: { message: 'A client with this Aadhaar or client ID already exists.' },
      });
    }
    return res.status(500).json({ data: null, error: { message: e.message } });
  }
});

app.put('/api/clients/:id', authMiddleware, async (req, res) => {
  const b = normalizeClientPayload(req.body || {});
  const fields = [
    'first_name',
    'last_name',
    'aadhaar_number',
    'voter_card_number',
    'kyc_type',
    'kyc_id',
    'cycle',
    'date_of_birth',
    'father_name',
    'mother_name',
    'gender',
    'marital_status',
    'mobile_number',
    'status',
    'qualification',
    'language',
    'caste',
    'religion',
    'occupation',
    'land_holding',
    'monthly_income',
    'annual_income',
    'household_income',
    'monthly_expense',
    'monthly_obligation',
  ];
  const sets = [];
  const vals = [];
  let i = 1;
  for (const field of fields) {
    if (b[field] !== undefined) {
      sets.push(`${field} = $${i++}`);
      vals.push(b[field]);
    }
  }
  if (b.date_of_birth !== undefined) {
    sets.push(`age = $${i++}`);
    vals.push(calcClientAge(b.date_of_birth));
  }
  if (!sets.length) {
    return res.status(400).json({ error: 'No fields' });
  }
  vals.push(req.params.id);

  try {
    const { rowCount } = await pool.query(
      `UPDATE clients SET ${sets.join(', ')}, updated_at = now() WHERE id = $${i}`,
      vals
    );
    if (!rowCount) {
      return res.status(404).json({ error: 'Not found' });
    }

    const full = await pool.query(
      `
      SELECT c.*,
        u.id AS c_id, u.first_name AS c_fn, u.last_name AS c_ln
      FROM clients c
      LEFT JOIN user_profiles u ON c.created_by = u.id
      WHERE c.id = $1
    `,
      [req.params.id]
    );

    return res.json({ data: mapClientRow(full.rows[0]), error: null });
  } catch (e) {
    console.error(e);
    if (e.code === '23505') {
      return res.status(409).json({
        data: null,
        error: { message: 'A client with this Aadhaar number already exists.' },
      });
    }
    return res.status(500).json({ data: null, error: { message: e.message } });
  }
});

app.delete('/api/clients/:id', authMiddleware, async (req, res) => {
  try {
    const { rowCount } = await pool.query(`DELETE FROM clients WHERE id = $1`, [req.params.id]);
    if (!rowCount) {
      return res.status(404).json({ error: 'Not found' });
    }
    return res.json({ error: null });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: { message: e.message } });
  }
});

// --- Roles ---
app.get('/api/roles', authMiddleware, async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM roles WHERE is_active = true ORDER BY role_name`
    );
    return res.json({ data: rows, error: null });
  } catch (e) {
    console.error(e);
    return res.json({ data: null, error: { message: e.message } });
  }
});

app.get('/api/roles/by-code/:code', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM roles WHERE role_code = $1 AND is_active = true`,
      [req.params.code]
    );
    return res.json({ data: rows[0] || null, error: null });
  } catch (e) {
    console.error(e);
    return res.json({ data: null, error: { message: e.message } });
  }
});

app.post('/api/roles', authMiddleware, async (req, res) => {
  const b = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO roles (role_name, role_code, description, is_active)
       VALUES ($1, $2, $3, true) RETURNING *`,
      [b.role_name, b.role_code, b.description ?? null]
    );
    return res.json({ data: rows[0], error: null });
  } catch (e) {
    console.error(e);
    return res.json({ data: null, error: { message: e.message } });
  }
});

app.patch('/api/roles/:id', authMiddleware, async (req, res) => {
  const b = req.body;
  const allowed = ['role_name', 'role_code', 'description', 'is_active'];
  const sets = [];
  const vals = [];
  let i = 1;
  for (const k of allowed) {
    if (b[k] !== undefined) {
      sets.push(`${k} = $${i++}`);
      vals.push(b[k]);
    }
  }
  if (!sets.length) {
    return res.status(400).json({ error: 'No fields' });
  }
  vals.push(req.params.id);
  try {
    const { rows } = await pool.query(
      `UPDATE roles SET ${sets.join(', ')}, updated_at = now() WHERE id = $${i} RETURNING *`,
      vals
    );
    if (!rows.length) {
      return res.status(404).json({ error: 'Not found' });
    }
    return res.json({ data: rows[0], error: null });
  } catch (e) {
    console.error(e);
    return res.json({ data: null, error: { message: e.message } });
  }
});

app.post('/api/roles/bulk-upsert', authMiddleware, async (req, res) => {
  const { roles } = req.body || {};
  if (!Array.isArray(roles)) {
    return res.status(400).json({ error: 'roles array required' });
  }
  const inserted = [];
  for (const r of roles) {
    try {
      const ins = await pool.query(
        `INSERT INTO roles (role_name, role_code, description, is_active)
         SELECT $1, $2, $3, true
         WHERE NOT EXISTS (SELECT 1 FROM roles WHERE role_code = $2)
         RETURNING *`,
        [r.role_name, r.role_code, r.description ?? null]
      );
      if (ins.rows[0]) {
        inserted.push(ins.rows[0]);
      }
    } catch (e) {
      console.error(e);
    }
  }
  const { rows: all } = await pool.query(`SELECT * FROM roles WHERE is_active = true`);
  return res.json({ data: inserted, error: null, allActive: all });
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
