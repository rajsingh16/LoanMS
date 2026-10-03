export function quoteIdent(identifier) {
  return `"${String(identifier).replace(/"/g, '""')}"`;
}

export function createCenterHelpers({ pool }) {
  let resolvedCenterTable = null;

  async function getCenterTableName() {
    if (resolvedCenterTable) return resolvedCenterTable;
    const preferred = await pool.query(
      `SELECT tablename FROM pg_catalog.pg_tables
       WHERE schemaname = 'public' AND tablename IN ('centers', 'center')
       ORDER BY CASE tablename WHEN 'centers' THEN 0 WHEN 'center' THEN 1 ELSE 2 END
       LIMIT 1`
    );
    if (preferred.rows[0]?.tablename) {
      resolvedCenterTable = preferred.rows[0].tablename;
      return resolvedCenterTable;
    }
    const fallback = await pool.query(
      `SELECT table_name FROM information_schema.columns
       WHERE table_schema = 'public' AND column_name IN ('center_code', 'center_name', 'branch_id')
       GROUP BY table_name HAVING COUNT(DISTINCT column_name) = 3
       ORDER BY table_name LIMIT 1`
    );
    if (fallback.rows[0]?.table_name) {
      resolvedCenterTable = fallback.rows[0].table_name;
      return resolvedCenterTable;
    }
    throw new Error('Center table not found in database schema');
  }

  async function getActiveBranchById(branchId) {
    if (!branchId) return null;
    const { rows } = await pool.query(
      `SELECT id, branch_code, branch_name FROM branches WHERE id = $1 AND status = 'active'`,
      [branchId]
    );
    return rows[0] || null;
  }

  return { getCenterTableName, getActiveBranchById };
}
