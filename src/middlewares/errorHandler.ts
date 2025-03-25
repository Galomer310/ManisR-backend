// backend/src/middlewares/errorHandler.ts
import { Request, Response, NextFunction } from "express";

/**
 * Global error handler middleware.
 * Logs the error and sends a JSON response with error details.
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
};
