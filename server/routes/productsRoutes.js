import { Router } from 'express';
import { requireMasterPermission } from '../middleware/authorization.js';
import { masterAuditSelect, masterError } from '../utils/masterResponses.js';
import { validateProductContractualTerms } from '../services/contractualRepaymentTerms.js';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function resolveProductGroupId(pool, input) {
  const value = String(input ?? '').trim();

  if (!value) {
    throw new Error('Product Group is required');
  }

  const query = UUID_REGEX.test(value)
    ? `SELECT id FROM product_groups
       WHERE id = $1`
    : `SELECT id FROM product_groups
       WHERE product_group_code = $1`;

  const { rows } = await pool.query(query, [value]);

  if (!rows.length) {
    return null;
  }

  return rows[0].id;
}
export function createProductsRoutes({ pool, authenticateRequest, unsupportedCsvUpload, mapProductRow }) {
  const router = Router();
  router.use(authenticateRequest, requireMasterPermission('products'));

  router.get('', authenticateRequest, async (_req, res) => {
    try {
      const { rows } = await pool.query(`
        SELECT t.*, pg.id AS canonical_product_group_id, ${masterAuditSelect}
        FROM products t
        LEFT JOIN product_groups pg
          ON pg.id = t.product_group_id
        LEFT JOIN user_profiles cb ON cb.id = t.created_by
        LEFT JOIN user_profiles ub ON ub.id = t.updated_by
        ORDER BY t.created_at DESC
      `);
      return res.json({ data: rows.map(mapProductRow), error: null });
    } catch (e) {
      return masterError(res, e, 'Failed to load products');
    }
  });
  
  router.post('/upload-csv', authenticateRequest, unsupportedCsvUpload);
  router.post('/process', authenticateRequest, (_req, res) => {
    return res.json({ success: true, message: 'Products processed successfully.' });
  });

  // These endpoints deliberately return the mapped master record: `data` holds
  // the complete product configuration, including fields retained in JSONB.
  router.get('/by-group/:groupId', authenticateRequest, async (req, res) => {
    try {
      const { rows } = await pool.query(`SELECT t.*, pg.id AS canonical_product_group_id
        FROM products t JOIN product_groups pg ON pg.id = t.product_group_id
        WHERE t.product_group_id = $1 AND lower(t.status) = 'active'
        ORDER BY t.product_name`, [req.params.groupId]);
      return res.json({ data: rows.map(mapProductRow), error: null });
    } catch (e) { return masterError(res, e, 'Failed to load products'); }
  });

  router.get('/:id/configuration', authenticateRequest, async (req, res) => {
    try {
      const { rows } = await pool.query(`SELECT t.*, pg.id AS canonical_product_group_id
        FROM products t JOIN product_groups pg ON pg.id = t.product_group_id WHERE t.id = $1`, [req.params.id]);
      if (!rows.length) return res.status(404).json({ data: null, error: { message: 'Product not found' } });
      return res.json({ data: mapProductRow(rows[0]), error: null });
    } catch (e) { return masterError(res, e, 'Failed to load product configuration'); }
  });
  
  router.post('', authenticateRequest, async (req, res) => {
    const b = req.body || {};
    if (!b.productGroupId || !b.productCode || !b.productName) {
      return res.status(400).json({ data: null, error: { message: 'Product group, code and name are required.' } });
    }
    try {
      try { validateProductContractualTerms(b); } catch (validationError) {
        return res.status(400).json({ data: null, error: { message: validationError.message } });
      }
      const productId = b.productId || `PROD${String(Date.now()).slice(-8)}`;
      const productGroupId = await resolveProductGroupId(
        pool,
        b.productGroupId
      );
      
      if (!productGroupId) {
        return res.status(400).json({
          data: null,
          error: {
            message: 'Selected Product Group does not exist'
          }
        });
      }
      const { rows } = await pool.query(
        `INSERT INTO products (
          product_id, product_code, product_name, product_group_id, status, data, created_by, updated_by
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$7)
        RETURNING *`,
        [
          productId,
          String(b.productCode).trim(),
          String(b.productName).trim(),
          productGroupId,
          b.status || 'active',
          JSON.stringify({ ...b, productId }),
          req.userId,
        ]
      );
      return res.status(201).json({ data: mapProductRow(rows[0]), error: null });
    } catch (e) {
      return masterError(res, e, 'Failed to create product');
    }
  });
  
  router.put('/:id', authenticateRequest, async (req, res) => {
    const b = req.body || {};
    if (!b.productGroupId || !b.productCode || !b.productName) {
      return res.status(400).json({ data: null, error: { message: 'Product group, code and name are required.' } });
    }
    try {
      try { validateProductContractualTerms(b); } catch (validationError) {
        return res.status(400).json({ data: null, error: { message: validationError.message } });
      }
      const { rows: current } = await pool.query(`SELECT product_id FROM products WHERE id = $1`, [req.params.id]);
      if (!current.length) return res.status(404).json({ data: null, error: { message: 'Not found' } });
      const productId = b.productId || current[0].product_id;
      const productGroupId = await resolveProductGroupId(
        pool,
        b.productGroupId
      );
      
      if (!productGroupId) {
        return res.status(400).json({
          data: null,
          error: {
            message: 'Selected Product Group does not exist'
          }
        });
      }
      const { rows } = await pool.query(
        `UPDATE products
         SET product_id = $1,
             product_code = $2,
             product_name = $3,
             product_group_id = $4,
             status = $5,
             data = $6,
             updated_by = $7,
             updated_at = now()
         WHERE id = $8
         RETURNING *`,
        [
          productId,
          String(b.productCode).trim(),
          String(b.productName).trim(),
          productGroupId,
          b.status || 'active',
          JSON.stringify({ ...b, productId }),
          req.userId,
          req.params.id,
        ]
      );
      return res.json({ data: mapProductRow(rows[0]), error: null });
    } catch (e) {
      return masterError(res, e, 'Failed to update product');
    }
  });
  
  router.delete('/:id', authenticateRequest, async (req, res) => {
    try {
      const { rowCount } = await pool.query(`DELETE FROM products WHERE id = $1`, [req.params.id]);
      if (!rowCount) return res.status(404).json({ error: { message: 'Not found' } });
      return res.json({ error: null });
    } catch (e) {
      return masterError(res, e, 'Failed to delete product');
    }
  });
  
  
  return router;
}
