import { Router } from 'express';

export function createClientsRoutes({ pool, authenticateRequest }) {
  const router = Router();

  function calcClientAge(dateOfBirth) {
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age -= 1;
    }
    return age;
  }
  
  function mapClientRow(row) {
    return {
      id: row.id,
      client_id: row.client_id,
      first_name: row.first_name,
      last_name: row.last_name,
      aadhaar_number: row.aadhaar_number,
      voter_card_number: row.voter_card_number,
      kyc_type: row.kyc_type,
      kyc_id: row.kyc_id,
      cycle: row.cycle,
      date_of_birth: row.date_of_birth,
      age: row.age,
      father_name: row.father_name,
      mother_name: row.mother_name,
      gender: row.gender,
      marital_status: row.marital_status,
      mobile_number: row.mobile_number,
      status: row.status,
      qualification: row.qualification,
      language: row.language,
      caste: row.caste,
      religion: row.religion,
      occupation: row.occupation,
      land_holding: row.land_holding,
      monthly_income: row.monthly_income,
      annual_income: row.annual_income,
      household_income: row.household_income,
      monthly_expense: row.monthly_expense,
      monthly_obligation: row.monthly_obligation,
      created_at: row.created_at,
      updated_at: row.updated_at,
      created_user: row.c_id
        ? { id: row.c_id, first_name: row.c_fn, last_name: row.c_ln }
        : null,
    };
  }
  
  function normalizeClientPayload(b) {
    return {
      first_name: b.first_name ?? b.firstName,
      last_name: b.last_name ?? b.lastName,
      aadhaar_number: b.aadhaar_number ?? b.aadhaarNumber,
      voter_card_number: b.voter_card_number ?? b.voterCardNumber,
      kyc_type: b.kyc_type ?? b.kycType,
      kyc_id: b.kyc_id ?? b.kycId,
      cycle: b.cycle,
      date_of_birth: b.date_of_birth ?? b.dateOfBirth,
      father_name: b.father_name ?? b.fatherName,
      mother_name: b.mother_name ?? b.motherName,
      gender: b.gender,
      marital_status: b.marital_status ?? b.maritalStatus,
      mobile_number: b.mobile_number ?? b.mobileNumber,
      status: b.status,
      qualification: b.qualification,
      language: b.language,
      caste: b.caste,
      religion: b.religion,
      occupation: b.occupation,
      land_holding: b.land_holding ?? b.landHolding,
      monthly_income: b.monthly_income ?? b.monthlyIncome,
      annual_income: b.annual_income ?? b.annualIncome,
      household_income: b.household_income ?? b.householdIncome,
      monthly_expense: b.monthly_expense ?? b.monthlyExpense,
      monthly_obligation: b.monthly_obligation ?? b.monthlyObligation,
    };
  }
  
  router.get('', authenticateRequest, async (_req, res) => {
    try {
      const { rows } = await pool.query(`
        SELECT c.*,
          u.id AS c_id, u.first_name AS c_fn, u.last_name AS c_ln
        FROM clients c
        LEFT JOIN user_profiles u ON c.created_by = u.id
        ORDER BY c.created_at DESC
      `);
      return res.json({ data: rows.map(mapClientRow), error: null });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ data: null, error: { message: e.message } });
    }
  });
  
  router.get('/:id', authenticateRequest, async (req, res) => {
    try {
      const { rows } = await pool.query(
        `
        SELECT c.*,
          u.id AS c_id, u.first_name AS c_fn, u.last_name AS c_ln
        FROM clients c
        LEFT JOIN user_profiles u ON c.created_by = u.id
        WHERE c.id = $1
      `,
        [req.params.id]
      );
      if (!rows.length) {
        return res.status(404).json({ data: null, error: { message: 'Not found' } });
      }
      return res.json({ data: mapClientRow(rows[0]), error: null });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ data: null, error: { message: e.message } });
    }
  });
  
  router.post('', authenticateRequest, async (req, res) => {
    const b = normalizeClientPayload(req.body || {});
    const required = [
      'first_name',
      'last_name',
      'aadhaar_number',
      'voter_card_number',
      'kyc_type',
      'kyc_id',
      'date_of_birth',
      'father_name',
      'mother_name',
      'gender',
      'marital_status',
      'mobile_number',
      'qualification',
      'language',
      'caste',
      'religion',
      'occupation',
      'land_holding',
    ];
    const missing = required.filter((field) => !b[field]);
    if (missing.length) {
      return res.status(400).json({
        data: null,
        error: { message: `Missing required fields: ${missing.join(', ')}` },
      });
    }
  
    try {
      const clientId = `CL${String(Date.now()).slice(-6)}`;
      const age = calcClientAge(b.date_of_birth);
  
      const { rows } = await pool.query(
        `INSERT INTO clients (
          client_id, first_name, last_name, aadhaar_number, voter_card_number, kyc_type, kyc_id,
          cycle, date_of_birth, age, father_name, mother_name, gender, marital_status, mobile_number,
          status, qualification, language, caste, religion, occupation, land_holding,
          monthly_income, annual_income, household_income, monthly_expense, monthly_obligation, created_by
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28
        ) RETURNING *`,
        [
          clientId,
          b.first_name,
          b.last_name,
          b.aadhaar_number,
          b.voter_card_number,
          b.kyc_type,
          b.kyc_id,
          b.cycle ?? 1,
          b.date_of_birth,
          age,
          b.father_name,
          b.mother_name,
          b.gender,
          b.marital_status,
          b.mobile_number,
          b.status ?? 'active',
          b.qualification,
          b.language,
          b.caste,
          b.religion,
          b.occupation,
          b.land_holding,
          b.monthly_income ?? 0,
          b.annual_income ?? 0,
          b.household_income ?? 0,
          b.monthly_expense ?? 0,
          b.monthly_obligation ?? 0,
          req.userId,
        ]
      );
  
      const full = await pool.query(
        `
        SELECT c.*,
          u.id AS c_id, u.first_name AS c_fn, u.last_name AS c_ln
        FROM clients c
        LEFT JOIN user_profiles u ON c.created_by = u.id
        WHERE c.id = $1
      `,
        [rows[0].id]
      );
  
      return res.status(201).json({ data: mapClientRow(full.rows[0]), error: null });
    } catch (e) {
      console.error(e);
      if (e.code === '23505') {
        return res.status(409).json({
          data: null,
          error: { message: 'A client with this Aadhaar or client ID already exists.' },
        });
      }
      return res.status(500).json({ data: null, error: { message: e.message } });
    }
  });
  
  router.put('/:id', authenticateRequest, async (req, res) => {
    const b = normalizeClientPayload(req.body || {});
    const fields = [
      'first_name',
      'last_name',
      'aadhaar_number',
      'voter_card_number',
      'kyc_type',
      'kyc_id',
      'cycle',
      'date_of_birth',
      'father_name',
      'mother_name',
      'gender',
      'marital_status',
      'mobile_number',
      'status',
      'qualification',
      'language',
      'caste',
      'religion',
      'occupation',
      'land_holding',
      'monthly_income',
      'annual_income',
      'household_income',
      'monthly_expense',
      'monthly_obligation',
    ];
    const sets = [];
    const vals = [];
    let i = 1;
    for (const field of fields) {
      if (b[field] !== undefined) {
        sets.push(`${field} = $${i++}`);
        vals.push(b[field]);
      }
    }
    if (b.date_of_birth !== undefined) {
      sets.push(`age = $${i++}`);
      vals.push(calcClientAge(b.date_of_birth));
    }
    if (!sets.length) {
      return res.status(400).json({ error: 'No fields' });
    }
    vals.push(req.params.id);
  
    try {
      const { rowCount } = await pool.query(
        `UPDATE clients SET ${sets.join(', ')}, updated_at = now() WHERE id = $${i}`,
        vals
      );
      if (!rowCount) {
        return res.status(404).json({ error: 'Not found' });
      }
  
      const full = await pool.query(
        `
        SELECT c.*,
          u.id AS c_id, u.first_name AS c_fn, u.last_name AS c_ln
        FROM clients c
        LEFT JOIN user_profiles u ON c.created_by = u.id
        WHERE c.id = $1
      `,
        [req.params.id]
      );
  
      return res.json({ data: mapClientRow(full.rows[0]), error: null });
    } catch (e) {
      console.error(e);
      if (e.code === '23505') {
        return res.status(409).json({
          data: null,
          error: { message: 'A client with this Aadhaar number already exists.' },
        });
      }
      return res.status(500).json({ data: null, error: { message: e.message } });
    }
  });
  
  router.delete('/:id', authenticateRequest, async (req, res) => {
    try {
      const { rowCount } = await pool.query(`DELETE FROM clients WHERE id = $1`, [req.params.id]);
      if (!rowCount) {
        return res.status(404).json({ error: 'Not found' });
      }
      return res.json({ error: null });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: { message: e.message } });
    }
  });
  
  
  return router;
}
