import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

export const requestId = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const id = (req.headers["x-request-id"] as string) || generateRequestId();

  req.requestId = id;
  res.setHeader("X-Request-ID", id);

  next();
};

const generateRequestId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(8).toString("hex");
  return `${timestamp}-${random}`;
};

export const cacheControl = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (req.method === "GET") {
    if (process.env.NODE_ENV === "production") {
      res.setHeader("Cache-Control", "public, max-age=300");
      res.setHeader("X-Cache", "HIT");
    } else {
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
    }
  } else {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
  }

  next();
};

export const responseTime = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const start = Date.now();

  res.on("header", () => {
    const duration = Date.now() - start;
    res.setHeader("X-Response-Time", `${duration}ms`);
  });

  next();
};
