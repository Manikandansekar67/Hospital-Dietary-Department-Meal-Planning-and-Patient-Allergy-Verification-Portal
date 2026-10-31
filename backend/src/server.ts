import { app } from './app.js';
import { env } from './config/env.config.js';
import { logger } from './utils/logger.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';

const PORT = Number(process.env.PORT || env.PORT || 5001);
const HOST = '0.0.0.0';

async function start() {
  // Start HTTP listener immediately so Render / cloud proxies detect port readiness
  const server = app.listen(PORT, HOST, () => {
    logger.info(`Hospital Dietary API server running in ${env.NODE_ENV} mode on http://${HOST}:${PORT}`);
    logger.info(`Health check available at http://${HOST}:${PORT}/api/health`);
  });

  // Connect to MongoDB asynchronously without blocking initial port binding
  connectDatabase()
    .then((connected) => {
      if (connected) {
        logger.info('Database connected successfully on server startup');
      } else {
        logger.warn('Server running in fallback mode while database connection attempts continue');
      }
    })
    .catch((err) => {
      logger.error('Error during database initialization:', err);
    });

  const handleShutdown = async (signal: string) => {
    logger.info(`${signal} received: closing HTTP server and MongoDB connection gracefully...`);
    try {
      await disconnectDatabase();
    } catch (err) {
      logger.error('Error disconnecting database during shutdown:', err);
    }

    server.close(() => {
      logger.info('HTTP server closed. Exiting process.');
      process.exit(0);
    });

    setTimeout(() => {
      logger.error('Forcefully terminating process after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));

  return server;
}

// Global safety handlers to prevent abrupt connection dropouts
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Promise Rejection:', reason);
});

// Only start HTTP listener if not running as a Vercel serverless function
if (!process.env.VERCEL) {
  start().catch((err) => {
    logger.error('Failed to start server:', err);
  });
}

export { app, start };
export default app;
