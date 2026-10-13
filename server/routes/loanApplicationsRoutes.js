import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import { deleteLoanApplicationDocument, getLoanApplicationDocument, saveLoanApplicationDocument } from '../services/loanApplicationDocumentStorage.js';
import { getAuthorizationContext } from '../middleware/authorization.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const FREQUENCIES = new Set(['weekly', 'fortnightly', 'monthly', 'quarterly']);
const DOCUMENT_TYPES = new Set(['Borrower KYC 1', 'Borrower KYC 2', 'Bank Passbook/Cheque', 'Co-applicant KYC 1 & 2', 'Profile Photo', 'Business Registration Proof', 'Client Consent', 'CIBIL', 'Loan Application', 'Bank Statement', 'Ownership Proof', 'Other Document 1 & 2',]);
const MAX_DOCUMENT_BYTES = Number(process.env.LOAN_DOCUMENT_MAX_BYTES) > 0 ? Number(process.env.LOAN_DOCUMENT_MAX_BYTES) : 10 * 1024 * 1024;
const ALLOWED_DOCUMENTS = new Map([['.pdf', 'application/pdf'], ['.jpg', 'image/jpeg'], ['.jpeg', 'image/jpeg'], ['.png', 'image/png']]);
const uploadDocumentFile = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_DOCUMENT_BYTES, files: 1, fields: 1, parts: 2 }, fileFilter: (_req, file, callback) => {
  const extension = path.extname(file.originalname || '').toLowerCase();
  if (!ALLOWED_DOCUMENTS.has(extension) || ALLOWED_DOCUMENTS.get(extension) !== file.mimetype) return callback(new Error('Only matching PDF, JPEG, and PNG documents are allowed'));
  callback(null, true);
} }).single('file');

function sanitizedFileName(value) {
  return path.basename(String(value || 'document')).replace(/[\\/:*?"<>|\x00-\x1f\x7f]/g, '_').replace(/\s+/g, ' ').trim().slice(0, 180) || 'document';
}

function documentSignatureMatches(buffer, mimeType) {
  if (mimeType === 'application/pdf') return buffer.subarray(0, 5).toString('ascii') === '%PDF-';
  if (mimeType === 'image/jpeg') return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (mimeType === 'image/png') return buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  return false;
}

function runDocumentUpload(req, res, next) {
  uploadDocumentFile(req, res, (error) => {
    if (!error) return next();
    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') return errorMessage(res, 413, `Document exceeds the ${Math.floor(MAX_DOCUMENT_BYTES / (1024 * 1024))} MB size limit`);
    if (error instanceof multer.MulterError) return errorMessage(res, 400, 'Invalid document upload');
    return errorMessage(res, 400, error.message || 'Invalid document upload');
  });
}

function permission(permission) {
  return async (req, res, next) => {
    try {
      const context = await getAuthorizationContext(req.userId);
      if (!context) return res.status(403).json({ data: null, error: { message: 'Forbidden' } });
      const admin = ['admin', 'administrator'].includes(context.role);
      const allowed = admin || context.permissions.some((p) => p.module === 'loan' && (p.permission === permission || p.permission === 'admin'));
      if (!allowed) return res.status(403).json({ data: null, error: { message: 'Not authorized for loan applications' } });
      req.authz = context;
      return next();
    } catch (error) {
      console.error('Loan authorization failed:', error);
      return res.status(500).json({ data: null, error: { message: 'Authorization check failed' } });
    }
  };
}

function value(body, camel, snake = camel) { return body[camel] ?? body[snake]; }
function errorMessage(res, status, message) { return res.status(status).json({ data: null, error: { message } }); }
function isValidationError(error) { return /required|invalid|does not|inactive|unsupported|must be|belong|IFSC/i.test(String(error?.message || '')); }

async function validateReferences(client, body) {
  const branchId = value(body, 'branchId', 'branch_id');
  const centerId = value(body, 'centerId', 'center_id');
  const clientId = value(body, 'clientId', 'client_id');
  const productGroupId = value(body, 'productGroupId', 'product_group_id');
  const productId = value(body, 'productId', 'product_id');
  const purposeId = value(body, 'purposeId', 'purpose_id');
  if (!purposeId) throw new Error('Purpose is required');
  const subPurposeId = value(body, 'subPurposeId', 'sub_purpose_id');
  for (const [name, id] of Object.entries({ branchId, centerId, clientId, productGroupId, productId, purposeId, subPurposeId })) {
    if (id != null && id !== '' && !UUID.test(String(id))) throw new Error(`${name} is invalid`);
  }
  if (!branchId || !centerId || !clientId || !productGroupId || !productId) throw new Error('Branch, center, client, product group and product are required');
  const branch = await client.query('SELECT id FROM branches WHERE id = $1 AND status = $2', [branchId, 'active']);
  if (!branch.rowCount) throw new Error('Branch does not exist or is inactive');
  const center = await client.query('SELECT id FROM centers WHERE id = $1 AND branch_id = $2 AND status = $3', [centerId, branchId, 'active']);
  if (!center.rowCount) throw new Error('Center does not exist, is inactive, or does not belong to the selected branch');
  const applicant = await client.query('SELECT id FROM clients WHERE id = $1 AND status = $2', [clientId, 'active']);
  if (!applicant.rowCount) throw new Error('Client does not exist or is inactive');
  const group = await client.query("SELECT id FROM product_groups WHERE id = $1 AND lower(status) = 'active'", [productGroupId]);
  if (!group.rowCount) throw new Error('Product group does not exist or is inactive');
  const product = await client.query("SELECT id, product_group_id FROM products WHERE id = $1 AND lower(status) = 'active'", [productId]);
  if (!product.rowCount || String(product.rows[0].product_group_id) !== String(productGroupId)) throw new Error('Product does not exist, is inactive, or does not belong to the selected product group');
  if (purposeId && !(await client.query('SELECT id FROM purposes WHERE id = $1 AND lower(status) = $2', [purposeId, 'active'])).rowCount) throw new Error('Purpose does not exist or is inactive');
  if (subPurposeId) {
    const subPurpose = await client.query('SELECT id, main_purpose_id FROM purposes WHERE id = $1 AND lower(status) = $2', [subPurposeId, 'active']);
    if (!subPurpose.rowCount) throw new Error('Sub-purpose does not exist or is inactive');
    if (!purposeId || String(subPurpose.rows[0].main_purpose_id) !== String(purposeId)) throw new Error('Sub-purpose does not belong to the selected purpose');
  }
  const officerId = value(body, 'fieldOfficerId', 'field_officer_id');
  if (officerId) {
    if (!UUID.test(String(officerId))) throw new Error('fieldOfficerId is invalid');
    const officer = await client.query("SELECT id FROM user_profiles WHERE id = $1 AND lower(role) = 'field_officer' AND status = 'active'", [officerId]);
    if (!officer.rowCount) throw new Error('Field officer does not exist or is inactive');
  }
  return { branchId, centerId, clientId, productGroupId, productId, purposeId: purposeId || null, subPurposeId: subPurposeId || null, officerId: officerId || null };
}

function validatePayload(body) {
  const amount = Number(value(body, 'loanAmount', 'loan_amount'));
  const emi = value(body, 'emiAmount', 'emi_amount');
  const rate = value(body, 'interestRate', 'interest_rate');
  const tenure = value(body, 'tenure');
  const frequency = String(value(body, 'repaymentFrequency', 'repayment_frequency') || '').toLowerCase();
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Loan amount must be positive');
  if (emi !== undefined && emi !== null && (!Number.isFinite(Number(emi)) || Number(emi) < 0)) throw new Error('EMI must be a non-negative number');
  if (rate !== undefined && rate !== null && (!Number.isFinite(Number(rate)) || Number(rate) < 0)) throw new Error('Interest rate must be a non-negative number');
  if (tenure !== undefined && tenure !== null && (!Number.isInteger(Number(tenure)) || Number(tenure) <= 0)) throw new Error('Tenure must be a positive integer');
  if (!FREQUENCIES.has(frequency)) throw new Error('A supported repayment frequency is required');
  return { amount, emi: emi == null || emi === '' ? null : Number(emi), rate: rate == null || rate === '' ? null : Number(rate), tenure: tenure == null || tenure === '' ? null : Number(tenure), frequency: frequency || null };
}

function childRows(body) {
  return { addresses: Array.isArray(body.addresses) ? body.addresses : [], familyMembers: Array.isArray(body.familyMembers) ? body.familyMembers : [], bankAccounts: Array.isArray(body.bankAccounts) ? body.bankAccounts : [] };
}

async function insertChildren(client, applicationId, body, userId) {
  const { addresses, familyMembers, bankAccounts } = childRows(body);
  for (const a of addresses) {
    if (!a.address1) throw new Error('Address 1 is required');
    if (a.pincode && !/^\d{6}$/.test(String(a.pincode))) throw new Error('Pincode must contain 6 digits');
    if (a.villageId && !UUID.test(String(a.villageId))) throw new Error('Village ID is invalid');
    if (a.districtId && !UUID.test(String(a.districtId))) throw new Error('District ID is invalid');
    if (a.villageId && !(await client.query('SELECT id FROM villages WHERE id = $1', [a.villageId])).rowCount) throw new Error('Village does not exist');
    if (a.districtId && !(await client.query('SELECT id FROM districts WHERE id = $1', [a.districtId])).rowCount) throw new Error('District does not exist');
    await client.query(`INSERT INTO loan_application_addresses (loan_application_id,address_type,address1,address2,mohalla,post_office,nearest_police_station,pincode,village_id,district_id,state,residence_type) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`, [applicationId, a.addressType || 'correspondence', a.address1, a.address2 || null, a.mohalla || null, a.postOffice || null, a.nearestPoliceStation || null, a.pincode || null, a.villageId || null, a.districtId || null, a.state || null, a.residenceType || null]);
  }
  for (const f of familyMembers) {
    if (!f.relation || !f.firstName) throw new Error('Family member relation and first name are required');
    await client.query(`INSERT INTO loan_application_family_members (loan_application_id,relation,first_name,last_name,mobile_number,date_of_birth,id_type,id_number,additional_id_type,additional_id_number,marital_status,employment_status,qualification,occupation,occupation_type,consider_for_assessment,is_nominee,is_co_applicant,is_guarantor) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)`, [applicationId, f.relation, f.firstName, f.lastName || null, f.mobileNumber || null, f.dateOfBirth || null, f.idType || null, f.idNumber || null, f.additionalIdType || null, f.additionalIdNumber || null, f.maritalStatus || null, f.employmentStatus || null, f.qualification || null, f.occupation || null, f.occupationType || null, !!f.considerForAssessment, !!f.isNominee || !!f.nameNominee, !!f.isCoApplicant || !!f.coApplicant, !!f.isGuarantor || !!f.guarantor]);
  }
  for (const b of bankAccounts) {
    if (!b.accountType || !b.accountNumber) throw new Error('Bank account type and number are required');
    if (b.nameMatchPercentage != null && (!Number.isFinite(Number(b.nameMatchPercentage)) || Number(b.nameMatchPercentage) < 0 || Number(b.nameMatchPercentage) > 100)) throw new Error('Name match percentage must be between 0 and 100');
    if (b.ifscId && !UUID.test(String(b.ifscId))) throw new Error('ifscId is invalid');
    if (b.ifscId && !(await client.query("SELECT id FROM ifsc_codes WHERE id=$1 AND ifsc_code ~* '^[A-Z]{4}0[A-Z0-9]{6}$'", [b.ifscId])).rowCount) throw new Error('IFSC does not exist or has an invalid format');
    await client.query(`INSERT INTO loan_application_bank_accounts (loan_application_id,account_type,account_number,ifsc_id,customer_name,for_disbursement,for_collection,name_match_percentage,penny_drop_done) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`, [applicationId, b.accountType, b.accountNumber, b.ifscId || null, b.customerName || null, !!b.forDisbursement, !!b.forCollection, b.nameMatchPercentage ?? null, !!b.pennyDropDone]);
  }
}

async function updateManagedChildren(client, applicationId, body, userId) {
  const { addresses, familyMembers, bankAccounts } = childRows(body);
  const deleted = body.deletedChildIds || {};
  for (const [key, table] of [['addresses', 'loan_application_addresses'], ['familyMembers', 'loan_application_family_members'], ['bankAccounts', 'loan_application_bank_accounts']]) {
    const ids = deleted[key] || [];
    if (!Array.isArray(ids) || ids.some((id) => !UUID.test(String(id)))) throw new Error(`deletedChildIds.${key} is invalid`);
    if (ids.length) await client.query(`DELETE FROM ${table} WHERE loan_application_id=$1 AND id=ANY($2::uuid[])`, [applicationId, ids]);
  }
  for (const a of addresses) {
    if (!a.address1) throw new Error('Address 1 is required');
    if (a.pincode && !/^\d{6}$/.test(String(a.pincode))) throw new Error('Pincode must contain 6 digits');
    if (a.id && !UUID.test(String(a.id))) throw new Error('Address ID is invalid');
    if (a.villageId && !UUID.test(String(a.villageId))) throw new Error('Village ID is invalid');
    if (a.districtId && !UUID.test(String(a.districtId))) throw new Error('District ID is invalid');
    if (a.villageId && !(await client.query('SELECT id FROM villages WHERE id = $1', [a.villageId])).rowCount) throw new Error('Village does not exist');
    if (a.districtId && !(await client.query('SELECT id FROM districts WHERE id = $1', [a.districtId])).rowCount) throw new Error('District does not exist');
    if (a.id) await client.query('UPDATE loan_application_addresses SET address_type=COALESCE($1,address_type), address1=COALESCE($2,address1), address2=$3, mohalla=$4, post_office=$5, nearest_police_station=$6, pincode=$7, village_id=$8, district_id=$9, state=$10, residence_type=$11 WHERE id=$12 AND loan_application_id=$13', [a.addressType || null, a.address1 || null, a.address2 || null, a.mohalla || null, a.postOffice || null, a.nearestPoliceStation || null, a.pincode || null, a.villageId || null, a.districtId || null, a.state || null, a.residenceType || null, a.id, applicationId]);
    else if (a.address1) await insertChildren(client, applicationId, { addresses: [a] }, userId);
  }
  for (const f of familyMembers) {
    if (!f.relation || !f.firstName) throw new Error('Family member relation and first name are required');
    if (f.id && !UUID.test(String(f.id))) throw new Error('Family member ID is invalid');
    if (f.id) await client.query('UPDATE loan_application_family_members SET relation=COALESCE($1,relation), first_name=COALESCE($2,first_name), last_name=$3, mobile_number=$4, date_of_birth=$5, id_type=$6, id_number=$7, additional_id_type=$8, additional_id_number=$9, marital_status=$10, employment_status=$11, qualification=$12, occupation=$13, occupation_type=$14, consider_for_assessment=$15, is_nominee=$16, is_co_applicant=$17, is_guarantor=$18 WHERE id=$19 AND loan_application_id=$20', [f.relation || null, f.firstName || null, f.lastName || null, f.mobileNumber || null, f.dateOfBirth || null, f.idType || null, f.idNumber || null, f.additionalIdType || null, f.additionalIdNumber || null, f.maritalStatus || null, f.employmentStatus || null, f.qualification || null, f.occupation || null, f.occupationType || null, !!f.considerForAssessment, !!f.isNominee, !!f.isCoApplicant, !!f.isGuarantor, f.id, applicationId]);
    else await insertChildren(client, applicationId, { familyMembers: [f] }, userId);
  }
  for (const b of bankAccounts) {
    if (!b.accountType || !b.accountNumber) throw new Error('Bank account type and number are required');
    if (b.id && !UUID.test(String(b.id))) throw new Error('Bank account ID is invalid');
    if (b.nameMatchPercentage != null && (!Number.isFinite(Number(b.nameMatchPercentage)) || Number(b.nameMatchPercentage) < 0 || Number(b.nameMatchPercentage) > 100)) throw new Error('Name match percentage must be between 0 and 100');
    if (b.ifscId && !(await client.query("SELECT id FROM ifsc_codes WHERE id=$1 AND ifsc_code ~* '^[A-Z]{4}0[A-Z0-9]{6}$'", [b.ifscId])).rowCount) throw new Error('IFSC does not exist or has an invalid format');
    if (b.id) await client.query('UPDATE loan_application_bank_accounts SET account_type=COALESCE($1,account_type), account_number=COALESCE($2,account_number), ifsc_id=$3, customer_name=$4, for_disbursement=$5, for_collection=$6, name_match_percentage=$7, penny_drop_done=$8 WHERE id=$9 AND loan_application_id=$10', [b.accountType || null, b.accountNumber || null, b.ifscId || null, b.customerName || null, !!b.forDisbursement, !!b.forCollection, b.nameMatchPercentage ?? null, !!b.pennyDropDone, b.id, applicationId]);
    else if (b.accountType && b.accountNumber) await insertChildren(client, applicationId, { bankAccounts: [b] }, userId);
  }
}

async function loadDetail(client, id) {
  const main = await client.query(`SELECT a.id, a.application_number, a.application_date, a.client_id, a.branch_id, a.center_id, a.product_group_id, a.product_id, a.purpose_id, a.sub_purpose_id, a.is_top_up, a.loan_amount, a.emi_amount, a.interest_rate, a.tenure, a.repayment_frequency, a.application_status, a.document_verification_status, a.sanction_status, a.sanction_amount, a.sanction_date, a.sanction_authority, a.sanction_remarks, a.rejection_reason, a.rejection_remarks, a.rejected_by, a.rejection_date, a.remarks, a.field_officer_id, a.created_by, a.updated_by, a.created_at, a.updated_at, c.client_id AS client_code, c.first_name, c.last_name, c.aadhaar_number, c.voter_card_number, c.kyc_type, c.kyc_id, c.date_of_birth, c.age, c.gender, c.father_name, c.mother_name, c.mobile_number, c.marital_status, c.qualification, c.language, c.caste, c.religion, c.occupation, c.land_holding, c.annual_income, c.monthly_income, c.monthly_expense, c.monthly_obligation, c.household_income, b.branch_code, b.branch_name, ce.center_code, ce.center_name, pg.product_group_name, p.product_name, pu.purpose_name, sp.purpose_name AS sub_purpose_name, u.first_name AS officer_first_name, u.last_name AS officer_last_name FROM loan_applications a JOIN clients c ON c.id=a.client_id JOIN branches b ON b.id=a.branch_id JOIN centers ce ON ce.id=a.center_id JOIN product_groups pg ON pg.id=a.product_group_id JOIN products p ON p.id=a.product_id LEFT JOIN purposes pu ON pu.id=a.purpose_id LEFT JOIN purposes sp ON sp.id=a.sub_purpose_id LEFT JOIN user_profiles u ON u.id=a.field_officer_id WHERE a.id=$1`, [id]);
  if (!main.rowCount) return null;
  const row = main.rows[0];
  const [addresses, familyMembers, bankAccounts, documents
  ] = await Promise.all([
    client.query(
      `
        SELECT
          ad.*,
          d.district_name
        FROM loan_application_addresses ad
        LEFT JOIN districts d
          ON d.id = ad.district_id
        WHERE ad.loan_application_id = $1
        ORDER BY ad.created_at
      `,
      [id]
    ),
  
    client.query(
      `
        SELECT *
        FROM loan_application_family_members
        WHERE loan_application_id = $1
        ORDER BY created_at
      `,
      [id]
    ),
  
    client.query(
      `
        SELECT
          ba.*,
          i.ifsc_code,
          i.bank_name
        FROM loan_application_bank_accounts ba
        LEFT JOIN ifsc_codes i
          ON i.id = ba.ifsc_id
        WHERE ba.loan_application_id = $1
        ORDER BY ba.created_at
      `,
      [id]
    ),
  
    client.query(
      `
        SELECT *
        FROM loan_application_documents
        WHERE loan_application_id = $1
        ORDER BY uploaded_at
      `,
      [id]
    ),
  ]);
  return { ...row, addresses: addresses.rows, familyMembers: familyMembers.rows, bankAccounts: bankAccounts.rows, documents: documents.rows };
}

export function createLoanApplicationsRoutes({ pool, authenticateRequest }) {
  const router = Router();
  router.post('/:id/documents', authenticateRequest, permission('write'), runDocumentUpload, async (req, res) => {
    if (!UUID.test(req.params.id)) return errorMessage(res, 400, 'Invalid application id');
    const documentType = String(req.body?.documentType || '').trim();
    if (!DOCUMENT_TYPES.has(documentType)) return errorMessage(res, 400, 'Select a valid document type');
    if (!req.file || !req.file.buffer?.length) return errorMessage(res, 400, 'A non-empty document file is required');
    if (req.file.size > MAX_DOCUMENT_BYTES) return errorMessage(res, 413, 'Document exceeds the configured size limit');
    if (!documentSignatureMatches(req.file.buffer, req.file.mimetype)) return errorMessage(res, 400, 'The document content does not match its file type');
    let storageKey;
    try {
      const application = await pool.query('SELECT application_status FROM loan_applications WHERE id=$1', [req.params.id]);
      if (!application.rowCount) return errorMessage(res, 404, 'Loan application not found');
      if (application.rows[0].application_status !== 'draft') {
        return errorMessage(
          res,
          409,
          'Documents can only be uploaded while the application is in draft'
        );
      }
      storageKey = await saveLoanApplicationDocument(req.params.id, req.file.buffer, path.extname(req.file.originalname).toLowerCase().slice(1));
      const { rows } = await pool.query(
        `INSERT INTO loan_application_documents (loan_application_id,document_type,file_name,storage_key,mime_type,file_size_bytes,uploaded_by,verification_status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,'pending')
         RETURNING id,loan_application_id,document_type,file_name,mime_type,file_size_bytes,verification_status,uploaded_at`,
        [req.params.id, documentType, sanitizedFileName(req.file.originalname), storageKey, req.file.mimetype, req.file.size, req.userId],
      );
      return res.status(201).json({ data: rows[0], error: null });
    } catch (error) {
      if (storageKey) await deleteLoanApplicationDocument(storageKey).catch((cleanupError) => console.error('Loan document cleanup failed:', cleanupError.message));
      console.error('Loan document upload failed:', error);
      return errorMessage(res, 500, 'Failed to save loan application document');
    }
  });
  
  router.get('/field-officers', authenticateRequest, permission('read'), async (_req, res) => {
    try {
      const { rows } = await pool.query("SELECT id, first_name, last_name, employee_id FROM user_profiles WHERE lower(role) = 'field_officer' AND status = 'active' ORDER BY first_name, last_name");
      return res.json({ data: rows, error: null });
    } catch (error) {
      console.error(error);
      return errorMessage(res, 500, 'Failed to load field officers');
    }
  });
  router.get('/:id/documents/:documentId', authenticateRequest, permission('read'), async (req, res) => {
    if (!UUID.test(req.params.id) || !UUID.test(req.params.documentId)) return errorMessage(res, 400, 'Invalid application or document id');
    try {
      const { rows } = await pool.query('SELECT storage_key,file_name,mime_type FROM loan_application_documents WHERE id=$1 AND loan_application_id=$2', [req.params.documentId, req.params.id]);
      if (!rows.length) return errorMessage(res, 404, 'Loan application document not found');
      const document = rows[0];
      if (!document.storage_key) return errorMessage(res, 404, 'Stored document is unavailable');
      const stored = await getLoanApplicationDocument(document.storage_key);
      const safeName = sanitizedFileName(document.file_name);
      res.setHeader('Content-Type', ALLOWED_DOCUMENTS.get(path.extname(safeName).toLowerCase()) === document.mime_type ? document.mime_type : 'application/octet-stream');
      res.setHeader('Content-Length', stored.size);
      res.setHeader('Content-Disposition', `attachment; filename="${safeName.replace(/["\\]/g, '_')}"; filename*=UTF-8''${encodeURIComponent(safeName)}`);
      res.setHeader('X-Content-Type-Options', 'nosniff');
      return stored.stream.pipe(res);
    } catch (error) {
      if (error.code === 'ENOENT') return errorMessage(res, 404, 'Stored document is unavailable');
      console.error('Loan document download failed:', error.message);
      return errorMessage(res, 500, 'Failed to retrieve loan application document');
    }
  });
  
  // Phase 7C: List loan accounts with search, filters and pagination.
  router.get(
    '/accounts',
    authenticateRequest,
    permission('read'),
    async (req, res) => {
      try {
        const allowedLoanStatuses = [
          'pending_disbursement',
          'active',
          'closed',
          'cancelled',
        ];

        const allowedDisbursementStatuses = [
          'not_disbursed',
          'partially_disbursed',
          'fully_disbursed',
        ];

        const params = [];
        const where = [];

        const search = String(req.query.search || '').trim();
        const loanStatus = String(req.query.loanStatus || '').trim();
        const disbursementStatus = String(
          req.query.disbursementStatus || '',
        ).trim();

        if (loanStatus) {
          if (!allowedLoanStatuses.includes(loanStatus)) {
            return errorMessage(res, 400, 'Invalid loan status');
          }

          params.push(loanStatus);
          where.push(`la.loan_status = $${params.length}`);
        }

        if (disbursementStatus) {
          if (
            !allowedDisbursementStatuses.includes(disbursementStatus)
          ) {
            return errorMessage(
              res,
              400,
              'Invalid disbursement status',
            );
          }

          params.push(disbursementStatus);
          where.push(`la.disbursement_status = $${params.length}`);
        }

        if (search) {
          params.push(`%${search}%`);
          const searchParam = `$${params.length}`;

          where.push(`(
            la.loan_account_number ILIKE ${searchParam}
            OR a.application_number ILIKE ${searchParam}
            OR c.client_id ILIKE ${searchParam}
            OR c.first_name ILIKE ${searchParam}
            OR c.last_name ILIKE ${searchParam}
          )`);
        }

        const whereSql = where.length
          ? `WHERE ${where.join(' AND ')}`
          : '';

        const page = Math.max(
          1,
          Math.min(1000000, Number.parseInt(req.query.page, 10) || 1),
        );

        const limit = Math.max(
          1,
          Math.min(100, Number.parseInt(req.query.limit, 10) || 10),
        );

        const offset = (page - 1) * limit;

        const countResult = await pool.query(
          `
            SELECT COUNT(*)::INTEGER AS total
            FROM loan_accounts la
            JOIN loan_applications a
              ON a.id = la.loan_application_id
            JOIN clients c ON c.id = la.client_id
            JOIN branches b ON b.id = la.branch_id
            JOIN centers ce ON ce.id = la.center_id
            JOIN product_groups pg ON pg.id = la.product_group_id
            JOIN products p ON p.id = la.product_id
            ${whereSql}
          `,
          params,
        );

        const total = countResult.rows[0].total;

        const listParams = [...params, limit, offset];

        const { rows } = await pool.query(
          `
            SELECT
              la.id,
              la.loan_account_number,
              la.loan_application_id,
              a.application_number,

              la.client_id,
              c.client_id AS client_code,
              c.first_name AS client_first_name,
              c.last_name AS client_last_name,

              la.branch_id,
              b.branch_code,
              b.branch_name,

              la.center_id,
              ce.center_code,
              ce.center_name,

              la.product_group_id,
              pg.product_group_name,

              la.product_id,
              p.product_name,

              la.sanction_amount,
              la.loan_amount,
              la.sanction_date,
              la.interest_rate,
              la.tenure,
              la.repayment_frequency,
              la.emi_amount,

              la.loan_status,
              la.disbursement_status,

              COALESCE(
                (
                  SELECT SUM(d.disbursement_amount)
                  FROM loan_disbursements d
                  WHERE d.loan_id = la.id
                    AND d.status = 'completed'
                ),
                0
              ) AS total_disbursed,

              GREATEST(
                la.loan_amount - COALESCE(
                  (
                    SELECT SUM(d.disbursement_amount)
                    FROM loan_disbursements d
                    WHERE d.loan_id = la.id
                      AND d.status = 'completed'
                  ),
                  0
                ),
                0
              ) AS remaining_amount,

              la.created_at,
              la.updated_at

            FROM loan_accounts la
            JOIN loan_applications a
              ON a.id = la.loan_application_id
            JOIN clients c ON c.id = la.client_id
            JOIN branches b ON b.id = la.branch_id
            JOIN centers ce ON ce.id = la.center_id
            JOIN product_groups pg ON pg.id = la.product_group_id
            JOIN products p ON p.id = la.product_id

            ${whereSql}

            ORDER BY la.created_at DESC
            LIMIT $${params.length + 1}
            OFFSET $${params.length + 2}
          `,
          listParams,
        );

        return res.json({
          data: rows,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
          error: null,
        });
      } catch (error) {
        console.error('Loan account listing failed:', error);

        return errorMessage(
          res,
          500,
          'Failed to load loan accounts',
        );
      }
    },
  );

  // Phase 7C: Get a loan account and its disbursement history.
  router.get(
    '/accounts/:id',
    authenticateRequest,
    permission('read'),
    async (req, res) => {
      const { id } = req.params;

      if (!UUID.test(id)) {
        return errorMessage(res, 400, 'Invalid loan account id');
      }

      try {
        const accountResult = await pool.query(
          `
            SELECT
              la.*,

              a.application_number,
              a.application_date,
              a.application_status,
              a.sanction_status,

              c.client_id AS client_code,
              c.first_name AS client_first_name,
              c.last_name AS client_last_name,

              b.branch_code,
              b.branch_name,

              ce.center_code,
              ce.center_name,

              pg.product_group_name,
              p.product_name

            FROM loan_accounts la

            JOIN loan_applications a
              ON a.id = la.loan_application_id
            JOIN clients c ON c.id = la.client_id
            JOIN branches b ON b.id = la.branch_id
            JOIN centers ce ON ce.id = la.center_id
            JOIN product_groups pg ON pg.id = la.product_group_id
            JOIN products p ON p.id = la.product_id

            WHERE la.id = $1
          `,
          [id],
        );

        if (!accountResult.rowCount) {
          return errorMessage(res, 404, 'Loan account not found');
        }

        const [disbursementResult, bankAccountResult] = await Promise.all([
          pool.query(
          `
            SELECT
              id,
              loan_id,
              disbursement_date,
              disbursement_amount,
              disbursement_mode,
              bank_account_id,
              reference_number,
              remarks,
              status,
              created_by,
              updated_by,
              created_at,
              updated_at
            FROM loan_disbursements
            WHERE loan_id = $1
            ORDER BY disbursement_date DESC, created_at DESC
          `,
          [id],
          ),
          pool.query(
            `
              SELECT id, account_type, account_number, customer_name
              FROM loan_application_bank_accounts
              WHERE loan_application_id = $1
                AND for_disbursement = TRUE
              ORDER BY created_at
            `,
            [accountResult.rows[0].loan_application_id],
          ),
        ]);

        const disbursements = disbursementResult.rows;

        const account = accountResult.rows[0];

        const totalDisbursed = disbursements
          .filter((item) => item.status === 'completed')
          .reduce(
            (sum, item) => sum + Number(item.disbursement_amount),
            0,
          );

        return res.json({
          data: {
            ...account,
            total_disbursed: totalDisbursed,
            remaining_amount: Math.max(
              0,
              Number(account.loan_amount) - totalDisbursed,
            ),
            disbursements,
            eligible_bank_accounts: bankAccountResult.rows,
          },
          error: null,
        });
      } catch (error) {
        console.error('Loan account details failed:', error);

        return errorMessage(
          res,
          500,
          'Failed to load loan account details',
        );
      }
    },
  );
  
  router.post(
    '/accounts/:id/disbursements',
    authenticateRequest,
    permission('write'),
    async (req, res) => {
      const loanId = req.params.id;
      const {
        disbursementDate,
        disbursementAmount,
        disbursementMode,
        bankAccountId,
        referenceNumber,
        remarks,
      } = req.body || {};

      if (!UUID.test(loanId)) {
        return errorMessage(res, 400, 'Invalid loan account id');
      }

      const allowedModes = [
        'bank_transfer',
        'neft',
        'rtgs',
        'imps',
        'cheque',
        'other',
      ];

      const amount = Number(disbursementAmount);

      if (
        !Number.isFinite(amount) ||
        amount <= 0 ||
        !Number.isFinite(Math.round(amount * 100) / 100) ||
        Math.abs(amount * 100 - Math.round(amount * 100)) > 0.000001
      ) {
        return errorMessage(
          res,
          400,
          'Enter a valid positive disbursement amount with at most two decimal places',
        );
      }

      if (
        typeof disbursementDate !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(disbursementDate) ||
        new Date(`${disbursementDate}T00:00:00.000Z`)
          .toISOString()
          .slice(0, 10) !== disbursementDate
      ) {
        return errorMessage(res, 400, 'Enter a valid disbursement date');
      }

      if (!allowedModes.includes(disbursementMode)) {
        return errorMessage(res, 400, 'Select a valid disbursement mode');
      }

      if (bankAccountId && !UUID.test(bankAccountId)) {
        return errorMessage(res, 400, 'Invalid bank account id');
      }

      if (
        referenceNumber != null &&
        (typeof referenceNumber !== 'string' ||
          referenceNumber.length > 200)
      ) {
        return errorMessage(res, 400, 'Reference number is too long');
      }

      if (
        remarks != null &&
        (typeof remarks !== 'string' || remarks.length > 2000)
      ) {
        return errorMessage(res, 400, 'Remarks are too long');
      }

      const client = await pool.connect();
      let transactionStarted = false;

      try {
        await client.query('BEGIN');
        transactionStarted = true;

      // Serialize disbursement creation for this account.
        const accountResult = await client.query(
          `
            SELECT
              id,
              loan_application_id,
              loan_amount,
              sanction_amount,
              loan_status
            FROM loan_accounts
            WHERE id = $1
            FOR UPDATE
          `,
          [loanId],
        );

        if (!accountResult.rowCount) {
          await client.query('ROLLBACK');
          transactionStarted = false;
          return errorMessage(res, 404, 'Loan account not found');
        }

        const account = accountResult.rows[0];

        if (['closed', 'cancelled'].includes(account.loan_status)) {
          await client.query('ROLLBACK');
          transactionStarted = false;
          return errorMessage(
            res,
            409,
            'Disbursement is not allowed for a closed or cancelled loan',
          );
        }

        if (
          Number(account.loan_amount) <= 0 ||
          Number(account.sanction_amount) <= 0
        ) {
          await client.query('ROLLBACK');
          transactionStarted = false;
          return errorMessage(
            res,
            409,
            'The loan account has invalid sanctioned terms',
          );
        }

        if (bankAccountId) {
          const bankResult = await client.query(
            `
              SELECT id
              FROM loan_application_bank_accounts
              WHERE id = $1
                AND loan_application_id = $2
                AND for_disbursement = TRUE
            `,
            [bankAccountId, account.loan_application_id],
          );

          if (!bankResult.rowCount) {
            await client.query('ROLLBACK');
            transactionStarted = false;
            return errorMessage(
              res,
              400,
              'Select a bank account marked for disbursement on this application',
            );
          }
        }

        // Pending amounts reserve capacity too, preventing over-allocation.
        const totalsResult = await client.query(
          `
            SELECT
              COALESCE(
                SUM(disbursement_amount)
                  FILTER (WHERE status = 'completed'),
                0
              ) AS completed_amount,
              COALESCE(
                SUM(disbursement_amount)
                  FILTER (WHERE status = 'pending'),
                0
              ) AS pending_amount
            FROM loan_disbursements
            WHERE loan_id = $1
          `,
          [loanId],
        );

        const completed = Number(totalsResult.rows[0].completed_amount);
        const pending = Number(totalsResult.rows[0].pending_amount);
        const loanAmount = Number(account.loan_amount);
        const remainingCapacity = Math.round(
          (loanAmount - completed - pending) * 100,
        ) / 100;

        if (amount > remainingCapacity + 0.000001) {
          await client.query('ROLLBACK');
          transactionStarted = false;

          return errorMessage(
            res,
            409,
            `Amount exceeds available disbursement capacity of ${Math.max(0, remainingCapacity).toFixed(2)}`,
          );
        }

        const inserted = await client.query(
          `
            INSERT INTO loan_disbursements (
              loan_id,
              disbursement_date,
              disbursement_amount,
              disbursement_mode,
              bank_account_id,
              reference_number,
              remarks,
              status,
              created_by,
              updated_by
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8, $8)
            RETURNING *
          `,
          [
            loanId,
            disbursementDate,
            amount,
            disbursementMode,
            bankAccountId || null,
            referenceNumber?.trim() || null,
            remarks?.trim() || null,
            req.userId,
          ],
        );

        await client.query('COMMIT');
        transactionStarted = false;

        return res.status(201).json({
          data: inserted.rows[0],
          error: null,
        });
      } catch (error) {
        if (transactionStarted) {
          await client.query('ROLLBACK').catch(() => {});
        }

        console.error('Disbursement creation failed:', error);

        return errorMessage(
          res,
          500,
          'Failed to create disbursement',
        );
      } finally {
        client.release();
      }
    },
  );
  
  router.put(
    '/accounts/:id/disbursements/:disbursementId/status',
    authenticateRequest,
    permission('write'),
    async (req, res) => {
      const { id: loanId, disbursementId } = req.params;
      const { status } = req.body || {};

      if (!UUID.test(loanId) || !UUID.test(disbursementId)) {
        return errorMessage(res, 400, 'Invalid loan or disbursement id');
      }

      const finalStatuses = ['completed', 'failed', 'cancelled'];

      if (!finalStatuses.includes(status)) {
        return errorMessage(
          res,
          400,
          'Status must be completed, failed, or cancelled',
        );
      }

      const client = await pool.connect();
      let transactionStarted = false;

      try {
        await client.query('BEGIN');
        transactionStarted = true;

        // Always lock the loan account first. This matches the creation
        // endpoint and serializes all changes for the same loan.
        const accountResult = await client.query(
          `
            SELECT id, loan_amount, loan_status
            FROM loan_accounts
            WHERE id = $1
            FOR UPDATE
          `,
          [loanId],
        );

        if (!accountResult.rowCount) {
          await client.query('ROLLBACK');
          transactionStarted = false;
          return errorMessage(res, 404, 'Loan account not found');
        }

        const account = accountResult.rows[0];

        const disbursementResult = await client.query(
          `
            SELECT *
            FROM loan_disbursements
            WHERE id = $1 AND loan_id = $2
            FOR UPDATE
          `,
          [disbursementId, loanId],
        );

        if (!disbursementResult.rowCount) {
          await client.query('ROLLBACK');
          transactionStarted = false;
          return errorMessage(res, 404, 'Disbursement not found');
        }

        const disbursement = disbursementResult.rows[0];

        if (disbursement.status !== 'pending') {
          await client.query('ROLLBACK');
          transactionStarted = false;
          return errorMessage(
            res,
            409,
            'Only pending disbursements can be updated',
          );
        }

        if (
          status === 'completed' &&
          ['closed', 'cancelled'].includes(account.loan_status)
        ) {
          await client.query('ROLLBACK');
          transactionStarted = false;
          return errorMessage(
            res,
            409,
            'A disbursement cannot be completed for a closed or cancelled loan',
          );
        }

        if (status === 'completed') {
          // Defensive validation in case data was modified outside this API.
          const totalsResult = await client.query(
            `
              SELECT COALESCE(
                SUM(disbursement_amount)
                  FILTER (WHERE status = 'completed'),
                0
              ) AS completed_amount
              FROM loan_disbursements
              WHERE loan_id = $1
            `,
            [loanId],
          );

          const completed = Number(totalsResult.rows[0].completed_amount);
          const loanAmount = Number(account.loan_amount);

          if (
            completed + Number(disbursement.disbursement_amount) >
            loanAmount + 0.000001
          ) {
            await client.query('ROLLBACK');
            transactionStarted = false;
            return errorMessage(
              res,
              409,
              'Completing this disbursement would exceed the loan amount',
            );
          }
        }

        const updatedResult = await client.query(
          `
            UPDATE loan_disbursements
            SET status = $1,
                updated_by = $2,
                updated_at = NOW()
            WHERE id = $3 AND loan_id = $4
            RETURNING *
          `,
          [status, req.userId, disbursementId, loanId],
        );

        // Recalculate account totals from completed transactions only.
        const totals = await client.query(
          `
            SELECT COALESCE(
              SUM(disbursement_amount)
                FILTER (WHERE status = 'completed'),
              0
            ) AS completed_amount
            FROM loan_disbursements
            WHERE loan_id = $1
          `,
          [loanId],
        );

        const completedAmount = Number(totals.rows[0].completed_amount);
        const loanAmount = Number(account.loan_amount);

        const disbursementStatus =
          completedAmount <= 0
            ? 'not_disbursed'
            : completedAmount >= loanAmount - 0.000001
              ? 'fully_disbursed'
              : 'partially_disbursed';

        await client.query(
          `
            UPDATE loan_accounts
            SET disbursement_status = $1,
                loan_status = CASE
                  WHEN $2 > 0
                    AND loan_status = 'pending_disbursement'
                    THEN 'active'
                  ELSE loan_status
                END,
                updated_by = $3,
                updated_at = NOW()
            WHERE id = $4
          `,
          [disbursementStatus, completedAmount, req.userId, loanId],
        );

        await client.query('COMMIT');
        transactionStarted = false;

        return res.json({
          data: {
            disbursement: updatedResult.rows[0],
            total_disbursed: completedAmount,
            remaining_amount: Math.max(0, loanAmount - completedAmount),
            disbursement_status: disbursementStatus,
          },
          error: null,
        });
      } catch (error) {
        if (transactionStarted) {
          await client.query('ROLLBACK').catch(() => {});
        }

        console.error('Disbursement status update failed:', error);

        return errorMessage(
          res,
          500,
          'Failed to update disbursement status',
        );
      } finally {
        client.release();
      }
    },
  );


  // This small lookup lets the application screen replace account creation with
  // a stable view action without inferring account state from a list search.
  router.get('/:id/loan-account', authenticateRequest, permission('read'), async (req, res) => {
    if (!UUID.test(req.params.id)) return errorMessage(res, 400, 'Invalid application id');
    try {
      const { rows } = await pool.query(
        'SELECT id, loan_account_number FROM loan_accounts WHERE loan_application_id = $1',
        [req.params.id],
      );
      return res.json({ data: rows[0] || null, error: null });
    } catch (error) {
      console.error('Loan account lookup failed:', error);
      return errorMessage(res, 500, 'Failed to load loan account');
    }
  });

  router.get('/:id', authenticateRequest, permission('read'), async (req, res) => {
    try { if (!UUID.test(req.params.id)) return errorMessage(res, 400, 'Invalid application id'); const data = await loadDetail(pool, req.params.id); if (!data) return errorMessage(res, 404, 'Loan application not found'); return res.json({ data, error: null }); } catch (e) { console.error(e); return errorMessage(res, 500, 'Failed to load loan application'); }
  });
  router.get('', authenticateRequest, permission('read'), async (req, res) => {
    try {
      const params = []; const where = [];
      if (req.query.status) { params.push(req.query.status); where.push(`a.application_status=$${params.length}`); }
      if (req.query.search) { params.push(`%${req.query.search}%`); where.push(`(a.application_number ILIKE $${params.length} OR c.client_id ILIKE $${params.length} OR c.aadhaar_number ILIKE $${params.length})`); }
      const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 200); params.push(limit); const limitParam = `$${params.length}`;
      const { rows } = await pool.query(`SELECT a.id,a.application_number,a.application_date,a.application_status,a.document_verification_status,a.sanction_status,a.loan_amount,a.emi_amount,a.interest_rate,a.tenure,a.repayment_frequency,c.client_id,c.first_name,c.last_name,b.branch_code,b.branch_name,ce.center_code,ce.center_name,pg.product_group_name,p.product_name,pu.purpose_name FROM loan_applications a JOIN clients c ON c.id=a.client_id JOIN branches b ON b.id=a.branch_id JOIN centers ce ON ce.id=a.center_id JOIN product_groups pg ON pg.id=a.product_group_id JOIN products p ON p.id=a.product_id LEFT JOIN purposes pu ON pu.id=a.purpose_id ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY a.created_at DESC LIMIT ${limitParam}`, params);
      return res.json({ data: rows, error: null });
    } catch (e) { console.error(e); return errorMessage(res, 500, 'Failed to load loan applications'); }
  });
  
  router.post('', authenticateRequest, permission('write'), async (req, res) => {
    const client = await pool.connect();
    try {
      const body = req.body || {}; await client.query('BEGIN'); const refs = await validateReferences(client, body); const numeric = validatePayload(body);
      const inserted = await client.query(`
        INSERT INTO loan_applications 
        (
          client_id,
          branch_id,
          center_id,
          product_group_id,
          product_id,
          purpose_id,
          sub_purpose_id,
          is_top_up,
          loan_amount,
          emi_amount,
          interest_rate,
          tenure,
          repayment_frequency,
          application_status,
          remarks,
          field_officer_id,
          created_by,updated_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$16,$17) RETURNING id`, [refs.clientId,refs.branchId,refs.centerId,refs.productGroupId,refs.productId,refs.purposeId,refs.subPurposeId,!!value(body,'isTopUp','is_top_up'),numeric.amount,numeric.emi,numeric.rate,numeric.tenure,numeric.frequency, 'draft',value(body,'remarks') || null,refs.officerId,req.userId]);
          await client.query(
            `
              INSERT INTO loan_application_status_history
              (
                loan_application_id,
                from_status,
                to_status,
                reason,
                changed_by
              )
              VALUES ($1, $2, $3, $4, $5)
            `,
            [
              inserted.rows[0].id,
              null,
              'draft',
              'Application created',
              req.userId,
            ]
          );
      await insertChildren(client, inserted.rows[0].id, body, req.userId); const data = await loadDetail(client, inserted.rows[0].id); await client.query('COMMIT'); return res.status(201).json({ data, error: null });
    } catch (e) { await client.query('ROLLBACK'); console.error(e); const status = e.code === '23505' ? 409 : (isValidationError(e) || e.code === '22P02' ? 400 : 500); const message = status === 400 ? e.message : status === 409 ? 'Conflicting loan application data' : 'Failed to create loan application'; return errorMessage(res, status, message); } finally { client.release(); }
  });
  router.put(
    '/:id',
    authenticateRequest,
    permission('write'),
    async (req, res) => {
      const applicationId = req.params.id;
  
      if (!UUID.test(applicationId)) {
        return errorMessage(res, 400, 'Invalid application id');
      }
  
      const client = await pool.connect();
  
      try {
        const body = req.body || {};
  
        await client.query('BEGIN');
  
        // Make sure the application exists
        const existing = await client.query(
          `
          SELECT id, application_status
          FROM loan_applications
          WHERE id = $1
          FOR UPDATE
          `,
          [applicationId]
        );
  
        if (!existing.rowCount) {
          await client.query('ROLLBACK');
          return errorMessage(res, 404, 'Loan application not found');
        }
  
        // Keep editing restricted to draft applications
        if (existing.rows[0].application_status !== 'draft') {
          await client.query('ROLLBACK');
  
          return errorMessage(
            res,
            409,
            'Only draft loan applications can be edited'
          );
        }
  
        // Validate master/reference fields
        const refs = await validateReferences(client, body);
  
        // Validate loan amount, EMI, interest, tenure, frequency
        const numeric = validatePayload(body);
  
        // Update main loan application
        await client.query(
          `
          UPDATE loan_applications
          SET
            application_date = COALESCE(
              $1,
              application_date
            ),
            client_id = $2,
            branch_id = $3,
            center_id = $4,
            product_group_id = $5,
            product_id = $6,
            purpose_id = $7,
            sub_purpose_id = $8,
            is_top_up = $9,
            loan_amount = $10,
            emi_amount = $11,
            interest_rate = $12,
            tenure = $13,
            repayment_frequency = $14,
            remarks = $15,
            field_officer_id = $16,
            updated_by = $17,
            updated_at = now()
          WHERE id = $18
          `,
          [
            value(body, 'applicationDate', 'application_date') || null,
            refs.clientId,
            refs.branchId,
            refs.centerId,
            refs.productGroupId,
            refs.productId,
            refs.purposeId,
            refs.subPurposeId,
            !!value(body, 'isTopUp', 'is_top_up'),
            numeric.amount,
            numeric.emi,
            numeric.rate,
            numeric.tenure,
            numeric.frequency,
            value(body, 'remarks') || null,
            refs.officerId,
            req.userId,
            applicationId,
          ]
        );
  
        // Update existing + insert new child records
        // without touching uploaded documents.
        await updateManagedChildren(
          client,
          applicationId,
          body,
          req.userId
        );
  
        // Reload complete application details
        const data = await loadDetail(
          client,
          applicationId
        );
  
        await client.query('COMMIT');
  
        return res.json({
          data,
          error: null,
        });
      } catch (error) {
        await client.query('ROLLBACK');
  
        console.error(
          'Loan application update failed:',
          error
        );
  
        const status =
          error.code === '23505'
            ? 409
            : (
                isValidationError(error) ||
                error.code === '22P02'
              )
              ? 400
              : 500;
  
        const message =
          status === 400
            ? error.message
            : status === 409
              ? 'Conflicting loan application data'
              : 'Failed to update loan application';
  
        return errorMessage(
          res,
          status,
          message
        );
      } finally {
        client.release();
      }
    }
  );
  router.put(
    '/:id/status',
    authenticateRequest,
    permission('write'),
    async (req, res) => {
      const client = await pool.connect();
  
      try {
        const applicationId = req.params.id;
  
        if (!UUID.test(applicationId)) {
          return errorMessage(res, 400, 'Invalid application id');
        }
  
        const requestedStatus = String(
          req.body?.status || '',
        )
          .trim()
          .toLowerCase();
  
        if (!['submitted', 'under_review', 'approved', 'rejected'].includes(
          requestedStatus,
        )) {
          return errorMessage(res, 400, 'Invalid application status');
        }
  
        await client.query('BEGIN');
  
        // ---------------------------------------------------
        // Lock application and get current sanction information
        // ---------------------------------------------------
        const currentResult = await client.query(
          `
            SELECT
              id,
              application_status,
              loan_amount,
              sanction_amount,
              sanction_status
            FROM loan_applications
            WHERE id = $1
            FOR UPDATE
          `,
          [applicationId],
        );
  
        if (!currentResult.rowCount) {
          await client.query('ROLLBACK');
  
          return errorMessage(
            res,
            404,
            'Loan application not found',
          );
        }
  
        const application = currentResult.rows[0];
        const currentStatus = application.application_status;
  
        // ---------------------------------------------------
        // Existing workflow transitions
        // ---------------------------------------------------
        const transitions = {
          draft: ['submitted'],
          submitted: ['under_review'],
          under_review: ['approved', 'rejected'],
          approved: [],
          rejected: [],
        };
  
        const allowedNextStatuses =
          transitions[currentStatus] || [];
  
        if (!allowedNextStatuses.includes(requestedStatus)) {
          await client.query('ROLLBACK');
  
          return errorMessage(
            res,
            409,
            `Invalid status transition: ${currentStatus} → ${requestedStatus}`,
          );
        }
  
        // ===================================================
        // APPROVAL
        // ===================================================
        if (requestedStatus === 'approved') {
          const sanctionAmountRaw =
            req.body?.sanctionAmount;
  
          const sanctionAmount =
            sanctionAmountRaw === undefined ||
            sanctionAmountRaw === null ||
            sanctionAmountRaw === ''
              ? NaN
              : Number(sanctionAmountRaw);
  
          const sanctionDate =
            typeof req.body?.sanctionDate === 'string'
              ? req.body.sanctionDate.trim()
              : '';
  
          const sanctionRemarks =
            typeof req.body?.sanctionRemarks === 'string'
              ? req.body.sanctionRemarks.trim()
              : '';
  
          // -----------------------------------------------
          // Sanction amount validation
          // -----------------------------------------------
          if (
            !Number.isFinite(sanctionAmount) ||
            sanctionAmount <= 0
          ) {
            await client.query('ROLLBACK');
  
            return errorMessage(
              res,
              400,
              'A valid sanction amount greater than zero is required',
            );
          }
  
          if (
            sanctionAmount >
            Number(application.loan_amount)
          ) {
            await client.query('ROLLBACK');
  
            return errorMessage(
              res,
              400,
              'Sanction amount cannot exceed the requested loan amount',
            );
          }
  
          // -----------------------------------------------
          // Sanction date validation
          // -----------------------------------------------
          if (!sanctionDate) {
            await client.query('ROLLBACK');
  
            return errorMessage(
              res,
              400,
              'Sanction date is required',
            );
          }
  
          if (
            !/^\d{4}-\d{2}-\d{2}$/.test(sanctionDate)
          ) {
            await client.query('ROLLBACK');
  
            return errorMessage(
              res,
              400,
              'Sanction date must be in YYYY-MM-DD format',
            );
          }

          const parsedSanctionDate = new Date(`${sanctionDate}T00:00:00.000Z`);
          if (
            Number.isNaN(parsedSanctionDate.getTime()) ||
            parsedSanctionDate.toISOString().slice(0, 10) !== sanctionDate
          ) {
            await client.query('ROLLBACK');

            return errorMessage(
              res,
              400,
              'Sanction date must be a valid calendar date',
            );
          }
  
          // -----------------------------------------------
          // prerequisite validation
          // -----------------------------------------------
  
          const verificationResult = await client.query(
            `
              SELECT id
              FROM loan_application_field_verifications
              WHERE loan_application_id = $1
              LIMIT 1
            `,
            [applicationId],
          );
  
          if (!verificationResult.rowCount) {
            await client.query('ROLLBACK');
  
            return errorMessage(
              res,
              409,
              'Field verification must be completed before approval',
            );
          }
  
          const assessmentResult = await client.query(
            `
              SELECT id
              FROM loan_application_assessments
              WHERE loan_application_id = $1
              LIMIT 1
            `,
            [applicationId],
          );
  
          if (!assessmentResult.rowCount) {
            await client.query('ROLLBACK');
  
            return errorMessage(
              res,
              409,
              'Applicant assessment must be completed before approval',
            );
          }
  
          // -----------------------------------------------
          // Approve application
          // -----------------------------------------------
          await client.query(
            `
              UPDATE loan_applications
              SET
                application_status = 'approved',
                sanction_status = 'approved',
                sanction_amount = $1,
                sanction_date = $2,
                sanction_authority = $3,
                sanction_remarks = $4,
  
                rejection_reason = NULL,
                rejection_remarks = NULL,
                rejected_by = NULL,
                rejection_date = NULL,
  
                updated_by = $3,
                updated_at = now()
              WHERE id = $5
            `,
            [
              sanctionAmount,
              sanctionDate,
              req.userId,
              sanctionRemarks || null,
              applicationId,
            ],
          );
  
          // -----------------------------------------------
          // Status history
          // -----------------------------------------------
          await client.query(
            `
              INSERT INTO loan_application_status_history
              (
                loan_application_id,
                from_status,
                to_status,
                reason,
                changed_by
              )
              VALUES ($1, $2, $3, $4, $5)
            `,
            [
              applicationId,
              currentStatus,
              'approved',
              sanctionRemarks || null,
              req.userId,
            ],
          );
        }
  
        // ===================================================
        // REJECTION
        // ===================================================
        else if (requestedStatus === 'rejected') {
          const rejectionReason =
            typeof req.body?.rejectionReason === 'string'
              ? req.body.rejectionReason.trim()
              : '';
  
          const rejectionRemarks =
            typeof req.body?.rejectionRemarks === 'string'
              ? req.body.rejectionRemarks.trim()
              : '';
  
          if (!rejectionReason) {
            await client.query('ROLLBACK');
  
            return errorMessage(
              res,
              400,
              'Rejection reason is required',
            );
          }
  
          await client.query(
            `
              UPDATE loan_applications
              SET
                application_status = 'rejected',
                sanction_status = 'rejected',
  
                rejection_reason = $1,
                rejection_remarks = $2,
                rejected_by = $3,
                rejection_date = now(),
  
                sanction_amount = NULL,
                sanction_date = NULL,
                sanction_authority = NULL,
                sanction_remarks = NULL,
  
                updated_by = $3,
                updated_at = now()
              WHERE id = $4
            `,
            [
              rejectionReason,
              rejectionRemarks || null,
              req.userId,
              applicationId,
            ],
          );
  
          await client.query(
            `
              INSERT INTO loan_application_status_history
              (
                loan_application_id,
                from_status,
                to_status,
                reason,
                changed_by
              )
              VALUES ($1, $2, $3, $4, $5)
            `,
            [
              applicationId,
              currentStatus,
              'rejected',
              rejectionReason,
              req.userId,
            ],
          );
        }
  
        // ===================================================
        // SUBMITTED / UNDER REVIEW
        // ===================================================
        else {
          await client.query(
            `
              UPDATE loan_applications
              SET
                application_status = $1,
                updated_by = $2,
                updated_at = now()
              WHERE id = $3
            `,
            [
              requestedStatus,
              req.userId,
              applicationId,
            ],
          );
  
          await client.query(
            `
              INSERT INTO loan_application_status_history
              (
                loan_application_id,
                from_status,
                to_status,
                reason,
                changed_by
              )
              VALUES ($1, $2, $3, $4, $5)
            `,
            [
              applicationId,
              currentStatus,
              requestedStatus,
              null,
              req.userId,
            ],
          );
        }
  
        const data = await loadDetail(
          client,
          applicationId,
        );
  
        await client.query('COMMIT');
  
        return res.json({
          data,
          error: null,
        });
      } catch (error) {
        await client.query('ROLLBACK');
  
        console.error(
          'Loan application status update failed:',
          error,
        );
  
        return errorMessage(
          res,
          500,
          'Failed to update application status',
        );
      } finally {
        client.release();
      }
    },
  );
  
  // Financial terms may be confirmed after approval, but only before a loan
  // account exists. The application lock is shared with account creation.
  router.put(
    '/:id/loan-terms',
    authenticateRequest,
    permission('write'),
    async (req, res) => {
      const applicationId = req.params.id;
      if (!UUID.test(applicationId)) return errorMessage(res, 400, 'Invalid application id');

      const { interestRate, tenure, repaymentFrequency, emiAmount } = req.body || {};
      const parsedRate = Number(interestRate);
      const parsedTenure = Number(tenure);
      const parsedEmi = Number(emiAmount);
      const frequency = String(repaymentFrequency || '').trim().toLowerCase();

      if (interestRate === '' || interestRate == null || !Number.isFinite(parsedRate) || parsedRate < 0 || Math.abs(parsedRate * 10000 - Math.round(parsedRate * 10000)) > 0.000001) {
        return errorMessage(res, 400, 'Interest rate must be a non-negative number with at most four decimal places');
      }
      if (tenure === '' || tenure == null || !Number.isInteger(parsedTenure) || parsedTenure <= 0) {
        return errorMessage(res, 400, 'Tenure must be a positive integer');
      }
      if (emiAmount === '' || emiAmount == null || !Number.isFinite(parsedEmi) || parsedEmi <= 0 || Math.abs(parsedEmi * 100 - Math.round(parsedEmi * 100)) > 0.000001) {
        return errorMessage(res, 400, 'EMI amount must be a positive number with at most two decimal places');
      }
      if (!FREQUENCIES.has(frequency)) return errorMessage(res, 400, 'A supported repayment frequency is required');

      const client = await pool.connect();
      let transactionStarted = false;
      try {
        await client.query('BEGIN');
        transactionStarted = true;
        const applicationResult = await client.query(
          `SELECT id, application_status, sanction_status
           FROM loan_applications WHERE id = $1 FOR UPDATE`,
          [applicationId],
        );
        if (!applicationResult.rowCount) {
          await client.query('ROLLBACK'); transactionStarted = false;
          return errorMessage(res, 404, 'Loan application not found');
        }
        const application = applicationResult.rows[0];
        if (application.application_status !== 'approved' || application.sanction_status !== 'approved') {
          await client.query('ROLLBACK'); transactionStarted = false;
          return errorMessage(res, 409, 'Financial terms can only be confirmed for an approved and sanctioned application');
        }
        const existingLoan = await client.query(
          'SELECT id FROM loan_accounts WHERE loan_application_id = $1',
          [applicationId],
        );
        if (existingLoan.rowCount) {
          await client.query('ROLLBACK'); transactionStarted = false;
          return errorMessage(res, 409, 'Financial terms cannot be changed after a loan account exists');
        }
        await client.query(
          `UPDATE loan_applications
           SET interest_rate = $1, tenure = $2, repayment_frequency = $3,
               emi_amount = $4, updated_by = $5, updated_at = NOW()
           WHERE id = $6`,
          [parsedRate, parsedTenure, frequency, parsedEmi, req.userId, applicationId],
        );
        const data = await loadDetail(client, applicationId);
        await client.query('COMMIT'); transactionStarted = false;
        return res.json({ data, error: null });
      } catch (error) {
        if (transactionStarted) await client.query('ROLLBACK').catch(() => {});
        console.error('Loan financial terms update failed:', error);
        return errorMessage(res, 500, 'Failed to update loan financial terms');
      } finally {
        client.release();
      }
    },
  );

  // Phase 7B: Create a loan account from an approved application.
  router.post(
    '/:id/create-loan',
    authenticateRequest,
    permission('write'),
    async (req, res) => {
      const applicationId = req.params.id;

      if (!UUID.test(applicationId)) {
        return errorMessage(res, 400, 'Invalid application id');
      }

      const client = await pool.connect();

      try {
        await client.query('BEGIN');

        // Lock the application so concurrent requests cannot
        // create duplicate loan accounts.
        const applicationResult = await client.query(
          `
            SELECT
              id,
              application_number,
              application_status,
              sanction_status,
              sanction_amount,
              sanction_date,
              sanction_remarks,
              client_id,
              branch_id,
              center_id,
              product_group_id,
              product_id,
              interest_rate,
              tenure,
              repayment_frequency,
              emi_amount
            FROM loan_applications
            WHERE id = $1
            FOR UPDATE
          `,
          [applicationId],
        );

        if (!applicationResult.rowCount) {
          await client.query('ROLLBACK');
          return errorMessage(
            res,
            404,
            'Loan application not found',
          );
        }

        const application = applicationResult.rows[0];

        // Only approved applications can become loan accounts.
        if (
          application.application_status !== 'approved' ||
          application.sanction_status !== 'approved'
        ) {
          await client.query('ROLLBACK');
          return errorMessage(
            res,
            409,
            'Only approved and sanctioned applications can create a loan account',
          );
        }

        // Verify the required sanctioned financial terms.
        const sanctionAmount = Number(application.sanction_amount);
        const interestRate = Number(application.interest_rate);
        const tenure = Number(application.tenure);
        const emiAmount = Number(application.emi_amount);

        if (
          !Number.isFinite(sanctionAmount) ||
          sanctionAmount <= 0 ||
          !application.sanction_date ||
          application.interest_rate === null ||
          !Number.isFinite(interestRate) ||
          interestRate < 0 ||
          !Number.isInteger(tenure) ||
          tenure <= 0 ||
          !Number.isFinite(emiAmount) ||
          emiAmount <= 0 ||
          !application.repayment_frequency
        ) {
          await client.query('ROLLBACK');
          return errorMessage(
            res,
            409,
            'The approved application is missing valid financial terms required to create a loan account',
          );
        }

        // Additional duplicate check for a clearer response.
        const existingLoan = await client.query(
          `
            SELECT id, loan_account_number
            FROM loan_accounts
            WHERE loan_application_id = $1
          `,
          [applicationId],
        );

        if (existingLoan.rowCount) {
          await client.query('ROLLBACK');
          return errorMessage(
            res,
            409,
            `A loan account already exists for this application: ${existingLoan.rows[0].loan_account_number}`,
          );
        }

        // Copy approved terms into a separate loan account.
        // The requested application amount is NOT used as
        // the actual loan amount; the sanctioned amount is.
        const loanResult = await client.query(
          `
            INSERT INTO loan_accounts (
              loan_application_id,
              client_id,
              branch_id,
              center_id,
              product_group_id,
              product_id,
              sanction_amount,
              loan_amount,
              sanction_date,
              interest_rate,
              tenure,
              repayment_frequency,
              emi_amount,
              loan_status,
              disbursement_status,
              remarks,
              created_by,
              updated_by
            )
            VALUES (
              $1, $2, $3, $4, $5, $6,
              $7, $7, $8, $9, $10, $11, $12,
              'pending_disbursement',
              'not_disbursed',
              $13, $14, $14
            )
            RETURNING *
          `,
          [
            application.id,
            application.client_id,
            application.branch_id,
            application.center_id,
            application.product_group_id,
            application.product_id,
            sanctionAmount,
            application.sanction_date,
            interestRate,
            tenure,
            application.repayment_frequency,
            emiAmount,
            application.sanction_remarks || null,
            req.userId,
          ],
        );

        await client.query('COMMIT');

        return res.status(201).json({
          data: loanResult.rows[0],
          error: null,
        });
      } catch (error) {
        await client.query('ROLLBACK');

        console.error('Loan account creation failed:', error);

        if (error.code === '23505') {
          return errorMessage(
            res,
            409,
            'A loan account already exists for this application or the loan account number conflicts',
          );
        }

        if (error.code === '23503') {
          return errorMessage(
            res,
            400,
            'A referenced record does not exist',
          );
        }

        return errorMessage(
          res,
          500,
          'Failed to create loan account',
        );
      } finally {
        client.release();
      }
    },
  );
  router.put(
    '/:id/documents/:documentId/verification',
    authenticateRequest,
    permission('write'),
    async (req, res) => {
      const applicationId = req.params.id;
      const documentId = req.params.documentId;
  
      if (!UUID.test(applicationId) || !UUID.test(documentId)) {
        return errorMessage(
          res,
          400,
          'Invalid application or document id'
        );
      }
  
      const status = String(req.body?.status || '')
        .trim()
        .toLowerCase();
  
      const reason =
        typeof req.body?.reason === 'string'
          ? req.body.reason.trim()
          : '';
  
      if (!['verified', 'rejected'].includes(status)) {
        return errorMessage(
          res,
          400,
          'Document verification status must be verified or rejected'
        );
      }
  
      if (status === 'rejected' && !reason) {
        return errorMessage(
          res,
          400,
          'Rejection reason is required'
        );
      }
  
      const client = await pool.connect();
  
      try {
        await client.query('BEGIN');
  
        const documentResult = await client.query(
          `
            SELECT
              d.id,
              d.loan_application_id,
              d.verification_status
            FROM loan_application_documents d
            WHERE d.id = $1
              AND d.loan_application_id = $2
            FOR UPDATE
          `,
          [documentId, applicationId]
        );
  
        if (!documentResult.rowCount) {
          await client.query('ROLLBACK');
  
          return errorMessage(
            res,
            404,
            'Loan application document not found'
          );
        }
  
        await client.query(
          `
            UPDATE loan_application_documents
            SET
              verification_status = $1,
              verified_by = $2,
              verified_at = now(),
              rejection_reason = CASE
                WHEN $1 = 'rejected' THEN $3
                ELSE NULL
              END
            WHERE id = $4
              AND loan_application_id = $5
          `,
          [
            status,
            req.userId,
            status === 'rejected' ? reason : null,
            documentId,
            applicationId,
          ]
        );
  
        /*
         * Recalculate application-level document verification status.
         *
         * For now:
         * - pending = no documents verified/rejected yet
         * - in_progress = some documents exist but not all are verified
         * - verified = all uploaded documents are verified
         *
         * Mandatory-document rules can be added separately once
         * the business defines which document types are mandatory.
         */
        const documentSummary = await client.query(
          `
            SELECT
              COUNT(*)::int AS total,
              COUNT(*) FILTER (
                WHERE verification_status = 'verified'
              )::int AS verified,
              COUNT(*) FILTER (
                WHERE verification_status = 'rejected'
              )::int AS rejected
            FROM loan_application_documents
            WHERE loan_application_id = $1
          `,
          [applicationId]
        );
  
        const summary = documentSummary.rows[0];
  
        let applicationDocumentStatus = 'pending';
  
        if (Number(summary.total) > 0) {
          if (
            Number(summary.verified) === Number(summary.total)
          ) {
            applicationDocumentStatus = 'verified';
          } else {
            applicationDocumentStatus = 'in_progress';
          }
        }
  
        await client.query(
          `
            UPDATE loan_applications
            SET
              document_verification_status = $1,
              updated_by = $2,
              updated_at = now()
            WHERE id = $3
          `,
          [
            applicationDocumentStatus,
            req.userId,
            applicationId,
          ]
        );
  
        const data = await loadDetail(
          client,
          applicationId
        );
  
        await client.query('COMMIT');
  
        return res.json({
          data,
          error: null,
        });
      } catch (error) {
        await client.query('ROLLBACK');
  
        console.error(
          'Loan document verification failed:',
          error
        );
  
        return errorMessage(
          res,
          500,
          'Failed to update document verification status'
        );
      } finally {
        client.release();
      }
    }
  );
  router.get(
    '/:id/field-verifications',
    authenticateRequest,
    permission('read'),
    async (req, res) => {
      const applicationId = req.params.id;
  
      if (!UUID.test(applicationId)) {
        return errorMessage(res, 400, 'Invalid application id');
      }
  
      try {
        const { rows } = await pool.query(
          `
            SELECT
              fv.id,
              fv.loan_application_id,
              fv.field_officer_id,
              u.first_name AS officer_first_name,
              u.last_name AS officer_last_name,
              u.employee_id AS officer_employee_id,
              fv.visit_date,
              fv.visit_location,
              fv.applicant_met,
              fv.business_verified,
              fv.residence_verified,
              fv.findings,
              fv.remarks,
              fv.verification_result,
              fv.created_by,
              fv.updated_by,
              fv.created_at,
              fv.updated_at
            FROM loan_application_field_verifications fv
            JOIN user_profiles u
              ON u.id = fv.field_officer_id
            WHERE fv.loan_application_id = $1
            ORDER BY fv.visit_date DESC, fv.created_at DESC
          `,
          [applicationId],
        );
  
        return res.json({
          data: rows,
          error: null,
        });
      } catch (error) {
        console.error('Failed to load field verifications:', error);
        return errorMessage(
          res,
          500,
          'Failed to load field verifications',
        );
      }
    },
  );
  
  
  router.post(
    '/:id/field-verifications',
    authenticateRequest,
    permission('write'),
    async (req, res) => {
      const applicationId = req.params.id;
  
      if (!UUID.test(applicationId)) {
        return errorMessage(res, 400, 'Invalid application id');
      }
  
      const body = req.body || {};
  
      const fieldOfficerId = value(
        body,
        'fieldOfficerId',
        'field_officer_id',
      );
  
      const visitDate = value(
        body,
        'visitDate',
        'visit_date',
      );
  
      const visitLocation = value(
        body,
        'visitLocation',
        'visit_location',
      );
  
      const applicantMet = value(
        body,
        'applicantMet',
        'applicant_met',
      );
  
      const businessVerified = value(
        body,
        'businessVerified',
        'business_verified',
      );
  
      const residenceVerified = value(
        body,
        'residenceVerified',
        'residence_verified',
      );
  
      const findings = value(body, 'findings');
  
      const remarks = value(body, 'remarks');
  
      const verificationResult = String(
        value(body, 'verificationResult', 'verification_result') || '',
      )
        .trim()
        .toLowerCase();
  
      if (!fieldOfficerId || !UUID.test(String(fieldOfficerId))) {
        return errorMessage(
          res,
          400,
          'A valid field officer is required',
        );
      }
  
      if (!visitDate) {
        return errorMessage(
          res,
          400,
          'Visit date is required',
        );
      }
  
      if (
        !['positive', 'negative', 'inconclusive'].includes(
          verificationResult,
        )
      ) {
        return errorMessage(
          res,
          400,
          'Verification result must be positive, negative, or inconclusive',
        );
      }
  
      try {
        const application = await pool.query(
          `
            SELECT id, application_status
            FROM loan_applications
            WHERE id = $1
          `,
          [applicationId],
        );
  
        if (!application.rowCount) {
          return errorMessage(
            res,
            404,
            'Loan application not found',
          );
        }
  
        if (application.rows[0].application_status !== 'under_review') {
          return errorMessage(
            res,
            409,
            'Field verification can only be recorded while the application is under review',
          );
        }
  
        const officer = await pool.query(
          `
            SELECT id
            FROM user_profiles
            WHERE id = $1
              AND lower(role) = 'field_officer'
              AND status = 'active'
          `,
          [fieldOfficerId],
        );
  
        if (!officer.rowCount) {
          return errorMessage(
            res,
            400,
            'Field officer does not exist or is inactive',
          );
        }
  
        const { rows } = await pool.query(
          `
            INSERT INTO loan_application_field_verifications
            (
              loan_application_id,
              field_officer_id,
              visit_date,
              visit_location,
              applicant_met,
              business_verified,
              residence_verified,
              findings,
              remarks,
              verification_result,
              created_by,
              updated_by
            )
            VALUES
            (
              $1,
              $2,
              $3,
              $4,
              $5,
              $6,
              $7,
              $8,
              $9,
              $10,
              $11,
              $11
            )
            RETURNING *
          `,
          [
            applicationId,
            fieldOfficerId,
            visitDate,
            visitLocation || null,
            Boolean(applicantMet),
            Boolean(businessVerified),
            Boolean(residenceVerified),
            findings || null,
            remarks || null,
            verificationResult,
            req.userId,
          ],
        );
  
        return res.status(201).json({
          data: rows[0],
          error: null,
        });
      } catch (error) {
        console.error(
          'Field verification creation failed:',
          error,
        );
  
        return errorMessage(
          res,
          500,
          'Failed to save field verification',
        );
      }
    },
  );
  router.get(
    '/:id/assessments',
    authenticateRequest,
    permission('read'),
    async (req, res) => {
      const applicationId = req.params.id;
  
      if (!UUID.test(applicationId)) {
        return errorMessage(res, 400, 'Invalid application id');
      }
  
      try {
        const { rows } = await pool.query(
          `
            SELECT
              a.id,
              a.loan_application_id,
              a.monthly_income,
              a.monthly_expenses,
              a.existing_obligations,
              a.household_income,
              a.household_expenses,
              a.net_monthly_income,
              a.repayment_capacity,
              a.recommended_loan_amount,
              a.recommended_emi,
              a.assessment_result,
              a.assessment_remarks,
              a.assessed_by,
              u.first_name AS assessor_first_name,
              u.last_name AS assessor_last_name,
              a.assessed_at,
              a.created_at,
              a.updated_at
            FROM loan_application_assessments a
            JOIN user_profiles u
              ON u.id = a.assessed_by
            WHERE a.loan_application_id = $1
            ORDER BY a.assessed_at DESC, a.created_at DESC
          `,
          [applicationId],
        );
  
        return res.json({
          data: rows,
          error: null,
        });
      } catch (error) {
        console.error('Failed to load assessments:', error);
  
        return errorMessage(
          res,
          500,
          'Failed to load applicant assessments',
        );
      }
    },
  );
  
  
  router.post(
    '/:id/assessments',
    authenticateRequest,
    permission('write'),
    async (req, res) => {
      const applicationId = req.params.id;
  
      if (!UUID.test(applicationId)) {
        return errorMessage(res, 400, 'Invalid application id');
      }
  
      const body = req.body || {};
  
      const monthlyIncome = value(
        body,
        'monthlyIncome',
        'monthly_income',
      );
  
      const monthlyExpenses = value(
        body,
        'monthlyExpenses',
        'monthly_expenses',
      );
  
      const existingObligations = value(
        body,
        'existingObligations',
        'existing_obligations',
      );
  
      const householdIncome = value(
        body,
        'householdIncome',
        'household_income',
      );
  
      const householdExpenses = value(
        body,
        'householdExpenses',
        'household_expenses',
      );
  
      const recommendedLoanAmount = value(
        body,
        'recommendedLoanAmount',
        'recommended_loan_amount',
      );
  
      const recommendedEmi = value(
        body,
        'recommendedEmi',
        'recommended_emi',
      );
  
      const assessmentResult = String(
        value(body, 'assessmentResult', 'assessment_result') || '',
      )
        .trim()
        .toLowerCase();
  
      const assessmentRemarks = value(
        body,
        'assessmentRemarks',
        'assessment_remarks',
      );
  
      const numericFields = {
        monthlyIncome,
        monthlyExpenses,
        existingObligations,
        householdIncome,
        householdExpenses,
        recommendedLoanAmount,
        recommendedEmi,
      };
  
      for (const [name, rawValue] of Object.entries(numericFields)) {
        if (
          rawValue !== undefined &&
          rawValue !== null &&
          rawValue !== '' &&
          (!Number.isFinite(Number(rawValue)) ||
            Number(rawValue) < 0)
        ) {
          return errorMessage(
            res,
            400,
            `${name} must be a non-negative number`,
          );
        }
      }
  
      if (
        !['positive', 'negative', 'inconclusive'].includes(
          assessmentResult,
        )
      ) {
        return errorMessage(
          res,
          400,
          'Assessment result must be positive, negative, or inconclusive',
        );
      }
  
      try {
        const application = await pool.query(
          `
            SELECT
              id,
              application_status
            FROM loan_applications
            WHERE id = $1
          `,
          [applicationId],
        );
  
        if (!application.rowCount) {
          return errorMessage(
            res,
            404,
            'Loan application not found',
          );
        }
  
        if (application.rows[0].application_status !== 'under_review') {
          return errorMessage(
            res,
            409,
            'Applicant assessment can only be recorded while the application is under review',
          );
        }
  
        const income =
          monthlyIncome === undefined ||
          monthlyIncome === null ||
          monthlyIncome === ''
            ? null
            : Number(monthlyIncome);
  
        const expenses =
          monthlyExpenses === undefined ||
          monthlyExpenses === null ||
          monthlyExpenses === ''
            ? null
            : Number(monthlyExpenses);
  
        const obligations =
          existingObligations === undefined ||
          existingObligations === null ||
          existingObligations === ''
            ? null
            : Number(existingObligations);
  
        const householdIncomeValue =
          householdIncome === undefined ||
          householdIncome === null ||
          householdIncome === ''
            ? null
            : Number(householdIncome);
  
        const householdExpensesValue =
          householdExpenses === undefined ||
          householdExpenses === null ||
          householdExpenses === ''
            ? null
            : Number(householdExpenses);
  
        /*
         * Net monthly income is calculated by the backend.
         *
         * When household income/expenses are provided,
         * household figures are used.
         *
         * Otherwise applicant income/expenses are used.
         */
        const incomeForCalculation =
          householdIncomeValue ?? income;
  
        const expensesForCalculation =
          householdExpensesValue ?? expenses;
  
        const netMonthlyIncome =
          incomeForCalculation !== null
            ? Math.max(
                0,
                incomeForCalculation -
                  (expensesForCalculation || 0) -
                  (obligations || 0),
              )
            : null;
  
        /*
         * Repayment capacity is intentionally kept equal to
         * the calculated disposable income for Phase 5.
         *
         * A business-specific repayment-capacity rule can be
         * introduced later without changing the database design.
         */
        const repaymentCapacity = netMonthlyIncome;
  
        const { rows } = await pool.query(
          `
            INSERT INTO loan_application_assessments
            (
              loan_application_id,
              monthly_income,
              monthly_expenses,
              existing_obligations,
              household_income,
              household_expenses,
              net_monthly_income,
              repayment_capacity,
              recommended_loan_amount,
              recommended_emi,
              assessment_result,
              assessment_remarks,
              assessed_by
            )
            VALUES
            (
              $1,
              $2,
              $3,
              $4,
              $5,
              $6,
              $7,
              $8,
              $9,
              $10,
              $11,
              $12,
              $13
            )
            RETURNING *
          `,
          [
            applicationId,
            income,
            expenses,
            obligations,
            householdIncomeValue,
            householdExpensesValue,
            netMonthlyIncome,
            repaymentCapacity,
            recommendedLoanAmount === undefined ||
            recommendedLoanAmount === null ||
            recommendedLoanAmount === ''
              ? null
              : Number(recommendedLoanAmount),
            recommendedEmi === undefined ||
            recommendedEmi === null ||
            recommendedEmi === ''
              ? null
              : Number(recommendedEmi),
            assessmentResult,
            assessmentRemarks || null,
            req.userId,
          ],
        );
  
        return res.status(201).json({
          data: rows[0],
          error: null,
        });
      } catch (error) {
        console.error(
          'Applicant assessment creation failed:',
          error,
        );
  
        return errorMessage(
          res,
          500,
          'Failed to save applicant assessment',
        );
      }
    },
  );
  router.delete('/:id', authenticateRequest, permission('delete'), async (req, res) => {
    try { const result = await pool.query("DELETE FROM loan_applications WHERE id=$1 AND application_status='draft'", [req.params.id]); if (!result.rowCount) return errorMessage(res, 409, 'Only draft applications can be deleted'); return res.json({ data: null, error: null }); } catch (e) { console.error(e); return errorMessage(res, 500, 'Failed to delete loan application'); }
  });
  return router;
}
