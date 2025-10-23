import { createApp } from './app';
import { config } from './config';
import { logger } from './utils/logger';
import { prisma } from './config/database';

const startServer = async () => {
    try {
        await prisma.$connect();
        logger.info('Database connected successfully');

        const app = createApp();

        const server = app.listen(config.port, () => {
            logger.info(`Server running on port ${config.port} in ${config.env} mode`);
            logger.info(`Health check available at http://localhost:${config.port}/health`);
        });

        const shutdown = async (signal: string) => {
            logger.info(`${signal} received, shutting down gracefully`);

            server.close(() => {
                logger.info('HTTP server closed');
            });

            await prisma.$disconnect();
            logger.info('Database disconnected');

            process.exit(0);
        };

        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));

    } catch (error) {
        logger.error('Failed to start server:', error);
        await prisma.$disconnect();
        process.exit(1);
    }
};

startServer();
