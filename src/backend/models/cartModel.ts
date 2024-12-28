import { pool } from "../database/db.js"; 
import {  ResultSetHeader } from "mysql2/promise";
interface CartItem {
  id: string; 
}

interface SaveCartResult {
  success: boolean;
  message: string;
}

interface Cart {
  customer_id: string;
  items: string; 
}

// Save the cart items for a given customer
async function saveCart(customerId: string, cartItems: CartItem[]): Promise<SaveCartResult> {
  try {
    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO saved_carts (customer_id, items) VALUES (?, ?)",
      [customerId, JSON.stringify(cartItems)]
    );
    if (result.affectedRows === 0) {
      return { success: false, message: "No cart items to save." };
    }
    return { success: true, message: "Cart saved successfully." };
  } catch (error) {
    console.error("Database save error:", error);
    throw error;
  }
}

// Retrieve the saved cart for a given customer
async function getSavedCart(customerId: string): Promise<Cart[]> {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM saved_carts WHERE customer_id = ?",
      [customerId]
    );
    return rows as Cart[];
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
}


export { saveCart, getSavedCart };
