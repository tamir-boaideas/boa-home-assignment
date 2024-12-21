import express, { Request, Response, Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

interface SaveCartRequestBody {
  products: string[];
  checkoutToken: string;
}


router.post(['/', '/*'], async (req: Request<{}, {}, SaveCartRequestBody>, res: Response):Promise<any> => {
  console.log('Save cart endpoint hit');
  console.log('Request body:', req.body);
  console.log('Request path:', req.path);
  console.log('Request query:', req.query);

  try {
    const { products } = req.body;

    if (!Array.isArray(products)) {
      console.error('Invalid products data:', products);
      return res.status(400).json({ error: 'Invalid products data' });
    }

    console.log('Products to save:', products);
    
    return res.status(200).json({
      success: true,
      message: 'Cart saved successfully',
      data: {
        products: products
      }
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get(['/', '/*'], (req, res) => {
  console.log('Get cart endpoint hit');
  res.status(200).json({ message: 'Cart endpoint is working' });
});

export default router;