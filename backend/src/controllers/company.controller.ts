import { Request, Response } from 'express';
import knex from '../utils/pg.util';
import { supabase } from '../utils/supabase.util';
import { AuthRequest } from '../middleware/auth.middleware';
import { Company, GoodsAndServices, UserCompanyMap } from '../models';

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
  const company = await knex<Company>('companies').where({ id: parseInt(id) }).first();
  if (!company) {
    res.status(404).json({ message: 'Company not found' });
    return;
  }
  const goods = await knex<GoodsAndServices>('goods_and_services').where({ company_id: parseInt(id) });
  (company as any).goods_and_services = goods.map((g) => g.name);
  (company as any).logo_url = getCompanyLogoUrl(company.id);
  res.json(company);
}

export async function createOrUpdateCompany(req: Request, res: Response): Promise<void> {
  console.log('createOrUpdateCompany req.body:', req.body);
  const userId = (req as AuthRequest).user.userId;
  const { name, industry, description, goods_and_services } = req.body;
  // Create company
  const [company]: Company[] = await knex<Company>('companies')
    .insert({ name, industry, description })
    .returning('*');
  // Map user to company
  await knex<UserCompanyMap>('user_company_map').insert({ user_id: userId, company_id: company.id }).onConflict(['user_id', 'company_id']).ignore();
  // Upsert goods_and_services
  if (Array.isArray(goods_and_services)) {
    await knex<GoodsAndServices>('goods_and_services').where({ company_id: company.id }).del();
    for (const g of goods_and_services) {
      await knex<GoodsAndServices>('goods_and_services').insert({ company_id: company.id, name: g });
    }
  }
  (company as any).logo_url = getCompanyLogoUrl(company.id);
  res.json(company);
}

export async function deleteCompany(req: Request, res: Response): Promise<void> {
  const userId = (req as AuthRequest).user.userId;
  // Find company id(s) for user
  const mapping = await knex<UserCompanyMap>('user_company_map').where({ user_id: userId });
  for (const row of mapping) {
    await knex<Company>('companies').where({ id: row.company_id }).del();
    await knex<UserCompanyMap>('user_company_map').where({ user_id: userId, company_id: row.company_id }).del();
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
  const company = await knex<UserCompanyMap>('user_company_map').where({ user_id: userId }).first();
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

export async function getMyCompany(req: AuthRequest, res: Response): Promise<void> {
  const userId = parseInt(req.user.userId);
  const mapping = await knex<UserCompanyMap>('user_company_map').where({ user_id: userId });
  const companyId = mapping[0]?.company_id;
  if (!companyId) {
    res.status(404).json({ message: 'No company found for user' });
    return;
  }
  const company = await knex<Company>('companies').where({ id: companyId }).first();
  if (!company) {
    res.status(404).json({ message: 'Company not found' });
    return;
  }
  const goods = await knex<GoodsAndServices>('goods_and_services').where({ company_id: company.id });
  (company as any).goods_and_services = goods.map((g) => g.name);
  (company as any).logo_url = getCompanyLogoUrl(company.id);
  res.json(company);
}

export async function getCompanyByUserId(req: Request, res: Response): Promise<void> {
  const { userId } = req.params;
  if (!/^[0-9]+$/.test(userId)) {
    res.status(400).json({ message: 'Invalid user id' });
    return;
  }
  const mapping = await knex<UserCompanyMap>('user_company_map').where({ user_id: parseInt(userId) });
  const companyId = mapping[0]?.company_id;
  if (!companyId) {
    res.status(404).json({ message: 'No company found for user' });
    return;
  }
  const company = await knex<Company>('companies').where({ id: companyId }).first();
  if (!company) {
    res.status(404).json({ message: 'Company not found' });
    return;
  }
  const goods = await knex<GoodsAndServices>('goods_and_services').where({ company_id: company.id });
  (company as any).goods_and_services = goods.map((g) => g.name);
  res.json(company);
}
