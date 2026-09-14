import type { NextFunction, Request, Response } from "express";

/**
 * Clerk's clerkMiddleware attaches `auth` to the request. Keeping the
 * authorization boundary in one middleware makes it impossible to
 * accidentally expose CRM data when adding a route.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const request = req as Request & {
    auth?: { userId?: string; sessionClaims?: { userId?: string } };
    userId?: string;
  };
  const userId =
    request.auth?.userId ??
    request.auth?.sessionClaims?.userId ??
    request.userId;

  if (!userId) {
    res.status(401).json({ error: "Autenticação necessária" });
    return;
  }

  request.userId = userId;
  next();
}