import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import {
    getCalendarEvents,
    getCalendarEventById,
    createCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
} from '../controllers/calendar.controller';
import {
    createCalendarEventSchema,
    updateCalendarEventSchema,
    getCalendarEventByIdSchema,
} from '../validators/calendar.validator';

const router = Router();

// Get all calendar events
router.get('/', authenticate, getCalendarEvents);

// Get calendar event by ID
router.get('/:id', authenticate, validate(getCalendarEventByIdSchema), getCalendarEventById);

// Create calendar event
router.post('/', authenticate, validate(createCalendarEventSchema), createCalendarEvent);

// Update calendar event
router.put(
    '/:id',
    authenticate,
    validate(updateCalendarEventSchema),
    updateCalendarEvent
);

// Delete calendar event
router.delete('/:id', authenticate, deleteCalendarEvent);

export default router;
