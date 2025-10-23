import { Router } from 'express';
import {
    signup,
    login,
    refreshAccessToken,
    logout,
    getMe,
} from '../controllers/auth.controller';
import { validate } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { authRateLimiter } from '../middleware/rateLimit';
import {
    signupSchema,
    loginSchema,
    refreshTokenSchema,
} from '../validators/auth.validator';

const router = Router();

router.post('/signup', authRateLimiter, validate(signupSchema), signup);
router.post('/login', authRateLimiter, validate(loginSchema), login);
router.post('/refresh', validate(refreshTokenSchema), refreshAccessToken);

router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);

export default router;
