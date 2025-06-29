import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../utils/pg.util';
import { signJwt } from '../utils/jwt.util';

export async function signup(_req: Request, res: Response, data: { email: string; password: string }) {
  const { email, password } = data;
  const hashed = await bcrypt.hash(password, 10);
  try {
    const result = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
      [email, hashed]
    );
    const user = result.rows[0];
    const token = signJwt({ userId: user.id, email: user.email });
    res.status(201).json({ user, token });
  } catch (err: any) {
    if (err.code === '23505') {
      return res.status(409).json({ message: 'Email already registered' });
    }
    throw err;
  }
}

export async function login(_req: Request, res: Response, data: { email: string; password: string }) {
  const { email, password } = data;
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
  const token = signJwt({ userId: user.id, email: user.email });
  res.json({ user: { id: user.id, email: user.email, created_at: user.created_at }, token });
}
