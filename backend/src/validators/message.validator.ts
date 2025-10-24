import { z } from 'zod';

export const createMessageSchema = z.object({
    body: z.object({
        recipientId: z.string().uuid('Invalid recipient ID'),
        subject: z.string().optional(),
        content: z.string().min(1, 'Message content is required'),
        parentMessageId: z.string().uuid().optional(),
    }),
});

export const getMessageByIdSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid message ID'),
    }),
});

export const markMessageAsReadSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid message ID'),
    }),
});
