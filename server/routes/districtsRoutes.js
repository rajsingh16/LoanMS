import { Router } from 'express';

export function createDistrictsRoutes({ pool, authenticateRequest, unsupportedCsvUpload, mapDistrictRow }) {
  const router = Router();

  router.get('', authenticateRequest, async (_req, res) => {
    try {
      const { rows } = await pool.query(`
        SELECT t.*, ${masterAuditSelect}
        FROM districts t
        ${masterAuditJoin}
        ORDER BY t.created_at DESC
      `);
      return res.json({ data: rows.map(mapDistrictRow), error: null });
    } catch (e) {
      return masterError(res, e, 'Failed to load districts');
    }
  });
  
  router.post('/upload-csv', authenticateRequest, unsupportedCsvUpload);
  
  router.post('', authenticateRequest, async (req, res) => {
    const b = req.body || {};
    if (!b.districtCode || !b.districtName || !b.countryId || !b.stateId || !b.stateName) {
      return res.status(400).json({ data: null, error: { message: 'District code, name, country, state and state name are required.' } });
    }
    try {
      const { rows } = await pool.query(
        `INSERT INTO districts (
          district_code, district_name, country_id, state_id, state_name, created_by, updated_by
        ) VALUES ($1,$2,$3,$4,$5,$6,$6)
        RETURNING *`,
        [b.districtCode, b.districtName, b.countryId, b.stateId, b.stateName, req.userId]
      );
      return res.status(201).json({ data: mapDistrictRow(rows[0]), error: null });
    } catch (e) {
      return masterError(res, e, 'Failed to create district');
    }
  });
  
  router.put('/:id', authenticateRequest, async (req, res) => {
    const b = req.body || {};
    if (!b.districtCode || !b.districtName || !b.countryId || !b.stateId || !b.stateName) {
      return res.status(400).json({ data: null, error: { message: 'District code, name, country, state and state name are required.' } });
    }
    try {
      const { rows } = await pool.query(
        `UPDATE districts
         SET district_code = $1,
             district_name = $2,
             country_id = $3,
             state_id = $4,
             state_name = $5,
             updated_by = $6,
             updated_at = now()
         WHERE id = $7
         RETURNING *`,
        [b.districtCode, b.districtName, b.countryId, b.stateId, b.stateName, req.userId, req.params.id]
      );
      if (!rows.length) return res.status(404).json({ data: null, error: { message: 'Not found' } });
      return res.json({ data: mapDistrictRow(rows[0]), error: null });
    } catch (e) {
      return masterError(res, e, 'Failed to update district');
    }
  });
  
  router.delete('/:id', authenticateRequest, async (req, res) => {
    try {
      const { rowCount } = await pool.query(`DELETE FROM districts WHERE id = $1`, [req.params.id]);
      if (!rowCount) return res.status(404).json({ error: { message: 'Not found' } });
      return res.json({ error: null });
    } catch (e) {
      return masterError(res, e, 'Failed to delete district');
    }
  });
  
  
  return router;
}
