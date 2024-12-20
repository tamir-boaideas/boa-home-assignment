// middleware/auth.ts
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

export const verifyAppProxyHmac = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const { signature, ...params } = req.query;
    const secret = process.env.SHOPIFY_API_SECRET;

    if (!signature || !secret) {
      console.error('Missing signature or secret');
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Sort parameters and create query string
    const message = Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('');

    // Calculate HMAC
    const hmac = crypto
      .createHmac('sha256', secret)
      .update(message)
      .digest('hex');

    // Verify signature
    if (hmac !== signature) {
      console.error('Invalid HMAC signature');
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    next();
  } catch (error) {
    console.error('HMAC verification error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};