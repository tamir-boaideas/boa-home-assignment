import { Router } from "express";
import asyncHandler from "express-async-handler";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

interface SaveCartRequest {
  customerId: string;
  variantIds: string[];
  cartData: any;
}

router.post(
  "/save",
  asyncHandler(async (req, res) => {
    const { customerId, variantIds, cartData } = req.body as SaveCartRequest;

    if (!customerId || !Array.isArray(variantIds) || !cartData) {
      res.status(400).json({ 
        error: "Customer ID, variant IDs array and cart data are required" 
      });
      return;
    }

    try {
      const cart = await prisma.savedCart.upsert({
        where: { customerId },
        update: { 
          variantIds,
          cartData: JSON.stringify(cartData)
        },
        create: { 
          customerId, 
          variantIds,
          cartData: JSON.stringify(cartData)
        },
      });
      
      res.json({ success: true, cart });
    } catch (error) {
      console.error("Error saving cart:", error);
      res.status(500).json({ error: "Server error while saving cart" });
    }
  })
);

router.get(
  "/retrieve",
  asyncHandler(async (req, res) => {
    const { customerId } = req.query;

    if (typeof customerId !== 'string') {
      res.status(400).json({ error: "Customer ID is required" });
      return;
    }

    try {
      const savedCart = await prisma.savedCart.findUnique({
        where: { customerId },
      });

      if (!savedCart) {
        res.status(404).json({ error: "Saved cart not found" });
        return;
      }

      res.json(savedCart);
    } catch (error) {
      console.error("Error retrieving cart:", error);
      res.status(500).json({ error: "Server error while retrieving cart" });
    }
  })
);

export default router;
