import { Router } from 'express';
import { getAuthorizationContext, hasPermission } from '../middleware/authorization.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const error = (res, status, message) => res.status(status).json({ data: null, error: { message } });
const isAdmin = (context) => ['admin', 'administrator'].includes(context.role);

function permissionFor(method) {
  return method === 'GET' ? 'master.products.view' : 'master.products.update';
}

export function createProductBranchMappingsRoutes({ pool, authenticateRequest }) {
  const router = Router();
  router.use(authenticateRequest, async (req, res, next) => {
    try {
      const context = await getAuthorizationContext(req.userId);
      if (!context || (!isAdmin(context) && !hasPermission(context, permissionFor(req.method)))) {
        return error(res, 403, 'Not authorized to manage product branch mappings');
      }
      req.authz = context;
      return next();
    } catch (cause) {
      console.error('Product branch mapping authorization failed:', cause);
      return error(res, 500, 'Authorization check failed');
    }
  });

  const scopeBranch = (req, branchId) => isAdmin(req.authz) || String(req.authz.branch_id || '') === String(branchId);
  const mappingRows = async (where = '', params = []) => (await pool.query(`
    SELECT m.id, m.product_id AS "productId", m.branch_id AS "branchId",
           p.product_name AS "productName", p.product_code AS "productCode",
           pg.id AS "productGroupId", pg.product_group_name AS "productGroupName",
           b.branch_name AS "branchName", b.branch_code AS "branchCode",
           m.assigned_at AS "assignedDate", m.status
      FROM product_branch_mappings m
      JOIN products p ON p.id = m.product_id
      JOIN product_groups pg ON pg.id = p.product_group_id
      JOIN branches b ON b.id = m.branch_id
      ${where}
     ORDER BY p.product_name, b.branch_name`, params)).rows;

  router.get('/options', async (req, res) => {
    try {
      const branchParams = [];
      const branchWhere = isAdmin(req.authz) ? '' : ' AND id = $1';
      if (!isAdmin(req.authz)) {
        if (!req.authz.branch_id) return error(res, 403, 'No authorized branch is assigned');
        branchParams.push(req.authz.branch_id);
      }
      const [groups, products, branches] = await Promise.all([
        pool.query("SELECT id, product_group_code AS \"productGroupCode\", product_group_name AS \"productGroupName\", status FROM product_groups WHERE lower(status) = 'active' ORDER BY product_group_name"),
        pool.query("SELECT id, product_group_id AS \"productGroupId\", product_code AS \"productCode\", product_name AS \"productName\", status FROM products WHERE lower(status) = 'active' ORDER BY product_name"),
        pool.query(`SELECT id, branch_code AS \"branchCode\", branch_name AS \"branchName\", location, status FROM branches WHERE status = 'active'${branchWhere} ORDER BY branch_name`, branchParams),
      ]);
      return res.json({ data: { productGroups: groups.rows, products: products.rows, branches: branches.rows }, error: null });
    } catch (cause) { console.error(cause); return error(res, 500, 'Failed to load mapping options'); }
  });

  router.get('/by-branch/:branchId', async (req, res) => {
    if (!UUID.test(req.params.branchId)) return error(res, 400, 'Invalid branch id');
    if (!scopeBranch(req, req.params.branchId)) return error(res, 403, 'You are not authorized for this branch');
    try {
      const { rows } = await pool.query(`SELECT p.id, p.product_group_id AS "productGroupId", p.product_code AS "productCode", p.product_name AS "productName", p.status
        FROM product_branch_mappings m JOIN products p ON p.id = m.product_id
        WHERE m.branch_id = $1 AND m.status = 'active' AND lower(p.status) = 'active'
        ORDER BY p.product_name`, [req.params.branchId]);
      return res.json({ data: rows, error: null });
    } catch (cause) { console.error(cause); return error(res, 500, 'Failed to load branch products'); }
  });

  router.get('/', async (req, res) => {
    try {
      const params = []; const clauses = [];
      const add = (column, value) => { if (value) { params.push(value); clauses.push(`${column} = $${params.length}`); } };
      add('pg.id', req.query.productGroupId); add('m.product_id', req.query.productId); add('m.branch_id', req.query.branchId); add('m.status', req.query.status);
      if (!isAdmin(req.authz)) { if (!req.authz.branch_id) return error(res, 403, 'No authorized branch is assigned'); add('m.branch_id', req.authz.branch_id); }
      return res.json({ data: await mappingRows(clauses.length ? `WHERE ${clauses.join(' AND ')}` : '', params), error: null });
    } catch (cause) { console.error(cause); return error(res, 500, 'Failed to load product branch mappings'); }
  });

  router.post('/', async (req, res) => {
    const { productId, branchIds } = req.body || {};
    if (!UUID.test(String(productId || '')) || !Array.isArray(branchIds) || branchIds.some((id) => !UUID.test(String(id)))) return error(res, 400, 'A product id and valid branch ids are required');
    const uniqueBranchIds = [...new Set(branchIds)];
    if (uniqueBranchIds.length !== branchIds.length) return error(res, 409, 'Duplicate branch assignments are not allowed');
    if (!isAdmin(req.authz) && uniqueBranchIds.some((id) => !scopeBranch(req, id))) return error(res, 403, 'You may only assign products to your authorized branch');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const product = await client.query("SELECT id FROM products WHERE id = $1 AND lower(status) = 'active'", [productId]);
      if (!product.rowCount) throw new Error('Product does not exist or is inactive');
      if (uniqueBranchIds.length) {
        const branches = await client.query("SELECT id FROM branches WHERE id = ANY($1::uuid[]) AND status = 'active'", [uniqueBranchIds]);
        if (branches.rowCount !== uniqueBranchIds.length) throw new Error('One or more branches do not exist or are inactive');
      }
      const allowedBranches = isAdmin(req.authz) ? uniqueBranchIds : [req.authz.branch_id];
      await client.query(`UPDATE product_branch_mappings SET status = 'inactive', updated_by = $1, updated_at = now()
        WHERE product_id = $2 AND branch_id = ANY($3::uuid[])`, [req.userId, productId, allowedBranches]);
      for (const branchId of uniqueBranchIds) {
        await client.query(`INSERT INTO product_branch_mappings (product_id, branch_id, status, assigned_at, created_by, updated_by)
          VALUES ($1, $2, 'active', now(), $3, $3)
          ON CONFLICT (product_id, branch_id) DO UPDATE SET status = 'active', assigned_at = now(), updated_by = EXCLUDED.updated_by, updated_at = now()`, [productId, branchId, req.userId]);
      }
      await client.query('COMMIT');
      return res.status(201).json({ data: await mappingRows('WHERE m.product_id = $1', [productId]), error: null });
    } catch (cause) { await client.query('ROLLBACK'); return error(res, /inactive|exist/.test(cause.message) ? 400 : 500, cause.message || 'Failed to save product branch mapping'); }
    finally { client.release(); }
  });

  router.patch('/:id', async (req, res) => {
    if (!UUID.test(req.params.id) || !['active', 'inactive'].includes(req.body?.status)) return error(res, 400, 'A valid mapping id and status are required');
    try {
      const existing = await pool.query('SELECT branch_id FROM product_branch_mappings WHERE id = $1', [req.params.id]);
      if (!existing.rowCount) return error(res, 404, 'Mapping not found');
      if (!scopeBranch(req, existing.rows[0].branch_id)) return error(res, 403, 'You are not authorized for this branch');
      const { rows } = await pool.query("UPDATE product_branch_mappings SET status = $1, updated_by = $2, updated_at = now() WHERE id = $3 RETURNING id", [req.body.status, req.userId, req.params.id]);
      return res.json({ data: (await mappingRows('WHERE m.id = $1', [rows[0].id]))[0], error: null });
    } catch (cause) { console.error(cause); return error(res, 500, 'Failed to update mapping status'); }
  });

  router.delete('/:id', async (req, res) => {
    if (!UUID.test(req.params.id)) return error(res, 400, 'Invalid mapping id');
    try {
      const existing = await pool.query('SELECT branch_id FROM product_branch_mappings WHERE id = $1', [req.params.id]);
      if (!existing.rowCount) return error(res, 404, 'Mapping not found');
      if (!scopeBranch(req, existing.rows[0].branch_id)) return error(res, 403, 'You are not authorized for this branch');
      await pool.query("UPDATE product_branch_mappings SET status = 'inactive', updated_by = $1, updated_at = now() WHERE id = $2", [req.userId, req.params.id]);
      return res.json({ data: null, error: null });
    } catch (cause) { console.error(cause); return error(res, 500, 'Failed to deactivate mapping'); }
  });
  return router;
}
