import { Response, NextFunction } from 'express';
import { AuthRequest, AppError } from '../types';
import { prisma } from '../config/database';
import { getPaginationParams, createPaginationMeta } from '../utils/helpers';
import { logger } from '../utils/logger';
import { uploadFile, deleteFile, getSignedUrl } from '../services/storage.service';

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
                orderBy: { updated_at: 'desc' },
            }),
            prisma.essays.count({ where }),
        ]);

        // Add download URLs
        const essaysWithUrls = await Promise.all(
            essays.map(async (essay) => {
                const downloadUrl = await getSignedUrl(essay.file_url);
                return { ...essay, download_url: downloadUrl };
            })
        );

        res.json({
            success: true,
            data: essaysWithUrls,
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
            },
        });

        if (!essay) {
            throw new AppError(404, 'Essay not found');
        }

        // Add download URL
        const downloadUrl = await getSignedUrl(essay.file_url);
        const essayWithUrl = { ...essay, download_url: downloadUrl };

        if (req.user?.role === 'student' && req.user.userId !== essay.student_id) {
            throw new AppError(403, 'Access denied');
        }

        res.json({
            success: true,
            data: essayWithUrl,
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

        const { applicationId, title, prompt, fileName, fileType, fileSize, fileUrl, signedUrl, studentId } = req.body;

        const essayStudentId =
            req.user.role === 'student' ? req.user.userId : studentId;

        if (!essayStudentId) {
            throw new AppError(400, 'Student ID is required');
        }

        if (!title) {
            throw new AppError(400, 'Title is required');
        }

        if (!fileUrl) {
            throw new AppError(400, 'File URL is required');
        }

        const essay = await prisma.essays.create({
            data: {
                student_id: essayStudentId,
                application_id: applicationId || null,
                title,
                prompt,
                file_name: fileName,
                file_type: fileType,
                file_size: parseInt(fileSize) || 0,
                file_url: fileUrl,
                status: 'draft',
            },
        });

        logger.info(`Essay created: ${essay.id}`);

        res.status(201).json({
            success: true,
            data: { ...essay, download_url: signedUrl },
            message: 'Essay uploaded successfully',
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
        const { title, prompt, status, feedback, fileName, fileType, fileSize, fileUrl, signedUrl } = req.body;

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

        let updateData: any = {
            title,
            prompt,
            status,
            feedback,
            reviewed_by: feedback ? req.user?.userId : undefined,
            reviewed_at: feedback ? new Date() : undefined,
        };

        // If a new file is provided, update file metadata
        if (fileUrl) {
            // Delete old file from storage if it exists
            if ((existingEssay as any).file_url) {
                try {
                    await deleteFile((existingEssay as any).file_url);
                } catch (error) {
                    logger.warn(`Failed to delete old file: ${(existingEssay as any).file_url}`);
                }
            }

            updateData.file_name = fileName;
            updateData.file_type = fileType;
            updateData.file_size = parseInt(fileSize) || 0;
            updateData.file_url = fileUrl;
        }

        const essay = await prisma.essays.update({
            where: { id },
            data: updateData,
        });

        logger.info(`Essay updated: ${id}`);

        res.json({
            success: true,
            data: { ...essay, download_url: signedUrl || await getSignedUrl((essay as any).file_url) },
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
