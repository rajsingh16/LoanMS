import { Router } from 'express';

export function createAreasRoutes({ pool, authenticateRequest, syncBranchFromArea }) {
  const router = Router();

  // --- Areas ---
  router.get('/', authenticateRequest, async (_req, res) => {
    try {
      const { rows } = await pool.query(`
        SELECT a.*, u.first_name AS cu_fn, u.last_name AS cu_ln
        FROM areas a
        LEFT JOIN user_profiles u ON a.created_by = u.id
        ORDER BY a.created_at DESC
      `);
      const data = rows.map((r) => {
        const { cu_fn, cu_ln, ...rest } = r;
        return {
          ...rest,
          created_user:
            cu_fn != null ? { first_name: cu_fn, last_name: cu_ln } : null,
        };
      });
      return res.json({ data, error: null });
    } catch (e) {
      console.error(e);
      return res.json({ data: null, error: { message: e.message } });
    }
  });
  
  router.post('/', authenticateRequest, async (req, res) => {
    const b = req.body;
    try {
      const areaCode =
        b.area_code ||
        `${String(b.area_type || 'AR').substring(0, 2).toUpperCase()}${String(Date.now()).slice(-3)}`;
      const { rows } = await pool.query(
        `INSERT INTO areas (
          area_type, area_code, area_name, parent_area_code, branch_manager_id,
          address1, address2, phone_number, email_id, pincode, district, state,
          mandatory_document, branch_rating, min_center_clients, max_center_clients,
          bc_branch_id, business_partner, cashless_disb_partner, nach_partner,
          branch_opening_date, disb_on_meeting_date, cross_sell_allowed,
          is_disb_active, is_cash_disb_active, is_sub_product_enabled,
          is_client_sourcing_enabled, is_center_formation_enabled, status, created_by
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30
        ) RETURNING *`,
        [
          b.area_type,
          areaCode,
          b.area_name,
          b.parent_area_code ?? null,
          b.branch_manager_id ?? null,
          b.address1,
          b.address2 ?? null,
          b.phone_number ?? null,
          b.email_id ?? null,
          b.pincode,
          b.district,
          b.state ?? null,
          b.mandatory_document ?? null,
          b.branch_rating ?? null,
          b.min_center_clients ?? 0,
          b.max_center_clients ?? 0,
          b.bc_branch_id ?? null,
          b.business_partner,
          b.cashless_disb_partner ?? null,
          b.nach_partner ?? null,
          b.branch_opening_date,
          b.disb_on_meeting_date ?? false,
          b.cross_sell_allowed ?? false,
          b.is_disb_active ?? true,
          b.is_cash_disb_active ?? false,
          b.is_sub_product_enabled ?? false,
          b.is_client_sourcing_enabled ?? false,
          b.is_center_formation_enabled ?? false,
          'active',
          req.userId,
        ]
      );
      await syncBranchFromArea(rows[0]);
      return res.json({ data: rows[0], error: null });
    } catch (e) {
      console.error(e);
      return res.json({ data: null, error: { message: e.message } });
    }
  });
  
  router.patch('/:id', authenticateRequest, async (req, res) => {
    const b = req.body;
    const fields = [
      'area_type',
      'area_name',
      'parent_area_code',
      'branch_manager_id',
      'address1',
      'address2',
      'phone_number',
      'email_id',
      'pincode',
      'district',
      'state',
      'mandatory_document',
      'branch_rating',
      'min_center_clients',
      'max_center_clients',
      'bc_branch_id',
      'business_partner',
      'cashless_disb_partner',
      'nach_partner',
      'branch_opening_date',
      'disb_on_meeting_date',
      'cross_sell_allowed',
      'is_disb_active',
      'is_cash_disb_active',
      'is_sub_product_enabled',
      'is_client_sourcing_enabled',
      'is_center_formation_enabled',
    ];
    const sets = [];
    const vals = [];
    let i = 1;
    for (const f of fields) {
      if (b[f] !== undefined) {
        sets.push(`${f} = $${i++}`);
        vals.push(b[f]);
      }
    }
    if (!sets.length) {
      return res.status(400).json({ error: 'No fields' });
    }
    vals.push(req.params.id);
    try {
      const { rows } = await pool.query(
        `UPDATE areas SET ${sets.join(', ')}, updated_at = now() WHERE id = $${i} RETURNING *`,
        vals
      );
      if (!rows.length) {
        return res.status(404).json({ error: 'Not found' });
      }
      await syncBranchFromArea(rows[0]);
      return res.json({ data: rows[0], error: null });
    } catch (e) {
      console.error(e);
      return res.json({ data: null, error: { message: e.message } });
    }
  });
  
  router.delete('/:id', authenticateRequest, async (req, res) => {
    try {
      await pool.query(`DELETE FROM areas WHERE id = $1`, [req.params.id]);
      return res.json({ error: null });
    } catch (e) {
      console.error(e);
      return res.json({ error: { message: e.message } });
    }
  });
  
  router.post('/bulk-upsert', authenticateRequest, async (req, res) => {
    const { rows: inputRows } = req.body || {};
    if (!Array.isArray(inputRows)) {
      return res.status(400).json({ error: 'rows array required' });
    }
    let created = 0;
    let updated = 0;
    let errors = 0;
    const errorDetails = [];
  
    for (let idx = 0; idx < inputRows.length; idx++) {
      const b = inputRows[idx];
      try {
        const areaCode = b.area_code;
        const ex = await pool.query(`SELECT id FROM areas WHERE area_code = $1`, [areaCode]);
        const payload = { ...b, created_by: req.userId };
        if (ex.rows.length) {
          const id = ex.rows[0].id;
          const fields = Object.keys(payload).filter(
            (k) => k !== 'area_code' && k !== 'id' && payload[k] !== undefined
          );
          const sets = fields.map((f, i) => `${f} = $${i + 1}`);
          const vals = fields.map((f) => payload[f]);
          vals.push(id);
          await pool.query(
            `UPDATE areas SET ${sets.join(', ')}, updated_at = now() WHERE id = $${fields.length + 1}`,
            vals
          );
          await syncBranchFromArea(payload);
          updated++;
        } else {
          await pool.query(
            `INSERT INTO areas (
              area_type, area_code, area_name, parent_area_code, branch_manager_id,
              address1, address2, phone_number, email_id, pincode, district, state,
              mandatory_document, branch_rating, min_center_clients, max_center_clients,
              bc_branch_id, business_partner, cashless_disb_partner, nach_partner,
              branch_opening_date, disb_on_meeting_date, cross_sell_allowed,
              is_disb_active, is_cash_disb_active, is_sub_product_enabled,
              is_client_sourcing_enabled, is_center_formation_enabled, status, created_by
            ) VALUES (
              $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30
            )`,
            [
              payload.area_type,
              payload.area_code,
              payload.area_name,
              payload.parent_area_code ?? null,
              payload.branch_manager_id ?? null,
              payload.address1,
              payload.address2 ?? null,
              payload.phone_number ?? null,
              payload.email_id ?? null,
              payload.pincode,
              payload.district,
              payload.state ?? null,
              payload.mandatory_document ?? null,
              payload.branch_rating ?? null,
              payload.min_center_clients ?? 0,
              payload.max_center_clients ?? 0,
              payload.bc_branch_id ?? null,
              payload.business_partner,
              payload.cashless_disb_partner ?? null,
              payload.nach_partner ?? null,
              payload.branch_opening_date,
              payload.disb_on_meeting_date ?? false,
              payload.cross_sell_allowed ?? false,
              payload.is_disb_active ?? true,
              payload.is_cash_disb_active ?? false,
              payload.is_sub_product_enabled ?? false,
              payload.is_client_sourcing_enabled ?? false,
              payload.is_center_formation_enabled ?? false,
              payload.status || 'active',
              req.userId,
            ]
          );
          await syncBranchFromArea(payload);
          created++;
        }
      } catch (e) {
        errors++;
        errorDetails.push(`Row ${idx + 2}: ${e.message}`);
      }
    }
  
    return res.json({
      success: errors === 0,
      created,
      updated,
      errors,
      errorDetails: errorDetails.slice(0, 10),
    });
  });
  
  
  return router;
}
