import { Request, Response, NextFunction } from 'express';

/**
 * Middleware: Error Handler
 * Handles uncaught exceptions and sends a standardized error response.
 */
export const errorHandlerMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
};
