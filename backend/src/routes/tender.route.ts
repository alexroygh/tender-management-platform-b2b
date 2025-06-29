import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth.middleware';
import * as tenderController from '../controllers/tender.controller';

const router = Router();

// List all tenders (paginated)
router.get('/', tenderController.listTenders);
// Company-specific tenders (auth required)
router.get('/company/:companyId', authenticateJWT, tenderController.listCompanyTenders);
// CRUD endpoints
router.get('/:id', tenderController.getTender);
router.post('/', authenticateJWT, tenderController.createTender);
router.put('/:id', authenticateJWT, tenderController.updateTender);
router.delete('/:id', authenticateJWT, tenderController.deleteTender);

export default router;
