import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimit';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import studentRoutes from './routes/student.routes';
import universityRoutes from './routes/university.routes';
import applicationRoutes from './routes/application.routes';
import documentRoutes from './routes/document.routes';
import essayRoutes from './routes/essay.routes';
import messageRoutes from './routes/message.routes';
import notificationRoutes from './routes/notification.routes';
import calendarRoutes from './routes/calendar.routes';

export const createApp = (): Application => {
    const app = express();

    app.use(helmet());
    app.use(cors({
        origin: config.cors.origins,
        credentials: true
    }));

    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    app.use(rateLimiter);

    app.get('/test', (_req, res) => {
        res.json({
            success: true,
            status: 'ok',
            timestamp: new Date().toISOString(),
            service: 'EduCounsel API',
            version: '1.0.0'
        });
    });

    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/students', studentRoutes);
    app.use('/api/universities', universityRoutes);
    app.use('/api/applications', applicationRoutes);
    app.use('/api/documents', documentRoutes);
    app.use('/api/essays', essayRoutes);
    app.use('/api/messages', messageRoutes);
    app.use('/api/notifications', notificationRoutes);
    app.use('/api/calendar', calendarRoutes);

    app.use((_req, res) => {
        res.status(404).json({
            success: false,
            error: 'Route not found'
        });
    });

    app.use(errorHandler);

    return app;
};
