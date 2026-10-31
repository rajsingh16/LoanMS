import { Router } from 'express';
import { getAuthorizationContext, hasPermission } from '../middleware/authorization.js';
import { recordAuditEvent, requestCorrelationId } from '../services/auditService.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const RESULTS = new Set(['pass', 'fail', 'review']);
const error = (res, status, message) => res.status(status).json({ data: null, error: { message } });
const isAdmin = (context) => ['admin', 'administrator'].includes(context.role);

function mapRecord(row) {
  return {
    id: row.id, loanApplicationId: row.loan_application_id, clientId: row.client_id,
    applicationId: row.application_id, applicationDate: row.application_date,
    bcPartner: row.cb_partner, bureauProvider: row.cb_partner,
    applicationStatus: row.application_status, centerCode: row.center_code,
    bureauResult: row.bureau_result, checkStatus: row.check_status,
    creditScore: row.credit_score, referenceNumber: row.reference_number,
    isTest: row.is_test, checkedAt: row.checked_at, createdAt: row.created_at,
    clientName: row.client_name, appliedAmount: row.applied_amount,
  };
}

async function scopedApplication(pool, context, idOrNumber) {
  const isUuid = UUID.test(String(idOrNumber || ''));
  const params = [idOrNumber];
  let where = isUuid ? 'a.id = $1' : 'a.application_number = $1';
  if (!isAdmin(context)) {
    if (!context.branch_id) return null;
    params.push(context.branch_id);
    where += ` AND a.branch_id = $${params.length}`;
  }
  const { rows } = await pool.query(
    `SELECT a.id, a.client_id, a.branch_id, a.application_number
       FROM loan_applications a WHERE ${where}`,
    params,
  );
  return rows[0] || null;
}

function permission(required) {
  return async (req, res, next) => {
    try {
      const context = await getAuthorizationContext(req.userId);
      if (!context || !hasPermission(context, required)) return error(res, 403, 'Not authorized for credit bureau checks');
      req.authz = context;
      next();
    } catch (cause) {
      console.error('Credit bureau authorization failed:', cause);
      return error(res, 500, 'Authorization check failed');
    }
  };
}

export function createCreditBureauRoutes({ pool, authenticateRequest }) {
  const router = Router();

  router.get('/', authenticateRequest, permission('application.view'), async (req, res) => {
    try {
      const params = [];
      const scope = !isAdmin(req.authz) ? 'WHERE branch_id = $1' : '';
      if (!isAdmin(req.authz)) params.push(req.authz.branch_id);
      if (!isAdmin(req.authz) && !req.authz.branch_id) return res.json({ data: [], error: null });
      const { rows } = await pool.query(`SELECT * FROM credit_bureau_records_view ${scope} ORDER BY created_at DESC`, params);
      return res.json({ data: rows.map(mapRecord), error: null });
    } catch (cause) { console.error('Credit bureau list failed:', cause); return error(res, 500, 'Failed to load credit bureau records'); }
  });

  router.get('/by-application/:applicationId', authenticateRequest, permission('application.view'), async (req, res) => {
    try {
      const application = await scopedApplication(pool, req.authz, req.params.applicationId);
      if (!application) return error(res, 404, 'Loan application not found or not accessible');
      const { rows } = await pool.query(
        'SELECT * FROM credit_bureau_records_view WHERE loan_application_id = $1 ORDER BY created_at DESC', [application.id],
      );
      return res.json({ data: rows.map(mapRecord), error: null });
    } catch (cause) { console.error('Credit bureau history failed:', cause); return error(res, 500, 'Failed to load credit bureau history'); }
  });

  router.post('/check', authenticateRequest, permission('application.credit_review.record'), async (req, res) => {
    const applicationId = String(req.body?.applicationId || '').trim();
    const provider = String(req.body?.cbPartner ?? req.body?.bureauProvider ?? '').trim();
    const remarks = String(req.body?.remarks || '').trim().slice(0, 2000) || null;
    if (!applicationId || !provider || provider.length > 100) return error(res, 400, 'Application and bureau provider are required');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const application = await scopedApplication(client, req.authz, applicationId);
      if (!application) { await client.query('ROLLBACK'); return error(res, 404, 'Loan application not found or not accessible'); }
      const pending = await client.query(
        `SELECT id FROM credit_bureau_checks WHERE loan_application_id = $1 AND bureau_provider = $2 AND check_status = 'pending' FOR UPDATE`,
        [application.id, provider],
      );
      if (pending.rowCount) { await client.query('ROLLBACK'); return error(res, 409, 'A pending check already exists for this application and provider'); }
      const inserted = await client.query(
        `INSERT INTO credit_bureau_checks (loan_application_id, client_id, branch_id, bureau_provider, check_status, is_test, remarks, created_by)
         VALUES ($1,$2,$3,$4,'pending',true,$5,$6) RETURNING *`,
        [application.id, application.client_id, application.branch_id, provider, remarks, req.userId],
      );
      await recordAuditEvent(client, { entityType: 'credit_bureau_check', entityId: inserted.rows[0].id, eventType: 'credit_bureau_check_created', actorUserId: req.userId, newStatus: 'pending', newValues: { applicationId: application.application_number, bureauProvider: provider, isTest: true }, remarks, correlationId: requestCorrelationId(req) });
      await client.query('COMMIT');
      return res.status(201).json({ data: inserted.rows[0], error: null });
    } catch (cause) { await client.query('ROLLBACK'); console.error('Credit bureau check creation failed:', cause); return error(res, 500, 'Failed to create credit bureau check'); }
    finally { client.release(); }
  });

  router.post('/:id/manual-result', authenticateRequest, permission('application.credit_review.record'), async (req, res) => {
    if (!UUID.test(req.params.id)) return error(res, 400, 'Invalid credit bureau check id');
    const bureauResult = String(req.body?.bureauResult || '').toLowerCase();
    const score = req.body?.creditScore;
    if (!RESULTS.has(bureauResult)) return error(res, 400, 'bureauResult must be pass, fail, or review');
    if (score !== undefined && score !== null && (!Number.isInteger(Number(score)) || Number(score) < 300 || Number(score) > 900)) return error(res, 400, 'creditScore must be an integer from 300 to 900');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const found = await client.query('SELECT * FROM credit_bureau_checks WHERE id = $1 FOR UPDATE', [req.params.id]);
      const check = found.rows[0];
      if (!check) { await client.query('ROLLBACK'); return error(res, 404, 'Credit bureau check not found'); }
      if (!isAdmin(req.authz) && String(check.branch_id) !== String(req.authz.branch_id)) { await client.query('ROLLBACK'); return error(res, 403, 'You do not have access to this credit bureau check'); }
      if (!check.is_test) { await client.query('ROLLBACK'); return error(res, 409, 'Only prototype test checks can receive manual results'); }
      if (check.check_status === 'completed') { await client.query('ROLLBACK'); return error(res, 409, 'Completed checks cannot be overwritten'); }
      const updated = await client.query(
        `UPDATE credit_bureau_checks SET check_status='completed', bureau_result=$1, credit_score=$2, remarks=$3, checked_at=now(), updated_at=now()
          WHERE id=$4 RETURNING *`, [bureauResult, score == null || score === '' ? null : Number(score), String(req.body?.remarks || '').trim().slice(0, 2000) || null, check.id],
      );
      await recordAuditEvent(client, { entityType: 'credit_bureau_check', entityId: check.id, eventType: 'credit_bureau_manual_result_recorded', actorUserId: req.userId, previousStatus: check.check_status, newStatus: 'completed', previousValues: { bureauResult: check.bureau_result, creditScore: check.credit_score }, newValues: { bureauResult, creditScore: updated.rows[0].credit_score, isTest: true }, remarks: req.body?.remarks, correlationId: requestCorrelationId(req) });
      await client.query('COMMIT');
      return res.json({ data: updated.rows[0], error: null });
    } catch (cause) { await client.query('ROLLBACK'); console.error('Credit bureau manual result failed:', cause); return error(res, 500, 'Failed to record manual test result'); }
    finally { client.release(); }
  });

  router.get('/:id', authenticateRequest, permission('application.view'), async (req, res) => {
    if (!UUID.test(req.params.id)) return error(res, 400, 'Invalid credit bureau check id');
    try {
      const { rows } = await pool.query(
        `SELECT v.*, a.application_number, a.branch_id AS application_branch_id, c.client_id AS client_code
           FROM credit_bureau_records_view v
           JOIN loan_applications a ON a.id = v.loan_application_id
           JOIN clients c ON c.id = v.client_id WHERE v.id = $1`, [req.params.id],
      );
      const row = rows[0];
      if (!row) return error(res, 404, 'Credit bureau check not found');
      if (!isAdmin(req.authz) && String(row.branch_id) !== String(req.authz.branch_id)) return error(res, 403, 'You do not have access to this credit bureau check');
      return res.json({ data: { ...mapRecord(row), loanApplication: { id: row.loan_application_id, applicationNumber: row.application_number }, client: { id: row.client_id, clientCode: row.client_code, name: row.client_name } }, error: null });
    } catch (cause) { console.error('Credit bureau detail failed:', cause); return error(res, 500, 'Failed to load credit bureau check'); }
  });
  return router;
}
