import { Response, NextFunction } from 'express';
import { AuthRequest, AppError } from '../types';
import { prisma } from '../config/database';
import { getPaginationParams, createPaginationMeta } from '../utils/helpers';
import { logger } from '../utils/logger';

export const getApplications = async (
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

        const [applications, total] = await Promise.all([
            prisma.applications.findMany({
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
                    university: {
                        select: {
                            id: true,
                            name: true,
                            country: true,
                            logo_url: true,
                        },
                    },
                    program: {
                        select: {
                            id: true,
                            program_name: true,
                            degree_type: true,
                        },
                    },
                },
                orderBy: { created_at: 'desc' },
            }),
            prisma.applications.count({ where }),
        ]);

        res.json({
            success: true,
            data: applications,
            pagination: createPaginationMeta(page, limit, total),
        });
    } catch (error) {
        next(error);
    }
};

export const getApplicationById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        const application = await prisma.applications.findUnique({
            where: { id },
            include: {
                student: {
                    select: {
                        id: true,
                        full_name: true,
                        email: true,
                    },
                },
                university: true,
                program: true,
                documents: {
                    select: {
                        id: true,
                        file_name: true,
                        document_type: true,
                        uploaded_at: true,
                    },
                },
                essays: {
                    select: {
                        id: true,
                        title: true,
                        status: true,
                        word_count: true,
                    },
                },
            },
        });

        if (!application) {
            throw new AppError(404, 'Application not found');
        }

        if (
            req.user?.role === 'student' &&
            req.user.userId !== application.student_id
        ) {
            throw new AppError(403, 'Access denied');
        }

        res.json({
            success: true,
            data: application,
        });
    } catch (error) {
        next(error);
    }
};

export const createApplication = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            throw new AppError(401, 'Not authenticated');
        }

        const { universityId, programId, deadline, notes } = req.body;

        const studentId =
            req.user.role === 'student' ? req.user.userId : req.body.studentId;

        if (!studentId) {
            throw new AppError(400, 'Student ID is required');
        }

        const application = await prisma.applications.create({
            data: {
                student_id: studentId,
                university_id: universityId,
                program_id: programId,
                deadline: deadline ? new Date(deadline) : null,
                notes,
                status: 'not_started',
            },
            include: {
                university: {
                    select: {
                        id: true,
                        name: true,
                        country: true,
                    },
                },
                program: {
                    select: {
                        id: true,
                        program_name: true,
                        degree_type: true,
                    },
                },
            },
        });

        logger.info(`Application created: ${application.id}`);

        res.status(201).json({
            success: true,
            data: application,
            message: 'Application created successfully',
        });
    } catch (error) {
        next(error);
    }
};

export const updateApplication = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const { status, deadline, submittedAt, decision, decisionDate, notes } =
            req.body;

        const existingApplication = await prisma.applications.findUnique({
            where: { id },
        });

        if (!existingApplication) {
            throw new AppError(404, 'Application not found');
        }

        if (
            req.user?.role === 'student' &&
            req.user.userId !== existingApplication.student_id
        ) {
            throw new AppError(403, 'Access denied');
        }

        const application = await prisma.applications.update({
            where: { id },
            data: {
                status,
                deadline: deadline ? new Date(deadline) : undefined,
                submitted_at: submittedAt ? new Date(submittedAt) : undefined,
                decision,
                decision_date: decisionDate ? new Date(decisionDate) : undefined,
                notes,
            },
            include: {
                university: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        logger.info(`Application updated: ${id}`);

        res.json({
            success: true,
            data: application,
            message: 'Application updated successfully',
        });
    } catch (error) {
        next(error);
    }
};

export const deleteApplication = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        const application = await prisma.applications.findUnique({
            where: { id },
        });

        if (!application) {
            throw new AppError(404, 'Application not found');
        }

        if (
            req.user?.role === 'student' &&
            req.user.userId !== application.student_id
        ) {
            throw new AppError(403, 'Access denied');
        }

        await prisma.applications.delete({
            where: { id },
        });

        logger.info(`Application deleted: ${id}`);

        res.json({
            success: true,
            message: 'Application deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};
