import { Request, Response } from 'express';
import pool from '../utils/pg.util';
import { supabase } from '../utils/supabase.util';
import { AuthRequest } from '../middleware/auth.middleware';

function getCompanyLogoUrl(companyId: number): string {
  const { data } = supabase.storage.from('company-logos').getPublicUrl(`${companyId}.png`);
  return data.publicUrl;
}

export async function getCompany(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  if (!/^[0-9]+$/.test(id)) {
    res.status(400).json({ message: 'Invalid company id' });
    return;
  }
  const result = await pool.query('SELECT * FROM companies WHERE id = $1', [parseInt(id)]);
  const company = result.rows[0];
  if (!company) {
    res.status(404).json({ message: 'Company not found' });
    return;
  }
  const goods = await pool.query('SELECT name FROM goods_and_services WHERE company_id = $1', [id]);
  company.goods_and_services = goods.rows.map((g) => g.name);
  company.logo_url = getCompanyLogoUrl(company.id);
  res.json(company);
}

export async function createOrUpdateCompany(req: Request, res: Response): Promise<void> {
  console.log('createOrUpdateCompany req.body:', req.body);
  const userId = (req as AuthRequest).user.userId;
  const { name, industry, description, goods_and_services } = req.body;
  // Create company
  const insert = await pool.query(
    `INSERT INTO companies (name, industry, description)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [name, industry, description]
  );
  const company = insert.rows[0];
  // Map user to company
  await pool.query('INSERT INTO user_company_map (user_id, company_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [userId, company.id]);
  // Upsert goods_and_services
  if (Array.isArray(goods_and_services)) {
    await pool.query('DELETE FROM goods_and_services WHERE company_id = $1', [company.id]);
    for (const g of goods_and_services) {
      await pool.query('INSERT INTO goods_and_services (company_id, name) VALUES ($1, $2)', [company.id, g]);
    }
  }
  company.logo_url = getCompanyLogoUrl(company.id);
  res.json(company);
}

export async function deleteCompany(req: Request, res: Response): Promise<void> {
  const userId = (req as AuthRequest).user.userId;
  // Find company id(s) for user
  const mapping = await pool.query('SELECT company_id FROM user_company_map WHERE user_id = $1', [userId]);
  for (const row of mapping.rows) {
    await pool.query('DELETE FROM companies WHERE id = $1', [row.company_id]);
    await pool.query('DELETE FROM user_company_map WHERE user_id = $1 AND company_id = $2', [userId, row.company_id]);
  }
  res.json({ message: 'Company deleted' });
}

export async function uploadLogo(req: Request, res: Response): Promise<void> {
  const userId = (req as AuthRequest).user.userId;
  const { image } = req.body;
  if (!image) {
    res.status(400).json({ message: 'Missing image' });
    return;
  }
  // Find company for user
  const mapping = await pool.query('SELECT company_id FROM user_company_map WHERE user_id = $1', [userId]);
  const company = mapping.rows[0];
  if (!company) {
    res.status(400).json({ message: 'User has no company' });
    return;
  }
  const filename = `${company.company_id}.png`;
  // Upload to Supabase
  const buffer = Buffer.from(image, 'base64');
  const { data, error } = await supabase.storage.from('company-logos').upload(filename, buffer, {
    contentType: 'image/png',
    upsert: true,
  });
  if (error) {
    res.status(500).json({ message: 'Supabase upload failed', error });
    return;
  }
  const publicUrl = getCompanyLogoUrl(company.company_id);
  res.json({ logo_url: publicUrl });
}

// Get current user's company
export async function getMyCompany(req: AuthRequest, res: Response): Promise<void> {
  const userId = parseInt(req.user.userId);
  const mapping = await pool.query('SELECT company_id FROM user_company_map WHERE user_id = $1', [userId]);
  const companyId = mapping.rows[0]?.company_id;
  if (!companyId) {
    res.status(404).json({ message: 'No company found for user' });
    return;
  }
  const result = await pool.query('SELECT * FROM companies WHERE id = $1', [companyId]);
  const company = result.rows[0];
  if (!company) {
    res.status(404).json({ message: 'Company not found' });
    return;
  }
  const goods = await pool.query('SELECT name FROM goods_and_services WHERE company_id = $1', [company.id]);
  company.goods_and_services = goods.rows.map((g) => g.name);
  company.logo_url = getCompanyLogoUrl(company.id);
  res.json(company);
}

export async function getCompanyByUserId(req: Request, res: Response): Promise<void> {
  const { userId } = req.params;
  if (!/^[0-9]+$/.test(userId)) {
    res.status(400).json({ message: 'Invalid user id' });
    return;
  }
  const mapping = await pool.query('SELECT company_id FROM user_company_map WHERE user_id = $1', [parseInt(userId)]);
  const companyId = mapping.rows[0]?.company_id;
  if (!companyId) {
    res.status(404).json({ message: 'No company found for user' });
    return;
  }
  const result = await pool.query('SELECT * FROM companies WHERE id = $1', [companyId]);
  const company = result.rows[0];
  if (!company) {
    res.status(404).json({ message: 'Company not found' });
    return;
  }
  const goods = await pool.query('SELECT name FROM goods_and_services WHERE company_id = $1', [company.id]);
  company.goods_and_services = goods.rows.map((g) => g.name);
  res.json(company);
}
