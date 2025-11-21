import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
        name: string;
      };
    }
  }
}

/**
 * Middleware to verify JWT token from auth_token cookie
 */
export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = req.cookies?.auth_token;

    if (!token) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const decoded = verifyToken(token);

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name,
    };

    next();
  } catch (error: any) {
    console.error('Auth middleware error:', error);
    if (error?.message === 'Token expired') {
      res.status(401).json({ error: 'Token expired' });
    } else {
      res.status(403).json({ error: 'Invalid token' });
    }
  }
}

/**
 * Middleware to check if user has admin role
 */
export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }

  next();
}

/**
 * Optional authentication - doesn't fail if no token provided
 */
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = req.cookies?.auth_token;

    if (token) {
      try {
        const decoded = verifyToken(token);
        req.user = {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role,
          name: decoded.name,
        };
      } catch {
        // Ignore invalid token and continue without user
      }
    }

    next();
  } catch {
    // Continue without authentication
    next();
  }
}
