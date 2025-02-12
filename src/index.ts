import { join } from "path";
import express from "express";
import { readFileSync } from "fs";
import serveStatic from "serve-static";
import dotenv from "dotenv";

import shopify from "./shopify.js";
import { prisma } from "./libs/prisma/index.js";

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

app.post("/api/saved-cart", async (req, res) => {
  try {
    console.log("inside server.ts");
    const { products, customerId, shop } = req.body;
    const shopDomain = shop || req.headers["x-shopify-shop-domain"];

    console.log("shopDomain: ", shopDomain);

    if (!shopDomain) {
      throw new Error("Missing shop domain");
    }

    console.log("=== Save Cart Request ===");
    console.log({
      products,
      customerId,
      shopDomain,
    });

    const savedCart = await prisma.savedCart.upsert({
      where: {
        customerId: customerId,
      },
      update: {
        products: products,
      },
      create: {
        customerId: customerId,
        products: products,
      },
    });

    res
      .status(200)
      .json({ message: "Cart saved successfully", cart: savedCart });
  } catch (error) {
    console.error("Error saving cart:", error);
    res.status(500).json({ message: "Failed to save cart" });
  }
});

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

app.listen(PORT);
