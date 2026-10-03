import { Router } from 'express';

export function createInsuranceRoutes({ pool, authenticateRequest, unsupportedCsvUpload, mapInsuranceRow }) {
  const router = Router();

  router.get('', authenticateRequest, async (_req, res) => {
    try {
      const { rows } = await pool.query(`
        SELECT t.*, ${masterAuditSelect}
        FROM insurance t
        ${masterAuditJoin}
        ORDER BY t.created_at DESC
      `);
      return res.json({ data: rows.map(mapInsuranceRow), error: null });
    } catch (e) {
      return masterError(res, e, 'Failed to load insurance');
    }
  });
  
  router.post('/upload-csv', authenticateRequest, unsupportedCsvUpload);
  
  router.post('', authenticateRequest, async (req, res) => {
    const b = req.body || {};
    if (!b.insuranceCode || !b.insuranceType || !b.insuranceName) {
      return res.status(400).json({ data: null, error: { message: 'Insurance code, type and name are required.' } });
    }
    try {
      const insuranceId = b.insuranceId || `INS${String(Date.now()).slice(-8)}`;
      const { rows } = await pool.query(
        `INSERT INTO insurance (
          insurance_id, insurance_code, insurance_type, insurance_name, status, data, created_by, updated_by
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$7)
        RETURNING *`,
        [insuranceId, b.insuranceCode, b.insuranceType, b.insuranceName, b.status || 'active', JSON.stringify({ ...b, insuranceId }), req.userId]
      );
      return res.status(201).json({ data: mapInsuranceRow(rows[0]), error: null });
    } catch (e) {
      return masterError(res, e, 'Failed to create insurance');
    }
  });
  
  router.put('/:id', authenticateRequest, async (req, res) => {
    const b = req.body || {};
    if (!b.insuranceCode || !b.insuranceType || !b.insuranceName) {
      return res.status(400).json({ data: null, error: { message: 'Insurance code, type and name are required.' } });
    }
    try {
      const { rows: current } = await pool.query(`SELECT insurance_id FROM insurance WHERE id = $1`, [req.params.id]);
      if (!current.length) return res.status(404).json({ data: null, error: { message: 'Not found' } });
      const insuranceId = b.insuranceId || current[0].insurance_id;
      const { rows } = await pool.query(
        `UPDATE insurance
         SET insurance_id = $1,
             insurance_code = $2,
             insurance_type = $3,
             insurance_name = $4,
             status = $5,
             data = $6,
             updated_by = $7,
             updated_at = now()
         WHERE id = $8
         RETURNING *`,
        [insuranceId, b.insuranceCode, b.insuranceType, b.insuranceName, b.status || 'active', JSON.stringify({ ...b, insuranceId }), req.userId, req.params.id]
      );
      return res.json({ data: mapInsuranceRow(rows[0]), error: null });
    } catch (e) {
      return masterError(res, e, 'Failed to update insurance');
    }
  });
  
  router.delete('/:id', authenticateRequest, async (req, res) => {
    try {
      const { rowCount } = await pool.query(`DELETE FROM insurance WHERE id = $1`, [req.params.id]);
      if (!rowCount) return res.status(404).json({ error: { message: 'Not found' } });
      return res.json({ error: null });
    } catch (e) {
      return masterError(res, e, 'Failed to delete insurance');
    }
  });
  
  
  return router;
}
