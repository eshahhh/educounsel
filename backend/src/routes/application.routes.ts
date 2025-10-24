import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import {
    getApplications,
    getApplicationById,
    createApplication,
    updateApplication,
    deleteApplication,
} from '../controllers/application.controller';
import {
    createApplicationSchema,
    updateApplicationSchema,
    getApplicationByIdSchema,
} from '../validators/application.validator';

const router = Router();

// Get all applications
router.get('/', authenticate, getApplications);

// Get application by ID
router.get('/:id', authenticate, validate(getApplicationByIdSchema), getApplicationById);

// Create application
router.post('/', authenticate, validate(createApplicationSchema), createApplication);

// Update application
router.put(
    '/:id',
    authenticate,
    validate(updateApplicationSchema),
    updateApplication
);

// Delete application
router.delete('/:id', authenticate, deleteApplication);

export default router;
