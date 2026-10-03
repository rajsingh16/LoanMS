import { Router } from 'express';

export function createPincodesRoutes({ pool, authenticateRequest }) {
  const router = Router();

  function mapPincodeRow(row) {
    return {
      id: row.id,
      pincode: row.pincode,
      state: row.state ?? '',
      district: row.district,
      status: row.status,
      insertedOn: row.created_at,
      insertedBy: row.inserted_by_name || row.inserted_by_email || 'System',
      updatedOn: row.updated_at,
      updatedBy: row.updated_by_name || row.updated_by_email || undefined,
    };
  }
  
  router.get('/lookup/:pincode', authenticateRequest, async (req, res) => {
    const pincode = String(req.params.pincode || '').trim();
    if (!/^\d{6}$/.test(pincode)) {
      return res.status(400).json({ error: 'Valid 6-digit pincode required' });
    }
  
    try {
      const { rows } = await pool.query(
        `SELECT
           p.*,
           trim(concat(cu.first_name, ' ', cu.last_name)) AS inserted_by_name,
           cuc.email AS inserted_by_email,
           trim(concat(uu.first_name, ' ', uu.last_name)) AS updated_by_name,
           uuc.email AS updated_by_email
         FROM pincodes p
         LEFT JOIN user_profiles cu ON cu.id = p.created_by
         LEFT JOIN user_credentials cuc ON cuc.user_id = p.created_by
         LEFT JOIN user_profiles uu ON uu.id = p.updated_by
         LEFT JOIN user_credentials uuc ON uuc.user_id = p.updated_by
         WHERE p.pincode = $1
         LIMIT 1`,
        [pincode]
      );
  
      if (!rows.length) {
        return res.status(404).json({ error: 'Pincode not found' });
      }
  
      return res.json({ data: mapPincodeRow(rows[0]), error: null });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ data: null, error: { message: e.message } });
    }
  });
  
  router.get('', authenticateRequest, async (_req, res) => {
    try {
      const { rows } = await pool.query(
        `SELECT
           p.*,
           trim(concat(cu.first_name, ' ', cu.last_name)) AS inserted_by_name,
           cuc.email AS inserted_by_email,
           trim(concat(uu.first_name, ' ', uu.last_name)) AS updated_by_name,
           uuc.email AS updated_by_email
         FROM pincodes p
         LEFT JOIN user_profiles cu ON cu.id = p.created_by
         LEFT JOIN user_credentials cuc ON cuc.user_id = p.created_by
         LEFT JOIN user_profiles uu ON uu.id = p.updated_by
         LEFT JOIN user_credentials uuc ON uuc.user_id = p.updated_by
         ORDER BY p.created_at DESC`
      );
      return res.json({ data: rows.map(mapPincodeRow), error: null });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ data: null, error: { message: e.message } });
    }
  });
  
  router.post('', authenticateRequest, async (req, res) => {
    const { pincode, state, district, status } = req.body || {};
  
    if (!pincode || !district || !state) {
      return res.status(400).json({ error: 'Pincode, district, and state are required' });
    }
  
    try {
      const { rows } = await pool.query(
        `INSERT INTO pincodes (pincode, state, district, status, created_by, updated_by)
         VALUES ($1, $2, $3, $4, $5, $5)
         RETURNING *`,
        [String(pincode).trim(), state?.trim() || null, String(district).trim(), status || 'active', req.userId]
      );
      const created = rows[0];
      return res.status(201).json({
        data: mapPincodeRow({
          ...created,
          inserted_by_name: null,
          inserted_by_email: null,
          updated_by_name: null,
          updated_by_email: null,
        }),
        error: null,
      });
    } catch (e) {
      console.error(e);
      if (e.code === '23505') {
        return res.status(409).json({ error: 'Pincode already exists' });
      }
      return res.status(500).json({ error: e.message || 'Failed to create pincode' });
    }
  });
  
  async function updatePincode(req, res) {
    const { pincode, state, district, status } = req.body || {};
    const fields = [];
    const values = [];
    let index = 1;
  
    if (pincode !== undefined) {
      fields.push(`pincode = $${index++}`);
      values.push(String(pincode).trim());
    }
    if (state !== undefined) {
      fields.push(`state = $${index++}`);
      values.push(state ? String(state).trim() : null);
    }
    if (district !== undefined) {
      fields.push(`district = $${index++}`);
      values.push(String(district).trim());
    }
    if (status !== undefined) {
      fields.push(`status = $${index++}`);
      values.push(status);
    }
  
    if (!fields.length) {
      return res.status(400).json({ error: 'No fields' });
    }
  
    values.push(req.userId, req.params.id);
  
    try {
      const { rows } = await pool.query(
        `UPDATE pincodes
         SET ${fields.join(', ')}, updated_by = $${index++}, updated_at = now()
         WHERE id = $${index}
         RETURNING *`,
        values
      );
      if (!rows.length) {
        return res.status(404).json({ error: 'Not found' });
      }
      return res.json({
        data: mapPincodeRow({
          ...rows[0],
          inserted_by_name: null,
          inserted_by_email: null,
          updated_by_name: null,
          updated_by_email: null,
        }),
        error: null,
      });
    } catch (e) {
      console.error(e);
      if (e.code === '23505') {
        return res.status(409).json({ error: 'Pincode already exists' });
      }
      return res.status(500).json({ error: e.message || 'Failed to update pincode' });
    }
  }
  
  router.put('/:id', authenticateRequest, updatePincode);
  router.patch('/:id', authenticateRequest, updatePincode);
  
  router.delete('/:id', authenticateRequest, async (req, res) => {
    try {
      const { rowCount } = await pool.query(`DELETE FROM pincodes WHERE id = $1`, [req.params.id]);
      if (!rowCount) {
        return res.status(404).json({ error: 'Not found' });
      }
      return res.json({ error: null });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: e.message || 'Failed to delete pincode' });
    }
  });
  
  
  return router;
}
