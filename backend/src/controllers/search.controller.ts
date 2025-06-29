import { Request, Response } from 'express';
import pool from '../utils/pg.util';

export async function searchCompanies(req: Request, res: Response): Promise<void> {
  const { name, industry, goods } = req.query;
  let query = 'SELECT DISTINCT c.* FROM companies c';
  const params: any[] = [];
  let where = [];
  if (goods) {
    query += ' JOIN goods_and_services g ON c.id = g.company_id';
    where.push(`g.name ILIKE $${params.length + 1}`);
    params.push(`%${goods}%`);
  }
  if (name) {
    where.push(`c.name ILIKE $${params.length + 1}`);
    params.push(`%${name}%`);
  }
  if (industry) {
    where.push(`c.industry ILIKE $${params.length + 1}`);
    params.push(`%${industry}%`);
  }
  if (where.length > 0) {
    query += ' WHERE ' + where.join(' AND ');
  }
  query += ' ORDER BY c.name ASC';
  const result = await pool.query(query, params);
  res.json(result.rows);
}
