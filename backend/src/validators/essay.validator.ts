import { z } from 'zod';

export const createEssaySchema = z.object({
    body: z.object({
        applicationId: z.string().uuid().optional(),
        title: z.string().min(1, 'Title is required'),
        prompt: z.string().optional(),
        content: z.string().optional(),
        fileName: z.string().min(1, 'File name is required'),
        fileType: z.string().min(1, 'File type is required'),
        fileSize: z.number().min(0, 'File size must be positive'),
        fileUrl: z.string().min(1, 'File URL is required'),
        signedUrl: z.string().optional(),
        studentId: z.string().uuid().optional(),
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
        fileName: z.string().optional(),
        fileType: z.string().optional(),
        fileSize: z.number().min(0).optional(),
        fileUrl: z.string().optional(),
        signedUrl: z.string().optional(),
    }),
});

export const getEssayByIdSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid essay ID'),
    }),
});
