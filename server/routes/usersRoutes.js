import { Router } from 'express';

function profileWithBranch(row) {
  if (!row) return null;
  const branches = row.branch_id ? {
    id: row.branch_id,
    branch_name: row.branch_name,
    branch_code: row.branch_code,
    location: row.location,
  } : null;
  const { branch_name: _branchName, branch_code: _branchCode, location: _location, ...profile } = row;
  return { ...profile, branches };
}

export function createUsersRoutes({ pool, authenticateRequest, requireAdministrator, requireSelfOrAdministrator }) {
  const router = Router();

  router.get('/', authenticateRequest, requireAdministrator, async (_req, res) => {
    try {
      const { rows } = await pool.query(`SELECT up.*, b.branch_name, b.branch_code, b.location FROM user_profiles up LEFT JOIN branches b ON b.id = up.branch_id ORDER BY up.created_at DESC`);
      return res.json({ data: rows.map(profileWithBranch), error: null });
    } catch (error) {
      console.error(error);
      return res.json({ data: null, error: { message: error.message } });
    }
  });

  router.get('/:id/profile', authenticateRequest, requireSelfOrAdministrator, async (req, res) => {
    try {
      const { rows } = await pool.query(`SELECT up.*, b.branch_name, b.branch_code, b.location FROM user_profiles up LEFT JOIN branches b ON b.id = up.branch_id WHERE up.id = $1`, [req.params.id]);
      if (!rows.length) return res.json({ data: null, error: { message: 'Not found' } });
      return res.json({ data: profileWithBranch(rows[0]), error: null });
    } catch (error) {
      console.error(error);
      return res.json({ data: null, error: { message: error.message } });
    }
  });

  router.patch('/:id/profile', authenticateRequest, requireSelfOrAdministrator, async (req, res) => {
    const updates = req.body || {};
    const isAdmin = ['admin', 'administrator'].includes(req.authz.role);
    const sensitiveFields = ['role', 'branch_id', 'status', 'employee_id'];
    if (!isAdmin && sensitiveFields.some((field) => updates[field] !== undefined)) {
      return res.status(403).json({ error: 'Only an administrator may change account access fields' });
    }
    const allowed = ['username', 'first_name', 'last_name', 'role', 'branch_id', 'status', 'phone', 'employee_id'];
    const sets = [];
    const values = [];
    for (const key of allowed) if (updates[key] !== undefined) { sets.push(`${key} = $${values.length + 1}`); values.push(updates[key]); }
    if (!sets.length) return res.status(400).json({ error: 'No valid fields' });
    values.push(req.params.id);
    try {
      const { rows } = await pool.query(`UPDATE user_profiles SET ${sets.join(', ')}, updated_at = now() WHERE id = $${values.length} RETURNING *`, values);
      if (!rows.length) return res.status(404).json({ error: 'Not found' });
      return res.json({ data: rows[0], error: null });
    } catch (error) {
      console.error(error);
      return res.json({ data: null, error: { message: error.message } });
    }
  });

  router.get('/:id/permissions', authenticateRequest, requireSelfOrAdministrator, async (req, res) => {
    try {
      const { rows } = await pool.query('SELECT * FROM user_permissions WHERE user_id = $1', [req.params.id]);
      return res.json({ data: rows, error: null });
    } catch (error) {
      console.error(error);
      return res.json({ data: null, error: { message: error.message } });
    }
  });

  router.get('/by-role/:role', authenticateRequest, requireAdministrator, async (req, res) => {
    try {
      const { rows } = await pool.query(`SELECT id, first_name, last_name FROM user_profiles WHERE role = $1 AND status = 'active'`, [req.params.role]);
      return res.json({ data: rows });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ data: null, error: error.message });
    }
  });

  return router;
}
