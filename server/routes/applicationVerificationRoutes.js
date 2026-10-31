import { Router } from 'express';
import { getAuthorizationContext, hasPermission } from '../middleware/authorization.js';
import { recordAuditEvent, requestCorrelationId } from '../services/auditService.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const error = (res, status, message) => res.status(status).json({ data: null, error: { message } });

export function createApplicationVerificationRoutes({ pool, authenticateRequest }) {
  const router = Router();
  const authorize = (permission) => async (req, res, next) => {
    try {
      const context = await getAuthorizationContext(req.userId);
      if (!context || !hasPermission(context, permission)) return error(res, 403, 'Not authorized for application verification');
      req.authz = context;
      next();
    } catch (e) { console.error('Verification authorization failed:', e); return error(res, 500, 'Authorization check failed'); }
  };
  const scopeSql = (context, params, alias = 'a') => {
    if (['admin', 'administrator'].includes(context.role)) return '';
    if (!context.branch_id) return ' AND false';
    params.push(context.branch_id);
    return ` AND ${alias}.branch_id = $${params.length}`;
  };
  const ensureVerification = async (client, applicationId) => {
    await client.query('INSERT INTO loan_application_verifications (loan_application_id) VALUES ($1) ON CONFLICT (loan_application_id) DO NOTHING', [applicationId]);
  };
  const record = (row) => ({
    id: row.id, applicationUuid: row.application_uuid, clientName: [row.first_name, row.last_name].filter(Boolean).join(' '),
    branchName: row.branch_name, applicationId: row.application_number, appliedOn: row.application_date,
    agentId: row.employee_id || '', agentName: [row.officer_first_name, row.officer_last_name].filter(Boolean).join(' '),
    applicationStatus: row.application_status, clientId: row.client_code, divisionName: null, centerCode: row.center_code,
    productCode: row.product_code, bcPartnerName: null, insertedOn: row.created_at, verificationStatus: row.verification_status,
    verificationRemarks: row.remarks, rejectionReason: row.rejection_reason, verifiedAt: row.verified_at,
  });
  const baseSelect = `SELECT COALESCE(v.id, a.id) AS id, a.id AS application_uuid, a.application_number, a.application_date, a.application_status, a.document_verification_status, a.loan_amount, a.created_at,
      c.client_id AS client_code, c.first_name, c.last_name, b.branch_name, ce.center_code, p.product_code,
      u.employee_id, u.first_name AS officer_first_name, u.last_name AS officer_last_name,
      COALESCE(v.verification_status, 'pending') AS verification_status, v.remarks, v.rejection_reason, v.verified_at
    FROM loan_applications a JOIN clients c ON c.id=a.client_id JOIN branches b ON b.id=a.branch_id
    JOIN centers ce ON ce.id=a.center_id JOIN products p ON p.id=a.product_id
    LEFT JOIN user_profiles u ON u.id=a.field_officer_id LEFT JOIN loan_application_verifications v ON v.loan_application_id=a.id`;

  router.get('/summary', authenticateRequest, authorize('application.verification.view'), async (req, res) => {
    try { const params = []; const scoped = scopeSql(req.authz, params); const { rows } = await pool.query(`SELECT count(*) FILTER (WHERE COALESCE(v.verification_status,'pending')='pending')::int AS pending, count(*) FILTER (WHERE v.verification_status='approved')::int AS approved, count(*) FILTER (WHERE v.verification_status='rejected')::int AS rejected FROM loan_applications a LEFT JOIN loan_application_verifications v ON v.loan_application_id=a.id WHERE COALESCE(v.queue_dismissed_at IS NOT NULL,false)=false${scoped}`, params); return res.json({ data: rows[0], error: null }); } catch (e) { console.error(e); return error(res, 500, 'Failed to load verification summary'); }
  });
  router.get('/filters', authenticateRequest, authorize('application.verification.view'), async (req, res) => {
    try { const params = []; const scoped = scopeSql(req.authz, params); const { rows } = await pool.query(`SELECT DISTINCT a.branch_id, b.branch_name, a.center_id, ce.center_code, a.product_group_id, pg.product_group_name, a.product_id, p.product_code, a.field_officer_id, u.employee_id FROM loan_applications a JOIN branches b ON b.id=a.branch_id JOIN centers ce ON ce.id=a.center_id JOIN product_groups pg ON pg.id=a.product_group_id JOIN products p ON p.id=a.product_id LEFT JOIN user_profiles u ON u.id=a.field_officer_id WHERE true${scoped} ORDER BY b.branch_name`, params); return res.json({ data: rows, error: null }); } catch (e) { console.error(e); return error(res, 500, 'Failed to load verification filters'); }
  });
  router.get('/', authenticateRequest, authorize('application.verification.view'), async (req, res) => {
    try {
      const { branchId, centerId, productGroupId, productId, applicationId, status, agentId, applicationDateFrom, applicationDateTo, includeDismissed } = req.query;
      if (applicationDateFrom && applicationDateTo && applicationDateFrom > applicationDateTo) return error(res, 400, 'Application date from must not be after application date to');
      const params = []; const where = ['true']; const add = (sql, value) => { params.push(value); where.push(sql.replace('?', `$${params.length}`)); };
      if (branchId) add('a.branch_id=?', branchId); if (centerId) add('a.center_id=?', centerId); if (productGroupId) add('a.product_group_id=?', productGroupId); if (productId) add('a.product_id=?', productId); if (applicationId) add('a.application_number ILIKE ?', `%${applicationId}%`); if (status) add("COALESCE(v.verification_status, 'pending')=?", status); if (agentId) add('u.employee_id ILIKE ?', `%${agentId}%`); if (applicationDateFrom) add('a.application_date >= ?', applicationDateFrom); if (applicationDateTo) add('a.application_date <= ?', applicationDateTo);
      if (includeDismissed !== 'true') where.push('COALESCE(v.queue_dismissed_at IS NOT NULL, false)=false');
      const scoped = scopeSql(req.authz, params); if (scoped) where.push(scoped.replace(/^ AND /, ''));
      const page = Math.max(1, Number(req.query.page) || 1); const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50)); params.push(limit, (page - 1) * limit);
      const { rows } = await pool.query(`${baseSelect} WHERE ${where.join(' AND ')} ORDER BY a.created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`, params);
      return res.json({ data: rows.map(record), error: null, pagination: { page, limit } });
    } catch (e) { console.error(e); return error(res, 500, 'Failed to load application verification queue'); }
  });
  router.get('/:id', authenticateRequest, authorize('application.verification.view'), async (req, res) => {
    if (!UUID.test(req.params.id)) return error(res, 400, 'Invalid application id');
    try { const params = [req.params.id]; const scoped = scopeSql(req.authz, params); const { rows } = await pool.query(`${baseSelect} WHERE a.id=$1${scoped}`, params); if (!rows.length) return error(res, 404, 'Application not found'); const history = await pool.query(`SELECT h.previous_status, h.new_status, h.remarks, h.rejection_reason, h.created_at, u.first_name, u.last_name FROM loan_application_verification_history h LEFT JOIN user_profiles u ON u.id=h.action_by WHERE h.loan_application_id=$1 ORDER BY h.created_at DESC`, [req.params.id]); return res.json({ data: { ...record(rows[0]), loanAmount: rows[0].loan_amount, documentVerificationStatus: rows[0].document_verification_status, history: history.rows.map(h => ({ ...h, actorName: [h.first_name, h.last_name].filter(Boolean).join(' ') })) }, error: null }); } catch (e) { console.error(e); return error(res, 500, 'Failed to load verification details'); }
  });
  const decide = (status) => [authenticateRequest, authorize('application.verification.record'), async (req, res) => {
    if (!UUID.test(req.params.id)) return error(res, 400, 'Invalid application id');
    const remarks = typeof req.body?.remarks === 'string' ? req.body.remarks.trim() : null;
    const rejectionReason = typeof req.body?.rejectionReason === 'string' ? req.body.rejectionReason.trim() : null;
    if (status === 'rejected' && !rejectionReason) return error(res, 400, 'A rejection reason is required');
    const client = await pool.connect(); try { await client.query('BEGIN'); const scoped = scopeSql(req.authz, [req.params.id]); const app = await client.query(`SELECT a.id FROM loan_applications a WHERE a.id=$1${scoped} FOR UPDATE`, [req.params.id, ...(req.authz.branch_id && !['admin','administrator'].includes(req.authz.role) ? [req.authz.branch_id] : [])]); if (!app.rows.length) { await client.query('ROLLBACK'); return error(res, 404, 'Application not found'); } await ensureVerification(client, req.params.id); const current = await client.query('SELECT * FROM loan_application_verifications WHERE loan_application_id=$1 FOR UPDATE', [req.params.id]); if (current.rows[0].verification_status !== 'pending') { await client.query('ROLLBACK'); return error(res, 409, 'Verification has already been decided; reopen it before changing the decision'); } const updated = await client.query(`UPDATE loan_application_verifications SET verification_status=$1, remarks=$2, rejection_reason=$3, verified_by=$4, verified_at=now(), queue_dismissed_at=NULL, queue_dismissed_by=NULL, updated_at=now() WHERE loan_application_id=$5 RETURNING *`, [status, remarks, rejectionReason, req.userId, req.params.id]); await client.query(`INSERT INTO loan_application_verification_history (loan_application_id,verification_id,previous_status,new_status,remarks,rejection_reason,action_by) VALUES ($1,$2,'pending',$3,$4,$5,$6)`, [req.params.id, updated.rows[0].id, status, remarks, rejectionReason, req.userId]); await recordAuditEvent(client, { entityType: 'loan_application', entityId: req.params.id, eventType: 'application_verification_changed', actorUserId: req.userId, previousStatus: 'pending', newStatus: status, remarks: rejectionReason || remarks, correlationId: requestCorrelationId(req) }); await client.query('COMMIT'); return res.json({ data: updated.rows[0], error: null }); } catch (e) { await client.query('ROLLBACK'); console.error(e); return error(res, 500, 'Failed to update verification'); } finally { client.release(); }
  }];
  router.post('/:id/approve', ...decide('approved')); router.post('/:id/reject', ...decide('rejected'));
  router.post('/:id/reopen', authenticateRequest, authorize('application.verification.record'), async (req, res) => { if (!UUID.test(req.params.id)) return error(res,400,'Invalid application id'); const client=await pool.connect(); try { await client.query('BEGIN'); const scopeParams=[req.params.id]; const scoped=scopeSql(req.authz,scopeParams); const scopedApplication=await client.query(`SELECT a.id FROM loan_applications a WHERE a.id=$1${scoped} FOR UPDATE`,scopeParams); if(!scopedApplication.rows.length){await client.query('ROLLBACK');return error(res,404,'Application not found');} const current=await client.query('SELECT * FROM loan_application_verifications WHERE loan_application_id=$1 FOR UPDATE',[req.params.id]); if (!current.rows.length || current.rows[0].verification_status === 'pending') { await client.query('ROLLBACK'); return error(res,409,'Only completed verifications can be reopened'); } const updated=await client.query("UPDATE loan_application_verifications SET verification_status='pending', verified_by=NULL, verified_at=NULL, rejection_reason=NULL, queue_dismissed_at=NULL, queue_dismissed_by=NULL, updated_at=now() WHERE loan_application_id=$1 RETURNING *",[req.params.id]); await client.query("INSERT INTO loan_application_verification_history (loan_application_id,verification_id,previous_status,new_status,remarks,action_by) VALUES ($1,$2,$3,'pending',$4,$5)",[req.params.id,updated.rows[0].id,current.rows[0].verification_status,typeof req.body?.remarks==='string'?req.body.remarks.trim()||null:null,req.userId]); await client.query('COMMIT'); return res.json({data:updated.rows[0],error:null}); } catch(e) { await client.query('ROLLBACK'); console.error(e); return error(res,500,'Failed to reopen verification'); } finally {client.release();} });
  router.post('/queue/clear-completed', authenticateRequest, authorize('application.verification.queue.manage'), async (req,res) => { try { const params=[req.userId]; const scoped=scopeSql(req.authz,params); const result=await pool.query(`UPDATE loan_application_verifications v SET queue_dismissed_at=now(),queue_dismissed_by=$1,updated_at=now() FROM loan_applications a WHERE a.id=v.loan_application_id AND v.verification_status IN ('approved','rejected') AND v.queue_dismissed_at IS NULL${scoped}`,params); return res.json({data:{dismissed:result.rowCount},error:null}); } catch(e){console.error(e);return error(res,500,'Failed to clear completed verification items');} });
  return router;
}
