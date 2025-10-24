import { z } from 'zod';

export const createNotificationSchema = z.object({
    body: z.object({
        userId: z.string().uuid('Invalid user ID'),
        title: z.string().min(1, 'Title is required'),
        message: z.string().min(1, 'Message is required'),
        notificationType: z.enum([
            'application_update',
            'message',
            'document',
            'essay',
            'deadline',
            'system',
        ]),
        linkUrl: z.string().optional(),
    }),
});

export const markNotificationAsReadSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid notification ID'),
    }),
});

export const getNotificationByIdSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid notification ID'),
    }),
});
