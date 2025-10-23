import { Request, Response, NextFunction } from 'express';
import { AuthRequest, AppError } from '../types';
import { prisma } from '../config/database';
import {
    hashPassword,
    comparePassword,
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
} from '../utils/auth';
import { logger } from '../utils/logger';

export const signup = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email, password, fullName, role, phone } = req.body;

        const existingUser = await prisma.users.findUnique({
            where: { email },
        });

        if (existingUser) {
            throw new AppError(409, 'User with this email already exists');
        }

        const passwordHash = await hashPassword(password);

        const user = await prisma.users.create({
            data: {
                email,
                password_hash: passwordHash,
                full_name: fullName,
                role,
                phone,
                is_active: true,
            },
            select: {
                id: true,
                email: true,
                role: true,
                full_name: true,
                created_at: true,
            },
        });

        if (role === 'student') {
            await prisma.student_profiles.create({
                data: {
                    id: user.id,
                },
            });
        } else if (role === 'counselor') {
            await prisma.counselor_profiles.create({
                data: {
                    id: user.id,
                },
            });
        }

        const accessToken = generateAccessToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        const refreshToken = generateRefreshToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        await prisma.sessions.create({
            data: {
                user_id: user.id,
                token_hash: refreshToken,
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                ip_address: req.ip,
                user_agent: req.headers['user-agent'] || null,
            },
        });

        logger.info(`User registered: ${user.email}`);

        res.status(201).json({
            success: true,
            data: {
                user,
                accessToken,
                refreshToken,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.users.findUnique({
            where: { email },
        });

        if (!user) {
            throw new AppError(401, 'Invalid credentials');
        }

        if (!user.is_active) {
            throw new AppError(403, 'Account is deactivated');
        }

        const isPasswordValid = await comparePassword(password, user.password_hash);

        if (!isPasswordValid) {
            throw new AppError(401, 'Invalid credentials');
        }

        await prisma.users.update({
            where: { id: user.id },
            data: { last_login: new Date() },
        });

        const accessToken = generateAccessToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        const refreshToken = generateRefreshToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        await prisma.sessions.create({
            data: {
                user_id: user.id,
                token_hash: refreshToken,
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                ip_address: req.ip,
                user_agent: req.headers['user-agent'] || null,
            },
        });

        logger.info(`User logged in: ${user.email}`);

        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    full_name: user.full_name,
                },
                accessToken,
                refreshToken,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const refreshAccessToken = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { refreshToken } = req.body;

        const decoded = verifyRefreshToken(refreshToken);

        const session = await prisma.sessions.findFirst({
            where: {
                user_id: decoded.userId,
                token_hash: refreshToken,
                expires_at: {
                    gt: new Date(),
                },
            },
        });

        if (!session) {
            throw new AppError(401, 'Invalid or expired refresh token');
        }

        const accessToken = generateAccessToken({
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
        });

        res.json({
            success: true,
            data: {
                accessToken,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const logout = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            throw new AppError(401, 'Not authenticated');
        }

        const { refreshToken } = req.body;

        if (refreshToken) {
            await prisma.sessions.deleteMany({
                where: {
                    user_id: req.user.userId,
                    token_hash: refreshToken,
                },
            });
        }

        logger.info(`User logged out: ${req.user.email}`);

        res.json({
            success: true,
            message: 'Logged out successfully',
        });
    } catch (error) {
        next(error);
    }
};

export const getMe = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            throw new AppError(401, 'Not authenticated');
        }

        const user = await prisma.users.findUnique({
            where: { id: req.user.userId },
            select: {
                id: true,
                email: true,
                role: true,
                full_name: true,
                phone: true,
                is_active: true,
                last_login: true,
                created_at: true,
                student_profile: {
                    select: {
                        grade_level: true,
                        gpa: true,
                        sat_score: true,
                        act_score: true,
                        interests: true,
                        target_major: true,
                    },
                },
                counselor_profile: {
                    select: {
                        organization: true,
                        bio: true,
                        specialization: true,
                        years_experience: true,
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

        if (!user) {
            throw new AppError(404, 'User not found');
        }

        res.json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
};
