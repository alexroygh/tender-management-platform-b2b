import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import pool from '../utils/pg.util';

export async function submitApplication(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user.userId;
  const { tender_id, proposal } = req.body;
  // Find company for user
  const mapping = await pool.query('SELECT company_id FROM user_company_map WHERE user_id = $1', [userId]);
  const company = mapping.rows[0];
  if (!company) {
    res.status(400).json({ message: 'User has no company' });
    return;
  }
  // Prevent duplicate application
  const exists = await pool.query('SELECT id FROM applications WHERE tender_id = $1 AND company_id = $2', [tender_id, company.company_id]);
  if (exists.rows.length > 0) {
    res.status(409).json({ message: 'Already applied to this tender' });
    return;
  }
  const result = await pool.query(
    'INSERT INTO applications (tender_id, company_id, proposal) VALUES ($1, $2, $3) RETURNING *',
    [tender_id, company.company_id, proposal]
  );
  res.status(201).json(result.rows[0]);
}

export async function getApplicationsForTender(req: AuthRequest, res: Response): Promise<void> {
  const { tenderId } = req.params;
  const result = await pool.query('SELECT * FROM applications WHERE tender_id = $1', [tenderId]);
  res.json(result.rows);
}

export async function getApplicationsForCompany(req: AuthRequest, res: Response): Promise<void> {
  const { companyId } = req.params;
  if (!/^[0-9]+$/.test(companyId)) {
    res.status(400).json({ message: 'Invalid company id' });
    return;
  }
  const result = await pool.query(
    `SELECT a.*, t.title as tender_title, t.deadline as tender_deadline
     FROM applications a
     JOIN tenders t ON a.tender_id = t.id
     WHERE a.company_id = $1
     ORDER BY a.created_at DESC`,
    [parseInt(companyId)]
  );
  res.json(result.rows);
}
