import { z } from 'zod';

export const createEssaySchema = z.object({
    body: z.object({
        applicationId: z.string().uuid().optional(),
        title: z.string().min(1, 'Title is required'),
        prompt: z.string().optional(),
        content: z.string().optional(),
    }),
});

export const updateEssaySchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid essay ID'),
    }),
    body: z.object({
        title: z.string().min(1).optional(),
        prompt: z.string().optional(),
        content: z.string().optional(),
        status: z.enum(['draft', 'in_review', 'reviewed', 'final']).optional(),
        feedback: z.string().optional(),
    }),
});

export const getEssayByIdSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid essay ID'),
    }),
});
