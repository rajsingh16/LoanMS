import { Router } from 'express';

export function createPurposesRoutes({ pool, authenticateRequest, unsupportedCsvUpload, mapPurposeRow }) {
  const router = Router();

  router.get('', authenticateRequest, async (_req, res) => {
    try {
      const { rows } = await pool.query(`
        SELECT t.*, ${masterAuditSelect}
        FROM purposes t
        ${masterAuditJoin}
        ORDER BY t.created_at DESC
      `);
      return res.json({ data: rows.map(mapPurposeRow), error: null });
    } catch (e) {
      return masterError(res, e, 'Failed to load purposes');
    }
  });
  
  router.post('/upload-csv', authenticateRequest, unsupportedCsvUpload);
  
  router.post('', authenticateRequest, async (req, res) => {
    const b = req.body || {};
    if (!b.purposeCode || !b.purposeName) {
      return res.status(400).json({ data: null, error: { message: 'Purpose code and name are required.' } });
    }
    try {
      const purposeId = b.purposeId || `PUR${String(Date.now()).slice(-8)}`;
      const { rows } = await pool.query(
        `INSERT INTO purposes (
          purpose_id, purpose_code, purpose_name, main_purpose_id, is_main_purpose,
          status, created_by, updated_by
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$7)
        RETURNING *`,
        [purposeId, b.purposeCode, b.purposeName, b.mainPurposeId || null, b.isMainPurpose ?? !b.mainPurposeId, b.status || 'active', req.userId]
      );
      return res.status(201).json({ data: mapPurposeRow(rows[0]), error: null });
    } catch (e) {
      return masterError(res, e, 'Failed to create purpose');
    }
  });
  
  router.put('/:id', authenticateRequest, async (req, res) => {
    const b = req.body || {};
    if (!b.purposeCode || !b.purposeName) {
      return res.status(400).json({ data: null, error: { message: 'Purpose code and name are required.' } });
    }
    try {
      const { rows: current } = await pool.query(`SELECT purpose_id FROM purposes WHERE id = $1`, [req.params.id]);
      if (!current.length) return res.status(404).json({ data: null, error: { message: 'Not found' } });
      const purposeId = b.purposeId || current[0].purpose_id;
      const { rows } = await pool.query(
        `UPDATE purposes
         SET purpose_id = $1,
             purpose_code = $2,
             purpose_name = $3,
             main_purpose_id = $4,
             is_main_purpose = $5,
             status = $6,
             updated_by = $7,
             updated_at = now()
         WHERE id = $8
         RETURNING *`,
        [purposeId, b.purposeCode, b.purposeName, b.mainPurposeId || null, b.isMainPurpose ?? !b.mainPurposeId, b.status || 'active', req.userId, req.params.id]
      );
      return res.json({ data: mapPurposeRow(rows[0]), error: null });
    } catch (e) {
      return masterError(res, e, 'Failed to update purpose');
    }
  });
  
  router.delete('/:id', authenticateRequest, async (req, res) => {
    try {
      const { rowCount } = await pool.query(`DELETE FROM purposes WHERE id = $1`, [req.params.id]);
      if (!rowCount) return res.status(404).json({ error: { message: 'Not found' } });
      return res.json({ error: null });
    } catch (e) {
      return masterError(res, e, 'Failed to delete purpose');
    }
  });
  
  
  return router;
}
