import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response } from "express";
import connectDB from "./config/database";
import logger from "./config/logger";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import mongoSanitize from "express-mongo-sanitize";

import authRoutes from "./routes/auth";
import productRoutes from "./routes/product";
import cartRoutes from "./routes/cart";
import orderRoutes from "./routes/order";

import errorHandler from "./middleware/error";
import requestLogger from "./middleware/requestLogger";
import { sanitizeInput, mongoSanitizeMiddleware } from "./middleware/sanitize";
import { requestId, cacheControl, responseTime } from "./middleware/utils";

connectDB().catch((err) => {
  logger.error("Failed to connect to database:", err);
  process.exit(1);
});

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

app.use(helmet());

const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};
app.use(cors(corsOptions));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later",
    code: "RATE_LIMIT_EXCEEDED",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later",
    code: "AUTH_RATE_LIMIT_EXCEEDED",
  },
});
app.use("/api/auth", authLimiter);

app.use(requestId);

app.use(responseTime);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(mongoSanitizeMiddleware);

app.use(sanitizeInput);

app.use(cacheControl);

app.use(compression());

if (NODE_ENV === "development") {
  app.use(requestLogger);
}

const API_VERSION = "v1";
const API_PREFIX = `/api`;

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/products`, productRoutes);
app.use(`${API_PREFIX}/cart`, cartRoutes);
app.use(`${API_PREFIX}/orders`, orderRoutes);

app.get(`${API_PREFIX}/health`, (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    version: API_VERSION,
  });
});

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "E-Commerce API",
    version: API_VERSION,
    documentation: "/api/docs",
    health: "/api/health",
  });
});

app.use("*", (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    code: "NOT_FOUND",
    path: req.path,
  });
});

app.use(errorHandler);

const server = app.listen(PORT, () => {
  logger.info(`Server started in ${NODE_ENV} mode on port ${PORT}`);
  logger.info(`API available at http://localhost:${PORT}/api`);
  logger.info(`Health check at http://localhost:${PORT}/api/health`);
});

const gracefulShutdown = (signal: string) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  server.close(() => {
    logger.info("HTTP server closed");

    process.exit(0);
  });

  setTimeout(() => {
    logger.error("Forced shutdown due to timeout");
    process.exit(1);
  }, 30000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", {
    promise: promise.toString(),
    reason,
  });
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", {
    error: error.message,
    stack: error.stack,
  });
  gracefulShutdown("UNCAUGHT_EXCEPTION");
});

export default app;
