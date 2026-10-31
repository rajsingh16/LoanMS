import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { getAuthorizationContext, hasPermission } from '../middleware/authorization.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MONEY = /^\d+(?:\.\d{1,2})?$/;
const error = (res, status, message) => res.status(status).json({ data: null, error: { message } });
const money = (value) => MONEY.test(String(value ?? '')) && Number(value) >= 0;
const isAdmin = (context) => ['admin', 'administrator'].includes(context.role);

function permission(name) { return async (req, res, next) => {
  try { const context = await getAuthorizationContext(req.userId); if (!hasPermission(context, `write_off.${name}`)) return error(res, 403, 'Not authorized for write-off operations'); req.authz = context; next(); }
  catch (cause) { console.error('Write-off authorization failed:', cause); return error(res, 500, 'Authorization check failed'); }
}; }
function scopedBranch(req, res) { if (!isAdmin(req.authz) && !req.authz.branch_id) { error(res, 403, 'No authorized branch is assigned'); return null; } return isAdmin(req.authz) ? null : req.authz.branch_id; }
function date(value) { return !value || /^\d{4}-\d{2}-\d{2}$/.test(String(value)); }
const balancesSql = `
  SELECT la.id,la.loan_account_number,la.branch_id,la.loan_status,
    concat_ws(' ',c.first_name,c.last_name) AS client_name,b.branch_name,
    COALESCE(SUM(s.scheduled_principal-s.principal_paid),0)-COALESCE((SELECT SUM(p.principal_written_off) FROM loan_write_off_postings p WHERE p.loan_id=la.id AND p.reversed_at IS NULL),0) AS principal_outstanding,
    0::numeric AS interest_accrued_receivable
  FROM loan_accounts la JOIN clients c ON c.id=la.client_id JOIN branches b ON b.id=la.branch_id
  LEFT JOIN loan_repayment_schedules s ON s.loan_id=la.id WHERE la.id=$1 GROUP BY la.id,c.first_name,c.last_name,b.branch_name`;

export function createWriteOffRoutes({ pool, authenticateRequest }) {
 const router = Router();
 router.get('/summary', authenticateRequest, permission('view'), async (req,res) => { try {
   const branch = scopedBranch(req,res); if (branch === null && !isAdmin(req.authz)) return;
   const result = await pool.query(`
     WITH schedule_balance AS (
       SELECT la.id, la.branch_id,
         COALESCE(SUM(s.scheduled_principal - s.principal_paid), 0) AS principal_outstanding
       FROM loan_accounts la
       LEFT JOIN loan_repayment_schedules s ON s.loan_id = la.id
       GROUP BY la.id, la.branch_id
     ), posted AS (
       SELECT loan_id,
         COALESCE(SUM(principal_written_off) FILTER (WHERE reversed_at IS NULL), 0) AS principal_written_off,
         COALESCE(SUM(total_written_off) FILTER (WHERE reversed_at IS NULL), 0) AS total_written_off
       FROM loan_write_off_postings
       GROUP BY loan_id
     )
     SELECT
       COALESCE(SUM(GREATEST(sb.principal_outstanding - COALESCE(p.principal_written_off, 0), 0)), 0)::text AS total_pos,
       '0.00'::text AS total_iarr,
       COALESCE(SUM(p.total_written_off), 0)::text AS total_write_off
     FROM schedule_balance sb
     LEFT JOIN posted p ON p.loan_id = sb.id
     WHERE ($1::uuid IS NULL OR sb.branch_id = $1)`, [branch]);
   res.json({ data: result.rows[0], error: null, interestWriteOffSupported: false, interestAccrualStatus: 'unavailable' });
 } catch(cause) { console.error('Write-off summary failed:', { code: cause?.code, message: cause?.message }); error(res,500,'Failed to load write-off summary'); }});
 router.get('/eligible-loans', authenticateRequest, permission('create'), async (req,res) => { try {
   const branch=scopedBranch(req,res); if(branch===null&&!isAdmin(req.authz)) return; const q=String(req.query.search||'').trim();
   const result=await pool.query(`SELECT la.id,la.loan_account_number,concat_ws(' ',c.first_name,c.last_name) AS client_name,b.branch_name,COALESCE(SUM(s.scheduled_principal-s.principal_paid),0)-COALESCE((SELECT SUM(p.principal_written_off) FROM loan_write_off_postings p WHERE p.loan_id=la.id AND p.reversed_at IS NULL),0) AS pos,'0.00'::numeric AS iarr FROM loan_accounts la JOIN clients c ON c.id=la.client_id JOIN branches b ON b.id=la.branch_id LEFT JOIN loan_repayment_schedules s ON s.loan_id=la.id WHERE la.loan_status='active' AND ($1::uuid IS NULL OR la.branch_id=$1) AND ($2='' OR la.loan_account_number ILIKE '%'||$2||'%' OR concat_ws(' ',c.first_name,c.last_name) ILIKE '%'||$2||'%') GROUP BY la.id,c.first_name,c.last_name,b.branch_name HAVING COALESCE(SUM(s.scheduled_principal-s.principal_paid),0)>COALESCE((SELECT SUM(p.principal_written_off) FROM loan_write_off_postings p WHERE p.loan_id=la.id AND p.reversed_at IS NULL),0) ORDER BY la.loan_account_number LIMIT 100`,[branch,q]); res.json({data:result.rows,error:null,interestWriteOffSupported:false});
 } catch(cause){console.error('Eligible loans failed:',cause);error(res,500,'Failed to load eligible loans');}});
 router.get('/', authenticateRequest, permission('view'), async (req,res)=>{try{
   const branch=scopedBranch(req,res);if(branch===null&&!isAdmin(req.authz))return; const {search='',status='',dateFrom='',dateTo=''}=req.query; if(!date(dateFrom)||!date(dateTo))return error(res,400,'Dates must use YYYY-MM-DD');
   const result=await pool.query(`SELECT r.id,la.loan_account_number AS loan_code,concat_ws(' ',c.first_name,c.last_name) AS client_name,b.branch_name,r.requested_principal AS pos,r.requested_interest AS iarr,(r.requested_principal+r.requested_interest+r.requested_fees) AS requested_write_off,COALESCE(p.total_written_off,0) AS posted_write_off,r.status,r.requested_at,r.decided_at AS approval_date FROM loan_write_off_requests r JOIN loan_accounts la ON la.id=r.loan_id JOIN clients c ON c.id=la.client_id JOIN branches b ON b.id=r.branch_id LEFT JOIN loan_write_off_postings p ON p.request_id=r.id WHERE ($1::uuid IS NULL OR r.branch_id=$1) AND ($2='' OR la.loan_account_number ILIKE '%'||$2||'%' OR concat_ws(' ',c.first_name,c.last_name) ILIKE '%'||$2||'%' OR b.branch_name ILIKE '%'||$2||'%') AND ($3='' OR r.status=$3) AND ($4::date IS NULL OR r.requested_at::date >=$4) AND ($5::date IS NULL OR r.requested_at::date <=$5) ORDER BY r.requested_at DESC`,[branch,String(search),String(status),dateFrom||null,dateTo||null]);res.json({data:result.rows,error:null});
 }catch(cause){console.error('Write-off listing failed:',cause);error(res,500,'Failed to load write-offs');}});
 router.post('/',authenticateRequest,permission('create'),async(req,res)=>{const {loanId,requestedPrincipal,requestedInterest=0,requestedFees=0,reason,remarks}=req.body||{};if(!UUID.test(String(loanId||''))||![requestedPrincipal,requestedInterest,requestedFees].every(money)||Number(requestedPrincipal)+Number(requestedInterest)+Number(requestedFees)<=0||!String(reason||'').trim())return error(res,400,'Enter a loan, non-negative amounts, and a reason');if(Number(requestedInterest)>0||Number(requestedFees)>0)return error(res,409,'Interest and fee write-offs are blocked: no authoritative accrued-interest or fee-receivable ledger exists');const client=await pool.connect();let begun=false;try{await client.query('BEGIN');begun=true;const balance=await client.query(balancesSql,[loanId]);if(!balance.rowCount)return error(res,404,'Loan account not found');const row=balance.rows[0];if(!isAdmin(req.authz)&&row.branch_id!==req.authz.branch_id)return error(res,403,'You do not have access to this loan account');if(Number(requestedPrincipal)>Number(row.principal_outstanding))return error(res,409,'Requested principal exceeds the current authoritative outstanding balance');const request=await client.query(`INSERT INTO loan_write_off_requests(loan_id,branch_id,requested_principal,requested_interest,requested_fees,reason,remarks,requested_by) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,[loanId,row.branch_id,requestedPrincipal,requestedInterest,requestedFees,String(reason).trim(),String(remarks||'').trim()||null,req.userId]);await client.query(`INSERT INTO audit_events(entity_type,entity_id,event_type,actor_user_id,new_status,metadata) VALUES('write_off_request',$1,'write_off_requested',$2,'pending',$3::jsonb)`,[request.rows[0].id,req.userId,JSON.stringify({loanId})]);await client.query('COMMIT');res.status(201).json({data:request.rows[0],error:null});}catch(cause){if(begun)await client.query('ROLLBACK').catch(()=>{});console.error('Write-off request failed:',cause);error(res,500,'Failed to create write-off request');}finally{client.release();}});
 async function decision(req,res,status){const id=req.params.id;const remarks=String(req.body?.remarks||'').trim();if(!UUID.test(id))return error(res,400,'Invalid write-off request id');const client=await pool.connect();let begun=false;try{await client.query('BEGIN');begun=true;const found=await client.query('SELECT * FROM loan_write_off_requests WHERE id=$1 FOR UPDATE',[id]);if(!found.rowCount)return error(res,404,'Write-off request not found');const r=found.rows[0];if(!isAdmin(req.authz)&&r.branch_id!==req.authz.branch_id)return error(res,403,'You do not have access to this request');if(r.status!=='pending')return error(res,409,'Only pending requests can be decided');if(r.requested_by===req.userId)return error(res,403,'Requesters cannot approve or reject their own request');const updated=await client.query('UPDATE loan_write_off_requests SET status=$1,decided_by=$2,decided_at=now(),decision_remarks=$3 WHERE id=$4 RETURNING *',[status,req.userId,remarks||null,id]);await client.query(`INSERT INTO audit_events(entity_type,entity_id,event_type,actor_user_id,previous_status,new_status,remarks) VALUES('write_off_request',$1,$2,$3,'pending',$4,$5)`,[id,`write_off_${status}`,req.userId,status,remarks||null]);await client.query('COMMIT');res.json({data:updated.rows[0],error:null});}catch(cause){if(begun)await client.query('ROLLBACK').catch(()=>{});console.error('Write-off decision failed:',cause);error(res,500,'Failed to decide write-off request');}finally{client.release();}}
 router.post('/:id/approve',authenticateRequest,permission('approve'),(req,res)=>decision(req,res,'approved'));
 router.post('/:id/reject',authenticateRequest,permission('approve'),(req,res)=>decision(req,res,'rejected'));
 router.post('/:id/post',authenticateRequest,permission('post'),async(req,res)=>{const id=req.params.id;if(!UUID.test(id))return error(res,400,'Invalid write-off request id');const client=await pool.connect();let begun=false;try{await client.query('BEGIN');begun=true;const found=await client.query('SELECT * FROM loan_write_off_requests WHERE id=$1 FOR UPDATE',[id]);if(!found.rowCount)return error(res,404,'Write-off request not found');const r=found.rows[0];if(!isAdmin(req.authz)&&r.branch_id!==req.authz.branch_id)return error(res,403,'You do not have access to this request');if(r.status!=='approved')return error(res,409,'Only approved requests can be posted');const balance=await client.query(balancesSql,[r.loan_id]);if(Number(r.requested_principal)>Number(balance.rows[0].principal_outstanding))return error(res,409,'The current outstanding balance is lower than the approved write-off');const posting=await client.query(`INSERT INTO loan_write_off_postings(request_id,loan_id,principal_written_off,interest_written_off,fees_written_off,posting_date,ledger_reference,posted_by) VALUES($1,$2,$3,$4,$5,CURRENT_DATE,$6,$7) RETURNING *`,[id,r.loan_id,r.requested_principal,r.requested_interest,r.requested_fees,`WO-${randomUUID()}`,req.userId]);await client.query("UPDATE loan_write_off_requests SET status='posted' WHERE id=$1",[id]);await client.query(`INSERT INTO audit_events(entity_type,entity_id,event_type,actor_user_id,previous_status,new_status,metadata) VALUES('write_off_request',$1,'write_off_posted',$2,'approved','posted',$3::jsonb)`,[id,req.userId,JSON.stringify({postingId:posting.rows[0].id})]);await client.query('COMMIT');res.json({data:posting.rows[0],error:null});}catch(cause){if(begun)await client.query('ROLLBACK').catch(()=>{});console.error('Write-off posting failed:',cause);error(res,500,'Failed to post write-off');}finally{client.release();}});
 return router;
}
