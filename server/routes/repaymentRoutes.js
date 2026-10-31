import { Router } from 'express';
import { createHash } from 'node:crypto';
import { getAuthorizationContext, hasPermission } from '../middleware/authorization.js';
import { scheduleEligibility, scheduleGenerationEligibility } from '../services/contractualRepaymentTerms.js';


const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
console.log(
  UUID.test('dadc71f2-b2b8-44d7-b4ee-95d70f86a629')
);
const MONEY = /^\d+(?:\.\d{1,2})?$/;
const methods = new Set(['cash', 'neft', 'rtgs', 'imps', 'upi', 'bank_transfer', 'cheque', 'other']);

function error(res, status, message) { return res.status(status).json({ data: null, error: { message } }); }
function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) return false;
  const [year, month, day] = String(value).split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}
function validPositiveMoney(value) { return MONEY.test(String(value || '')) && !/^0(?:\.0{1,2})?$/.test(String(value)); }
function normalizedMoney(value) {
  const [whole, fraction = ''] = String(value).split('.');
  return `${whole.replace(/^0+(?=\d)/, '')}.${fraction.padEnd(2, '0')}`;
}
function paymentFingerprint({ loanId, amount, paymentDate, paymentMethod, referenceNumber, collectionAgentId, remarks }) {
  const normalized = JSON.stringify({
    loanId,
    amount: normalizedMoney(amount),
    paymentDate,
    paymentMethod,
    referenceNumber: String(referenceNumber || '').trim(),
    collectionAgentId: collectionAgentId || '',
    remarks: String(remarks || '').trim(),
  });
  return createHash('sha256').update(normalized).digest('hex');
}
function decimalToScaled(value, scale = 10000) {
  const match = String(value).trim().match(/^(\d+)(?:\.(\d+))?$/);
  if (!match) throw new Error('Invalid contractual money or rate value');
  const decimals = String(scale).length - 1;
  const fraction = (match[2] || '').padEnd(decimals, '0');
  if ((match[2] || '').length > decimals) throw new Error('Contractual rate precision is unsupported');
  return BigInt(match[1]) * BigInt(scale) + BigInt(fraction || '0');
}
function roundDivision(numerator, denominator, policy) {
  const quotient = numerator / denominator; const remainder = numerator % denominator;
  const doubled = remainder * 2n;
  if (doubled > denominator || (doubled === denominator && (policy === 'half_up_2dp' || quotient % 2n === 1n))) return quotient + 1n;
  return quotient;
}
function centsText(cents) { return `${cents / 100n}.${String(cents % 100n).padStart(2, '0')}`; }
function dateOnly(value) { return value instanceof Date ? value.toISOString().slice(0, 10) : String(value).slice(0, 10); }
function addPeriods(dateText, frequency, periods) {
  const [year, month, day] = dateText.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (frequency === 'weekly') date.setUTCDate(date.getUTCDate() + periods * 7);
  else if (frequency === 'fortnightly') date.setUTCDate(date.getUTCDate() + periods * 14);
  else {
    const months = frequency === 'quarterly' ? periods * 3 : periods;
    const targetMonth = date.getUTCMonth() + months;
    const lastDay = new Date(Date.UTC(date.getUTCFullYear(), targetMonth + 1, 0)).getUTCDate();
    date.setUTCDate(Math.min(day, lastDay)); date.setUTCMonth(targetMonth);
  }
  return date.toISOString().slice(0, 10);
}
function scheduleRows({ principal, anchorDate, firstInstallmentDate, terms }) {
  const principalCents = decimalToScaled(principal, 100);
  if (principalCents <= 0n) throw new Error('Completed disbursement total must be positive');
  const count = terms.installmentCount;
  const rate = decimalToScaled(terms.interestRate, 10000);
  const tenureMonths = BigInt(terms.tenure);
  // Flat annual nominal interest: principal × rate% × tenureMonths / 12.
  const totalInterest = roundDivision(principalCents * rate * tenureMonths, 12000000n, terms.roundingPolicy);
  const principalBase = principalCents / BigInt(count); const principalRemainder = principalCents % BigInt(count);
  const interestBase = totalInterest / BigInt(count); const interestRemainder = totalInterest % BigInt(count);
  let opening = principalCents;
  const firstDue = firstInstallmentDate || addPeriods(anchorDate, terms.repaymentFrequency, 1);
  return Array.from({ length: count }, (_, index) => {
    const principalPart = principalBase + (BigInt(index) < principalRemainder ? 1n : 0n);
    const interestPart = interestBase + (BigInt(index) < interestRemainder ? 1n : 0n);
    const contractualDue = index === 0 ? firstDue : addPeriods(firstDue, terms.repaymentFrequency, index);
    const total = principalPart + interestPart;
    const today = new Date().toISOString().slice(0, 10);
    const status = contractualDue < today ? 'overdue' : contractualDue === today ? 'due' : 'upcoming';
    const row = { installmentNumber: index + 1, contractualDue, collectionDue: contractualDue, opening: centsText(opening), principal: centsText(principalPart), interest: centsText(interestPart), amount: centsText(total), status };
    opening -= principalPart;
    return row;
  });
}
function requiredPermission(permission) {
  return async (req, res, next) => {
    try {
      const context = await getAuthorizationContext(req.userId);
      const allowed = hasPermission(context, permission);
      if (!allowed) return error(res, 403, 'Not authorized for repayment operations');
      req.authz = context;
      return next();
    } catch (cause) { console.error('Repayment authorization failed:', cause); return error(res, 500, 'Authorization check failed'); }
  };
}

function requireAccountScope(pool) {
  return async (req, res, next) => {
    const loanAccountId = String(
      req.params?.id || req.repaymentRouteId || ''
    ).trim();

    

    try {
      const { rows } = await pool.query(
        'SELECT id, branch_id FROM loan_accounts WHERE id = $1',
        [loanAccountId]
      );

      if (!rows.length) {
        return error(res, 404, 'Loan account not found');
      }

      req.loanAccountId = loanAccountId;

      if (['admin', 'administrator'].includes(req.authz.role)) {
        return next();
      }

      if (!req.authz.branch_id) {
        return error(res, 403, 'No authorized branch is assigned');
      }

      if (rows[0].branch_id !== req.authz.branch_id) {
        return error(res, 403, 'You do not have access to this loan account');
      }

      return next();

    } catch (cause) {
      console.error('Repayment scope check failed:', cause);
      return error(res, 500, 'Authorization check failed');
    }
  };
}

function requirePaymentScope(pool) {
  return async (req, res, next) => {
    if (!UUID.test(String(req.params.id || ''))) return error(res, 400, 'Invalid payment id');
    try {
      if (['admin', 'administrator'].includes(req.authz.role)) return next();
      if (!req.authz.branch_id) return error(res, 403, 'No authorized branch is assigned');
      const { rows } = await pool.query('SELECT p.id FROM loan_payments p JOIN loan_accounts la ON la.id = p.loan_id WHERE p.id = $1 AND la.branch_id = $2', [req.params.id, req.authz.branch_id]);
      if (!rows.length) return error(res, 403, 'You do not have access to this payment');
      return next();
    } catch (cause) { console.error('Payment scope check failed:', cause); return error(res, 500, 'Authorization check failed'); }
  };
}
function requireScopedReports(req, res, next) {
  if (!['admin', 'administrator'].includes(req.authz.role)) {
    if (!req.authz.branch_id) return error(res, 403, 'No authorized branch is assigned');
    req.reportBranchId = req.authz.branch_id;
  } else req.reportBranchId = null;
  return next();
}
function reportRange(req) {
  const from = validDate(req.query.from) ? String(req.query.from) : null;
  const to = validDate(req.query.to) ? String(req.query.to) : null;
  if ((req.query.from && !from) || (req.query.to && !to)) throw new Error('Dates must use YYYY-MM-DD');
  if (from && to && from > to) throw new Error('From date must not be after to date');
  return { from, to, limit: Math.min(Math.max(Math.floor(Number(req.query.limit) || 100), 1), 500), offset: Math.max(Math.floor(Number(req.query.offset) || 0), 0) };
}

const balanceSelect = `
  SELECT la.id, la.loan_account_number, la.loan_status,
    COALESCE(SUM(s.scheduled_principal), 0) AS scheduled_principal,
    COALESCE(SUM(s.scheduled_interest), 0) AS scheduled_interest,
    COALESCE(SUM(s.scheduled_fees), 0) AS scheduled_fees,
    COALESCE(SUM(s.principal_paid), 0) AS principal_paid,
    COALESCE(SUM(s.interest_paid), 0) AS interest_paid,
    COALESCE(SUM(s.fees_paid), 0) AS fees_paid,
    COALESCE(SUM(s.scheduled_principal - s.principal_paid), 0) AS principal_outstanding,
    COALESCE(SUM(s.scheduled_interest - s.interest_paid), 0) AS interest_outstanding,
    COALESCE(SUM(s.scheduled_fees - s.fees_paid), 0) AS fees_outstanding,
    COALESCE(SUM(CASE WHEN s.collection_due_date < CURRENT_DATE THEN s.scheduled_amount - s.principal_paid - s.interest_paid - s.fees_paid ELSE 0 END), 0) AS arrears
  FROM loan_accounts la
  LEFT JOIN loan_repayment_schedules s ON s.loan_id = la.id
  WHERE la.id = $1
  GROUP BY la.id`;

export function createRepaymentRoutes({ pool, authenticateRequest }) {
  const router = Router();
  // Express restores route parameters as it advances through nested async
  // middleware. Preserve the decoded value once so account handlers and their
  // authorization middleware always use the same identifier.
  router.param('id', (req, res, next, id) => {
    req.repaymentRouteId = id;
    next();
  });
  const accountScope = requireAccountScope(pool);
  const paymentScope = requirePaymentScope(pool);

  router.get('/accounts/:id/schedule-eligibility', authenticateRequest, requiredPermission('repayment.view'), accountScope, async (req, res) => {
    const loanAccountId = req.loanAccountId;
    try {
      const result = await pool.query('SELECT contractual_repayment_terms FROM loan_accounts WHERE id=$1', [loanAccountId]);
      if (!result.rowCount) return error(res, 404, 'Loan account not found');
      return res.json({ data: scheduleEligibility(result.rows[0].contractual_repayment_terms), error: null });
    } catch (cause) { console.error('Schedule eligibility lookup failed:', cause); return error(res, 500, 'Failed to validate schedule eligibility'); }
  });

  router.post('/accounts/:id/schedule', authenticateRequest, requiredPermission('repayment.schedule.generate'), accountScope, async (req, res) => {
    const loanAccountId = req.loanAccountId;
    const client = await pool.connect(); let begun = false;
    try {
      await client.query('BEGIN'); begun = true;
      const account = await client.query(`SELECT la.id, la.loan_status, la.loan_amount, la.sanction_amount, la.loan_application_id, la.contractual_repayment_terms, a.contractual_first_installment_date FROM loan_accounts la JOIN loan_applications a ON a.id=la.loan_application_id WHERE la.id=$1 FOR UPDATE`, [loanAccountId]);
      if (!account.rowCount) { await client.query('ROLLBACK'); return error(res, 404, 'Loan account not found'); }
      const eligibility = scheduleGenerationEligibility(account.rows[0].contractual_repayment_terms);
      if (!eligibility.eligible) {
        await client.query(`INSERT INTO loan_repayment_schedule_events(loan_id,event_type,details,created_by) VALUES($1,'generation_blocked',$2::jsonb,$3)`, [loanAccountId, JSON.stringify({ missingTerms: eligibility.missing, blockers: eligibility.blockers }), req.userId]);
        await client.query('COMMIT');
        return res.status(409).json({ data: { generated: false, ...eligibility }, error: { message: eligibility.missing.length ? 'Contractual repayment terms are incomplete' : 'Configured terms are not supported for schedule generation' } });
      }
      const existing = await client.query('SELECT 1 FROM loan_repayment_schedules WHERE loan_id=$1 LIMIT 1 FOR UPDATE', [loanAccountId]);
      if (existing.rowCount) { await client.query('COMMIT'); return res.json({ data: { generated: false, reason: 'existing_schedule' }, error: null, idempotent: true }); }
      const disbursements = await client.query(`SELECT disbursement_date, disbursement_amount FROM loan_disbursements WHERE loan_id=$1 AND status='completed' ORDER BY disbursement_date,id FOR SHARE`, [loanAccountId]);
      if (!disbursements.rowCount) { await client.query('ROLLBACK'); return error(res, 409, 'A completed disbursement is required before schedule generation'); }
      const total = await client.query(`SELECT COALESCE(SUM(disbursement_amount),0)::text AS amount FROM loan_disbursements WHERE loan_id=$1 AND status='completed'`, [loanAccountId]);
      const overSanction = await client.query('SELECT $1::numeric > $2::numeric AS value', [total.rows[0].amount, account.rows[0].sanction_amount]);
      if (overSanction.rows[0].value) { await client.query('ROLLBACK'); return error(res, 409, 'Completed disbursements exceed the sanctioned amount'); }
      const terms = eligibility.terms;
      const override = account.rows[0].contractual_first_installment_date;
      if (override && !terms.firstInstallmentOverrideAllowed) { await client.query('ROLLBACK'); return error(res, 409, 'A first-installment override exists but this product does not permit one'); }
      if (override && dateOnly(override) < dateOnly(disbursements.rows[0].disbursement_date)) { await client.query('ROLLBACK'); return error(res, 409, 'The first-installment date cannot precede the first completed disbursement'); }
      const rows = scheduleRows({ principal: total.rows[0].amount, anchorDate: dateOnly(disbursements.rows[0].disbursement_date), firstInstallmentDate: override ? dateOnly(override) : null, terms });
      for (const row of rows) await client.query(`INSERT INTO loan_repayment_schedules(loan_id,schedule_version,installment_number,contractual_due_date,collection_due_date,opening_principal,scheduled_principal,scheduled_interest,scheduled_fees,scheduled_amount,payment_status,created_by,updated_by) VALUES($1,1,$2,$3,$4,$5,$6,$7,0,$8,$9,$10,$10)`, [loanAccountId,row.installmentNumber,row.contractualDue,row.collectionDue,row.opening,row.principal,row.interest,row.amount,row.status,req.userId]);
      await client.query(`INSERT INTO loan_repayment_schedule_events(loan_id,event_type,details,created_by) VALUES($1,'generated',$2::jsonb,$3)`, [loanAccountId, JSON.stringify({ scheduleVersion: 1, principal: total.rows[0].amount, completedDisbursementCount: disbursements.rowCount, firstCompletedDisbursementDate: disbursements.rows[0].disbursement_date }), req.userId]);
      await client.query('COMMIT');
      return res.status(201).json({ data: { generated: true, installmentCount: rows.length }, error: null });
    } catch (cause) { if (begun) await client.query('ROLLBACK').catch(() => {}); console.error('Schedule generation failed:', cause); return error(res, 500, 'Failed to generate repayment schedule'); } finally { client.release(); }
  });

  router.get('/accounts/:id/schedule', authenticateRequest, requiredPermission('repayment.view'), accountScope, async (req, res) => {
    const loanAccountId = req.loanAccountId;
    try {
      const [schedules, balance] = await Promise.all([
        pool.query(`SELECT * FROM loan_repayment_schedules WHERE loan_id=$1 ORDER BY schedule_version DESC, installment_number`, [loanAccountId]),
        pool.query(balanceSelect, [loanAccountId]),
      ]);
      if (!balance.rowCount) return error(res, 404, 'Loan account not found');
      return res.json({ data: { installments: schedules.rows, balance: balance.rows[0] }, error: null });
    } catch (cause) { console.error('Schedule lookup failed:', cause); return error(res, 500, 'Failed to load repayment schedule'); }
  });

  router.get('/accounts/:id/payments', authenticateRequest, requiredPermission('repayment.view'), accountScope, async (req, res) => {
    const loanAccountId = req.loanAccountId;
    try {
      const result = await pool.query(`SELECT p.*, COALESCE(json_agg(json_build_object('schedule_id',a.schedule_id,'principal_amount',a.principal_amount,'interest_amount',a.interest_amount,'fees_amount',a.fees_amount)) FILTER (WHERE a.id IS NOT NULL), '[]') allocations FROM loan_payments p LEFT JOIN loan_payment_allocations a ON a.payment_id=p.id WHERE p.loan_id=$1 GROUP BY p.id ORDER BY p.payment_date DESC,p.posted_at DESC`, [loanAccountId]);
      return res.json({ data: result.rows, error: null });
    } catch (cause) { console.error('Payment lookup failed:', cause); return error(res, 500, 'Failed to load payment history'); }
  });

  // Payments are allocated oldest-due-first, fees -> interest -> principal. An
  // amount above currently scheduled unpaid balances is rejected until an
  // explicit advance-payment product policy exists.
  router.post('/accounts/:id/payments', authenticateRequest, requiredPermission('repayment.payment.post'), accountScope, async (req, res) => {
    const loanId = req.loanAccountId;
    const { amount, paymentDate, paymentMethod, referenceNumber, collectionAgentId, idempotencyKey, remarks } = req.body || {};
    if (!UUID.test(loanId) || !validPositiveMoney(amount) || !validDate(paymentDate) || !methods.has(paymentMethod) || !UUID.test(String(idempotencyKey || ''))) return error(res, 400, 'Enter a valid amount, payment date, payment method, and idempotency key');
    if (collectionAgentId && !UUID.test(String(collectionAgentId))) return error(res, 400, 'Invalid collection agent');
    const fingerprint = paymentFingerprint({ loanId, amount, paymentDate, paymentMethod, referenceNumber, collectionAgentId, remarks });
    const client = await pool.connect(); let begun = false;
    try {
      await client.query('BEGIN'); begun = true;
      // Serialize retries for this idempotency key before checking/inserting it.
      await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [String(idempotencyKey)]);
      const existing = await client.query('SELECT * FROM loan_payments WHERE idempotency_key=$1 FOR UPDATE', [idempotencyKey]);
      if (existing.rowCount) {
        if (existing.rows[0].request_fingerprint !== fingerprint) {
          await client.query('ROLLBACK');
          return error(res, 409, 'Idempotency key was already used with different payment details');
        }
        await client.query('COMMIT');
        return res.json({ data: existing.rows[0], error: null, idempotent: true });
      }
      const account = await client.query("SELECT id,loan_status,contractual_repayment_terms FROM loan_accounts WHERE id=$1 FOR UPDATE", [loanId]);
      if (!account.rowCount) { await client.query('ROLLBACK'); return error(res, 404, 'Loan account not found'); }
      if (!['active', 'closed'].includes(account.rows[0].loan_status)) { await client.query('ROLLBACK'); return error(res, 409, 'Payments can only be posted to an active or closed loan account'); }
      const scheduleEligibilityResult = scheduleGenerationEligibility(account.rows[0].contractual_repayment_terms);
      if (!scheduleEligibilityResult.eligible) { await client.query('ROLLBACK'); return error(res, 409, 'Payments are blocked because the account does not have an eligible contractual repayment schedule'); }
      const schedules = await client.query(`SELECT * FROM loan_repayment_schedules WHERE loan_id=$1 AND payment_status <> 'paid' ORDER BY collection_due_date,installment_number FOR UPDATE`, [loanId]);
      if (!schedules.rowCount) { await client.query('ROLLBACK'); return error(res, 409, 'No unpaid repayment schedule is available for this account'); }
      let remaining = String(amount);
      const allocations = [];
      for (const s of schedules.rows) {
        let principal = '0', interest = '0', fees = '0';
        for (const [field, paidField, set] of [['scheduled_fees','fees_paid','fees'], ['scheduled_interest','interest_paid','interest'], ['scheduled_principal','principal_paid','principal']]) {
          const available = await client.query(`SELECT LEAST($1::numeric, GREATEST($2::numeric-$3::numeric,0)) AS paid`, [remaining, s[field], s[paidField]]);
          const paid = available.rows[0].paid;
          if (set === 'fees') fees = paid; else if (set === 'interest') interest = paid; else principal = paid;
          remaining = (await client.query('SELECT ($1::numeric-$2::numeric)::text AS value', [remaining, paid])).rows[0].value;
        }
        const hasAllocation = await client.query('SELECT ($1::numeric + $2::numeric + $3::numeric) > 0 AS value', [principal, interest, fees]);
        if (hasAllocation.rows[0].value) allocations.push({ schedule: s, principal, interest, fees });
      }
      const unallocated = await client.query('SELECT $1::numeric > 0 AS has_unallocated_amount', [remaining]);
      if (unallocated.rows[0].has_unallocated_amount) { await client.query('ROLLBACK'); return error(res, 409, 'Payment exceeds scheduled unpaid balance; advance-payment policy is not configured'); }
      const payment = await client.query(`INSERT INTO loan_payments(loan_id,payment_date,amount,payment_method,reference_number,collection_agent_id,idempotency_key,request_fingerprint,remarks,posted_by) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`, [loanId,paymentDate,amount,paymentMethod,referenceNumber?.trim() || null,collectionAgentId || null,idempotencyKey,fingerprint,remarks?.trim() || null,req.userId]);
      for (const a of allocations) {
        await client.query(`INSERT INTO loan_payment_allocations(loan_id,payment_id,schedule_id,principal_amount,interest_amount,fees_amount) VALUES($1,$2,$3,$4,$5,$6)`, [loanId,payment.rows[0].id,a.schedule.id,a.principal,a.interest,a.fees]);
        await client.query(`UPDATE loan_repayment_schedules SET principal_paid=principal_paid+$1,interest_paid=interest_paid+$2,fees_paid=fees_paid+$3,payment_status=CASE WHEN scheduled_amount <= principal_paid+$1+interest_paid+$2+fees_paid+$3 THEN 'paid' WHEN principal_paid+$1+interest_paid+$2+fees_paid+$3 > 0 THEN 'partially_paid' WHEN collection_due_date < CURRENT_DATE THEN 'overdue' WHEN collection_due_date <= CURRENT_DATE THEN 'due' ELSE 'upcoming' END,updated_by=$4,updated_at=now() WHERE id=$5`, [a.principal,a.interest,a.fees,req.userId,a.schedule.id]);
      }
      await client.query('COMMIT'); return res.status(201).json({ data: payment.rows[0], error: null });
    } catch (cause) { if (begun) await client.query('ROLLBACK').catch(() => {}); console.error('Payment posting failed:', cause); return error(res, 500, 'Failed to post payment'); } finally { client.release(); }
  });

  router.post('/payments/:id/reverse', authenticateRequest, requiredPermission('repayment.payment.reverse'), paymentScope, async (req, res) => {
    const paymentId = req.params.id; const reason = String(req.body?.reason || '').trim();
    if (!UUID.test(paymentId) || !reason) return error(res, 400, 'A payment id and reversal reason are required');
    const client = await pool.connect(); let begun = false;
    try {
      await client.query('BEGIN'); begun = true;
      // Discover the account, then use the same account-before-schedule order as posting.
      const paymentAccount = await client.query('SELECT loan_id FROM loan_payments WHERE id=$1', [paymentId]);
      if (!paymentAccount.rowCount) { await client.query('ROLLBACK'); return error(res, 404, 'Payment not found'); }
      await client.query('SELECT id FROM loan_accounts WHERE id=$1 FOR UPDATE', [paymentAccount.rows[0].loan_id]);
      const payment = await client.query('SELECT * FROM loan_payments WHERE id=$1 FOR UPDATE', [paymentId]);
      if (payment.rows[0].status !== 'posted') { await client.query('ROLLBACK'); return error(res, 409, 'Only posted payments can be reversed'); }
      const allocations = await client.query('SELECT * FROM loan_payment_allocations WHERE payment_id=$1 FOR UPDATE', [paymentId]);
      for (const allocation of allocations.rows) {
        await client.query(`UPDATE loan_repayment_schedules SET principal_paid=principal_paid-$1,interest_paid=interest_paid-$2,fees_paid=fees_paid-$3,payment_status=CASE WHEN principal_paid-$1+interest_paid-$2+fees_paid-$3 = 0 THEN CASE WHEN collection_due_date < CURRENT_DATE THEN 'overdue' WHEN collection_due_date <= CURRENT_DATE THEN 'due' ELSE 'upcoming' END ELSE 'partially_paid' END,updated_by=$4,updated_at=now() WHERE id=$5`, [allocation.principal_amount,allocation.interest_amount,allocation.fees_amount,req.userId,allocation.schedule_id]);
      }
      const result = await client.query("UPDATE loan_payments SET status='reversed',reversed_by=$1,reversed_at=now(),reversal_reason=$2 WHERE id=$3 RETURNING *", [req.userId,reason,paymentId]);
      await client.query('COMMIT'); return res.json({ data: result.rows[0], error: null });
    } catch (cause) { if (begun) await client.query('ROLLBACK').catch(() => {}); console.error('Payment reversal failed:', cause); return error(res, 500, 'Failed to reverse payment'); } finally { client.release(); }
  });

  // Reports use schedule due dates for demand and only `posted` payment rows
  // for collections. Reversed rows remain visible in collection detail but are
  // deliberately excluded from all net collection totals.
  router.get('/reports/repayment-details', authenticateRequest, requiredPermission('repayment.report.view'), requireScopedReports, async (req, res) => {
    try {
      const range = reportRange(req);
      const result = await pool.query(`SELECT s.id, la.id AS loan_id, la.loan_account_number, la.loan_status, la.loan_amount, c.client_id AS client_code, concat_ws(' ',c.first_name,c.last_name) AS client_name,c.mobile_number,c.cycle,p.product_code,b.branch_name,ce.center_code,ce.center_name,u.employee_id,concat_ws(' ',u.first_name,u.last_name) AS fo_name,a.total_interest,a.created_at, s.installment_number, s.contractual_due_date, s.collection_due_date, s.scheduled_principal, s.scheduled_interest, s.scheduled_fees, s.scheduled_amount, s.principal_paid, s.interest_paid, s.fees_paid, (s.principal_paid+s.interest_paid+s.fees_paid) AS paid_amount,(s.scheduled_principal-s.principal_paid) AS principal_due_outstanding,(s.scheduled_amount-s.principal_paid-s.interest_paid-s.fees_paid) AS outstanding_amount, s.payment_status, totals.principal_outstanding,totals.interest_outstanding,totals.installment_count,totals.installments_outstanding,pay.last_collection_date FROM loan_repayment_schedules s JOIN loan_accounts la ON la.id=s.loan_id JOIN loan_applications a ON a.id=la.loan_application_id JOIN clients c ON c.id=la.client_id JOIN products p ON p.id=la.product_id JOIN branches b ON b.id=la.branch_id JOIN centers ce ON ce.id=la.center_id LEFT JOIN user_profiles u ON u.id=a.field_officer_id LEFT JOIN LATERAL (SELECT SUM(scheduled_principal-principal_paid) AS principal_outstanding,SUM(scheduled_interest-interest_paid) AS interest_outstanding,COUNT(*)::int AS installment_count,COUNT(*) FILTER (WHERE scheduled_amount>principal_paid+interest_paid+fees_paid)::int AS installments_outstanding FROM loan_repayment_schedules WHERE loan_id=la.id) totals ON true LEFT JOIN LATERAL (SELECT payment_date AS last_collection_date FROM loan_payments WHERE loan_id=la.id AND status='posted' ORDER BY payment_date DESC,posted_at DESC LIMIT 1) pay ON true WHERE ($1::date IS NULL OR s.contractual_due_date >= $1) AND ($2::date IS NULL OR s.contractual_due_date <= $2) AND ($5::uuid IS NULL OR la.branch_id = $5) ORDER BY s.contractual_due_date,s.installment_number LIMIT $3 OFFSET $4`, [range.from, range.to, range.limit, range.offset, req.reportBranchId]);
      return res.json({ data: result.rows, error: null, pagination: { limit: range.limit, offset: range.offset } });
    } catch (cause) { return error(res, cause.message === 'Dates must use YYYY-MM-DD' || cause.message === 'From date must not be after to date' ? 400 : 500, cause.message === 'Dates must use YYYY-MM-DD' || cause.message === 'From date must not be after to date' ? cause.message : 'Failed to load repayment details'); }
  });

  router.get('/reports/collection-details', authenticateRequest, requiredPermission('repayment.report.view'), requireScopedReports, async (req, res) => {
    try {
      const range = reportRange(req);
      const result = await pool.query(`SELECT p.id, p.loan_id, la.loan_account_number, p.payment_date, p.amount, p.payment_method, p.reference_number, p.status, p.posted_at, p.reversed_at, p.reversal_reason, COALESCE(a.principal_amount,0) AS principal_amount, COALESCE(a.interest_amount,0) AS interest_amount, COALESCE(a.fees_amount,0) AS fees_amount FROM loan_payments p JOIN loan_accounts la ON la.id=p.loan_id LEFT JOIN LATERAL (SELECT SUM(principal_amount) AS principal_amount,SUM(interest_amount) AS interest_amount,SUM(fees_amount) AS fees_amount FROM loan_payment_allocations WHERE payment_id=p.id) a ON true WHERE ($1::date IS NULL OR p.payment_date >= $1) AND ($2::date IS NULL OR p.payment_date <= $2) AND ($5::uuid IS NULL OR la.branch_id = $5) ORDER BY p.payment_date DESC,p.posted_at DESC LIMIT $3 OFFSET $4`, [range.from, range.to, range.limit, range.offset, req.reportBranchId]);
      return res.json({ data: result.rows, error: null, pagination: { limit: range.limit, offset: range.offset } });
    } catch (cause) { return error(res, cause.message === 'Dates must use YYYY-MM-DD' || cause.message === 'From date must not be after to date' ? 400 : 500, cause.message === 'Dates must use YYYY-MM-DD' || cause.message === 'From date must not be after to date' ? cause.message : 'Failed to load collection details'); }
  });

  router.get('/reports/due-vs-collection', authenticateRequest, requiredPermission('repayment.report.view'), requireScopedReports, async (req, res) => {
    try {
      const range = reportRange(req); if (!range.from || !range.to) return error(res, 400, 'From and to dates are required');
      const result = await pool.query(`WITH due AS (SELECT COALESCE(SUM(s.scheduled_amount),0) AS scheduled_due, COALESCE(SUM(s.scheduled_principal),0) AS principal_due, COALESCE(SUM(s.scheduled_interest),0) AS interest_due, COALESCE(SUM(s.scheduled_fees),0) AS fees_due FROM loan_repayment_schedules s JOIN loan_accounts la ON la.id=s.loan_id WHERE s.contractual_due_date BETWEEN $1 AND $2 AND ($3::uuid IS NULL OR la.branch_id=$3)), collected AS (SELECT COALESCE(SUM(p.amount),0) AS collected_amount, COUNT(*) AS collection_count FROM loan_payments p JOIN loan_accounts la ON la.id=p.loan_id WHERE p.status='posted' AND p.payment_date BETWEEN $1 AND $2 AND ($3::uuid IS NULL OR la.branch_id=$3)) SELECT due.*, collected.* FROM due CROSS JOIN collected`, [range.from, range.to, req.reportBranchId]);
      return res.json({ data: { from: range.from, to: range.to, ...result.rows[0] }, error: null });
    } catch (cause) { return error(res, cause.message === 'Dates must use YYYY-MM-DD' || cause.message === 'From date must not be after to date' ? 400 : 500, cause.message === 'Dates must use YYYY-MM-DD' || cause.message === 'From date must not be after to date' ? cause.message : 'Failed to load due versus collection'); }
  });

  router.get('/reports/loan-summary', authenticateRequest, requiredPermission('repayment.report.view'), requireScopedReports, async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT la.id AS loan_id, la.loan_account_number, la.loan_status, la.loan_amount, la.sanction_date, la.tenure, la.repayment_frequency, la.emi_amount,
          la.interest_rate, la.product_id, p.product_id AS product_identifier, p.product_code, p.product_name,
          c.client_id AS client_code, c.first_name, c.last_name, c.mobile_number, c.aadhaar_number, c.voter_card_number, c.kyc_id, c.kyc_type,
          c.date_of_birth, c.age, c.gender, c.marital_status, c.caste, c.religion, c.occupation, c.monthly_income, c.monthly_expense, c.annual_income, c.cycle,
          b.branch_code, b.branch_name, ce.center_code, ce.center_name,
          u.employee_id, NULLIF(trim(concat_ws(' ', u.first_name, u.last_name)), '') AS fo_name,
          COALESCE(s.installment_count, 0) AS installment_count,
          COALESCE(s.scheduled_interest, 0) AS scheduled_interest,
          COALESCE(s.principal_outstanding, 0) AS principal_outstanding,
          COALESCE(s.interest_outstanding, 0) AS interest_outstanding,
          COALESCE(s.installments_outstanding, 0) AS installments_outstanding,
          COALESCE(s.principal_collected, 0) AS principal_collected,
          COALESCE(s.interest_collected, 0) AS interest_collected,
          COALESCE(s.principal_arrears, 0) AS principal_arrears,
          COALESCE(s.interest_arrears, 0) AS interest_arrears,
          COALESCE(s.total_arrears, 0) AS total_arrears,
          app.application_date, app.processing_fee, app.insurance_charge, app.total_interest, app.total_payable_amount,
          app.product_terms_snapshot, d.disbursement_date, d.disbursement_mode, d.reference_number, COALESCE(d.completed_disbursed, 0) AS completed_disbursed,
          COALESCE(d.completed_disbursed, 0) AS net_payable_amount,
          pay.last_collection_date, COALESCE(pay.last_collection_amount, 0) AS last_collection_amount, pay.last_collection_mode
        FROM loan_accounts la
        JOIN clients c ON c.id=la.client_id
        JOIN branches b ON b.id=la.branch_id
        JOIN centers ce ON ce.id=la.center_id
        JOIN products p ON p.id=la.product_id
        LEFT JOIN loan_applications app ON app.id=la.loan_application_id
        LEFT JOIN user_profiles u ON u.id=app.field_officer_id
        LEFT JOIN LATERAL (
          SELECT COUNT(*)::int AS installment_count,
            SUM(scheduled_interest) AS scheduled_interest,
            SUM(scheduled_principal-principal_paid) AS principal_outstanding,
            SUM(scheduled_interest-interest_paid) AS interest_outstanding,
            COUNT(*) FILTER (WHERE scheduled_amount>principal_paid+interest_paid+fees_paid)::int AS installments_outstanding,
            SUM(principal_paid) AS principal_collected, SUM(interest_paid) AS interest_collected,
            SUM(scheduled_principal-principal_paid) FILTER (WHERE collection_due_date<CURRENT_DATE AND scheduled_amount>principal_paid+interest_paid+fees_paid) AS principal_arrears,
            SUM(scheduled_interest-interest_paid) FILTER (WHERE collection_due_date<CURRENT_DATE AND scheduled_amount>principal_paid+interest_paid+fees_paid) AS interest_arrears,
            SUM(scheduled_amount-principal_paid-interest_paid-fees_paid) FILTER (WHERE collection_due_date<CURRENT_DATE AND scheduled_amount>principal_paid+interest_paid+fees_paid) AS total_arrears
          FROM loan_repayment_schedules WHERE loan_id=la.id
        ) s ON true
        LEFT JOIN LATERAL (SELECT disbursement_date, disbursement_mode, reference_number, SUM(disbursement_amount) OVER () AS completed_disbursed FROM loan_disbursements WHERE loan_id=la.id AND status='completed' ORDER BY disbursement_date DESC, created_at DESC LIMIT 1) d ON true
        LEFT JOIN LATERAL (SELECT payment_date AS last_collection_date, amount AS last_collection_amount, payment_method AS last_collection_mode FROM loan_payments WHERE loan_id=la.id AND status='posted' ORDER BY payment_date DESC, posted_at DESC LIMIT 1) pay ON true
        WHERE ($1::uuid IS NULL OR la.branch_id=$1)
        ORDER BY la.loan_account_number`, [req.reportBranchId]);
      return res.json({ data: result.rows, error: null });
    } catch (cause) { return error(res, 500, 'Failed to load loan summary'); }
  });

  router.get('/dashboards/collection', authenticateRequest, requiredPermission('repayment.report.view'), requireScopedReports, async (req, res) => {
    try {
      const range = reportRange(req); if (!range.from || !range.to) return error(res, 400, 'From and to dates are required');
      const result = await pool.query(`SELECT COALESCE(SUM(p.amount),0) AS collected_amount, COUNT(*) AS collection_count, COALESCE(SUM(p.amount) FILTER (WHERE p.payment_method='cash'),0) AS cash_amount, COALESCE(SUM(p.amount) FILTER (WHERE p.payment_method<>'cash'),0) AS digital_amount FROM loan_payments p JOIN loan_accounts la ON la.id=p.loan_id WHERE p.status='posted' AND p.payment_date BETWEEN $1 AND $2 AND ($3::uuid IS NULL OR la.branch_id=$3)`, [range.from, range.to, req.reportBranchId]);
      return res.json({ data: { from: range.from, to: range.to, ...result.rows[0] }, error: null });
    } catch (cause) { return error(res, cause.message === 'Dates must use YYYY-MM-DD' || cause.message === 'From date must not be after to date' ? 400 : 500, cause.message === 'Dates must use YYYY-MM-DD' || cause.message === 'From date must not be after to date' ? cause.message : 'Failed to load collection dashboard'); }
  });

  router.get('/dashboards/overdue', authenticateRequest, requiredPermission('repayment.report.view'), requireScopedReports, async (req, res) => {
    try {
      const asOf = validDate(req.query.asOf) ? String(req.query.asOf) : new Date().toISOString().slice(0, 10);
      const result = await pool.query(`WITH overdue AS (SELECT s.loan_id, s.collection_due_date, (s.scheduled_amount-s.principal_paid-s.interest_paid-s.fees_paid) AS outstanding, ($1::date-s.collection_due_date) AS days_overdue FROM loan_repayment_schedules s JOIN loan_accounts la ON la.id=s.loan_id WHERE s.collection_due_date < $1::date AND s.scheduled_amount>s.principal_paid+s.interest_paid+s.fees_paid AND ($2::uuid IS NULL OR la.branch_id=$2)) SELECT COUNT(*) AS overdue_installment_count, COUNT(DISTINCT loan_id) AS overdue_account_count, COALESCE(SUM(outstanding),0) AS overdue_amount, COALESCE(AVG(days_overdue),0) AS average_days_overdue, COALESCE(SUM(outstanding) FILTER (WHERE days_overdue BETWEEN 1 AND 30),0) AS days_1_30, COALESCE(SUM(outstanding) FILTER (WHERE days_overdue BETWEEN 31 AND 60),0) AS days_31_60, COALESCE(SUM(outstanding) FILTER (WHERE days_overdue > 90),0) AS days_90_plus FROM overdue`, [asOf, req.reportBranchId]);
      return res.json({ data: { asOf, ...result.rows[0] }, error: null });
    } catch (cause) { return error(res, cause.message === 'Dates must use YYYY-MM-DD' || cause.message === 'From date must not be after to date' ? 400 : 500, cause.message === 'Dates must use YYYY-MM-DD' || cause.message === 'From date must not be after to date' ? cause.message : 'Failed to load overdue dashboard'); }
  });

  return router;
}
