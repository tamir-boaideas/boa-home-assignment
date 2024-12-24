import { NextFunction, Request, Response } from "express";

export const handleAppProxyRequest = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const session = req.shopify.session;

    if (!session) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    next();
  } catch (error) {
    console.error("Error fetching cart data:", error);
     res.status(500).json({ message: "Internal server error" });
  }
};
