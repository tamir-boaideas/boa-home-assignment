// index.ts
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { verifyAppProxyHmac } from './middleware/auth.js';

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.BACKEND_PORT ? parseInt(process.env.BACKEND_PORT, 10) : 8081;

app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log('Request:', {
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body,
    headers: req.headers
  });
  next();
});

// App proxy endpoint
app.post('/app_proxy', verifyAppProxyHmac, async (req, res) => {
  try {
    const { path, shop } = req.query;
    console.log('App proxy request:', { path, shop, body: req.body });

    if (path === 'save-cart') {
      const { items, customer_id } = req.body;

      if (!Array.isArray(items)) {
        res.status(400).json({
          message: 'Items must be an array'
        });
        return;
      }

      // Save to database
      const savedCart = await prisma.savedCart.upsert({
        where: { 
          customerId_shop: {
            customerId: customer_id || 'test-customer',
            shop: shop as string
          }
        },
        update: {
          items: items,
          updatedAt: new Date()
        },
        create: {
          customerId: customer_id || 'test-customer',
          shop: shop as string,
          items: items,
        }
      });

      res.json({
        success: true,
        message: `Saved ${items.length} items to cart`,
        cart: savedCart
      });
    } else {
      console.log('Unknown path:', path);
      res.status(404).json({ message: 'Not found' });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server is running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});