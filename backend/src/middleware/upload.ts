import multer from 'multer';
import { Request } from 'express';
import { AppError } from '../types';
import { config } from '../config';

const storage = multer.memoryStorage();

const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    const allowedTypes = config.upload.allowedTypes;

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new AppError(
                400,
                `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
            ) as any
        );
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: config.upload.maxFileSize,
    },
});

export const uploadSingle = (fieldName: string) => {
    return upload.single(fieldName);
};

export const uploadMultiple = (fieldName: string, maxCount: number = 5) => {
    return upload.array(fieldName, maxCount);
};

export const uploadFields = (fields: multer.Field[]) => {
    return upload.fields(fields);
};

export const handleMulterError = (err: any, req: Request, res: any, next: any) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return next(
                new AppError(
                    400,
                    `File too large. Maximum size: ${config.upload.maxFileSize / 1024 / 1024}MB`
                )
            );
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return next(new AppError(400, 'Too many files'));
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return next(new AppError(400, 'Unexpected file field'));
        }
        return next(new AppError(400, 'File upload error'));
    }
    next(err);
};
