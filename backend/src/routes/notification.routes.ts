import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import {
    getNotifications,
    getNotificationById,
    createNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    getUnreadCount,
} from '../controllers/notification.controller';
import {
    createNotificationSchema,
    markNotificationAsReadSchema,
    getNotificationByIdSchema,
} from '../validators/notification.validator';

const router = Router();

// Get all notifications
router.get('/', authenticate, getNotifications);

// Get unread count
router.get('/unread/count', authenticate, getUnreadCount);

// Get notification by ID
router.get('/:id', authenticate, validate(getNotificationByIdSchema), getNotificationById);

// Create notification (admin/counselor only)
router.post(
    '/',
    authenticate,
    authorize('admin', 'counselor'),
    validate(createNotificationSchema),
    createNotification
);

// Mark notification as read
router.patch(
    '/:id/read',
    authenticate,
    validate(markNotificationAsReadSchema),
    markNotificationAsRead
);

// Mark all notifications as read
router.patch('/read-all', authenticate, markAllNotificationsAsRead);

// Delete notification
router.delete('/:id', authenticate, deleteNotification);

export default router;
