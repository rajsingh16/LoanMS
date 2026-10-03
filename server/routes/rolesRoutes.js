import { Router } from 'express';

export function createRolesRoutes({ pool, authenticateRequest, requireAdministrator }) {
  const router = Router();
  const admin = [authenticateRequest, requireAdministrator];

  router.get('/', ...admin, async (_req, res) => {
    try {
      const { rows } = await pool.query(`SELECT * FROM roles WHERE is_active = true ORDER BY role_name`);
      return res.json({ data: rows, error: null });
    } catch (error) {
      console.error(error);
      return res.json({ data: null, error: { message: error.message } });
    }
  });

  router.get('/by-code/:code', ...admin, async (req, res) => {
    try {
      const { rows } = await pool.query(`SELECT * FROM roles WHERE role_code = $1 AND is_active = true`, [req.params.code]);
      return res.json({ data: rows[0] || null, error: null });
    } catch (error) {
      console.error(error);
      return res.json({ data: null, error: { message: error.message } });
    }
  });

  router.post('/', ...admin, async (req, res) => {
    const b = req.body;
    try {
      const { rows } = await pool.query(`INSERT INTO roles (role_name, role_code, description, is_active) VALUES ($1, $2, $3, true) RETURNING *`, [b.role_name, b.role_code, b.description ?? null]);
      return res.json({ data: rows[0], error: null });
    } catch (error) {
      console.error(error);
      return res.json({ data: null, error: { message: error.message } });
    }
  });

  router.patch('/:id', ...admin, async (req, res) => {
    const b = req.body;
    const allowed = ['role_name', 'role_code', 'description', 'is_active'];
    const sets = [];
    const values = [];
    for (const key of allowed) if (b[key] !== undefined) { sets.push(`${key} = $${values.length + 1}`); values.push(b[key]); }
    if (!sets.length) return res.status(400).json({ error: 'No fields' });
    values.push(req.params.id);
    try {
      const { rows } = await pool.query(`UPDATE roles SET ${sets.join(', ')}, updated_at = now() WHERE id = $${values.length} RETURNING *`, values);
      if (!rows.length) return res.status(404).json({ error: 'Not found' });
      return res.json({ data: rows[0], error: null });
    } catch (error) {
      console.error(error);
      return res.json({ data: null, error: { message: error.message } });
    }
  });

  router.post('/bulk-upsert', ...admin, async (req, res) => {
    const { roles } = req.body || {};
    if (!Array.isArray(roles)) return res.status(400).json({ error: 'roles array required' });
    const inserted = [];
    for (const role of roles) {
      try {
        const result = await pool.query(`INSERT INTO roles (role_name, role_code, description, is_active) SELECT $1, $2, $3, true WHERE NOT EXISTS (SELECT 1 FROM roles WHERE role_code = $2) RETURNING *`, [role.role_name, role.role_code, role.description ?? null]);
        if (result.rows[0]) inserted.push(result.rows[0]);
      } catch (error) { console.error(error); }
    }
    const { rows: all } = await pool.query(`SELECT * FROM roles WHERE is_active = true`);
    return res.json({ data: inserted, error: null, allActive: all });
  });
  return router;
}
