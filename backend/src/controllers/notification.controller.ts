import { Response, NextFunction } from 'express';
import { AuthRequest, AppError } from '../types';
import { prisma } from '../config/database';
import { getPaginationParams, createPaginationMeta } from '../utils/helpers';
import { logger } from '../utils/logger';

export const getNotifications = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            throw new AppError(401, 'Not authenticated');
        }

        const { page, limit, skip } = getPaginationParams(req);
        const { isRead, notificationType } = req.query;

        const where: any = {
            user_id: req.user.userId,
        };

        if (isRead !== undefined) {
            where.is_read = isRead === 'true';
        }

        if (notificationType) {
            where.notification_type = notificationType;
        }

        const [notifications, total] = await Promise.all([
            prisma.notifications.findMany({
                where,
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
            }),
            prisma.notifications.count({ where }),
        ]);

        res.json({
            success: true,
            data: notifications,
            pagination: createPaginationMeta(page, limit, total),
        });
    } catch (error) {
        next(error);
    }
};

export const getNotificationById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        const notification = await prisma.notifications.findUnique({
            where: { id },
        });

        if (!notification) {
            throw new AppError(404, 'Notification not found');
        }

        if (req.user?.userId !== notification.user_id) {
            throw new AppError(403, 'Access denied');
        }

        res.json({
            success: true,
            data: notification,
        });
    } catch (error) {
        next(error);
    }
};

export const createNotification = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { userId, title, message, notificationType, linkUrl } = req.body;

        const notification = await prisma.notifications.create({
            data: {
                user_id: userId,
                title,
                message,
                notification_type: notificationType,
                link_url: linkUrl,
            },
        });

        logger.info(`Notification created: ${notification.id}`);

        res.status(201).json({
            success: true,
            data: notification,
            message: 'Notification created successfully',
        });
    } catch (error) {
        next(error);
    }
};

export const markNotificationAsRead = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        const notification = await prisma.notifications.findUnique({
            where: { id },
        });

        if (!notification) {
            throw new AppError(404, 'Notification not found');
        }

        if (req.user?.userId !== notification.user_id) {
            throw new AppError(403, 'Access denied');
        }

        await prisma.notifications.update({
            where: { id },
            data: {
                is_read: true,
                read_at: new Date(),
            },
        });

        res.json({
            success: true,
            message: 'Notification marked as read',
        });
    } catch (error) {
        next(error);
    }
};

export const markAllNotificationsAsRead = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            throw new AppError(401, 'Not authenticated');
        }

        await prisma.notifications.updateMany({
            where: {
                user_id: req.user.userId,
                is_read: false,
            },
            data: {
                is_read: true,
                read_at: new Date(),
            },
        });

        res.json({
            success: true,
            message: 'All notifications marked as read',
        });
    } catch (error) {
        next(error);
    }
};

export const deleteNotification = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        const notification = await prisma.notifications.findUnique({
            where: { id },
        });

        if (!notification) {
            throw new AppError(404, 'Notification not found');
        }

        if (req.user?.userId !== notification.user_id) {
            throw new AppError(403, 'Access denied');
        }

        await prisma.notifications.delete({
            where: { id },
        });

        logger.info(`Notification deleted: ${id}`);

        res.json({
            success: true,
            message: 'Notification deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

export const getUnreadCount = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            throw new AppError(401, 'Not authenticated');
        }

        const count = await prisma.notifications.count({
            where: {
                user_id: req.user.userId,
                is_read: false,
            },
        });

        res.json({
            success: true,
            data: { count },
        });
    } catch (error) {
        next(error);
    }
};
