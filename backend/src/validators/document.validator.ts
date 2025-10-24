import { z } from 'zod';

export const createDocumentSchema = z.object({
    body: z.object({
        applicationId: z.string().uuid().optional(),
        documentType: z.enum([
            'transcript',
            'passport',
            'test_score',
            'recommendation',
            'essay',
            'financial',
            'other',
        ]),
    }),
});

export const updateDocumentSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid document ID'),
    }),
    body: z.object({
        reviewerNotes: z.string().optional(),
    }),
});

export const getDocumentByIdSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid document ID'),
    }),
});
