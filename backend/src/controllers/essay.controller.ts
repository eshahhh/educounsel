import { Response, NextFunction } from 'express';
import { AuthRequest, AppError } from '../types';
import { prisma } from '../config/database';
import { getPaginationParams, createPaginationMeta } from '../utils/helpers';
import { logger } from '../utils/logger';

export const getEssays = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { page, limit, skip } = getPaginationParams(req);
        const { status, studentId } = req.query;

        const where: any = {};

        if (req.user?.role === 'student') {
            where.student_id = req.user.userId;
        } else if (studentId) {
            where.student_id = studentId;
        }

        if (status) {
            where.status = status;
        }

        const [essays, total] = await Promise.all([
            prisma.essays.findMany({
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
                    application: {
                        select: {
                            id: true,
                            university: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    },
                    reviewer: {
                        select: {
                            id: true,
                            full_name: true,
                        },
                    },
                },
                orderBy: { created_at: 'desc' },
            }),
            prisma.essays.count({ where }),
        ]);

        res.json({
            success: true,
            data: essays,
            pagination: createPaginationMeta(page, limit, total),
        });
    } catch (error) {
        next(error);
    }
};

export const getEssayById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        const essay = await prisma.essays.findUnique({
            where: { id },
            include: {
                student: {
                    select: {
                        id: true,
                        full_name: true,
                        email: true,
                    },
                },
                application: {
                    select: {
                        id: true,
                        university: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
                reviewer: {
                    select: {
                        id: true,
                        full_name: true,
                    },
                },
                versions: {
                    orderBy: { version_number: 'desc' },
                    take: 5,
                },
            },
        });

        if (!essay) {
            throw new AppError(404, 'Essay not found');
        }

        if (req.user?.role === 'student' && req.user.userId !== essay.student_id) {
            throw new AppError(403, 'Access denied');
        }

        res.json({
            success: true,
            data: essay,
        });
    } catch (error) {
        next(error);
    }
};

export const createEssay = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            throw new AppError(401, 'Not authenticated');
        }

        const { applicationId, title, prompt, content } = req.body;

        const studentId =
            req.user.role === 'student' ? req.user.userId : req.body.studentId;

        if (!studentId) {
            throw new AppError(400, 'Student ID is required');
        }

        const wordCount = content ? content.trim().split(/\s+/).length : 0;

        const essay = await prisma.essays.create({
            data: {
                student_id: studentId,
                application_id: applicationId || null,
                title,
                prompt,
                content,
                word_count: wordCount,
                version: 1,
                status: 'draft',
            },
        });

        if (content) {
            await prisma.essay_versions.create({
                data: {
                    essay_id: essay.id,
                    version_number: 1,
                    content,
                    word_count: wordCount,
                },
            });
        }

        logger.info(`Essay created: ${essay.id}`);

        res.status(201).json({
            success: true,
            data: essay,
            message: 'Essay created successfully',
        });
    } catch (error) {
        next(error);
    }
};

export const updateEssay = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const { title, prompt, content, status, feedback } = req.body;

        const existingEssay = await prisma.essays.findUnique({
            where: { id },
        });

        if (!existingEssay) {
            throw new AppError(404, 'Essay not found');
        }

        if (
            req.user?.role === 'student' &&
            req.user.userId !== existingEssay.student_id
        ) {
            throw new AppError(403, 'Access denied');
        }

        const wordCount = content ? content.trim().split(/\s+/).length : undefined;

        if (content && content !== existingEssay.content) {
            const newVersion = existingEssay.version + 1;

            await prisma.essay_versions.create({
                data: {
                    essay_id: id,
                    version_number: newVersion,
                    content,
                    word_count: wordCount || 0,
                },
            });

            await prisma.essays.update({
                where: { id },
                data: { version: newVersion },
            });
        }

        const essay = await prisma.essays.update({
            where: { id },
            data: {
                title,
                prompt,
                content,
                word_count: wordCount,
                status,
                feedback,
                reviewed_by: feedback ? req.user?.userId : undefined,
                reviewed_at: feedback ? new Date() : undefined,
            },
        });

        logger.info(`Essay updated: ${id}`);

        res.json({
            success: true,
            data: essay,
            message: 'Essay updated successfully',
        });
    } catch (error) {
        next(error);
    }
};

export const deleteEssay = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        const essay = await prisma.essays.findUnique({
            where: { id },
        });

        if (!essay) {
            throw new AppError(404, 'Essay not found');
        }

        if (req.user?.role === 'student' && req.user.userId !== essay.student_id) {
            throw new AppError(403, 'Access denied');
        }

        await prisma.essays.delete({
            where: { id },
        });

        logger.info(`Essay deleted: ${id}`);

        res.json({
            success: true,
            message: 'Essay deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};
