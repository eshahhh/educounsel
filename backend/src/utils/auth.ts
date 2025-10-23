import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { JWTPayload } from '../types';

const SALT_ROUNDS = 10;

export const hashPassword = async (password: string): Promise<string> => {
    return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (
    password: string,
    hashedPassword: string
): Promise<boolean> => {
    return bcrypt.compare(password, hashedPassword);
};

export const generateAccessToken = (payload: JWTPayload): string => {
    return jwt.sign(payload, config.jwt.secret, {
        expiresIn: '1h',
    });
};

export const generateRefreshToken = (payload: JWTPayload): string => {
    return jwt.sign(payload, config.jwt.refreshSecret, {
        expiresIn: '7d',
    });
};

export const verifyAccessToken = (token: string): JWTPayload => {
    return jwt.verify(token, config.jwt.secret) as JWTPayload;
};

export const verifyRefreshToken = (token: string): JWTPayload => {
    return jwt.verify(token, config.jwt.refreshSecret) as JWTPayload;
};
