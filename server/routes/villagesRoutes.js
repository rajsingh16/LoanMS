import { Router } from 'express';

export function createVillagesRoutes({ pool, authenticateRequest }) {
  const router = Router();

  function mapVillageRow(row) {
    return {
      id: row.id,
      village_id: row.village_id,
      village_name: row.village_name,
      village_code: row.village_code,
      branch_id: row.branch_id,
      status: row.status,
      village_classification: row.village_classification,
      pincode: row.pincode,
      city: row.city,
      country_name: row.country_name,
      district: row.district,
      post_office: row.post_office,
      mohalla_name: row.mohalla_name,
      panchayat_name: row.panchayat_name,
      police_station: row.police_station,
      contact_person_name: row.contact_person_name,
      contact_person_number: row.contact_person_number,
      language: row.language,
      customer_base_expected: row.customer_base_expected,
      distance_from_branch: row.distance_from_branch,
      bank_distance: row.bank_distance,
      nearest_bank_name: row.nearest_bank_name,
      hospital_distance: row.hospital_distance,
      nearest_hospital_name: row.nearest_hospital_name,
      police_station_distance: row.police_station_distance,
      population: row.population,
      road_type: row.road_type,
      school_type: row.school_type,
      hospital_type: row.hospital_type,
      religion_majority: row.religion_majority,
      category: row.category,
      is_primary_health_centre: row.is_primary_health_centre,
      is_politically_influenced: row.is_politically_influenced,
      number_of_schools: row.number_of_schools,
      total_clinics: row.total_clinics,
      total_kiryana_stores: row.total_kiryana_stores,
      total_kutcha_houses: row.total_kutcha_houses,
      total_pakka_houses: row.total_pakka_houses,
      latitude: row.latitude,
      longitude: row.longitude,
      created_at: row.created_at,
      updated_at: row.updated_at,
      branches: row.b_id
        ? { id: row.b_id, branch_name: row.b_branch_name, branch_code: row.b_branch_code }
        : null,
      created_user: row.c_id ? { id: row.c_id, first_name: row.c_fn, last_name: row.c_ln } : null,
    };
  }
  
  router.get('', authenticateRequest, async (_req, res) => {
    try {
      const { rows } = await pool.query(`
        SELECT v.*,
          b.id AS b_id, b.branch_name AS b_branch_name, b.branch_code AS b_branch_code,
          u.id AS c_id, u.first_name AS c_fn, u.last_name AS c_ln
        FROM villages v
        LEFT JOIN branches b ON v.branch_id = b.id
        LEFT JOIN user_profiles u ON v.created_by = u.id
        ORDER BY v.created_at DESC
      `);
      return res.json({ data: rows.map(mapVillageRow), error: null });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ data: null, error: { message: e.message } });
    }
  });
  
  router.post('', authenticateRequest, async (req, res) => {
    const b = req.body || {};
    try {
      const villageId = `VIL${String(Date.now()).slice(-6)}`;
      const villageCode = `${String(b.village_name || 'VIL').replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 4) || 'VIL'}${String(Date.now()).slice(-4)}`;
  
      const { rows } = await pool.query(
        `INSERT INTO villages (
          village_id, village_name, village_code, branch_id, status, village_classification,
          pincode, city, country_name, district, post_office, mohalla_name, panchayat_name,
          police_station, contact_person_name, contact_person_number, language, customer_base_expected,
          distance_from_branch, bank_distance, nearest_bank_name, hospital_distance, nearest_hospital_name,
          police_station_distance, population, road_type, school_type, hospital_type, religion_majority,
          category, created_by
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31
        ) RETURNING *`,
        [
          villageId,
          b.village_name,
          villageCode,
          b.branch_id,
          b.status ?? 'active',
          b.village_classification,
          b.pincode,
          b.city ?? null,
          b.country_name ?? 'India',
          b.district,
          b.post_office,
          b.mohalla_name,
          b.panchayat_name,
          b.police_station,
          b.contact_person_name,
          b.contact_person_number ?? null,
          b.language,
          b.customer_base_expected ?? 0,
          b.distance_from_branch ?? 0,
          b.bank_distance ?? 0,
          b.nearest_bank_name,
          b.hospital_distance ?? 0,
          b.nearest_hospital_name,
          b.police_station_distance ?? 0,
          b.population ?? 0,
          b.road_type,
          b.school_type,
          b.hospital_type,
          b.religion_majority,
          b.category,
          req.userId,
        ]
      );
  
      const full = await pool.query(`
        SELECT v.*,
          b.id AS b_id, b.branch_name AS b_branch_name, b.branch_code AS b_branch_code,
          u.id AS c_id, u.first_name AS c_fn, u.last_name AS c_ln
        FROM villages v
        LEFT JOIN branches b ON v.branch_id = b.id
        LEFT JOIN user_profiles u ON v.created_by = u.id
        WHERE v.id = $1
      `, [rows[0].id]);
  
      return res.status(201).json({ data: mapVillageRow(full.rows[0]), error: null });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ data: null, error: { message: e.message } });
    }
  });
  
  router.put('/:id', authenticateRequest, async (req, res) => {
    const b = req.body || {};
    const fields = [
      'branch_id',
      'status',
      'village_name',
      'village_classification',
      'pincode',
      'city',
      'country_name',
      'district',
      'post_office',
      'mohalla_name',
      'panchayat_name',
      'police_station',
      'contact_person_name',
      'contact_person_number',
      'language',
      'customer_base_expected',
      'distance_from_branch',
      'bank_distance',
      'nearest_bank_name',
      'hospital_distance',
      'nearest_hospital_name',
      'police_station_distance',
      'population',
      'road_type',
      'school_type',
      'hospital_type',
      'religion_majority',
      'category',
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
    if (!sets.length) {
      return res.status(400).json({ error: 'No fields' });
    }
    vals.push(req.params.id);
  
    try {
      const { rowCount } = await pool.query(
        `UPDATE villages SET ${sets.join(', ')}, updated_at = now() WHERE id = $${i}`,
        vals
      );
      if (!rowCount) {
        return res.status(404).json({ error: 'Not found' });
      }
  
      const full = await pool.query(`
        SELECT v.*,
          b.id AS b_id, b.branch_name AS b_branch_name, b.branch_code AS b_branch_code,
          u.id AS c_id, u.first_name AS c_fn, u.last_name AS c_ln
        FROM villages v
        LEFT JOIN branches b ON v.branch_id = b.id
        LEFT JOIN user_profiles u ON v.created_by = u.id
        WHERE v.id = $1
      `, [req.params.id]);
  
      return res.json({ data: mapVillageRow(full.rows[0]), error: null });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ data: null, error: { message: e.message } });
    }
  });
  
  router.delete('/:id', authenticateRequest, async (req, res) => {
    try {
      const { rowCount } = await pool.query(`DELETE FROM villages WHERE id = $1`, [req.params.id]);
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
