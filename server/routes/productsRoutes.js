import { Router } from 'express';

export function createProductsRoutes({ pool, authenticateRequest, unsupportedCsvUpload, mapProductRow }) {
  const router = Router();

  router.get('', authenticateRequest, async (_req, res) => {
    try {
      const { rows } = await pool.query(`
        SELECT t.*, ${masterAuditSelect}
        FROM products t
        ${masterAuditJoin}
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
  
  router.post('', authenticateRequest, async (req, res) => {
    const b = req.body || {};
    if (!b.productGroupId || !b.productCode || !b.productName) {
      return res.status(400).json({ data: null, error: { message: 'Product group, code and name are required.' } });
    }
    try {
      const productId = b.productId || `PROD${String(Date.now()).slice(-8)}`;
      const { rows } = await pool.query(
        `INSERT INTO products (
          product_id, product_code, product_name, product_group_id, status, data, created_by, updated_by
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$7)
        RETURNING *`,
        [
          productId,
          String(b.productCode).trim(),
          String(b.productName).trim(),
          String(b.productGroupId).trim(),
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
      const { rows: current } = await pool.query(`SELECT product_id FROM products WHERE id = $1`, [req.params.id]);
      if (!current.length) return res.status(404).json({ data: null, error: { message: 'Not found' } });
      const productId = b.productId || current[0].product_id;
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
          String(b.productGroupId).trim(),
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
