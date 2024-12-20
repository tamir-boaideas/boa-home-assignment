import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log('Incoming Request:', {
    method: req.method,
    path: req.path,
    body: req.body
  });
  next();
});

// Save cart endpoint
app.post('/apps/boa-home-task-bv/save-cart', async (req, res):Promise<any> => {
  try {
    const { items } = req.body;

    // Validate request
    if (!Array.isArray(items)) {
      return res.status(400).json({
        message: 'Invalid request',
        details: 'Items must be an array'
      });
    }

    // TODO: Extract customer ID from JWT token
    const customerId = 'test-customer'; 
    const shop = 'home-assignment-113.myshopify.com';

    // Upsert saved cart
    const savedCart = await prisma.savedCart.upsert({
      where: { 
        customerId_shop: {
          customerId,
          shop
        }
      },
      update: {
        items: JSON.stringify(items),
        updatedAt: new Date()
      },
      create: {
        customerId,
        shop,
        items: JSON.stringify(items)
      }
    });

    return res.status(200).json({
      success: true,
      message: `Saved ${items.length} items to cart`,
      cart: savedCart
    });
  } catch (error) {
    console.error('Save cart error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Retrieve saved cart endpoint
app.get('/apps/boa-home-task-bv/retrieve-cart', async (req, res):Promise<any> => {
  try {
    // TODO: Extract customer ID from JWT token
    const customerId = 'test-customer';
    const shop = 'home-assignment-113.myshopify.com';

    const savedCart = await prisma.savedCart.findUnique({
      where: { 
        customerId_shop: {
          customerId,
          shop
        }
      }
    });

    if (!savedCart) {
      return res.status(404).json({
        message: 'No saved cart found'
      });
    }

    return res.status(200).json({
      success: true,
      items: JSON.parse(savedCart.items as string)
    });
  } catch (error) {
    console.error('Retrieve cart error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8081;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server is running on port ${PORT}`);
});