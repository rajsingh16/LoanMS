import { Router } from 'express';

export function createBranchesRoutes({ pool }) {
  const router = Router();

  router.get('/', async (_req, res) => {
    try {
      const { rows } = await pool.query(
        `SELECT * FROM branches WHERE status = 'active' ORDER BY branch_name`
      );
      return res.json({ data: rows });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to load branches', data: null });
    }
  });

  return router;
}
