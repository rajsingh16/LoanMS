import { Router } from 'express';
import { recordAuditEvent, requestCorrelationId } from '../services/auditService.js';

export function createRolesRoutes({ pool, authenticateRequest, requireAdministrator }) {
  const router = Router();
  const admin = [authenticateRequest, requireAdministrator];

  const roleError = (res, status, message) => res.status(status).json({ data: null, error: { message } });
  const validateRole = (body, partial = false) => {
    if (!partial || body.role_name !== undefined) {
      if (typeof body.role_name !== 'string' || !body.role_name.trim()) return 'Role name is required';
    }
    if (!partial || body.role_code !== undefined) {
      if (typeof body.role_code !== 'string' || !/^[a-z][a-z0-9_]*$/.test(body.role_code.trim())) return 'Role code must use lowercase letters, numbers, and underscores';
    }
    if (body.description !== undefined && body.description !== null && typeof body.description !== 'string') return 'Description must be text';
    return null;
  };
  const validPermissions = (items) => Array.isArray(items)
    && items.every((item) => item && typeof item.module === 'string' && typeof item.permission === 'string');

  router.get('/permissions/catalog', ...admin, async (_req, res) => {
    try {
      const { rows } = await pool.query('SELECT module, permission, description FROM permission_catalog ORDER BY module, permission');
      return res.json({ data: rows, error: null });
    } catch (error) { console.error(error); return roleError(res, 500, 'Failed to load permission catalog'); }
  });

  router.get('/:id/permissions', ...admin, async (req, res) => {
    try {
      const { rows } = await pool.query(
        `SELECT rp.module, rp.permission, rp.granted_at, rp.granted_by, pc.description
           FROM role_permissions rp JOIN permission_catalog pc ON pc.module = rp.module AND pc.permission = rp.permission
          WHERE rp.role_id = $1 ORDER BY rp.module, rp.permission`, [req.params.id],
      );
      return res.json({ data: rows, error: null });
    } catch (error) { console.error(error); return roleError(res, 500, 'Failed to load role permissions'); }
  });

  router.put('/:id/permissions', ...admin, async (req, res) => {
    const requested = req.body?.permissions;
    if (!validPermissions(requested)) return roleError(res, 400, 'permissions must be an array of module and permission objects');
    const unique = [...new Map(requested.map((item) => [`${item.module}:${item.permission}`, { module: item.module, permission: item.permission }])).values()];
    const client = await pool.connect();
    let started = false;
    try {
      await client.query('BEGIN'); started = true;
      const role = await client.query('SELECT id, role_code FROM roles WHERE id = $1 FOR UPDATE', [req.params.id]);
      if (!role.rowCount) { await client.query('ROLLBACK'); return roleError(res, 404, 'Role not found'); }
      const catalog = await client.query('SELECT module, permission FROM permission_catalog');
      const known = new Set(catalog.rows.map((item) => `${item.module}:${item.permission}`));
      if (unique.some((item) => !known.has(`${item.module}:${item.permission}`))) {
        await client.query('ROLLBACK'); return roleError(res, 400, 'One or more permissions are not supported');
      }
      const before = await client.query('SELECT module, permission FROM role_permissions WHERE role_id = $1', [req.params.id]);
      await client.query('DELETE FROM role_permissions WHERE role_id = $1', [req.params.id]);
      for (const item of unique) await client.query(
        'INSERT INTO role_permissions (role_id, module, permission, granted_by) VALUES ($1, $2, $3, $4)',
        [req.params.id, item.module, item.permission, req.userId],
      );
      const previous = before.rows.map((item) => `${item.module}:${item.permission}`).sort();
      const next = unique.map((item) => `${item.module}:${item.permission}`).sort();
      await recordAuditEvent(client, {
        entityType: 'role', entityId: req.params.id, eventType: 'role_permissions_updated', actorUserId: req.userId,
        previousValues: { permissions: previous }, newValues: { permissions: next },
        metadata: { roleCode: role.rows[0].role_code }, correlationId: requestCorrelationId(req),
      });
      await client.query('COMMIT'); started = false;
      return res.json({ data: unique, error: null });
    } catch (error) {
      if (started) await client.query('ROLLBACK').catch(() => {});
      console.error(error); return roleError(res, 500, 'Failed to update role permissions');
    } finally { client.release(); }
  });

  router.get('/', ...admin, async (_req, res) => {
    try {
      const { rows } = await pool.query(`SELECT * FROM roles WHERE is_active = true ORDER BY role_name`);
      return res.status(200).json({ data: rows, error: null });
    } catch (error) {
      console.error(error);
      return roleError(res, 500, 'Failed to load roles');
    }
  });

  router.get('/by-code/:code', ...admin, async (req, res) => {
    try {
      const { rows } = await pool.query(`SELECT * FROM roles WHERE role_code = $1 AND is_active = true`, [req.params.code]);
      return res.status(200).json({ data: rows[0] || null, error: null });
    } catch (error) {
      console.error(error);
      return roleError(res, 500, 'Failed to load role');
    }
  });

  router.post('/', ...admin, async (req, res) => {
    const b = req.body || {};
    const validationError = validateRole(b);
    if (validationError) return roleError(res, 400, validationError);
    try {
      const { rows } = await pool.query(`INSERT INTO roles (role_name, role_code, description, is_active) VALUES ($1, $2, $3, true) RETURNING *`, [b.role_name, b.role_code, b.description ?? null]);
      return res.status(201).json({ data: rows[0], error: null });
    } catch (error) {
      console.error(error);
      if (error.code === '23505') return roleError(res, 409, 'A role with this code already exists');
      return roleError(res, 500, 'Failed to create role');
    }
  });

  router.patch('/:id', ...admin, async (req, res) => {
    const b = req.body || {};
    const validationError = validateRole(b, true);
    if (validationError) return roleError(res, 400, validationError);
    const allowed = ['role_name', 'role_code', 'description', 'is_active'];
    const sets = [];
    const values = [];
    for (const key of allowed) if (b[key] !== undefined) { sets.push(`${key} = $${values.length + 1}`); values.push(b[key]); }
    if (!sets.length) return roleError(res, 400, 'At least one role field is required');
    values.push(req.params.id);
    try {
      const { rows } = await pool.query(`UPDATE roles SET ${sets.join(', ')}, updated_at = now() WHERE id = $${values.length} RETURNING *`, values);
      if (!rows.length) return roleError(res, 404, 'Role not found');
      return res.status(200).json({ data: rows[0], error: null });
    } catch (error) {
      console.error(error);
      if (error.code === '23505') return roleError(res, 409, 'A role with this code already exists');
      return roleError(res, 500, 'Failed to update role');
    }
  });

  router.post('/bulk-upsert', ...admin, async (req, res) => {
    const { roles } = req.body || {};
    if (!Array.isArray(roles)) return roleError(res, 400, 'roles array required');
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
