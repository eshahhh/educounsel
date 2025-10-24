import { z } from 'zod';

export const updateStudentProfileSchema = z.object({
    body: z.object({
        gradeLevel: z.string().optional(),
        gpa: z.number().min(0).max(4.0).optional(),
        satScore: z.number().min(400).max(1600).optional(),
        actScore: z.number().min(1).max(36).optional(),
        extracurriculars: z.string().optional(),
        interests: z.string().optional(),
        targetMajor: z.string().optional(),
        counselorId: z.string().uuid().optional().nullable(),
        schoolId: z.string().uuid().optional().nullable(),
    }),
});

export const getStudentByIdSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid student ID'),
    }),
});
