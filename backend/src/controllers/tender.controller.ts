import { Request, Response } from 'express';
import pool from '../utils/pg.util';
import { AuthRequest } from '../middleware/auth.middleware';

export async function listTenders(req: Request, res: Response): Promise<void> {
  const { page = 1, limit = 10 } = req.query;
  const offset = ((Number(page) || 1) - 1) * (Number(limit) || 10);
  const result = await pool.query('SELECT * FROM tenders ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
  res.json(result.rows);
}

export async function listCompanyTenders(req: Request, res: Response): Promise<void> {
  const { companyId } = req.params;
  const result = await pool.query('SELECT * FROM tenders WHERE company_id = $1 ORDER BY created_at DESC', [companyId]);
  res.json(result.rows);
}

export async function getTender(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const result = await pool.query('SELECT * FROM tenders WHERE id = $1', [id]);
  const tender = result.rows[0];
  if (!tender) {
    res.status(404).json({ message: 'Tender not found' });
    return;
  }
  res.json(tender);
}

export async function createTender(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user.userId;
  // Find company for user
  const mapping = await pool.query('SELECT company_id FROM user_company_map WHERE user_id = $1', [userId]);
  const company = mapping.rows[0];
  if (!company) {
    res.status(400).json({ message: 'User has no company' });
    return;
  }
  const { title, description, deadline, budget } = req.body;
  const result = await pool.query(
    'INSERT INTO tenders (company_id, title, description, deadline, budget) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [company.company_id, title, description, deadline, budget]
  );
  res.status(201).json(result.rows[0]);
}

export async function updateTender(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user.userId;
  const { id } = req.params;
  // Only allow update if tender belongs to user's company
  const mapping = await pool.query('SELECT company_id FROM user_company_map WHERE user_id = $1', [userId]);
  const company = mapping.rows[0];
  if (!company) {
    res.status(400).json({ message: 'User has no company' });
    return;
  }
  const { title, description, deadline, budget } = req.body;
  const result = await pool.query(
    'UPDATE tenders SET title = $1, description = $2, deadline = $3, budget = $4 WHERE id = $5 AND company_id = $6 RETURNING *',
    [title, description, deadline, budget, id, company.company_id]
  );
  if (!result.rows[0]) {
    res.status(404).json({ message: 'Tender not found or not owned by company' });
    return;
  }
  res.json(result.rows[0]);
}

export async function deleteTender(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user.userId;
  const { id } = req.params;
  // Only allow delete if tender belongs to user's company
  const mapping = await pool.query('SELECT company_id FROM user_company_map WHERE user_id = $1', [userId]);
  const company = mapping.rows[0];
  if (!company) {
    res.status(400).json({ message: 'User has no company' });
    return;
  }
  const result = await pool.query('DELETE FROM tenders WHERE id = $1 AND company_id = $2 RETURNING *', [id, company.company_id]);
  if (!result.rows[0]) {
    res.status(404).json({ message: 'Tender not found or not owned by company' });
    return;
  }
  res.json({ message: 'Tender deleted' });
}
