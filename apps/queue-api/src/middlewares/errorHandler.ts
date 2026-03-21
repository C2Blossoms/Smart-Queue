import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("❌ [ErrorHander]:", err);

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    res.status(400).json({
      error: "Validation Error",
      details: err.issues.map(i => `${i.path.join('.')}: ${i.message}`),
    });
    return;
  }

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode).json({
    error: err.name || "Internal Server Error",
    message: err.message || "Something went wrong",
  });
};
