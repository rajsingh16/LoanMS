import { Router } from 'express';

export function createProductGroupsRoutes({ pool, authenticateRequest, unsupportedCsvUpload, mapProductGroupRow }) {
  const router = Router();

  router.get('', authenticateRequest, async (_req, res) => {
    try {
      const { rows } = await pool.query(`
        SELECT t.*, ${masterAuditSelect}
        FROM product_groups t
        ${masterAuditJoin}
        ORDER BY t.created_at DESC
      `);
      return res.json({ data: rows.map(mapProductGroupRow), error: null });
    } catch (e) {
      return masterError(res, e, 'Failed to load product groups');
    }
  });
  
  router.post('/upload-csv', authenticateRequest, unsupportedCsvUpload);
  
  router.post('', authenticateRequest, async (req, res) => {
    const b = req.body || {};
    if (!b.productGroupCode || !b.productGroupName) {
      return res.status(400).json({ data: null, error: { message: 'Product group code and name are required.' } });
    }
    try {
      const { rows } = await pool.query(
        `INSERT INTO product_groups (
          product_group_code, product_group_name, product_group_segment, product_group_type,
          status, data, created_by, updated_by
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$7)
        RETURNING *`,
        [
          String(b.productGroupCode).trim(),
          String(b.productGroupName).trim(),
          b.productGroupSegment || null,
          b.productGroupType || null,
          b.status || 'active',
          JSON.stringify(b),
          req.userId,
        ]
      );
      return res.status(201).json({ data: mapProductGroupRow(rows[0]), error: null });
    } catch (e) {
      return masterError(res, e, 'Failed to create product group');
    }
  });
  
  router.put('/:id', authenticateRequest, async (req, res) => {
    const b = req.body || {};
    if (!b.productGroupCode || !b.productGroupName) {
      return res.status(400).json({ data: null, error: { message: 'Product group code and name are required.' } });
    }
    try {
      const { rows } = await pool.query(
        `UPDATE product_groups
         SET product_group_code = $1,
             product_group_name = $2,
             product_group_segment = $3,
             product_group_type = $4,
             status = $5,
             data = $6,
             updated_by = $7,
             updated_at = now()
         WHERE id = $8
         RETURNING *`,
        [
          String(b.productGroupCode).trim(),
          String(b.productGroupName).trim(),
          b.productGroupSegment || null,
          b.productGroupType || null,
          b.status || 'active',
          JSON.stringify(b),
          req.userId,
          req.params.id,
        ]
      );
      if (!rows.length) return res.status(404).json({ data: null, error: { message: 'Not found' } });
      return res.json({ data: mapProductGroupRow(rows[0]), error: null });
    } catch (e) {
      return masterError(res, e, 'Failed to update product group');
    }
  });
  
  router.delete('/:id', authenticateRequest, async (req, res) => {
    try {
      const { rowCount } = await pool.query(`DELETE FROM product_groups WHERE id = $1`, [req.params.id]);
      if (!rowCount) return res.status(404).json({ error: { message: 'Not found' } });
      return res.json({ error: null });
    } catch (e) {
      return masterError(res, e, 'Failed to delete product group');
    }
  });
  
  
  return router;
}
