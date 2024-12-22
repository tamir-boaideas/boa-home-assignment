import express, { type Request, type Response, type Router } from "express";

import { prisma } from "../libs/prisma/index.js";

const router: Router = express.Router();

router.post("/save", async (req: Request, res: Response): Promise<Response> => {
  const { customerId, productVariants } = req.body;

  if (!customerId || !Array.isArray(productVariants)) {
    return res.status(400).json({ error: "Invalid data" });
  }

  try {
    await prisma.savedCart.upsert({
      where: { customerId },
      update: { productVariants },
      create: { customerId, productVariants },
    });

    return res.status(200).json({ message: "Cart saved successfully!" });
  } catch (error) {
    console.error("Error saving cart:", error);
    return res
      .status(500)
      .json({ message: "Could not save or update the cart." });
  }
});

router.post(
  "/:customerId",
  async (
    req: Request<{ customerId: string }>,
    res: Response
  ): Promise<Response> => {
    const { customerId } = req.params;

    if (!customerId) {
      return res.status(400).json({ error: "Customer ID is required" });
    }

    try {
      const savedCart = await prisma.savedCart.findUnique({
        where: { customerId },
      });

      if (!savedCart) {
        return res.status(404).json({ message: "No saved cart found" });
      }

      return res.status(200).json(savedCart);
    } catch (error) {
      console.error("Error retrieving saved cart:", error);
      return res
        .status(500)
        .json({ message: "Could not retrieve the saved cart." });
    }
  }
);

export default router;
