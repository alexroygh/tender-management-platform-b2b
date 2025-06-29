import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import knex from '../utils/pg.util';
import { signJwt } from '../utils/jwt.util';
import { User } from '../models';

export async function signup(_req: Request, res: Response, data: { email: string; password: string }) {
  const { email, password } = data;
  const hashed = await bcrypt.hash(password, 10);
  try {
    const [user]: User[] = await knex<User>('users')
      .insert({ email, password_hash: hashed })
      .returning(['id', 'email', 'created_at']);
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
  const [user]: User[] = await knex<User>('users').where({ email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
  const token = signJwt({ userId: user.id, email: user.email });
  res.json({ user: { id: user.id, email: user.email, created_at: user.created_at }, token });
}
