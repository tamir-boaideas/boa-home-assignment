import { Request, Response, NextFunction } from 'express';

/**
 * Middleware: Auth
 * Validates the Shopify access token for authenticated requests.
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'];
  const validApiKey = process.env.API_KEY;

  if (!apiKey || apiKey !== validApiKey) {
    res.status(403).json({ error: 'Forbidden: Invalid or missing API key.' });
    return;
  }

  next();
};
