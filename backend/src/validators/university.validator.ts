import { z } from 'zod';

export const createUniversitySchema = z.object({
    body: z.object({
        name: z.string().min(1, 'University name is required'),
        location: z.string().optional(),
        country: z.string().optional(),
        ranking: z.number().optional(),
        acceptanceRate: z.number().min(0).max(100).optional(),
        tuitionFees: z.number().min(0).optional(),
        website: z.string().url().optional(),
        description: z.string().optional(),
        logoUrl: z.string().url().optional(),
    }),
});

export const updateUniversitySchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid university ID'),
    }),
    body: z.object({
        name: z.string().min(1).optional(),
        location: z.string().optional(),
        country: z.string().optional(),
        ranking: z.number().optional(),
        acceptanceRate: z.number().min(0).max(100).optional(),
        tuitionFees: z.number().min(0).optional(),
        website: z.string().url().optional(),
        description: z.string().optional(),
        logoUrl: z.string().url().optional(),
        isActive: z.boolean().optional(),
    }),
});

export const getUniversityByIdSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid university ID'),
    }),
});
