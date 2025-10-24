import { z } from 'zod';

export const createApplicationSchema = z.object({
    body: z.object({
        universityId: z.string().uuid('Invalid university ID'),
        programId: z.string().uuid('Invalid program ID').optional(),
        deadline: z.string().optional(),
        notes: z.string().optional(),
    }),
});

export const updateApplicationSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid application ID'),
    }),
    body: z.object({
        status: z.enum([
            'not_started',
            'in_progress',
            'submitted',
            'under_review',
            'accepted',
            'rejected',
            'waitlisted',
        ]).optional(),
        deadline: z.string().optional(),
        submittedAt: z.string().optional(),
        decision: z.string().optional(),
        decisionDate: z.string().optional(),
        notes: z.string().optional(),
    }),
});

export const getApplicationByIdSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid application ID'),
    }),
});
