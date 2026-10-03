import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { pool } from './db.js';
import { requireAdministrator, requireSelfOrAdministrator } from './middleware/authorization.js';
import { verifyAccessToken } from './auth/auth.js';
import { createAuthRoutes } from './routes/authRoutes.js';
import { createUsersRoutes } from './routes/usersRoutes.js';
import { createRolesRoutes } from './routes/rolesRoutes.js';
import { createCentersRoutes } from './routes/centersRoutes.js';
import { createCenterHelpers } from './utils/centerHelpers.js';
import { createAreaHelpers } from './utils/areaHelpers.js';
import { createAreasRoutes } from './routes/areasRoutes.js';
import { createPincodesRoutes } from './routes/pincodesRoutes.js';
import { createVillagesRoutes } from './routes/villagesRoutes.js';
import { createProductGroupsRoutes } from './routes/productGroupsRoutes.js';
import { createProductsRoutes } from './routes/productsRoutes.js';
import { createDistrictsRoutes } from './routes/districtsRoutes.js';
import { createInsuranceRoutes } from './routes/insuranceRoutes.js';
import { createIfscRoutes } from './routes/ifscRoutes.js';
import { createPurposesRoutes } from './routes/purposesRoutes.js';
import { createClientsRoutes } from './routes/clientsRoutes.js';
import { createBranchesRoutes } from './routes/branchesRoutes.js';

const PORT = Number(process.env.PORT) || 3001;
const JWT_SECRET = process.env.JWT_SECRET;

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}
if (!JWT_SECRET) {
  console.error('JWT_SECRET is required');
  process.exit(1);
}

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));

function authMiddleware(req, res, next) {
  const h = req.headers.authorization;
  if (!h?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const payload = verifyAccessToken(h.slice(7), JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/* authorization middleware lives in server/middleware/authorization.js */
/*
async function getAuthorizationContext(userId) {
  const { rows } = await pool.query(
    `SELECT up.id, lower(up.role) AS role,
            COALESCE(json_agg(json_build_object('module', p.module, 'permission', p.permission))
              FILTER (WHERE p.id IS NOT NULL), '[]') AS permissions
     FROM user_profiles up
     LEFT JOIN user_permissions p ON p.user_id = up.id
     WHERE up.id = $1 AND up.status = 'active'
     GROUP BY up.id, up.role`,
    [userId]
  );
  return rows[0] || null;
}

function requireAdministrator(req, res, next) {
  getAuthorizationContext(req.userId)
    .then((context) => {
      if (!context) return res.status(403).json({ error: 'Forbidden' });
      if (context.role !== 'admin' && context.role !== 'administrator') {
        return res.status(403).json({ error: 'Administrator access required' });
      }
      req.authz = context;
      return next();
    })
    .catch((error) => {
      console.error('Authorization lookup failed:', error);
      return res.status(500).json({ error: 'Authorization check failed' });
    });
}

function requireSelfOrAdministrator(req, res, next) {
  getAuthorizationContext(req.userId)
    .then((context) => {
      if (!context) return res.status(403).json({ error: 'Forbidden' });
      const isAdmin = context.role === 'admin' || context.role === 'administrator';
      if (!isAdmin && String(req.params.id) !== String(req.userId)) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      req.authz = context;
      return next();
    })
    .catch((error) => {
      console.error('Authorization lookup failed:', error);
      return res.status(500).json({ error: 'Authorization check failed' });
    });
}
*/

// --- Auth ---
app.use('/api/auth', createAuthRoutes({
  pool,
  jwtSecret: JWT_SECRET,
  authenticateRequest: authMiddleware,
}));

// --- Public branches (registration form) ---
app.use('/api/branches', createBranchesRoutes({ pool }));
app.use('/api/clients', createClientsRoutes({ pool, authenticateRequest: authMiddleware }));

// --- Users / profiles ---
app.use('/api/users', createUsersRoutes({
  pool,
  authenticateRequest: authMiddleware,
  requireAdministrator,
  requireSelfOrAdministrator,
}));

app.use('/api/roles', createRolesRoutes({
  pool,
  authenticateRequest: authMiddleware,
  requireAdministrator,
}));

const centerHelpers = createCenterHelpers({ pool });
app.use('/api/centers', createCentersRoutes({
  pool,
  authenticateRequest: authMiddleware,
  ...centerHelpers,
}));

// --- Areas ---
const areaHelpers = createAreaHelpers({ pool });
app.use('/api/areas', createAreasRoutes({
  pool,
  authenticateRequest: authMiddleware,
  ...areaHelpers,
}));

app.use('/api/pincodes', createPincodesRoutes({ pool, authenticateRequest: authMiddleware }));
app.use('/api/villages', createVillagesRoutes({ pool, authenticateRequest: authMiddleware }));

// --- Master catalog modules ---
function actorName(row, prefix) {
  const first = row[`${prefix}_first_name`];
  const last = row[`${prefix}_last_name`];
  return [first, last].filter(Boolean).join(' ') || null;
}

function auditFields(row) {
  return {
    insertedOn: row.created_at,
    insertedBy: actorName(row, 'created') || row.created_by || 'System',
    updatedOn: row.updated_at,
    updatedBy: actorName(row, 'updated') || row.updated_by || null,
  };
}

function jsonData(row) {
  if (!row.data) return {};
  return typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
}

function masterDuplicateResponse(res, fallback) {
  return res.status(409).json({
    data: null,
    error: { message: fallback },
    message: fallback,
  });
}

function masterError(res, e, fallback = 'Request failed') {
  console.error(e);
  if (e.code === '23505') {
    return masterDuplicateResponse(res, 'A record with this code already exists.');
  }
  return res.status(500).json({
    data: null,
    error: { message: e.message || fallback },
    message: e.message || fallback,
  });
}

function unsupportedCsvUpload(_req, res) {
  return res.status(501).json({
    success: false,
    created: 0,
    updated: 0,
    errors: 1,
    message: 'CSV upload is not configured on the server yet. Please create records from the form.',
  });
}

function mapProductGroupRow(row) {
  return {
    ...jsonData(row),
    id: row.id,
    productGroupCode: row.product_group_code,
    productGroupName: row.product_group_name,
    productGroupSegment: row.product_group_segment,
    productGroupType: row.product_group_type,
    status: row.status,
    ...auditFields(row),
  };
}

function mapProductRow(row) {
  return {
    ...jsonData(row),
    id: row.id,
    productId: row.product_id,
    productCode: row.product_code,
    productName: row.product_name,
    productGroupId: row.product_group_id,
    status: row.status,
    ...auditFields(row),
  };
}

function mapDistrictRow(row) {
  return {
    id: row.id,
    districtCode: row.district_code,
    districtName: row.district_name,
    countryId: row.country_id,
    stateId: row.state_id,
    stateName: row.state_name,
    ...auditFields(row),
  };
}

function mapInsuranceRow(row) {
  return {
    ...jsonData(row),
    id: row.id,
    insuranceId: row.insurance_id,
    insuranceCode: row.insurance_code,
    insuranceType: row.insurance_type,
    insuranceName: row.insurance_name,
    status: row.status,
    ...auditFields(row),
  };
}

function mapIfscRow(row) {
  return {
    id: row.id,
    ifscCode: row.ifsc_code,
    bankName: row.bank_name,
    bankBranch: row.bank_branch,
    branchAddress: row.branch_address,
    bankAddress: row.branch_address,
    city: row.city,
    state: row.state,
    mobileNumber: row.mobile_number,
    ...auditFields(row),
  };
}

function mapPurposeRow(row) {
  return {
    id: row.id,
    purposeId: row.purpose_id,
    purposeCode: row.purpose_code,
    purposeName: row.purpose_name,
    mainPurposeId: row.main_purpose_id,
    isMainPurpose: row.is_main_purpose,
    status: row.status,
    ...auditFields(row),
  };
}

const masterAuditJoin = `
  LEFT JOIN user_profiles cb ON cb.id = t.created_by
  LEFT JOIN user_profiles ub ON ub.id = t.updated_by
`;

const masterAuditSelect = `
  cb.first_name AS created_first_name,
  cb.last_name AS created_last_name,
  ub.first_name AS updated_first_name,
  ub.last_name AS updated_last_name
`;

app.use('/api/product-groups', createProductGroupsRoutes({
  pool,
  authenticateRequest: authMiddleware,
  unsupportedCsvUpload,
  mapProductGroupRow,
}));
app.use('/api/products', createProductsRoutes({
  pool,
  authenticateRequest: authMiddleware,
  unsupportedCsvUpload,
  mapProductRow,
}));

app.use('/api/districts', createDistrictsRoutes({ pool, authenticateRequest: authMiddleware, unsupportedCsvUpload, mapDistrictRow }));
app.use('/api/insurance', createInsuranceRoutes({ pool, authenticateRequest: authMiddleware, unsupportedCsvUpload, mapInsuranceRow }));
app.use('/api/ifsc', createIfscRoutes({ pool, authenticateRequest: authMiddleware, unsupportedCsvUpload, mapIfscRow }));
app.use('/api/purposes', createPurposesRoutes({ pool, authenticateRequest: authMiddleware, unsupportedCsvUpload, mapPurposeRow }));

// --- Clients ---
// --- Roles ---
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
