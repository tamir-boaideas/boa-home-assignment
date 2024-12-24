import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import router from './Routes/routes.js';
import { errorHandlerMiddleware } from './middlewares/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON requests
app.use(express.json());

// Attach all routes
app.use(router);

// Fallback route for undefined endpoints
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    message: 'Welcome to the Shopify App API!',
  });
});

// Apply global error handler middleware
app.use(errorHandlerMiddleware);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
