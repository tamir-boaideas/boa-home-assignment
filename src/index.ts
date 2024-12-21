import { join } from "path";
import express, {Request,Response,NextFunction} from "express";
import { readFileSync } from "fs";
import serveStatic from "serve-static";
import dotenv from "dotenv";
import crypto from 'crypto';
import saveCartRouter from './routes/save-cart.js';
import shopify from "./shopify.js";

dotenv.config();

const backendPort = process.env.BACKEND_PORT as string;
const envPort = process.env.PORT as string;
const PORT = parseInt(backendPort || envPort, 10);

const app = express();

app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', 'https://extensions.shopifycdn.com');
  res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.sendStatus(200);
});

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://extensions.shopifycdn.com');
  res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use(express.json());


const verifyProxySignature = (req:Request, res:Response, next:NextFunction) => {
  const { signature, timestamp, shop, ...params } = req.query;

  if (!signature || !timestamp || !shop) {
    return res.status(400).json({ error: 'Missing required query parameters' });
  }

  const sortedParams = Object.entries({ timestamp, shop, ...params })
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('');

  const sharedSecret = process.env.SHOPIFY_API_SECRET || 'fd8bd02ef3b2d45c5e79cc0b97f5a052';
  const computedSignature = crypto
    .createHmac('sha256', sharedSecret)
    .update(sortedParams)
    .digest('hex');

  if (computedSignature === signature) {
    next();
  } else {
    console.error('Invalid signature', {
      provided: signature,
      computed: computedSignature,
      params: sortedParams
    });
    res.status(401).json({ error: 'Invalid signature' });
  }
};

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

app.use('/apps/boa-home-task-bv/api/save-cart' , saveCartRouter);

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