import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types';
import { logger } from '../utils/logger';

export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    _next: NextFunction
): void => {
    if (err instanceof AppError) {
        logger.error(`${err.statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

        res.status(err.statusCode).json({
            success: false,
            error: err.message,
            ...(err.details && { details: err.details }),
        });
        return;
    }

    if (err.name === 'PrismaClientKnownRequestError') {
        logger.error('Prisma Error:', err);
        res.status(400).json({
            success: false,
            error: 'Database operation failed',
        });
        return;
    }

    if (err.name === 'ZodError') {
        logger.error('Validation Error:', err);
        res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: err,
        });
        return;
    }

    logger.error('Unhandled Error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
    });
};
