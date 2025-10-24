import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import {
    getUniversities,
    getUniversityById,
    createUniversity,
    updateUniversity,
    deleteUniversity,
    getUniversityPrograms,
} from '../controllers/university.controller';
import {
    createUniversitySchema,
    updateUniversitySchema,
    getUniversityByIdSchema,
} from '../validators/university.validator';

const router = Router();

// Get all universities (public for authenticated users)
router.get('/', authenticate, getUniversities);

// Get university by ID
router.get('/:id', authenticate, validate(getUniversityByIdSchema), getUniversityById);

// Create university (admin only)
router.post(
    '/',
    authenticate,
    authorize('admin'),
    validate(createUniversitySchema),
    createUniversity
);

// Update university (admin only)
router.put(
    '/:id',
    authenticate,
    authorize('admin'),
    validate(updateUniversitySchema),
    updateUniversity
);

// Delete university (admin only)
router.delete('/:id', authenticate, authorize('admin'), deleteUniversity);

// Get university programs
router.get('/:id/programs', authenticate, getUniversityPrograms);

export default router;
