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
    const { rows } = await pool.query(`
      SELECT c.*,
        b.id AS b_id, b.branch_name AS b_branch_name, b.branch_code AS b_branch_code,
        u1.id AS a_id, u1.first_name AS a_fn, u1.last_name AS a_ln,
        u2.id AS c_id, u2.first_name AS c_fn, u2.last_name AS c_ln
      FROM centers c
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
    const br = await pool.query(`SELECT branch_code FROM branches WHERE id = $1`, [b.branch_id]);
    const branchCode = br.rows[0]?.branch_code || 'CTR';
    const centerCode = `${branchCode}${String(Date.now()).slice(-4)}`;

    const { rows } = await pool.query(
      `INSERT INTO centers (
        center_code, center_name, branch_id, village, assigned_to, center_day, center_time,
        contact_person_name, contact_person_number, meeting_place, address1, address2, landmark,
        pincode, city, latitude, longitude, status, blacklisted, bc_center_id, parent_center_id, created_by
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22
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
      FROM centers c
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
    await pool.query(
      `UPDATE centers SET ${sets.join(', ')}, updated_at = now() WHERE id = $${i}`,
      vals
    );
    const { rows } = await pool.query(
      `
      SELECT c.*,
        b.id AS b_id, b.branch_name AS b_branch_name, b.branch_code AS b_branch_code,
        u1.id AS a_id, u1.first_name AS a_fn, u1.last_name AS a_ln,
        u2.id AS c_id, u2.first_name AS c_fn, u2.last_name AS c_ln
      FROM centers c
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
    await pool.query(`DELETE FROM centers WHERE id = $1`, [req.params.id]);
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
