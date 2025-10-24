import { Response, NextFunction } from 'express';
import { AuthRequest, AppError } from '../types';
import { prisma } from '../config/database';
import { getPaginationParams, createPaginationMeta } from '../utils/helpers';
import { uploadFile, deleteFile, getSignedUrl } from '../services/storage.service';
import { logger } from '../utils/logger';

export const getDocuments = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { page, limit, skip } = getPaginationParams(req);
        const { documentType, studentId } = req.query;

        const where: any = {};

        if (req.user?.role === 'student') {
            where.student_id = req.user.userId;
        } else if (studentId) {
            where.student_id = studentId;
        }

        if (documentType) {
            where.document_type = documentType;
        }

        const [documents, total] = await Promise.all([
            prisma.documents.findMany({
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
                orderBy: { uploaded_at: 'desc' },
            }),
            prisma.documents.count({ where }),
        ]);

        res.json({
            success: true,
            data: documents,
            pagination: createPaginationMeta(page, limit, total),
        });
    } catch (error) {
        next(error);
    }
};

export const getDocumentById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        const document = await prisma.documents.findUnique({
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
            },
        });

        if (!document) {
            throw new AppError(404, 'Document not found');
        }

        if (
            req.user?.role === 'student' &&
            req.user.userId !== document.student_id
        ) {
            throw new AppError(403, 'Access denied');
        }

        const signedUrl = await getSignedUrl(document.file_url, 3600);
        document.file_url = signedUrl;

        res.json({
            success: true,
            data: document,
        });
    } catch (error) {
        next(error);
    }
};

export const uploadDocument = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            throw new AppError(401, 'Not authenticated');
        }

        if (!req.file) {
            throw new AppError(400, 'No file uploaded');
        }

        const { applicationId, documentType } = req.body;

        const studentId =
            req.user.role === 'student' ? req.user.userId : req.body.studentId;

        if (!studentId) {
            throw new AppError(400, 'Student ID is required');
        }

        const { url, fileName } = await uploadFile(
            req.file.buffer,
            req.file.originalname,
            req.file.mimetype,
            studentId,
            'documents'
        );

        const document = await prisma.documents.create({
            data: {
                student_id: studentId,
                application_id: applicationId || null,
                file_name: req.file.originalname,
                file_type: req.file.mimetype,
                file_size: req.file.size,
                file_url: fileName,
                document_type: documentType,
            },
        });

        logger.info(`Document uploaded: ${document.id}`);

        res.status(201).json({
            success: true,
            data: {
                ...document,
                file_url: url,
            },
            message: 'Document uploaded successfully',
        });
    } catch (error) {
        next(error);
    }
};

export const updateDocument = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const { reviewerNotes } = req.body;

        const existingDocument = await prisma.documents.findUnique({
            where: { id },
        });

        if (!existingDocument) {
            throw new AppError(404, 'Document not found');
        }

        if (
            req.user?.role === 'student' &&
            req.user.userId !== existingDocument.student_id
        ) {
            throw new AppError(403, 'Access denied');
        }

        const document = await prisma.documents.update({
            where: { id },
            data: {
                reviewer_notes: reviewerNotes,
                reviewed_by: req.user?.userId,
                reviewed_at: new Date(),
            },
        });

        logger.info(`Document updated: ${id}`);

        res.json({
            success: true,
            data: document,
            message: 'Document updated successfully',
        });
    } catch (error) {
        next(error);
    }
};

export const deleteDocument = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        const document = await prisma.documents.findUnique({
            where: { id },
        });

        if (!document) {
            throw new AppError(404, 'Document not found');
        }

        if (
            req.user?.role === 'student' &&
            req.user.userId !== document.student_id
        ) {
            throw new AppError(403, 'Access denied');
        }

        await deleteFile(document.file_url);

        await prisma.documents.delete({
            where: { id },
        });

        logger.info(`Document deleted: ${id}`);

        res.json({
            success: true,
            message: 'Document deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};
