import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { uploadSingle } from '../middleware/upload';
import {
    getEssays,
    getEssayById,
    createEssay,
    updateEssay,
    deleteEssay,
} from '../controllers/essay.controller';
import {
    createEssaySchema,
    updateEssaySchema,
    getEssayByIdSchema,
} from '../validators/essay.validator';

const router = Router();

// Get all essays
router.get('/', authenticate, getEssays);

// Get essay by ID
router.get('/:id', authenticate, validate(getEssayByIdSchema), getEssayById);

// Create essay
router.post('/', authenticate, validate(createEssaySchema), createEssay);

// Update essay
router.put('/:id', authenticate, validate(updateEssaySchema), updateEssay);

// Delete essay
router.delete('/:id', authenticate, deleteEssay);

export default router;
