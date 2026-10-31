import mongoose from 'mongoose';
import { env } from './env.config.js';
import { logger } from '../utils/logger.js';

let isConnected = false;
let listenersAttached = false;

export async function connectDatabase(): Promise<boolean> {
  // If already connected, reuse existing connection (crucial for Vercel serverless warm starts)
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return true;
  }

  // If connection is already in progress, wait for it to complete
  if (mongoose.connection.readyState === 2) {
    await new Promise((resolve) => {
      const onOpen = () => {
        cleanup();
        resolve(true);
      };
      const onError = () => {
        cleanup();
        resolve(false);
      };
      const cleanup = () => {
        mongoose.connection.removeListener('open', onOpen);
        mongoose.connection.removeListener('error', onError);
      };
      mongoose.connection.once('open', onOpen);
      mongoose.connection.once('error', onError);
    });
    isConnected = (mongoose.connection.readyState as number) === 1;
    return isConnected;
  }

  const uri = env.MONGODB_URI;

  try {
    if (!listenersAttached) {
      mongoose.connection.on('connected', () => {
        isConnected = true;
        logger.info(`Mongoose connected successfully to MongoDB at ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);
      });

      mongoose.connection.on('error', (err) => {
        logger.error('Mongoose connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        isConnected = false;
        logger.warn('Mongoose disconnected from MongoDB');
      });

      listenersAttached = true;
    }

    // Configure connection options with sensible defaults for serverless and server modes
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      autoIndex: env.NODE_ENV !== 'production',
      maxPoolSize: 10,
    });

    isConnected = true;
    logger.info('MongoDB connection initialized successfully');
    return true;
  } catch (error) {
    logger.warn(
      `MongoDB connection to '${uri}' could not be established immediately (${(error as Error).message}). Operating in resilient hybrid mode.`
    );
    isConnected = false;
    return false;
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
    logger.info('MongoDB disconnected gracefully');
  }
}

export function isDatabaseConnected(): boolean {
  return mongoose.connection.readyState === 1 || isConnected;
}

export default {
  connectDatabase,
  disconnectDatabase,
  isDatabaseConnected,
};
