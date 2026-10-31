import { app } from './app.js';
import { env } from './config/env.config.js';
import { logger } from './utils/logger.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';

const PORT = env.PORT || 5000;

async function start() {
  await connectDatabase();

  const server = app.listen(PORT, () => {
    logger.info(`Hospital Dietary API server running in ${env.NODE_ENV} mode on port ${PORT}`);
    logger.info(`Health check available at http://localhost:${PORT}/api/health`);
  });

  const handleShutdown = async (signal: string) => {
    logger.info(`${signal} received: closing HTTP server and MongoDB connection gracefully...`);
    await disconnectDatabase();
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

// Only start HTTP listener if not running as a Vercel serverless function
if (!process.env.VERCEL) {
  start().catch((err) => {
    logger.error('Failed to start server:', err);
  });
}

export { app, start };
export default app;
