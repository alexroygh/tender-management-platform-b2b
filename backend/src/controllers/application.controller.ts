import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import knex from '../utils/pg.util';
import { Application, UserCompanyMap, Tender } from '../models';

export async function submitApplication(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user.userId;
  const { tender_id, proposal } = req.body;
  // Find company for user
  const mapping = await knex<UserCompanyMap>('user_company_map').where({ user_id: userId }).first();
  if (!mapping) {
    res.status(400).json({ message: 'User has no company' });
    return;
  }
  // Prevent duplicate application
  const exists = await knex<Application>('applications').where({ tender_id, company_id: mapping.company_id }).first();
  if (exists) {
    res.status(409).json({ message: 'Already applied to this tender' });
    return;
  }
  const [application]: Application[] = await knex<Application>('applications')
    .insert({ tender_id, company_id: mapping.company_id, proposal })
    .returning('*');
  res.status(201).json(application);
}

export async function getApplicationsForTender(req: AuthRequest, res: Response): Promise<void> {
  const { tenderId } = req.params;
  const result = await knex<Application>('applications').where({ tender_id: parseInt(tenderId) });
  res.json(result);
}

export async function getApplicationsForCompany(req: AuthRequest, res: Response): Promise<void> {
  const { companyId } = req.params;
  if (!/^[0-9]+$/.test(companyId)) {
    res.status(400).json({ message: 'Invalid company id' });
    return;
  }
  const result = await knex<Application>('applications')
    .join<Tender>('tenders', 'applications.tender_id', 'tenders.id')
    .select('applications.*', 'tenders.title as tender_title', 'tenders.deadline as tender_deadline')
    .where('applications.company_id', parseInt(companyId))
    .orderBy('applications.created_at', 'desc');
  res.json(result);
}
