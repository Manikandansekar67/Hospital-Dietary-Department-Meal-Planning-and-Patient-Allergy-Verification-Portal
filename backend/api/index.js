import { app } from '../dist/app.js';
import { connectDatabase } from '../dist/config/database.js';

let isDbInitialized = false;

/**
 * Vercel Serverless Function Handler for Backend
 * Dispatches all incoming requests to the Express application
 */
export default async function handler(req, res) {
  // Ensure MongoDB connection is initialized / reused across warm serverless calls
  if (!isDbInitialized) {
    try {
      await connectDatabase();
      isDbInitialized = true;
    } catch (err) {
      console.warn('MongoDB connection warning in Vercel serverless function:', err?.message || err);
    }
  }

  // Delegate request to Express app
  return app(req, res);
}
