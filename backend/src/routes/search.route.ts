import { Router } from 'express';
import * as searchController from '../controllers/search.controller';

const router = Router();

// Search companies by name, industry, or products/services
router.get('/companies', searchController.searchCompanies);

export default router;
