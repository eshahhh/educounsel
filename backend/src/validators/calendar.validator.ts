import { z } from 'zod';

export const createCalendarEventSchema = z.object({
    body: z.object({
        title: z.string().min(1, 'Title is required'),
        description: z.string().optional(),
        eventType: z.enum([
            'deadline',
            'test',
            'interview',
            'meeting',
            'reminder',
            'other',
        ]),
        eventDate: z.string().min(1, 'Event date is required'),
    }),
});

export const updateCalendarEventSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid event ID'),
    }),
    body: z.object({
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        eventType: z.enum([
            'deadline',
            'test',
            'interview',
            'meeting',
            'reminder',
            'other',
        ]).optional(),
        eventDate: z.string().optional(),
        reminderSent: z.boolean().optional(),
    }),
});

export const getCalendarEventByIdSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid event ID'),
    }),
});
