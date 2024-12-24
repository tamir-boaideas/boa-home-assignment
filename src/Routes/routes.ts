import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config(); 

// Initialize Router and Prisma Client
const router = Router();
const prisma = new PrismaClient();

// Types for request bodies and query parameters
interface SaveCartRequestBody {
  customerId: string; // Required customer identifier
  variantIds: (string | number)[]; // Array of product variant IDs
}

interface GetCartQuery {
  customerId: string; // Required customer identifier
}

/**
 * Health Check Endpoint
 * GET /api/health
 * Verifies that the server is running and operational.
 */
router.get('/api/health', (_req: Request, res: Response): void => {
  res.status(200).json({ status: 'Server is up and running!' });
});

/**
 * Welcome Endpoint
 * GET /
 * Returns a welcome message and instructions for API usage.
 */
router.get('/', (_req: Request, res: Response): void => {
  res.status(200).json({
    message: 'Welcome to the BOA Home Task API! Use /api/save-cart or /apps/tools/get-cart for specific actions.',
  });
});

// Shopify API credentials
const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY!;
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET!;

if (!SHOPIFY_API_KEY || !SHOPIFY_API_SECRET) {
  throw new Error('Shopify API credentials are missing in the .env file');
}
/**
 * Shopify OAuth Callback Endpoint
 * Handles the callback after Shopify authorization.
 */
router.get(
  '/api/auth/callback',
  async (req: Request, res: Response): Promise<void> => {
    const { shop, code, hmac, state } = req.query as {
      shop: string;
      code: string;
      hmac: string;
      state: string;
    };

    // Validate required parameters
    if (!shop || !code) {
      res.status(400).json({ error: "Missing required parameters" });
      return;
    }

    try {
      // Exchange the authorization code for an access token
      const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: SHOPIFY_API_KEY,
          client_secret: SHOPIFY_API_SECRET,
          code,
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error("Failed to exchange code for access token");
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      console.log("Access Token:", accessToken);

      res.status(200).json({
        message: "Authentication successful!",
        accessToken,
      });
    } catch (error) {
      console.error("Error during authentication:", error);
      res.status(500).json({ error: "Failed to exchange code for access token" });
    }
  }
);

/**
 * Middleware to handle async errors.
 * Ensures unhandled Promise rejections don't crash the server.
 */
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/**
 * Save Cart Endpoint
 * POST /apps/save-cart-proxy
 * Save or update a customer's cart in the database.
 */
router.post(
  '/apps/save-cart-proxy',
  asyncHandler(async (req: Request<{}, {}, SaveCartRequestBody>, res: Response): Promise<void> => {
    const { customerId, variantIds } = req.body;

    // Validate request payload
    if (!customerId || !Array.isArray(variantIds)) {
      res.status(400).json({ error: 'Invalid payload: customerId and variantIds are required.' });
      return;
    }

    // Ensure variantIds is not empty
    if (variantIds.length === 0) {
      res.status(400).json({ error: 'Invalid payload: variantIds array must not be empty.' });
      return;
    }

    // Upsert operation to save or update the customer's cart
    await prisma.savedCart.upsert({
      where: { customerId },
      update: {
        variantsJson: variantIds,
        createdAt: new Date(),
      },
      create: {
        customerId,
        variantsJson: variantIds,
      },
    });

    res.status(200).json({ success: true, message: 'Cart saved successfully.' });
  })
);

/**
 * Get Saved Cart Endpoint
 * GET /apps/tools/get-cart
 * Retrieve a customer's saved cart from the database via Shopify App Proxy.
 */
router.get(
  '/apps/tools/get-cart',
  asyncHandler(async (req: Request<{}, {}, {}, GetCartQuery>, res: Response): Promise<void> => {
    const { customerId } = req.query;

    // Validate query parameters
    if (!customerId) {
      res.status(400).json({ error: 'Missing customerId in query parameters.' });
      return;
    }

    // Find the customer's saved cart
    const savedCart = await prisma.savedCart.findUnique({
      where: { customerId },
    });

    if (!savedCart) {
      res.status(404).json({ error: 'No saved cart found for the provided customerId.' });
      return;
    }

    res.status(200).json({
      success: true,
      variantIds: savedCart.variantsJson,
      message: 'Cart retrieved successfully.',
    });
  })
);

/**
 * Customer Info Endpoint
 * GET /apps/shopify/customer-info
 * Simulates fetching a customer's info from Shopify.
 */
router.get(
  "/apps/shopify/customer-info",
  async (req: Request, res: Response): Promise<void> => {
    try {
      // Replace this with actual customer data fetching logic
      const customerId = req.query.customer_id || "default-customer-id";
      res.json({ customerId });
    } catch (error) {
      console.error("Error fetching customer info:", error);
      res.status(500).json({ error: "Failed to fetch customer info" });
    }
  }
);

/**
 * Default Route
 * Handles undefined endpoints with a 404 error.
 */
router.use((_req: Request, res: Response): void => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

export default router;
