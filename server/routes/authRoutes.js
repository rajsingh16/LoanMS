import { Router } from 'express';
import { randomUUID } from 'crypto';
import { createAccessToken, hashPassword, verifyPassword } from '../auth/auth.js';

export function createAuthRoutes({ pool, jwtSecret, authenticateRequest }) {
  const router = Router();

  router.post('/register', async (req, res) => {
    const { email, password, username, first_name, last_name, phone } = req.body || {};
    if (!email || !password || !username || !first_name || !last_name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const client = await pool.connect();
    try {
      const dup = await client.query('SELECT 1 FROM user_credentials WHERE lower(email) = lower($1) OR EXISTS (SELECT 1 FROM user_profiles WHERE lower(username) = lower($2))', [email, username]);
      if (dup.rows.length) return res.status(409).json({ error: 'Email or username already registered' });
      const id = randomUUID();
      const hash = await hashPassword(password);
      await client.query('BEGIN');
      await client.query(
        `INSERT INTO user_profiles (id, username, first_name, last_name, role, branch_id, status, phone, employee_id)
         VALUES ($1, $2, $3, $4, NULL, NULL, 'pending', $5, NULL)`,
        [id, username, first_name, last_name, phone || null]
      );
      await client.query(
        `INSERT INTO user_credentials (user_id, email, password_hash) VALUES ($1, lower($2), $3)`,
        [id, email, hash]
      );
      await client.query('COMMIT');
      return res.status(201).json({ ok: true, message: 'Registration submitted and is pending administrator approval.' });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(error);
      if (error.code === '23505') return res.status(409).json({ error: 'Email, username, or employee ID already registered' });
      return res.status(500).json({ error: 'Registration failed' });
    } finally {
      client.release();
    }
  });

  router.post('/login', async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    try {
      const { rows } = await pool.query(
        `SELECT uc.user_id, uc.password_hash, uc.email, up.status
         FROM user_credentials uc JOIN user_profiles up ON up.id = uc.user_id
         WHERE lower(uc.email) = lower($1)`,
        [email]
      );
      if (!rows.length || !(await verifyPassword(password, rows[0].password_hash))) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      if (rows[0].status === 'pending') return res.status(403).json({ error: 'Your account is pending approval. Please contact your administrator.' });
      if (rows[0].status !== 'active') return res.status(403).json({ error: 'Your account is currently inactive. Please contact your administrator.' });
      const token = createAccessToken(rows[0].user_id, jwtSecret);
      return res.json({ token, user: { id: rows[0].user_id, email: rows[0].email } });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Login failed' });
    }
  });

  router.get('/me', authenticateRequest, async (req, res) => {
    try {
      const { rows } = await pool.query(`SELECT uc.email FROM user_credentials uc JOIN user_profiles up ON up.id = uc.user_id WHERE uc.user_id = $1 AND up.status = 'active'`, [req.userId]);
      if (!rows.length) return res.status(401).json({ error: 'User not found' });
      return res.json({ user: { id: req.userId, email: rows[0].email } });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to load session' });
    }
  });

  return router;
}
