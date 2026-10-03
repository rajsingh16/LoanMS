import { Router } from 'express';

export function createIfscRoutes({ pool, authenticateRequest, unsupportedCsvUpload, mapIfscRow }) {
  const router = Router();

  router.get('', authenticateRequest, async (_req, res) => {
    try {
      const { rows } = await pool.query(`
        SELECT t.*, ${masterAuditSelect}
        FROM ifsc_codes t
        ${masterAuditJoin}
        ORDER BY t.created_at DESC
      `);
      return res.json({ data: rows.map(mapIfscRow), error: null });
    } catch (e) {
      return masterError(res, e, 'Failed to load IFSC codes');
    }
  });
  
  router.post('/upload-csv', authenticateRequest, unsupportedCsvUpload);
  
  router.post('', authenticateRequest, async (req, res) => {
    const b = req.body || {};
    const branchAddress = b.branchAddress || b.bankAddress;
    if (!b.ifscCode || !b.bankName || !b.bankBranch || !branchAddress || !b.city || !b.state) {
      return res.status(400).json({ data: null, error: { message: 'IFSC code, bank, branch, address, city and state are required.' } });
    }
    try {
      const { rows } = await pool.query(
        `INSERT INTO ifsc_codes (
          ifsc_code, bank_name, bank_branch, branch_address, city, state, mobile_number, created_by, updated_by
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$8)
        RETURNING *`,
        [b.ifscCode, b.bankName, b.bankBranch, branchAddress, b.city, b.state, b.mobileNumber || null, req.userId]
      );
      return res.status(201).json({ data: mapIfscRow(rows[0]), error: null });
    } catch (e) {
      return masterError(res, e, 'Failed to create IFSC code');
    }
  });
  
  router.put('/:id', authenticateRequest, async (req, res) => {
    const b = req.body || {};
    const branchAddress = b.branchAddress || b.bankAddress;
    if (!b.ifscCode || !b.bankName || !b.bankBranch || !branchAddress || !b.city || !b.state) {
      return res.status(400).json({ data: null, error: { message: 'IFSC code, bank, branch, address, city and state are required.' } });
    }
    try {
      const { rows } = await pool.query(
        `UPDATE ifsc_codes
         SET ifsc_code = $1,
             bank_name = $2,
             bank_branch = $3,
             branch_address = $4,
             city = $5,
             state = $6,
             mobile_number = $7,
             updated_by = $8,
             updated_at = now()
         WHERE id = $9
         RETURNING *`,
        [b.ifscCode, b.bankName, b.bankBranch, branchAddress, b.city, b.state, b.mobileNumber || null, req.userId, req.params.id]
      );
      if (!rows.length) return res.status(404).json({ data: null, error: { message: 'Not found' } });
      return res.json({ data: mapIfscRow(rows[0]), error: null });
    } catch (e) {
      return masterError(res, e, 'Failed to update IFSC code');
    }
  });
  
  router.delete('/:id', authenticateRequest, async (req, res) => {
    try {
      const { rowCount } = await pool.query(`DELETE FROM ifsc_codes WHERE id = $1`, [req.params.id]);
      if (!rowCount) return res.status(404).json({ error: { message: 'Not found' } });
      return res.json({ error: null });
    } catch (e) {
      return masterError(res, e, 'Failed to delete IFSC code');
    }
  });
  
  
  return router;
}
