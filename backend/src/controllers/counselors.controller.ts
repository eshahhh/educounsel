import { Response, NextFunction } from 'express';
import { AuthRequest, AppError } from '../types';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

export const getCounselors = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const counselors = await prisma.users.findMany({
            where: { role: 'counselor' },
            select: {
                id: true,
                full_name: true,
                email: true,
            },
        });

        res.json({
            success: true,
            data: counselors,
        });
    } catch (error) {
        next(error);
    }
};