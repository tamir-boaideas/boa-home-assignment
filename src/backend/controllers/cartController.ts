import { Request, Response } from "express";
import {
  saveCart,
  getSavedCart,
} from "../models/cartModel.js";
import { console } from "inspector";

interface CartItem {
  id: string;
}

interface SaveCartResult {
  success: boolean;
  message: string;
}


export const saveCartToDB = async (
  req: Request,
  res: Response
): Promise<void> => {

  const {
    customerId,
    cartItems,
  }: { customerId: string; cartItems: CartItem[] } = req.body;
  if (!customerId || !cartItems || !Array.isArray(cartItems)) {
    res.status(400).json({ message: "Invalid request body" });
    return;
  }
  try {
    const result: SaveCartResult = await saveCart(customerId, cartItems);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: "Failed to save cart",
      error: (error as Error).message,
    });
  }
};

export const importSavedCartFromDB = async (
  req: Request,
  res: Response
): Promise<void> => {
  const customerId = req.headers['x-shopify-customer-id'] as string;

  try {
    if (!customerId) {
      console.error('Customer ID missing in headers');
      res.status(401).json({ error: 'Customer not authenticated' });
    }
    const savedCart = await getSavedCart(customerId);
    res.status(200).json(savedCart);

  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve cart",
      error: (error as Error).message,
    });
  }
};
