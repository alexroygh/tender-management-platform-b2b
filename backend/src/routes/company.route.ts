import { Router, Request, Response, NextFunction } from 'express';
import { authenticateJWT } from '../middleware/auth.middleware';
import * as companyController from '../controllers/company.controller';

const router = Router();

// CRUD endpoints for company metadata
router.get('/me', authenticateJWT, companyController.getMyCompany);
router.get('/:id', companyController.getCompany);
router.post('/', authenticateJWT, companyController.createOrUpdateCompany);
router.delete('/:id', authenticateJWT, companyController.deleteCompany);

// Image upload (Supabase integration placeholder)
router.post('/:id/logo', authenticateJWT, companyController.uploadLogo);

export default router;
