import { Request, Response, NextFunction } from 'express';

/**
 * Async Error Handler
 * Wraps async routes for centralized error handling.
 */
export const asyncHandler =
  (fn: Function) =>
  (req: Request, res: Response, next: NextFunction): Promise<void> =>
    Promise.resolve(fn(req, res, next)).catch(next);
