// src/routes/cartRoutes.js
import express from "express";
import {
  saveCartToDB,
  importSavedCartFromDB
} from "../controllers/cartController.js";

const router = express.Router();

router.post("/cart/save-cart", saveCartToDB);

router.post("/cart/import-saved-cart", importSavedCartFromDB);

export default router;
