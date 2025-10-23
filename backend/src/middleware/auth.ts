import { Response, NextFunction } from 'express';
import { AuthRequest, AppError } from '../types';
import { verifyAccessToken } from '../utils/auth';
import { prisma } from '../config/database';

export const authenticate = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError(401, 'Authentication token required');
        }

        const token = authHeader.substring(7);

        try {
            const decoded = verifyAccessToken(token);

            const user = await prisma.users.findUnique({
                where: { id: decoded.userId },
                select: {
                    id: true,
                    email: true,
                    role: true,
                    full_name: true,
                    is_active: true,
                },
            });

            if (!user || !user.is_active) {
                throw new AppError(401, 'User not found or inactive');
            }

            req.user = {
                userId: user.id,
                email: user.email,
                role: user.role,
            };

            next();
        } catch (error) {
            if (error instanceof Error && error.name === 'TokenExpiredError') {
                throw new AppError(401, 'Token expired');
            }
            throw new AppError(401, 'Invalid token');
        }
    } catch (error) {
        next(error);
    }
};

export const authorize = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new AppError(401, 'Authentication required'));
        }

        if (!roles.includes(req.user.role)) {
            return next(new AppError(403, 'Access denied'));
        }

        next();
    };
};
