import { pool } from '../db.js';

export async function getAuthorizationContext(userId) {
  const { rows } = await pool.query(
    `SELECT up.id, lower(up.role) AS role,
            COALESCE(json_agg(json_build_object('module', p.module, 'permission', p.permission))
              FILTER (WHERE p.id IS NOT NULL), '[]') AS permissions
     FROM user_profiles up
     LEFT JOIN user_permissions p ON p.user_id = $1
     WHERE up.id = $1 AND up.status = 'active'
     GROUP BY up.id, up.role`,
    [userId]
  );
  return rows[0] || null;
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
