import { supabaseAdmin } from '../config/supabase';
import { logger } from '../utils/logger';
import { AppError } from '../types';
import crypto from 'crypto';
import path from 'path';

const BUCKET_NAME = 'educounsel-files';

export const initializeBuckets = async (): Promise<void> => {
    try {
        const { data: buckets, error } = await supabaseAdmin.storage.listBuckets();

        if (error) {
            logger.error('Failed to list buckets:', error);
            return;
        }

        const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);

        if (!bucketExists) {
            const { error: createError } = await supabaseAdmin.storage.createBucket(
                BUCKET_NAME,
                {
                    public: false,
                    fileSizeLimit: 10485760, // 10MB
                    allowedMimeTypes: [
                        'application/pdf',
                        'image/jpeg',
                        'image/png',
                        'image/jpg',
                        'application/msword',
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    ],
                }
            );

            if (createError) {
                logger.error('Failed to create bucket:', createError);
            } else {
                logger.info(`Storage bucket '${BUCKET_NAME}' created successfully`);
            }
        } else {
            logger.info(`Storage bucket '${BUCKET_NAME}' already exists`);
        }
    } catch (error) {
        logger.error('Error initializing storage buckets:', error);
    }
};

const generateFileName = (originalName: string, userId: string): string => {
    const ext = path.extname(originalName);
    const randomString = crypto.randomBytes(8).toString('hex');
    const timestamp = Date.now();
    return `${userId}/${timestamp}-${randomString}${ext}`;
};

export const uploadFile = async (
    file: Buffer,
    originalName: string,
    mimeType: string,
    userId: string,
    folder: string = 'documents'
): Promise<{ url: string; fileName: string }> => {
    try {
        const fileName = generateFileName(originalName, userId);
        const filePath = `${folder}/${fileName}`;

        const { data, error } = await supabaseAdmin.storage
            .from(BUCKET_NAME)
            .upload(filePath, file, {
                contentType: mimeType,
                upsert: false,
            });

        if (error) {
            logger.error('Failed to upload file:', error);
            throw new AppError(500, 'Failed to upload file');
        }

        const { data: urlData } = await supabaseAdmin.storage
            .from(BUCKET_NAME)
            .createSignedUrl(filePath, 60 * 60 * 24 * 365);

        if (!urlData) {
            throw new AppError(500, 'Failed to generate file URL');
        }

        logger.info(`File uploaded successfully: ${filePath}`);

        return {
            url: urlData.signedUrl,
            fileName: data.path,
        };
    } catch (error) {
        logger.error('Error uploading file:', error);
        if (error instanceof AppError) throw error;
        throw new AppError(500, 'Failed to upload file');
    }
};

export const deleteFile = async (filePath: string): Promise<void> => {
    try {
        const { error } = await supabaseAdmin.storage
            .from(BUCKET_NAME)
            .remove([filePath]);

        if (error) {
            logger.error('Failed to delete file:', error);
            throw new AppError(500, 'Failed to delete file');
        }

        logger.info(`File deleted successfully: ${filePath}`);
    } catch (error) {
        logger.error('Error deleting file:', error);
        if (error instanceof AppError) throw error;
        throw new AppError(500, 'Failed to delete file');
    }
};

export const getSignedUrl = async (
    filePath: string,
    expiresIn: number = 3600
): Promise<string> => {
    try {
        const { data, error } = await supabaseAdmin.storage
            .from(BUCKET_NAME)
            .createSignedUrl(filePath, expiresIn);

        if (error || !data) {
            logger.error('Failed to generate signed URL:', error);
            throw new AppError(500, 'Failed to generate file URL');
        }

        return data.signedUrl;
    } catch (error) {
        logger.error('Error generating signed URL:', error);
        if (error instanceof AppError) throw error;
        throw new AppError(500, 'Failed to generate file URL');
    }
};

export const listFiles = async (
    folder: string,
    userId: string
): Promise<any[]> => {
    try {
        const { data, error } = await supabaseAdmin.storage
            .from(BUCKET_NAME)
            .list(`${folder}/${userId}`);

        if (error) {
            logger.error('Failed to list files:', error);
            throw new AppError(500, 'Failed to list files');
        }

        return data || [];
    } catch (error) {
        logger.error('Error listing files:', error);
        if (error instanceof AppError) throw error;
        throw new AppError(500, 'Failed to list files');
    }
};

export const getFileMetadata = async (filePath: string): Promise<any> => {
    try {
        const { data, error } = await supabaseAdmin.storage
            .from(BUCKET_NAME)
            .list(path.dirname(filePath), {
                search: path.basename(filePath),
            });

        if (error || !data || data.length === 0) {
            logger.error('Failed to get file metadata:', error);
            throw new AppError(404, 'File not found');
        }

        return data[0];
    } catch (error) {
        logger.error('Error getting file metadata:', error);
        if (error instanceof AppError) throw error;
        throw new AppError(500, 'Failed to get file metadata');
    }
};
