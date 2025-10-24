import { Response, NextFunction } from 'express';
import { AuthRequest, AppError } from '../types';
import { prisma } from '../config/database';
import { sanitizeUser } from '../utils/helpers';
import { logger } from '../utils/logger';

export const getUserProfile = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        if (req.user?.role !== 'admin' && req.user?.userId !== id) {
            throw new AppError(403, 'Access denied');
        }

        const user = await prisma.users.findUnique({
            where: { id },
            include: {
                student_profile: {
                    include: {
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
                },
                counselor_profile: true,
                school: true,
            },
        });

        if (!user) {
            throw new AppError(404, 'User not found');
        }

        res.json({
            success: true,
            data: sanitizeUser(user),
        });
    } catch (error) {
        next(error);
    }
};

export const updateUserProfile = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        if (req.user?.role !== 'admin' && req.user?.userId !== id) {
            throw new AppError(403, 'Access denied');
        }

        const { fullName, phone } = req.body;

        const user = await prisma.users.update({
            where: { id },
            data: {
                full_name: fullName,
                phone,
            },
        });

        logger.info(`User profile updated: ${id}`);

        res.json({
            success: true,
            data: sanitizeUser(user),
            message: 'Profile updated successfully',
        });
    } catch (error) {
        next(error);
    }
};

export const deactivateUser = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (req.user?.role !== 'admin') {
            throw new AppError(403, 'Only admins can deactivate users');
        }

        const { id } = req.params;

        await prisma.users.update({
            where: { id },
            data: {
                is_active: false,
            },
        });

        await prisma.sessions.deleteMany({
            where: { user_id: id },
        });

        logger.info(`User deactivated: ${id}`);

        res.json({
            success: true,
            message: 'User deactivated successfully',
        });
    } catch (error) {
        next(error);
    }
};
