import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth.middleware';
import * as applicationController from '../controllers/application.controller';

const router = Router();

// Submit proposal
router.post('/', authenticateJWT, applicationController.submitApplication);
// Retrieve all applications per tender
router.get('/tender/:tenderId', authenticateJWT, applicationController.getApplicationsForTender);
// Retrieve all applications for a company
router.get('/company/:companyId', authenticateJWT, applicationController.getApplicationsForCompany);

export default router;
