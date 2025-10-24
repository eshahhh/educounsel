import { Response, NextFunction } from 'express';
import { AuthRequest, AppError } from '../types';
import { prisma } from '../config/database';
import { getPaginationParams, createPaginationMeta } from '../utils/helpers';
import { logger } from '../utils/logger';

export const getMessages = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            throw new AppError(401, 'Not authenticated');
        }

        const { page, limit, skip } = getPaginationParams(req);
        const { folder = 'inbox' } = req.query;

        const where: any = {};

        if (folder === 'inbox') {
            where.recipient_id = req.user.userId;
        } else if (folder === 'sent') {
            where.sender_id = req.user.userId;
        }

        const [messages, total] = await Promise.all([
            prisma.messages.findMany({
                where,
                skip,
                take: limit,
                include: {
                    sender: {
                        select: {
                            id: true,
                            full_name: true,
                            email: true,
                        },
                    },
                    recipient: {
                        select: {
                            id: true,
                            full_name: true,
                            email: true,
                        },
                    },
                },
                orderBy: { created_at: 'desc' },
            }),
            prisma.messages.count({ where }),
        ]);

        res.json({
            success: true,
            data: messages,
            pagination: createPaginationMeta(page, limit, total),
        });
    } catch (error) {
        next(error);
    }
};

export const getMessageById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        const message = await prisma.messages.findUnique({
            where: { id },
            include: {
                sender: {
                    select: {
                        id: true,
                        full_name: true,
                        email: true,
                    },
                },
                recipient: {
                    select: {
                        id: true,
                        full_name: true,
                        email: true,
                    },
                },
                replies: {
                    include: {
                        sender: {
                            select: {
                                id: true,
                                full_name: true,
                            },
                        },
                    },
                    orderBy: { created_at: 'asc' },
                },
            },
        });

        if (!message) {
            throw new AppError(404, 'Message not found');
        }

        if (
            req.user?.userId !== message.sender_id &&
            req.user?.userId !== message.recipient_id
        ) {
            throw new AppError(403, 'Access denied');
        }

        res.json({
            success: true,
            data: message,
        });
    } catch (error) {
        next(error);
    }
};

export const createMessage = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            throw new AppError(401, 'Not authenticated');
        }

        const { recipientId, subject, content, parentMessageId } = req.body;

        const message = await prisma.messages.create({
            data: {
                sender_id: req.user.userId,
                recipient_id: recipientId,
                subject,
                content,
                parent_message_id: parentMessageId || null,
            },
            include: {
                recipient: {
                    select: {
                        id: true,
                        full_name: true,
                        email: true,
                    },
                },
            },
        });

        await prisma.notifications.create({
            data: {
                user_id: recipientId,
                title: 'New Message',
                message: `You have a new message from ${req.user.email}`,
                notification_type: 'message',
                link_url: `/messages/${message.id}`,
            },
        });

        logger.info(`Message sent: ${message.id}`);

        res.status(201).json({
            success: true,
            data: message,
            message: 'Message sent successfully',
        });
    } catch (error) {
        next(error);
    }
};

export const markMessageAsRead = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        const message = await prisma.messages.findUnique({
            where: { id },
        });

        if (!message) {
            throw new AppError(404, 'Message not found');
        }

        if (req.user?.userId !== message.recipient_id) {
            throw new AppError(403, 'Access denied');
        }

        await prisma.messages.update({
            where: { id },
            data: {
                is_read: true,
                read_at: new Date(),
            },
        });

        res.json({
            success: true,
            message: 'Message marked as read',
        });
    } catch (error) {
        next(error);
    }
};

export const deleteMessage = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        const message = await prisma.messages.findUnique({
            where: { id },
        });

        if (!message) {
            throw new AppError(404, 'Message not found');
        }

        if (
            req.user?.userId !== message.sender_id &&
            req.user?.userId !== message.recipient_id
        ) {
            throw new AppError(403, 'Access denied');
        }

        await prisma.messages.delete({
            where: { id },
        });

        logger.info(`Message deleted: ${id}`);

        res.json({
            success: true,
            message: 'Message deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};
