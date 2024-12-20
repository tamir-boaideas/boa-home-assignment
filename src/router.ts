// router.ts
import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { Session } from '@shopify/shopify-api';

const prisma = new PrismaClient();
const router = express.Router();

interface AuthenticatedRequest extends Request {
  shopifySession?: Session;
}

// Save cart endpoint
router.post('/save-cart', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { shop } = req.body; // Get shop from request body for app proxy
    const { customer_id } = req.query;

    // Validate customer ID
    if (!customer_id || typeof customer_id !== 'string') {
      res.status(400).json({
        message: 'Customer ID is required'
      });
      return;
    }

    // Validate request body
    const items = req.body.items;
    if (!Array.isArray(items)) {
      res.status(400).json({
        message: 'Items must be an array'
      });
      return;
    }

    // Save to database with shop info
    const savedCart = await prisma.savedCart.upsert({
      where: { 
        customerId_shop: {
          customerId: customer_id,
          shop: shop
        }
      },
      update: {
        items: items,
        updatedAt: new Date()
      },
      create: {
        customerId: customer_id,
        shop: shop,
        items: items,
      }
    });

    res.json({
      success: true,
      message: `Saved ${items.length} items to cart`,
      cart: savedCart
    });

  } catch (error) {
    console.error('Save cart error:', error);
    res.status(500).json({
      message: 'Failed to save cart'
    });
  }
});

// GET endpoint
router.get('/saved-cart', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { shop } = req.body;  // Get shop from request body for app proxy
    const { customer_id } = req.query;

    if (!customer_id || typeof customer_id !== 'string') {
      res.status(400).json({
        message: 'Customer ID is required'
      });
      return;
    }

    const savedCart = await prisma.savedCart.findUnique({
      where: { 
        customerId_shop: {
          customerId: customer_id,
          shop: shop
        }
      }
    });

    if (!savedCart) {
      res.status(404).json({
        message: 'No saved cart found'
      });
      return;
    }

    res.json({
      success: true,
      cart: savedCart
    });

  } catch (error) {
    console.error('Get saved cart error:', error);
    res.status(500).json({
      message: 'Failed to retrieve saved cart'
    });
  }
});

export default router;