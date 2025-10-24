import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import {
    getMessages,
    getMessageById,
    createMessage,
    markMessageAsRead,
    deleteMessage,
} from '../controllers/message.controller';
import {
    createMessageSchema,
    getMessageByIdSchema,
    markMessageAsReadSchema,
} from '../validators/message.validator';

const router = Router();

// Get all messages (inbox/sent)
router.get('/', authenticate, getMessages);

// Get message by ID
router.get('/:id', authenticate, validate(getMessageByIdSchema), getMessageById);

// Create message (send)
router.post('/', authenticate, validate(createMessageSchema), createMessage);

// Mark message as read
router.patch(
    '/:id/read',
    authenticate,
    validate(markMessageAsReadSchema),
    markMessageAsRead
);

// Delete message
router.delete('/:id', authenticate, deleteMessage);

export default router;
