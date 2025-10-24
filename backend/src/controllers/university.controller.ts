import { Response, NextFunction } from 'express';
import { AuthRequest, AppError } from '../types';
import { prisma } from '../config/database';
import { getPaginationParams, createPaginationMeta } from '../utils/helpers';
import { logger } from '../utils/logger';

export const getUniversities = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { page, limit, skip } = getPaginationParams(req);
        const { search, country, minRanking, maxRanking } = req.query;

        const where: any = { is_active: true };

        if (search) {
            where.OR = [
                { name: { contains: search as string, mode: 'insensitive' } },
                { location: { contains: search as string, mode: 'insensitive' } },
            ];
        }

        if (country) {
            where.country = country;
        }

        if (minRanking || maxRanking) {
            where.ranking = {};
            if (minRanking) where.ranking.gte = parseInt(minRanking as string);
            if (maxRanking) where.ranking.lte = parseInt(maxRanking as string);
        }

        const [universities, total] = await Promise.all([
            prisma.universities.findMany({
                where,
                skip,
                take: limit,
                include: {
                    programs: {
                        select: {
                            id: true,
                            program_name: true,
                            degree_type: true,
                        },
                    },
                    _count: {
                        select: {
                            applications: true,
                        },
                    },
                },
                orderBy: { ranking: 'asc' },
            }),
            prisma.universities.count({ where }),
        ]);

        res.json({
            success: true,
            data: universities,
            pagination: createPaginationMeta(page, limit, total),
        });
    } catch (error) {
        next(error);
    }
};

export const getUniversityById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        const university = await prisma.universities.findUnique({
            where: { id },
            include: {
                programs: {
                    orderBy: { program_name: 'asc' },
                },
                _count: {
                    select: {
                        applications: true,
                        university_shortlist: true,
                    },
                },
            },
        });

        if (!university) {
            throw new AppError(404, 'University not found');
        }

        res.json({
            success: true,
            data: university,
        });
    } catch (error) {
        next(error);
    }
};

export const createUniversity = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (req.user?.role !== 'admin') {
            throw new AppError(403, 'Only admins can create universities');
        }

        const {
            name,
            location,
            country,
            ranking,
            acceptanceRate,
            tuitionFees,
            website,
            description,
            logoUrl,
        } = req.body;

        const university = await prisma.universities.create({
            data: {
                name,
                location,
                country,
                ranking,
                acceptance_rate: acceptanceRate,
                tuition_fees: tuitionFees,
                website,
                description,
                logo_url: logoUrl,
            },
        });

        logger.info(`University created: ${university.name}`);

        res.status(201).json({
            success: true,
            data: university,
            message: 'University created successfully',
        });
    } catch (error) {
        next(error);
    }
};

export const updateUniversity = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (req.user?.role !== 'admin') {
            throw new AppError(403, 'Only admins can update universities');
        }

        const { id } = req.params;
        const {
            name,
            location,
            country,
            ranking,
            acceptanceRate,
            tuitionFees,
            website,
            description,
            logoUrl,
            isActive,
        } = req.body;

        const existingUniversity = await prisma.universities.findUnique({
            where: { id },
        });

        if (!existingUniversity) {
            throw new AppError(404, 'University not found');
        }

        const university = await prisma.universities.update({
            where: { id },
            data: {
                name,
                location,
                country,
                ranking,
                acceptance_rate: acceptanceRate,
                tuition_fees: tuitionFees,
                website,
                description,
                logo_url: logoUrl,
                is_active: isActive,
            },
        });

        logger.info(`University updated: ${id}`);

        res.json({
            success: true,
            data: university,
            message: 'University updated successfully',
        });
    } catch (error) {
        next(error);
    }
};

export const deleteUniversity = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (req.user?.role !== 'admin') {
            throw new AppError(403, 'Only admins can delete universities');
        }

        const { id } = req.params;

        const university = await prisma.universities.findUnique({
            where: { id },
        });

        if (!university) {
            throw new AppError(404, 'University not found');
        }

        await prisma.universities.delete({
            where: { id },
        });

        logger.info(`University deleted: ${id}`);

        res.json({
            success: true,
            message: 'University deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

export const getUniversityPrograms = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        const programs = await prisma.university_programs.findMany({
            where: { university_id: id },
            orderBy: { program_name: 'asc' },
        });

        res.json({
            success: true,
            data: programs,
        });
    } catch (error) {
        next(error);
    }
};
