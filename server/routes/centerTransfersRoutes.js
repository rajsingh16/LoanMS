import { Router } from 'express';
import { getAuthorizationContext, hasPermission } from '../middleware/authorization.js';
import { quoteIdent } from '../utils/centerHelpers.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const error = (res, status, message) => res.status(status).json({ data: null, error: { message } });

function csvCell(value) {
  const text = String(value ?? '');
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function createCenterTransfersRoutes({ pool, authenticateRequest, getCenterTableName }) {
  const router = Router();

  const authorize = (permission) => async (req, res, next) => {
    try {
      const context = await getAuthorizationContext(req.userId);
      if (!context || !hasPermission(context, permission)) return error(res, 403, 'Not authorized for center transfers');
      req.authz = context;
      next();
    } catch (cause) { console.error('Center transfer authorization failed', cause); return error(res, 500, 'Authorization check failed'); }
  };
  const canAccessBranch = (context, branchId) => ['admin', 'administrator'].includes(context.role) || context.branch_id === branchId;
  const validIds = (ids) => Array.isArray(ids) && ids.length > 0 && ids.every((id) => typeof id === 'string' && UUID.test(id));

  async function listCenters(context, filters = {}) {
    const table = quoteIdent(await getCenterTableName());
    const values = []; const where = [];
    const bind = (value) => { values.push(value); return `$${values.length}`; };
    if (!['admin', 'administrator'].includes(context.role)) where.push(`c.branch_id = ${bind(context.branch_id)}`);
    if (filters.branch) { const value = bind(`%${filters.branch}%`); where.push(`(b.branch_name ILIKE ${value} OR b.branch_code ILIKE ${value})`); }
    if (filters.status) where.push(`c.status = ${bind(filters.status)}`);
    if (filters.fieldOfficer) { const value = bind(`%${filters.fieldOfficer}%`); where.push(`(u.first_name || ' ' || u.last_name ILIKE ${value} OR u.employee_id ILIKE ${value})`); }
    if (filters.search) { const value = bind(`%${filters.search}%`); where.push(`(c.center_code ILIKE ${value} OR c.center_name ILIKE ${value} OR b.branch_name ILIKE ${value} OR u.first_name || ' ' || u.last_name ILIKE ${value} OR c.city ILIKE ${value})`); }
    const query = `SELECT c.id, c.center_code, c.center_name, c.branch_id, c.assigned_to, c.center_day,
      c.address1, c.address2, c.landmark, c.city, c.meeting_place, c.bc_center_id, c.village, c.status,
      b.branch_name, b.branch_code, u.first_name AS officer_first_name, u.last_name AS officer_last_name, u.employee_id
      FROM ${table} c LEFT JOIN branches b ON b.id = c.branch_id LEFT JOIN user_profiles u ON u.id = c.assigned_to
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY c.center_name`;
    const { rows } = await pool.query(query, values);
    return rows.map((row) => ({
      id: row.id, centerId: row.id, centerCode: row.center_code, centerName: row.center_name,
      branchId: row.branch_id, branch: row.branch_name || row.branch_code || 'Unassigned',
      fieldOfficerId: row.assigned_to, fieldOfficer: [row.officer_first_name, row.officer_last_name].filter(Boolean).join(' ') || 'Unassigned',
      centerDay: row.center_day || '', address1: row.address1 || '', address2: row.address2 || '', address3: row.landmark || '',
      city: row.city || '', meetingPlace: row.meeting_place || '', collPartnerId: row.bc_center_id || row.employee_id || '', villageId: row.village || '', status: row.status,
    }));
  }

  router.get('/centers', authenticateRequest, authorize('center_transfer.view'), async (req, res) => {
    try { return res.json({ data: await listCenters(req.authz, req.query), error: null }); }
    catch (cause) { console.error(cause); return error(res, 500, 'Failed to load centers'); }
  });
  router.get('/branches', authenticateRequest, authorize('center_transfer.view'), async (req, res) => {
    try {
      const values = []; let scope = '';
      if (!['admin', 'administrator'].includes(req.authz.role)) { values.push(req.authz.branch_id); scope = 'AND id = $1'; }
      const { rows } = await pool.query(`SELECT id, branch_code, branch_name FROM branches WHERE status = 'active' ${scope} ORDER BY branch_name`, values);
      return res.json({ data: rows, error: null });
    } catch (cause) { console.error(cause); return error(res, 500, 'Failed to load branches'); }
  });
  router.get('/field-officers', authenticateRequest, authorize('center_transfer.view'), async (req, res) => {
    const branchId = String(req.query.branchId || '');
    if (!UUID.test(branchId) || !canAccessBranch(req.authz, branchId)) return error(res, 400, 'A permitted target branch is required');
    try {
      const { rows } = await pool.query(`SELECT id, first_name, last_name, employee_id, branch_id FROM user_profiles WHERE role = 'field_officer' AND status = 'active' AND branch_id = $1 ORDER BY first_name, last_name`, [branchId]);
      return res.json({ data: rows, error: null });
    } catch (cause) { console.error(cause); return error(res, 500, 'Failed to load field officers'); }
  });
  router.post('/validate', authenticateRequest, authorize('center_transfer.execute'), async (req, res) => {
    const { centerIds, targetBranchId, targetFieldOfficerId, reason } = req.body || {};
    if (!validIds(centerIds) || !UUID.test(targetBranchId || '') || !UUID.test(targetFieldOfficerId || '') || !String(reason || '').trim()) return error(res, 400, 'Centers, target branch, field officer, and reason are required');
    if (!canAccessBranch(req.authz, targetBranchId)) return error(res, 403, 'Target branch is outside your authorized scope');
    try {
      const table = quoteIdent(await getCenterTableName());
      const centers = await pool.query(`SELECT id, center_name, branch_id, assigned_to FROM ${table} WHERE id = ANY($1::uuid[]) FOR UPDATE`, [centerIds]);
      if (centers.rows.length !== centerIds.length || centers.rows.some((row) => !canAccessBranch(req.authz, row.branch_id))) return error(res, 403, 'One or more centers are not accessible');
      const officer = await pool.query(`SELECT id FROM user_profiles WHERE id = $1 AND role = 'field_officer' AND status = 'active' AND branch_id = $2`, [targetFieldOfficerId, targetBranchId]);
      if (!officer.rows.length) return error(res, 400, 'The selected field officer is not active in the target branch');
      return res.json({ data: { centers: centers.rows, valid: true }, error: null });
    } catch (cause) { console.error(cause); return error(res, 500, 'Transfer validation failed'); }
  });
  router.post('/', authenticateRequest, authorize('center_transfer.execute'), async (req, res) => {
    const { centerIds, targetBranchId, targetFieldOfficerId, reason } = req.body || {};
    if (!validIds(centerIds) || !UUID.test(targetBranchId || '') || !UUID.test(targetFieldOfficerId || '') || !String(reason || '').trim()) return error(res, 400, 'Centers, target branch, field officer, and reason are required');
    if (!canAccessBranch(req.authz, targetBranchId)) return error(res, 403, 'Target branch is outside your authorized scope');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const table = quoteIdent(await getCenterTableName());
      const centers = await client.query(`SELECT id, branch_id, assigned_to FROM ${table} WHERE id = ANY($1::uuid[]) FOR UPDATE`, [centerIds]);
      if (centers.rows.length !== centerIds.length || centers.rows.some((row) => !canAccessBranch(req.authz, row.branch_id))) throw Object.assign(new Error('One or more centers are not accessible'), { status: 403 });
      const officer = await client.query(`SELECT id FROM user_profiles WHERE id = $1 AND role = 'field_officer' AND status = 'active' AND branch_id = $2`, [targetFieldOfficerId, targetBranchId]);
      if (!officer.rows.length) throw Object.assign(new Error('The selected field officer is not active in the target branch'), { status: 400 });
      for (const center of centers.rows) {
        await client.query(`UPDATE ${table} SET branch_id = $1, assigned_to = $2, updated_at = now() WHERE id = $3`, [targetBranchId, targetFieldOfficerId, center.id]);
        await client.query(`INSERT INTO center_transfer_history (center_id, source_branch_id, target_branch_id, source_field_officer_id, target_field_officer_id, transfer_reason, requested_by, approved_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$7)`, [center.id, center.branch_id, targetBranchId, center.assigned_to, targetFieldOfficerId, String(reason).trim(), req.userId]);
      }
      await client.query('COMMIT');
      return res.json({ data: { transferred: centers.rows.length }, error: null, message: `${centers.rows.length} center(s) transferred successfully` });
    } catch (cause) { await client.query('ROLLBACK'); console.error(cause); return error(res, cause.status || 500, cause.message || 'Transfer failed'); }
    finally { client.release(); }
  });
  router.get('/history', authenticateRequest, authorize('center_transfer.view'), async (req, res) => {
    try {
      const scoped = ['admin', 'administrator'].includes(req.authz.role) ? '' : 'WHERE h.source_branch_id = $1 OR h.target_branch_id = $1';
      const values = scoped ? [req.authz.branch_id] : [];
      const { rows } = await pool.query(`SELECT h.* FROM center_transfer_history h ${scoped} ORDER BY h.transferred_at DESC LIMIT 200`, values);
      return res.json({ data: rows, error: null });
    } catch (cause) { console.error(cause); return error(res, 500, 'Failed to load transfer history'); }
  });
  router.get('/export', authenticateRequest, authorize('center_transfer.view'), async (req, res) => {
    try {
      const rows = await listCenters(req.authz, req.query);
      const headers = ['Center Code', 'Center Name', 'Branch', 'Field Officer', 'Center Day', 'City', 'Status'];
      const content = [headers, ...rows.map((r) => [r.centerCode, r.centerName, r.branch, r.fieldOfficer, r.centerDay, r.city, r.status])].map((row) => row.map(csvCell).join(',')).join('\n');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8'); res.setHeader('Content-Disposition', 'attachment; filename="center-transfers.csv"'); return res.send(content);
    } catch (cause) { console.error(cause); return error(res, 500, 'Failed to export centers'); }
  });
  return router;
}
