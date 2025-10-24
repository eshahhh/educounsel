import { z } from 'zod';

export const signupSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        fullName: z.string().min(2, 'Full name is required'),
        role: z.enum(['student', 'counselor', 'school', 'admin']),
        phone: z.string().optional(),
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(1, 'Password is required'),
    }),
});

export const refreshTokenSchema = z.object({
    body: z.object({
        refreshToken: z.string().min(1, 'Refresh token is required'),
    }),
});

export const forgotPasswordSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
    }),
});

export const resetPasswordSchema = z.object({
    body: z.object({
        token: z.string().min(1, 'Reset token is required'),
        newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    }),
});

export const verifyEmailSchema = z.object({
    body: z.object({
        token: z.string().min(1, 'Verification token is required'),
    }),
});
