import { Response, NextFunction } from 'express';
import { AuthRequest, AppError } from '../types';
import { prisma } from '../config/database';
import { getPaginationParams, createPaginationMeta } from '../utils/helpers';
import { logger } from '../utils/logger';

export const getStudents = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { page, limit, skip } = getPaginationParams(req);
        const { search, gradeLevel } = req.query;

        const where: any = {};

        if (search) {
            where.user = {
                OR: [
                    { email: { contains: search as string, mode: 'insensitive' } },
                    { full_name: { contains: search as string, mode: 'insensitive' } },
                ],
            };
        }

        if (gradeLevel) {
            where.grade_level = gradeLevel;
        }

        const [students, total] = await Promise.all([
            prisma.student_profiles.findMany({
                where,
                skip,
                take: limit,
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            full_name: true,
                            phone: true,
                            is_active: true,
                            created_at: true,
                        },
                    },
                    counselor: {
                        select: {
                            id: true,
                            full_name: true,
                            email: true,
                        },
                    },
                    school: {
                        select: {
                            id: true,
                            school_name: true,
                        },
                    },
                },
                orderBy: { created_at: 'desc' },
            }),
            prisma.student_profiles.count({ where }),
        ]);

        res.json({
            success: true,
            data: students,
            pagination: createPaginationMeta(page, limit, total),
        });
    } catch (error) {
        next(error);
    }
};

export const getStudentById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        const student = await prisma.student_profiles.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        full_name: true,
                        phone: true,
                        is_active: true,
                        created_at: true,
                        last_login: true,
                    },
                },
                counselor: {
                    select: {
                        id: true,
                        full_name: true,
                        email: true,
                    },
                },
                school: {
                    select: {
                        id: true,
                        school_name: true,
                        city: true,
                        state: true,
                        country: true,
                    },
                },
            },
        });

        if (!student) {
            throw new AppError(404, 'Student not found');
        }

        res.json({
            success: true,
            data: student,
        });
    } catch (error) {
        next(error);
    }
};

export const updateStudentProfile = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const {
            gradeLevel,
            gpa,
            satScore,
            actScore,
            extracurriculars,
            interests,
            targetMajor,
            counselorId,
            schoolId,
        } = req.body;

        const existingStudent = await prisma.student_profiles.findUnique({
            where: { id },
        });

        if (!existingStudent) {
            throw new AppError(404, 'Student not found');
        }

        if (req.user?.role === 'student' && req.user.userId !== id) {
            throw new AppError(403, 'You can only update your own profile');
        }

        const student = await prisma.student_profiles.update({
            where: { id },
            data: {
                grade_level: gradeLevel,
                gpa,
                sat_score: satScore,
                act_score: actScore,
                extracurriculars,
                interests,
                target_major: targetMajor,
                counselor_id: counselorId,
                school_id: schoolId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        full_name: true,
                        phone: true,
                    },
                },
            },
        });

        logger.info(`Student profile updated: ${id}`);

        res.json({
            success: true,
            data: student,
            message: 'Profile updated successfully',
        });
    } catch (error) {
        next(error);
    }
};

export const deleteStudent = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        if (req.user?.role !== 'admin') {
            throw new AppError(403, 'Only admins can delete students');
        }

        const student = await prisma.student_profiles.findUnique({
            where: { id },
        });

        if (!student) {
            throw new AppError(404, 'Student not found');
        }

        await prisma.users.delete({
            where: { id },
        });

        logger.info(`Student deleted: ${id}`);

        res.json({
            success: true,
            message: 'Student deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

export const getStudentApplications = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        const applications = await prisma.applications.findMany({
            where: { student_id: id },
            include: {
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
        });

        res.json({
            success: true,
            data: applications,
        });
    } catch (error) {
        next(error);
    }
};

export const getStudentDocuments = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        const documents = await prisma.documents.findMany({
            where: { student_id: id },
            include: {
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
            orderBy: { uploaded_at: 'desc' },
        });

        res.json({
            success: true,
            data: documents,
        });
    } catch (error) {
        next(error);
    }
};

export const getStudentDashboard = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        // Resolve the student profile id:
        // - If caller requests /me/dashboard OR the authenticated user is a student, find the student profile by the user's id
        // - Otherwise use the provided :id param (admin/counselor requests)
        let studentProfileId = id;

        if (id === 'me' || req.user?.role === 'student') {
            // In this schema the student_profiles.id maps to the users.id for the user -> student_profile relation.
            // So we can resolve the profile by the authenticated user's id.
            const profile = await prisma.student_profiles.findUnique({
                where: { id: req.user?.userId },
            });

            if (!profile) {
                throw new AppError(404, 'Student profile not found for current user');
            }

            studentProfileId = profile.id;
        }

        // Fetch student profile with counselor
        const student = await prisma.student_profiles.findUnique({
            where: { id: studentProfileId },
            include: {
                user: {
                    select: {
                        id: true,
                        full_name: true,
                    },
                },
                counselor: {
                    select: {
                        id: true,
                        full_name: true,
                        email: true,
                    },
                },
            },
        });

        if (!student) {
            throw new AppError(404, 'Student not found');
        }

        // Fetch counts
        const [documentsCount, essays, applicationsCount, testEventsCount] = await Promise.all([
            prisma.documents.count({ where: { student_id: studentProfileId } }),
            prisma.essays.findMany({
                where: { student_id: studentProfileId },
                select: { status: true },
            }),
            prisma.applications.count({ where: { student_id: studentProfileId, status: 'in-progress' } }),
            prisma.calendar_events.count({ where: { student_id: studentProfileId, event_type: 'test' } }),
        ]);

        const essaysCount = essays.length;
        const essaysReviewed = essays.filter(e => e.status === 'reviewed').length;

        // Calculate progress percentages
        const progressTracking = {
            documents: Math.min((documentsCount / 10) * 100, 100),
            essays: Math.min((essaysCount / 5) * 100, 100),
            testPrep: 0, // Placeholder, can be calculated based on test prep milestones if available
            applications: Math.min((applicationsCount / 8) * 100, 100),
        };

        const dashboardData = {
            student: {
                id: student.id,
                name: student.user.full_name,
            },
            counselor: student.counselor ? {
                id: student.counselor.id,
                name: student.counselor.full_name,
                email: student.counselor.email,
            } : null,
            stats: {
                documentsUploaded: documentsCount,
                documentsTotal: 10,
                essaysDrafted: essaysCount,
                essaysReviewed,
                testsScheduled: testEventsCount,
                applicationsInProgress: applicationsCount,
            },
            progressTracking,
        };

        res.json({
            success: true,
            data: dashboardData,
        });
    } catch (error) {
        next(error);
    }
};
