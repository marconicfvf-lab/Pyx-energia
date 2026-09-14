import { getAuth } from "@clerk/express";
import type { NextFunction, Request, Response } from "express";

/**
 * Reads the Clerk session attached by clerkMiddleware. Keeping the
 * authorization boundary in one middleware makes it impossible to
 * accidentally expose CRM data when adding a route.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const request = req as Request & { userId?: string };
  const userId = getAuth(req).userId ?? request.userId;

  if (!userId) {
    res.status(401).json({ error: "Autenticação necessária" });
    return;
  }

  request.userId = userId;
  next();
}