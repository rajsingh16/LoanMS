import { Router } from 'express';
import { randomBytes, randomUUID } from 'crypto';
import { hashPassword } from '../auth/auth.js';

const VALID_STATUSES = new Set(['pending', 'active', 'inactive', 'suspended']);

function profileWithBranch(row) {
  if (!row) return null;
  const branches = row.branch_id ? { id: row.branch_id, branch_name: row.branch_name, branch_code: row.branch_code, location: row.location } : null;
  const { branch_name: _branchName, branch_code: _branchCode, location: _location, ...profile } = row;
  return { ...profile, branches };
}

function errorResponse(res, status, message) { return res.status(status).json({ data: null, error: { message } }); }

async function validateRoleAndBranch(pool, role, branchId) {
  if (role !== undefined && role !== null) {
    const roleResult = await pool.query('SELECT role_code FROM roles WHERE role_code = $1 AND is_active = true', [role]);
    if (!roleResult.rows.length) return 'Selected role is not active or does not exist';
  }
  if (branchId) {
    const branchResult = await pool.query("SELECT id FROM branches WHERE id = $1 AND status = 'active'", [branchId]);
    if (!branchResult.rows.length) return 'Selected branch is not active or does not exist';
  }
  return null;
}

export function createUsersRoutes({ pool, authenticateRequest, requireAdministrator, requireSelfOrAdministrator }) {
  const router = Router();
  const admin = [authenticateRequest, requireAdministrator];

  router.get('/', ...admin, async (_req, res) => {
    try {
      const { rows } = await pool.query(`SELECT up.id, up.username, up.first_name, up.last_name, up.role, up.branch_id, up.status, up.phone, up.employee_id, up.created_at, up.updated_at, uc.email, b.branch_name, b.branch_code, b.location FROM user_profiles up LEFT JOIN user_credentials uc ON uc.user_id = up.id LEFT JOIN branches b ON b.id = up.branch_id ORDER BY up.created_at DESC`);
      return res.status(200).json({ data: rows.map(profileWithBranch), error: null });
    } catch (error) { console.error(error); return errorResponse(res, 500, 'Failed to load users'); }
  });

  router.post('/', ...admin, async (req, res) => {
    const body = req.body || {};
    const { email, username, first_name, last_name, phone, employee_id, role, branch_id, status = 'active' } = body;
    if (!email || !username || !first_name || !last_name || !role) return errorResponse(res, 400, 'Email, username, name, and role are required');
    if (!VALID_STATUSES.has(status)) return errorResponse(res, 400, 'Invalid user status');
    const roleBranchError = await validateRoleAndBranch(pool, role, branch_id);
    if (roleBranchError) return errorResponse(res, 400, roleBranchError);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const duplicate = await client.query(`SELECT EXISTS (SELECT 1 FROM user_credentials WHERE lower(email) = lower($1)) AS email_exists, EXISTS (SELECT 1 FROM user_profiles WHERE lower(username) = lower($2)) AS username_exists, EXISTS (SELECT 1 FROM user_profiles WHERE employee_id = $3 AND $3 IS NOT NULL) AS employee_exists`, [email, username, employee_id || null]);
      const duplicateRow = duplicate.rows[0];
      if (duplicateRow.email_exists || duplicateRow.username_exists || duplicateRow.employee_exists) { await client.query('ROLLBACK'); return errorResponse(res, 409, 'Email, username, or employee ID already exists'); }
      const id = randomUUID();
      const temporaryPassword = randomBytes(18).toString('base64url');
      await client.query(`INSERT INTO user_profiles (id, username, first_name, last_name, role, branch_id, status, phone, employee_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`, [id, username, first_name, last_name, role, branch_id || null, status, phone || null, employee_id || null]);
      await client.query('INSERT INTO user_credentials (user_id, email, password_hash) VALUES ($1, lower($2), $3)', [id, email, await hashPassword(temporaryPassword)]);
      const { rows } = await client.query(`SELECT up.id, up.username, up.first_name, up.last_name, up.role, up.branch_id, up.status, up.phone, up.employee_id, up.created_at, up.updated_at, uc.email FROM user_profiles up JOIN user_credentials uc ON uc.user_id = up.id WHERE up.id = $1`, [id]);
      await client.query('COMMIT');
      return res.status(201).json({ data: { ...rows[0], temporary_password: temporaryPassword }, error: null });
    } catch (error) {
      await client.query('ROLLBACK'); console.error(error);
      if (error.code === '23505') return errorResponse(res, 409, 'Email, username, or employee ID already exists');
      return errorResponse(res, 500, 'Failed to create user');
    } finally { client.release(); }
  });

  router.get('/:id/profile', authenticateRequest, requireSelfOrAdministrator, async (req, res) => {
    try {
      const { rows } = await pool.query(`SELECT up.id, up.username, up.first_name, up.last_name, up.role, up.branch_id, up.status, up.phone, up.employee_id, up.created_at, up.updated_at, uc.email, b.branch_name, b.branch_code, b.location FROM user_profiles up LEFT JOIN user_credentials uc ON uc.user_id = up.id LEFT JOIN branches b ON b.id = up.branch_id WHERE up.id = $1`, [req.params.id]);
      if (!rows.length) return errorResponse(res, 404, 'User not found');
      return res.status(200).json({ data: profileWithBranch(rows[0]), error: null });
    } catch (error) { console.error(error); return errorResponse(res, 500, 'Failed to load user profile'); }
  });

  router.patch('/:id/profile', authenticateRequest, requireSelfOrAdministrator, async (req, res) => {
    const updates = req.body || {};
    const isAdmin = ['admin', 'administrator'].includes(req.authz.role);
    const sensitiveFields = ['role', 'branch_id', 'status', 'employee_id'];
    if (!isAdmin && sensitiveFields.some((field) => updates[field] !== undefined)) return errorResponse(res, 403, 'Only an administrator may change account access fields');
    if (updates.status !== undefined && !VALID_STATUSES.has(updates.status)) return errorResponse(res, 400, 'Invalid user status');
    if (isAdmin && (updates.role !== undefined || updates.branch_id !== undefined)) {
      const roleBranchError = await validateRoleAndBranch(pool, updates.role, updates.branch_id);
      if (roleBranchError) return errorResponse(res, 400, roleBranchError);
    }
    const allowed = ['username', 'first_name', 'last_name', 'role', 'branch_id', 'status', 'phone', 'employee_id'];
    const sets = []; const values = [];
    for (const key of allowed) if (updates[key] !== undefined) { sets.push(`${key} = $${values.length + 1}`); values.push(updates[key]); }
    if (!sets.length) return errorResponse(res, 400, 'No valid fields');
    values.push(req.params.id);
    try {
      const { rows } = await pool.query(`UPDATE user_profiles SET ${sets.join(', ')}, updated_at = now() WHERE id = $${values.length} RETURNING id, username, first_name, last_name, role, branch_id, status, phone, employee_id, created_at, updated_at`, values);
      if (!rows.length) return errorResponse(res, 404, 'User not found');
      return res.status(200).json({ data: rows[0], error: null });
    } catch (error) { console.error(error); if (error.code === '23505') return errorResponse(res, 409, 'Username or employee ID already exists'); return errorResponse(res, 500, 'Failed to update user'); }
  });

  router.get('/:id/permissions', authenticateRequest, requireSelfOrAdministrator, async (req, res) => {
    try { const { rows } = await pool.query('SELECT id, user_id, module, permission, granted_by, granted_at FROM user_permissions WHERE user_id = $1', [req.params.id]); return res.status(200).json({ data: rows, error: null }); }
    catch (error) { console.error(error); return errorResponse(res, 500, 'Failed to load permissions'); }
  });

  router.get('/by-role/:role', ...admin, async (req, res) => {
    try { const { rows } = await pool.query(`SELECT id, first_name, last_name, employee_id FROM user_profiles WHERE role = $1 AND status = 'active'`, [req.params.role]); return res.status(200).json({ data: rows, error: null }); }
    catch (error) { console.error(error); return errorResponse(res, 500, 'Failed to load users by role'); }
  });

  return router;
}
