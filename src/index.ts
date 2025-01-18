import { join } from "path";
import express, {Request, Response } from "express";
import { readFileSync } from "fs";
import serveStatic from "serve-static";
import dotenv from "dotenv";

import shopify from "./shopify.js";


dotenv.config();

const backendPort = process.env.BACKEND_PORT as string;
const envPort = process.env.PORT as string;
const PORT = parseInt(backendPort || envPort, 10);

const app = express();

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);

app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: {} })
);

app.use(express.json());

// All endpoints after this point will require an active session
app.use("/api/*", shopify.validateAuthenticatedSession());

app.use(serveStatic(`${process.cwd()}/frontend/`, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res) => {
  const htmlContent = readFileSync(
    join(`${process.cwd()}/frontend/`, "index.html"),
    "utf-8"
  );
  const transformedHtml = htmlContent.replace(
    /%SHOPIFY_API_KEY%/g,
    process.env.SHOPIFY_API_KEY || ""
  );

  res.status(200).set("Content-Type", "text/html").send(transformedHtml);
});

app.post('/app_proxy/cart/add', async (req, res) => {
  try {
    const { products } = req.body;
    
    // Validate the products array
    if (!products || !Array.isArray(products)) {
      return res.status(400).json({ error: 'Invalid products data' });
    }

    // Map products to the correct format for the cart API
    const items = products.map((product) => ({
      id: product.id,  // Ensure this is a valid variant ID
      quantity: product.quantity || 1,
    }));

    // Make the request to the Shopify cart API
    const response = await fetch(`${process.env.SHOPIFY_STORE_URL}/cart/add.js`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items }),
    });

    // Check if the response is okay (status code 200)
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add products to cart');
    }

    // Parse the successful response
    const cartData = await response.json();

    // Send the response back to the client
    res.json({ message: 'Products added to cart successfully', cart: cartData });
  } catch (error) {
    console.error('Error adding products to cart:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


shopify.processWebhooks
app.listen(PORT);
