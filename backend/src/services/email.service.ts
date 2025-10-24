import crypto from 'crypto';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';
import { AppError } from '../types';

interface VerificationToken {
    userId: string;
    token: string;
    type: 'email_verification' | 'password_reset';
    expiresAt: Date;
}

const tokenStore: Map<string, VerificationToken> = new Map();

const generateToken = (): string => {
    return crypto.randomBytes(32).toString('hex');
};

export const sendVerificationEmail = async (
    userId: string,
    email: string
): Promise<string> => {
    try {
        const token = generateToken();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        tokenStore.set(token, {
            userId,
            token,
            type: 'email_verification',
            expiresAt,
        });

        logger.info(`Verification email would be sent to: ${email}`);
        logger.info(`Verification token: ${token}`);
        logger.info(`Verification URL: ${process.env.FRONTEND_URL}/verify-email?token=${token}`);

        // NEED TO USE RESEND.DEV HERE

        return token;
    } catch (error) {
        logger.error('Failed to send verification email:', error);
        throw new AppError(500, 'Failed to send verification email');
    }
};

export const verifyEmailToken = async (token: string): Promise<string> => {
    const tokenData = tokenStore.get(token);

    if (!tokenData) {
        throw new AppError(400, 'Invalid or expired verification token');
    }

    if (tokenData.type !== 'email_verification') {
        throw new AppError(400, 'Invalid token type');
    }

    if (tokenData.expiresAt < new Date()) {
        tokenStore.delete(token);
        throw new AppError(400, 'Verification token has expired');
    }

    await prisma.users.update({
        where: { id: tokenData.userId },
        data: { is_active: true },
    });

    tokenStore.delete(token);

    logger.info(`Email verified for user: ${tokenData.userId}`);

    return tokenData.userId;
};

export const sendPasswordResetEmail = async (
    userId: string,
    email: string
): Promise<string> => {
    try {
        const token = generateToken();
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

        tokenStore.set(token, {
            userId,
            token,
            type: 'password_reset',
            expiresAt,
        });

        logger.info(`Password reset email would be sent to: ${email}`);
        logger.info(`Reset token: ${token}`);
        logger.info(`Reset URL: ${process.env.FRONTEND_URL}/reset-password?token=${token}`);

        // NEED TO USE RESEND.DEV HERE

        return token;
    } catch (error) {
        logger.error('Failed to send password reset email:', error);
        throw new AppError(500, 'Failed to send password reset email');
    }
};

export const verifyPasswordResetToken = async (
    token: string
): Promise<string> => {
    const tokenData = tokenStore.get(token);

    if (!tokenData) {
        throw new AppError(400, 'Invalid or expired reset token');
    }

    if (tokenData.type !== 'password_reset') {
        throw new AppError(400, 'Invalid token type');
    }

    if (tokenData.expiresAt < new Date()) {
        tokenStore.delete(token);
        throw new AppError(400, 'Reset token has expired');
    }

    return tokenData.userId;
};

export const invalidatePasswordResetToken = (token: string): void => {
    tokenStore.delete(token);
};

export const sendWelcomeEmail = async (
    email: string,
    name: string
): Promise<void> => {
    try {
        logger.info(`Welcome email would be sent to: ${email}`);
        logger.info(`User name: ${name}`);

        // NEED TO USE RESEND.DEV HERE

    } catch (error) {
        logger.error('Failed to send welcome email:', error);
    }
};

export const sendNotificationEmail = async (
    email: string,
    subject: string,
    message: string
): Promise<void> => {
    try {
        logger.info(`Notification email would be sent to: ${email}`);
        logger.info(`Subject: ${subject}`);
        logger.info(`Message: ${message}`);

        // NEED TO USE RESEND.DEV HERE

    } catch (error) {
        logger.error('Failed to send notification email:', error);
    }
};
