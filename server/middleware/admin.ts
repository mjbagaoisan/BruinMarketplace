// server/middleware/admin.ts
import { Request, Response, NextFunction } from "express";

// assumes authenticateToken already set req.user = { userId, role, ... }
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;  // or `req.user` if you've typed it

  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: admin only" });
  }

  return next();
}
