import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
    getUserProfile,
    updateUserProfile,
    deactivateUser,
} from '../controllers/user.controller';

const router = Router();

// Get user profile
router.get('/:id', authenticate, getUserProfile);

// Update user profile
router.put('/:id', authenticate, updateUserProfile);

// Deactivate user (admin only)
router.post('/:id/deactivate', authenticate, authorize('admin'), deactivateUser);

export default router;
