export function createAreaHelpers({ pool }) {
  async function syncBranchFromArea(area) {
    if (String(area.area_type || '').toLowerCase() !== 'branch') {
      return;
    }

    await pool.query(
      `INSERT INTO branches (branch_code, branch_name, location, status)
       VALUES ($1, $2, $3, 'active')
       ON CONFLICT (branch_code) DO UPDATE
       SET branch_name = EXCLUDED.branch_name,
           location = EXCLUDED.location,
           status = 'active',
           updated_at = now()`,
      [
        area.area_code,
        area.area_name,
        [area.address1, area.district, area.state].filter(Boolean).join(', ') || null,
      ]
    );
  }

  return { syncBranchFromArea };
}
