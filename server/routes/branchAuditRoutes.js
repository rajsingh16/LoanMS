import { Router } from 'express';
import multer from 'multer';
import crypto from 'node:crypto';
import * as XLSX from 'xlsx';
import { getAuthorizationContext, hasPermission } from '../middleware/authorization.js';
import { recordAuditEvent } from '../services/auditService.js';

const MAX_BYTES = 10 * 1024 * 1024;
const MAX_ROWS = 5000;
const HEADERS = ['Branch Code', 'Audit Date', 'Audit Reference', 'Audit Status', 'Findings', 'Observations', 'Corrective Action', 'Action Owner', 'Due Date', 'Remarks'];
const REQUIRED = ['Branch Code', 'Audit Date', 'Audit Status'];
const STATUSES = ['compliant', 'non_compliant', 'pending_review'];
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_BYTES, files: 1 } }).single('file');
const fail = (res, status, message, details) => res.status(status).json({ data: details ? { errors: details } : null, error: { message } });
const admin = (context) => ['admin', 'administrator'].includes(context?.role);
const clean = (value, maximum = 4000) => value == null ? null : String(value).replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, maximum) || null;
const header = (value) => String(value ?? '').trim().replace(/\s+/g, ' ').toLowerCase();

function authorize(write = false) {
  return async (req, res, next) => {
    try {
      const context = await getAuthorizationContext(req.userId);
      if (!context || (!admin(context) && !hasPermission(context, write ? 'branch_audit.write' : 'branch_audit.view'))) return fail(res, 403, 'Not authorized for branch audits');
      req.authz = context;
      return next();
    } catch (error) { console.error('Branch audit authorization failed', error); return fail(res, 500, 'Authorization check failed'); }
  };
}

function scoped(req, column, index) {
  if (admin(req.authz)) return { sql: '', values: [] };
  if (!req.authz.branch_id) return null;
  return { sql: ` AND ${column} = $${index}`, values: [req.authz.branch_id] };
}

function dateValue(value) {
  if (value instanceof Date && !Number.isNaN(value.valueOf())) return value.toISOString().slice(0, 10);
  if (typeof value === 'number') { const parsed = XLSX.SSF.parse_date_code(value); if (parsed) return `${parsed.y}-${String(parsed.m).padStart(2, '0')}-${String(parsed.d).padStart(2, '0')}`; }
  const text = clean(value, 40);
  if (!text) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(text) && !Number.isNaN(Date.parse(`${text}T00:00:00Z`))) return text;
  return null;
}

function isWorkbook(buffer, filename) {
  const extension = String(filename).toLowerCase().match(/\.(xlsx|xls)$/)?.[1];
  const zip = buffer.length >= 4 && buffer.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04]));
  const ole = buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]));
  return (extension === 'xlsx' && zip) || (extension === 'xls' && ole);
}

function makeTemplate() {
  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.aoa_to_sheet([HEADERS, ['BRANCH-001', '2026-01-15', 'AUD-001', 'compliant', '', '', '', '', '', '']]);
  sheet['!cols'] = HEADERS.map((name) => ({ wch: Math.max(name.length + 2, 18) }));
  XLSX.utils.book_append_sheet(workbook, sheet, 'Branch Audits');
  const instructions = XLSX.utils.aoa_to_sheet([
    ['Branch Audit Upload Instructions'],
    ['Required columns', 'Branch Code, Audit Date, Audit Status'],
    ['Date format', 'YYYY-MM-DD'],
    ['Valid audit statuses', STATUSES.join(', ')],
    ['Limits', `One worksheet; maximum ${MAX_ROWS} data rows; maximum 10 MB file`],
    ['Safety', 'Enter values only. Spreadsheet formulas are not evaluated as trusted input.'],
  ]);
  instructions['!cols'] = [{ wch: 26 }, { wch: 100 }];
  XLSX.utils.book_append_sheet(workbook, instructions, 'Instructions');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([['Audit Status'], ...STATUSES.map((status) => [status])]), 'Reference');
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx', compression: true });
}

export function createBranchAuditRoutes({ pool, authenticateRequest }) {
  const router = Router();
  router.get('/template', authenticateRequest, authorize(), (_req, res) => {
    res.set({ 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Content-Disposition': 'attachment; filename="branch-audit-template.xlsx"', 'Cache-Control': 'no-store' });
    return res.send(makeTemplate());
  });
  router.get('/summary', authenticateRequest, authorize(), async (req, res) => {
    const access = scoped(req, 'r.branch_id', 1); if (!access) return fail(res, 403, 'No authorized branch is assigned');
    try {
      const query = `WITH latest AS (SELECT DISTINCT ON (r.branch_id) r.branch_id,r.audit_status FROM branch_audit_records r JOIN branch_audit_uploads u ON u.id=r.upload_id AND u.upload_status='successful' WHERE 1=1${access.sql} ORDER BY r.branch_id,r.audit_date DESC,r.created_at DESC), last_upload AS (SELECT u.uploaded_at, concat_ws(' ',p.first_name,p.last_name) uploader FROM branch_audit_uploads u LEFT JOIN user_profiles p ON p.id=u.uploaded_by WHERE u.upload_status='successful' ${admin(req.authz) ? '' : `AND EXISTS (SELECT 1 FROM branch_audit_records r WHERE r.upload_id=u.id${access.sql})`} ORDER BY u.uploaded_at DESC LIMIT 1) SELECT COUNT(*)::int total_branches,COUNT(*) FILTER (WHERE audit_status='compliant')::int compliant_branches,COUNT(*) FILTER (WHERE audit_status='non_compliant')::int non_compliant_branches,(SELECT uploaded_at FROM last_upload) latest_upload_date,(SELECT uploader FROM last_upload) latest_uploader FROM latest`;
      const { rows } = await pool.query(query, access.values); const r = rows[0];
      return res.json({ data: { totalBranchesAudited: r.total_branches, compliantBranches: r.compliant_branches, nonCompliantBranches: r.non_compliant_branches, latestUploadDate: r.latest_upload_date, latestUploaderName: r.latest_uploader || null }, error: null });
    } catch (error) { console.error(error); return fail(res, 500, 'Failed to load branch audit summary'); }
  });
  router.get('/uploads', authenticateRequest, authorize(), async (req, res) => {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1), limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
    const access = scoped(req, 'r.branch_id', 1); if (!access) return fail(res, 403, 'No authorized branch is assigned');
    try { const values = [...access.values, limit, (page - 1) * limit]; const q = await pool.query(`SELECT u.*,concat_ws(' ',p.first_name,p.last_name) uploader_name FROM branch_audit_uploads u LEFT JOIN user_profiles p ON p.id=u.uploaded_by WHERE ${admin(req.authz) ? 'TRUE' : `EXISTS (SELECT 1 FROM branch_audit_records r WHERE r.upload_id=u.id${access.sql})`} ORDER BY u.uploaded_at DESC LIMIT $${values.length - 1} OFFSET $${values.length}`, values); return res.json({ data: q.rows, error: null, meta: { page, limit } }); } catch (error) { console.error(error); return fail(res, 500, 'Failed to load audit uploads'); }
  });
  router.get('/uploads/:id', authenticateRequest, authorize(), async (req, res) => {
    const access = scoped(req, 'r.branch_id', 2); if (!access) return fail(res, 403, 'No authorized branch is assigned');
    try { const q = await pool.query(`SELECT u.*,concat_ws(' ',p.first_name,p.last_name) uploader_name FROM branch_audit_uploads u LEFT JOIN user_profiles p ON p.id=u.uploaded_by WHERE u.id=$1 ${admin(req.authz) ? '' : `AND EXISTS (SELECT 1 FROM branch_audit_records r WHERE r.upload_id=u.id${access.sql})`}`, [req.params.id, ...access.values]); if (!q.rowCount) return fail(res, 404, 'Upload not found'); return res.json({ data: q.rows[0], error: null }); } catch (error) { return fail(res, 400, 'Invalid upload id'); }
  });
  router.get('/records', authenticateRequest, authorize(), async (req, res) => {
    const access = scoped(req, 'r.branch_id', 1); if (!access) return fail(res, 403, 'No authorized branch is assigned');
    try { const values = [...access.values]; const where = [`1=1${access.sql}`]; for (const [key, column] of [['branchId', 'r.branch_id'], ['status', 'r.audit_status']]) if (req.query[key]) { values.push(req.query[key]); where.push(`${column}=$${values.length}`); } const q = await pool.query(`SELECT r.*,b.branch_code,b.branch_name FROM branch_audit_records r JOIN branches b ON b.id=r.branch_id WHERE ${where.join(' AND ')} ORDER BY r.audit_date DESC,r.created_at DESC LIMIT 500`, values); return res.json({ data: q.rows, error: null }); } catch (error) { console.error(error); return fail(res, 500, 'Failed to load audit records'); }
  });
  router.post('/upload', authenticateRequest, authorize(true), (req, res, next) => upload(req, res, (error) => error ? fail(res, 400, error.code === 'LIMIT_FILE_SIZE' ? 'File must be 10 MB or smaller' : 'Invalid upload') : next()), async (req, res) => {
    const file = req.file;
    if (!file || !isWorkbook(file.buffer, file.originalname)) return fail(res, 400, 'Upload a valid .xlsx or .xls workbook no larger than 10 MB');
    const hash = crypto.createHash('sha256').update(file.buffer).digest('hex');
    let rows;
    try { const book = XLSX.read(file.buffer, { type: 'buffer', cellFormula: false, cellHTML: false, cellText: false, raw: true, WTF: false }); if (!book.SheetNames.length) throw new Error('Workbook has no worksheets'); rows = XLSX.utils.sheet_to_json(book.Sheets[book.SheetNames[0]], { header: 1, raw: true, defval: null, blankrows: false }); } catch { return fail(res, 400, 'The Excel workbook could not be safely read'); }
    if (!rows.length || rows.length - 1 > MAX_ROWS) return fail(res, 400, `Workbook must contain between 1 and ${MAX_ROWS} data rows`);
    const map = new Map(rows[0].map((value, index) => [header(value), index])); const absent = REQUIRED.filter((name) => !map.has(header(name))); if (absent.length) return fail(res, 400, `Missing required columns: ${absent.join(', ')}`);
    const raw = rows.slice(1).filter((row) => row.some((value) => clean(value) !== null)); if (!raw.length) return fail(res, 400, 'Workbook has no data rows');
    const value = (row, name) => row[map.get(header(name))]; const codes = [...new Set(raw.map((row) => clean(value(row, 'Branch Code'), 120)).filter(Boolean))];
    try {
      const branches = await pool.query(`SELECT id,branch_code FROM branches WHERE status='active' AND upper(branch_code)=ANY($1::text[])`, [codes.map((code) => code.toUpperCase())]); const byCode = new Map(branches.rows.map((branch) => [branch.branch_code.toUpperCase(), branch])); const errors = [], prepared = [];
      raw.forEach((row, offset) => { const line = offset + 2, code = clean(value(row, 'Branch Code'), 120), auditDate = dateValue(value(row, 'Audit Date')), status = clean(value(row, 'Audit Status'), 50)?.toLowerCase().replace(/[ -]+/g, '_'), dueDate = value(row, 'Due Date') == null || clean(value(row, 'Due Date')) === null ? null : dateValue(value(row, 'Due Date')); const branch = code && byCode.get(code.toUpperCase()); if (!code || !branch) errors.push({ line, field: 'Branch Code', message: 'A valid active branch code is required' }); if (!auditDate) errors.push({ line, field: 'Audit Date', message: 'Use a valid YYYY-MM-DD audit date' }); if (!STATUSES.includes(status)) errors.push({ line, field: 'Audit Status', message: `Use one of: ${STATUSES.join(', ')}` }); if (value(row, 'Due Date') != null && clean(value(row, 'Due Date')) !== null && !dueDate) errors.push({ line, field: 'Due Date', message: 'Use a valid YYYY-MM-DD due date' }); prepared.push({ branch, auditDate, status, dueDate, auditReference: clean(value(row, 'Audit Reference'), 250), findings: clean(value(row, 'Findings')), observations: clean(value(row, 'Observations')), correctiveAction: clean(value(row, 'Corrective Action')), remarks: clean(value(row, 'Remarks')) }); });
      if (!admin(req.authz) && prepared.some((item) => item.branch && item.branch.id !== req.authz.branch_id)) errors.push({ line: 1, field: 'Branch Code', message: 'The workbook contains a branch outside your authorized branch' });
      if (errors.length) return fail(res, 400, 'Workbook validation failed', errors.slice(0, 500));
      const client = await pool.connect(); try { await client.query('BEGIN'); const prior = await client.query('SELECT id FROM branch_audit_uploads WHERE file_hash=$1 FOR UPDATE', [hash]); if (prior.rowCount) throw Object.assign(new Error('This file was already uploaded'), { status: 409 }); const duplicate = await client.query(`SELECT b.branch_code,r.audit_date,r.audit_reference FROM branch_audit_records r JOIN branches b ON b.id=r.branch_id WHERE (r.branch_id,r.audit_date,COALESCE(r.audit_reference,'')) IN (SELECT * FROM unnest($1::uuid[],$2::date[],$3::text[]))`, [prepared.map((item) => item.branch.id), prepared.map((item) => item.auditDate), prepared.map((item) => item.auditReference || '')]); if (duplicate.rowCount) throw Object.assign(new Error('One or more audit records already exist for the same branch, date, and reference'), { status: 409 }); const saved = await client.query(`INSERT INTO branch_audit_uploads(original_file_name,file_size,file_hash,uploaded_by,total_rows,successful_rows,upload_status) VALUES($1,$2,$3,$4,$5,$5,'successful') RETURNING *`, [clean(file.originalname, 255), file.size, hash, req.userId, prepared.length]); for (const item of prepared) await client.query(`INSERT INTO branch_audit_records(upload_id,branch_id,audit_date,audit_reference,audit_status,findings,observations,corrective_action,due_date,remarks) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`, [saved.rows[0].id, item.branch.id, item.auditDate, item.auditReference, item.status, item.findings, item.observations, item.correctiveAction, item.dueDate, item.remarks]); await recordAuditEvent(client, { entityType: 'branch_audit_upload', entityId: saved.rows[0].id, eventType: 'branch_audit_uploaded', actorUserId: req.userId, metadata: { rowCount: prepared.length, fileHash: hash } }); await client.query('COMMIT'); return res.status(201).json({ data: { id: saved.rows[0].id, totalRows: prepared.length, successfulRows: prepared.length, failedRows: 0, uploadStatus: 'successful' }, error: null }); } catch (error) { await client.query('ROLLBACK'); return fail(res, error.status || 500, error.message || 'Failed to save audit workbook'); } finally { client.release(); }
    } catch (error) { console.error('Branch audit upload failed', error); return fail(res, error?.code === '23505' ? 409 : 500, error?.code === '23505' ? 'This file or audit record was already uploaded' : 'Failed to process audit workbook'); }
  });
  return router;
}
