import { Request, Response } from 'express';
import knex from '../utils/pg.util';
import { AuthRequest } from '../middleware/auth.middleware';
import { Tender, UserCompanyMap } from '../models';

export async function listTenders(req: Request, res: Response): Promise<void> {
  const { page = 1, limit = 10 } = req.query;
  const offset = ((Number(page) || 1) - 1) * (Number(limit) || 10);
  const countResult = await knex<Tender>('tenders').count('id as count');
  const count = (countResult[0] as any).count;
  const result = await knex<Tender>('tenders').orderBy('created_at', 'desc').limit(Number(limit)).offset(Number(offset));
  res.json({ tenders: result, total: Number(count) });
}

export async function listCompanyTenders(req: Request, res: Response): Promise<void> {
  const { companyId } = req.params;
  const result = await knex<Tender>('tenders').where({ company_id: parseInt(companyId) }).orderBy('created_at', 'desc');
  res.json(result);
}

export async function getTender(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const tender = await knex<Tender>('tenders').where({ id: parseInt(id) }).first();
  if (!tender) {
    res.status(404).json({ message: 'Tender not found' });
    return;
  }
  res.json(tender);
}

export async function createTender(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user.userId;
  // Find company for user
  const mapping = await knex<UserCompanyMap>('user_company_map').where({ user_id: userId }).first();
  if (!mapping) {
    res.status(400).json({ message: 'User has no company' });
    return;
  }
  const { title, description, deadline, budget } = req.body;
  const [tender]: Tender[] = await knex<Tender>('tenders')
    .insert({ company_id: mapping.company_id, title, description, deadline, budget })
    .returning('*');
  res.status(201).json(tender);
}

export async function updateTender(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user.userId;
  const { id } = req.params;
  // Only allow update if tender belongs to user's company
  const mapping = await knex<UserCompanyMap>('user_company_map').where({ user_id: userId }).first();
  if (!mapping) {
    res.status(400).json({ message: 'User has no company' });
    return;
  }
  const { title, description, deadline, budget } = req.body;
  const [tender]: Tender[] = await knex<Tender>('tenders')
    .where({ id: parseInt(id), company_id: mapping.company_id })
    .update({ title, description, deadline, budget })
    .returning('*');
  if (!tender) {
    res.status(404).json({ message: 'Tender not found or not owned by company' });
    return;
  }
  res.json(tender);
}

export async function deleteTender(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user.userId;
  const { id } = req.params;
  // Only allow delete if tender belongs to user's company
  const mapping = await knex<UserCompanyMap>('user_company_map').where({ user_id: userId }).first();
  if (!mapping) {
    res.status(400).json({ message: 'User has no company' });
    return;
  }
  const [deleted]: Tender[] = await knex<Tender>('tenders')
    .where({ id: parseInt(id), company_id: mapping.company_id })
    .del()
    .returning('*');
  if (!deleted) {
    res.status(404).json({ message: 'Tender not found or not owned by company' });
    return;
  }
  res.json({ message: 'Tender deleted' });
}
