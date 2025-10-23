import { Request } from 'express';

export interface AuthUser {
    userId: string;
    email: string;
    role: string;
}

export interface AuthRequest extends Request {
    user?: AuthUser;
}

export interface JWTPayload {
    userId: string;
    email: string;
    role: string;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export interface PaginationParams {
    page: number;
    limit: number;
    skip: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export class AppError extends Error {
    public statusCode: number;
    public details?: any;

    constructor(
        statusCode: number,
        message: string,
        details?: any
    ) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        this.name = 'AppError';
        Error.captureStackTrace(this, this.constructor);
    }
}

export interface UploadedFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
}
