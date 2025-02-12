import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import shopify from "./shopify.js";
import cartRoutes from "./routes/cart.js";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

// Middleware
app.use(cors());
app.use(express.json());

// API routes for cart (without authentication)
app.use("/apps/save-cart-for-later/api/cart", cartRoutes);

// Shopify Auth endpoints
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);

// Webhooks endpoint
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: {} })
);

// API routes
// Important: mount cart routes before validateAuthenticatedSession
// so they are accessible via the App Proxy
app.use("/api/cart", cartRoutes);

// Protected API endpoints
app.use("/api/*", shopify.validateAuthenticatedSession());

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});