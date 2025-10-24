import { Router } from 'express';
import {
    signup,
    login,
    refreshAccessToken,
    logout,
    getMe,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerificationEmail,
} from '../controllers/auth.controller';
import { validate } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { authRateLimiter } from '../middleware/rateLimit';
import {
    signupSchema,
    loginSchema,
    refreshTokenSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    verifyEmailSchema,
} from '../validators/auth.validator';

const router = Router();

// Public routes
router.post('/signup', authRateLimiter, validate(signupSchema), signup);
router.post('/login', authRateLimiter, validate(loginSchema), login);
router.post('/refresh', validate(refreshTokenSchema), refreshAccessToken);

// Password reset routes
router.post('/forgot-password', authRateLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', authRateLimiter, validate(resetPasswordSchema), resetPassword);

// Email verification routes
router.post('/verify-email', validate(verifyEmailSchema), verifyEmail);
router.post('/resend-verification', authenticate, resendVerificationEmail);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);

export default router;
