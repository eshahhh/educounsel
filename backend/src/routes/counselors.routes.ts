import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getCounselors } from '../controllers/counselors.controller';

const router = Router();

// Get all counselors
router.get('/', authenticate, getCounselors);

export default router;