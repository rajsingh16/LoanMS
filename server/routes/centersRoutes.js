import { Router } from 'express';
import { quoteIdent } from '../utils/centerHelpers.js';

export function createCentersRoutes({ pool, authenticateRequest, getCenterTableName, getActiveBranchById }) {
  const router = Router();

  // --- Centers ---
  router.get('/', authenticateRequest, async (_req, res) => {
    try {
      const centerTable = quoteIdent(await getCenterTableName());
      const { rows } = await pool.query(`
        SELECT c.*,
          b.id AS b_id, b.branch_name AS b_branch_name, b.branch_code AS b_branch_code,
          u1.id AS a_id, u1.first_name AS a_fn, u1.last_name AS a_ln,
          u2.id AS c_id, u2.first_name AS c_fn, u2.last_name AS c_ln
        FROM ${centerTable} c
        LEFT JOIN branches b ON c.branch_id = b.id
        LEFT JOIN user_profiles u1 ON c.assigned_to = u1.id
        LEFT JOIN user_profiles u2 ON c.created_by = u2.id
        ORDER BY c.created_at DESC
      `);
      const data = rows.map((r) => ({
        ...stripJoinAliases(r),
        branches: r.b_id
          ? { id: r.b_id, branch_name: r.b_branch_name, branch_code: r.b_branch_code }
          : null,
        assigned_user: r.a_id ? { id: r.a_id, first_name: r.a_fn, last_name: r.a_ln } : null,
        created_user: r.c_id ? { id: r.c_id, first_name: r.c_fn, last_name: r.c_ln } : null,
      }));
      return res.json({ data, error: null });
    } catch (e) {
      console.error(e);
      return res.json({ data: null, error: { message: e.message } });
    }
  });
  
  function stripJoinAliases(r) {
    const out = { ...r };
    delete out.b_id;
    delete out.b_branch_name;
    delete out.b_branch_code;
    delete out.a_id;
    delete out.a_fn;
    delete out.a_ln;
    delete out.c_id;
    delete out.c_fn;
    delete out.c_ln;
    return out;
  }
  
  router.post('/', authenticateRequest, async (req, res) => {
    const b = req.body;
    try {
      const centerTable = quoteIdent(await getCenterTableName());
      const branch = await getActiveBranchById(b.branch_id);
      if (!branch) {
        return res.status(400).json({
          data: null,
          error: { message: 'Please select a valid active branch before creating a center.' },
        });
      }
      const branchCode = branch.branch_code || 'CTR';
      const centerCode = `${branchCode}${String(Date.now()).slice(-4)}`;
  
      const { rows } = await pool.query(
        `INSERT INTO ${centerTable} (
          center_code, center_name, branch_id, village, assigned_to, center_day, center_time,
          contact_person_name, contact_person_number, meeting_place, address1, address2, landmark,
          pincode, city, district, state, latitude, longitude, status, blacklisted, bc_center_id, parent_center_id, created_by
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24
        ) RETURNING *`,
        [
          centerCode,
          b.center_name,
          b.branch_id,
          b.village ?? null,
          b.assigned_to ?? null,
          b.center_day ?? null,
          b.center_time ?? null,
          b.contact_person_name ?? null,
          b.contact_person_number ?? null,
          b.meeting_place ?? null,
          b.address1 ?? null,
          b.address2 ?? null,
          b.landmark ?? null,
          b.pincode ?? null,
          b.city ?? null,
          b.district ?? null,
          b.state ?? null,
          b.latitude ?? null,
          b.longitude ?? null,
          b.status ?? 'active',
          b.blacklisted ?? false,
          b.bc_center_id ?? null,
          b.parent_center_id ?? null,
          req.userId,
        ]
      );
      const id = rows[0].id;
      const full = await pool.query(
        `
        SELECT c.*,
          b.id AS b_id, b.branch_name AS b_branch_name, b.branch_code AS b_branch_code,
          u1.id AS a_id, u1.first_name AS a_fn, u1.last_name AS a_ln
        FROM ${centerTable} c
        LEFT JOIN branches b ON c.branch_id = b.id
        LEFT JOIN user_profiles u1 ON c.assigned_to = u1.id
        WHERE c.id = $1
      `,
        [id]
      );
      const r = full.rows[0];
      const data = {
        ...stripJoinAliases(r),
        branches: r.b_id
          ? { id: r.b_id, branch_name: r.b_branch_name, branch_code: r.b_branch_code }
          : null,
        assigned_user: r.a_id ? { id: r.a_id, first_name: r.a_fn, last_name: r.a_ln } : null,
      };
      return res.json({ data, error: null });
    } catch (e) {
      console.error(e);
      return res.json({ data: null, error: { message: e.message } });
    }
  });
  
  router.patch('/:id', authenticateRequest, async (req, res) => {
    const b = req.body;
    const fields = [
      'center_name',
      'branch_id',
      'village',
      'assigned_to',
      'center_day',
      'center_time',
      'contact_person_name',
      'contact_person_number',
      'meeting_place',
      'address1',
      'address2',
      'landmark',
      'pincode',
      'city',
      'district',
      'state',
      'latitude',
      'longitude',
      'status',
      'blacklisted',
      'bc_center_id',
      'parent_center_id',
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
      if (b.branch_id !== undefined) {
        const branch = await getActiveBranchById(b.branch_id);
        if (!branch) {
          return res.status(400).json({
            data: null,
            error: { message: 'Please select a valid active branch before updating this center.' },
          });
        }
      }
  
      const centerTable = quoteIdent(await getCenterTableName());
      await pool.query(
        `UPDATE ${centerTable} SET ${sets.join(', ')}, updated_at = now() WHERE id = $${i}`,
        vals
      );
      const { rows } = await pool.query(
        `
        SELECT c.*,
          b.id AS b_id, b.branch_name AS b_branch_name, b.branch_code AS b_branch_code,
          u1.id AS a_id, u1.first_name AS a_fn, u1.last_name AS a_ln,
          u2.id AS c_id, u2.first_name AS c_fn, u2.last_name AS c_ln
        FROM ${centerTable} c
        LEFT JOIN branches b ON c.branch_id = b.id
        LEFT JOIN user_profiles u1 ON c.assigned_to = u1.id
        LEFT JOIN user_profiles u2 ON c.created_by = u2.id
        WHERE c.id = $1
      `,
        [req.params.id]
      );
      if (!rows.length) {
        return res.status(404).json({ error: 'Not found' });
      }
      const r = rows[0];
      const data = {
        ...stripJoinAliases(r),
        branches: r.b_id
          ? { id: r.b_id, branch_name: r.b_branch_name, branch_code: r.b_branch_code }
          : null,
        assigned_user: r.a_id ? { id: r.a_id, first_name: r.a_fn, last_name: r.a_ln } : null,
        created_user: r.c_id ? { id: r.c_id, first_name: r.c_fn, last_name: r.c_ln } : null,
      };
      return res.json({ data, error: null });
    } catch (e) {
      console.error(e);
      return res.json({ data: null, error: { message: e.message } });
    }
  });
  
  router.delete('/:id', authenticateRequest, async (req, res) => {
    try {
      const centerTable = quoteIdent(await getCenterTableName());
      await pool.query(`DELETE FROM ${centerTable} WHERE id = $1`, [req.params.id]);
      return res.json({ error: null });
    } catch (e) {
      console.error(e);
      return res.json({ error: { message: e.message } });
    }
  });
  
  
  return router;
}
