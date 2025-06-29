import { Request, Response } from 'express';
import knex from '../utils/pg.util';

export async function searchCompanies(req: Request, res: Response): Promise<void> {
  const { name, industry, goods } = req.query;
  let query = knex('companies').distinct('companies.*');
  if (goods) {
    query = query.join('goods_and_services', 'companies.id', 'goods_and_services.company_id')
      .whereILike('goods_and_services.name', `%${goods}%`);
  }
  if (name) {
    query = query.whereILike('companies.name', `%${name}%`);
  }
  if (industry) {
    query = query.whereILike('companies.industry', `%${industry}%`);
  }
  query = query.orderBy('companies.name', 'asc');
  const result = await query;
  res.json(result);
}
