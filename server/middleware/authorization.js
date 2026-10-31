import { pool } from '../db.js';

export async function getAuthorizationContext(userId) {
  const { rows } = await pool.query(
    `SELECT up.id, lower(up.role) AS role, up.branch_id,
            COALESCE(json_agg(DISTINCT jsonb_build_object('module', grants.module, 'permission', grants.permission))
              FILTER (WHERE grants.module IS NOT NULL), '[]') AS permissions
     FROM user_profiles up
     LEFT JOIN roles r ON r.role_code = up.role AND r.is_active = true
     LEFT JOIN LATERAL (
       SELECT module, permission FROM user_permissions WHERE user_id = up.id
       UNION
       SELECT module, permission FROM role_permissions WHERE role_id = r.id
     ) grants ON true
     WHERE up.id = $1 AND up.status = 'active'
     GROUP BY up.id, up.role, up.branch_id`,
    [userId]
  );
  return rows[0] || null;
}

export function hasPermission(context, permission) {
  if (!context) return false;
  // Administrator is the application's existing explicit administrative role.
  if (['admin', 'administrator'].includes(context.role)) return true;
  return context.permissions.some((entry) => entry.module === 'loan' && entry.permission === permission);
}

export function requireMasterPermission(master) {
  return (req, res, next) => {
    const action = { GET: 'view', POST: 'create', PUT: 'update', PATCH: 'update', DELETE: 'delete' }[req.method];
    if (!action) return res.status(403).json({ data: null, error: { message: 'Forbidden' } });
    getAuthorizationContext(req.userId).then((context) => {
      if (!hasPermission(context, `master.${master}.${action}`)) return res.status(403).json({ data: null, error: { message: 'Not authorized for this master-data action' } });
      req.authz = context;
      return next();
    }).catch((error) => authorizationError(res, error));
  };
}

function authorizationError(res, error) {
  console.error('Authorization lookup failed:', error);
  return res.status(500).json({ error: 'Authorization check failed' });
}

export function requireAdministrator(req, res, next) {
  getAuthorizationContext(req.userId).then((context) => {
    if (!context) return res.status(403).json({ error: 'Forbidden' });
    if (!['admin', 'administrator'].includes(context.role)) {
      return res.status(403).json({ error: 'Administrator access required' });
    }
    req.authz = context;
    return next();
  }).catch((error) => authorizationError(res, error));
}

export function requireSelfOrAdministrator(req, res, next) {
  getAuthorizationContext(req.userId).then((context) => {
    if (!context) return res.status(403).json({ error: 'Forbidden' });
    const isAdmin = ['admin', 'administrator'].includes(context.role);
    if (!isAdmin && String(req.params.id) !== String(req.userId)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    req.authz = context;
    return next();
  }).catch((error) => authorizationError(res, error));
}
