import { Response, NextFunction } from 'express';
import { AuthRequest, AppError } from '../types';
import { prisma } from '../config/database';
import { getPaginationParams, createPaginationMeta } from '../utils/helpers';
import { logger } from '../utils/logger';

export const getCalendarEvents = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            throw new AppError(401, 'Not authenticated');
        }

        const { page, limit, skip } = getPaginationParams(req);
        const { eventType, startDate, endDate } = req.query;

        const where: any = {};

        if (req.user.role === 'student') {
            where.student_id = req.user.userId;
        } else if (req.query.studentId) {
            where.student_id = req.query.studentId;
        }

        if (eventType) {
            where.event_type = eventType;
        }

        if (startDate || endDate) {
            where.event_date = {};
            if (startDate) where.event_date.gte = new Date(startDate as string);
            if (endDate) where.event_date.lte = new Date(endDate as string);
        }

        const [events, total] = await Promise.all([
            prisma.calendar_events.findMany({
                where,
                skip,
                take: limit,
                include: {
                    student: {
                        select: {
                            id: true,
                            full_name: true,
                            email: true,
                        },
                    },
                },
                orderBy: { event_date: 'asc' },
            }),
            prisma.calendar_events.count({ where }),
        ]);

        res.json({
            success: true,
            data: events,
            pagination: createPaginationMeta(page, limit, total),
        });
    } catch (error) {
        next(error);
    }
};

export const getCalendarEventById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        const event = await prisma.calendar_events.findUnique({
            where: { id },
            include: {
                student: {
                    select: {
                        id: true,
                        full_name: true,
                        email: true,
                    },
                },
            },
        });

        if (!event) {
            throw new AppError(404, 'Event not found');
        }

        if (req.user?.role === 'student' && req.user.userId !== event.student_id) {
            throw new AppError(403, 'Access denied');
        }

        res.json({
            success: true,
            data: event,
        });
    } catch (error) {
        next(error);
    }
};

export const createCalendarEvent = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            throw new AppError(401, 'Not authenticated');
        }

        const { title, description, eventType, eventDate } = req.body;

        const studentId =
            req.user.role === 'student' ? req.user.userId : req.body.studentId;

        if (!studentId) {
            throw new AppError(400, 'Student ID is required');
        }

        const event = await prisma.calendar_events.create({
            data: {
                student_id: studentId,
                title,
                description,
                event_type: eventType,
                event_date: new Date(eventDate),
            },
        });

        logger.info(`Calendar event created: ${event.id}`);

        res.status(201).json({
            success: true,
            data: event,
            message: 'Event created successfully',
        });
    } catch (error) {
        next(error);
    }
};

export const updateCalendarEvent = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const { title, description, eventType, eventDate, reminderSent } = req.body;

        const existingEvent = await prisma.calendar_events.findUnique({
            where: { id },
        });

        if (!existingEvent) {
            throw new AppError(404, 'Event not found');
        }

        if (
            req.user?.role === 'student' &&
            req.user.userId !== existingEvent.student_id
        ) {
            throw new AppError(403, 'Access denied');
        }

        const event = await prisma.calendar_events.update({
            where: { id },
            data: {
                title,
                description,
                event_type: eventType,
                event_date: eventDate ? new Date(eventDate) : undefined,
                reminder_sent: reminderSent,
            },
        });

        logger.info(`Calendar event updated: ${id}`);

        res.json({
            success: true,
            data: event,
            message: 'Event updated successfully',
        });
    } catch (error) {
        next(error);
    }
};

export const deleteCalendarEvent = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        const event = await prisma.calendar_events.findUnique({
            where: { id },
        });

        if (!event) {
            throw new AppError(404, 'Event not found');
        }

        if (req.user?.role === 'student' && req.user.userId !== event.student_id) {
            throw new AppError(403, 'Access denied');
        }

        await prisma.calendar_events.delete({
            where: { id },
        });

        logger.info(`Calendar event deleted: ${id}`);

        res.json({
            success: true,
            message: 'Event deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};
