/*
AI-Assisted Code (Documentation Research)

Prompt: How do I extend the Express Request type in TypeScript to include 
a custom user property for authentication middleware?

Additional Notes: I wrote the middleware logic myself. AI showed me how to 
extend the Express Request interface using the global namespace pattern in 
TypeScript.
*/
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';
import { supabase } from '../services/db.js';

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

    //test suspension
     const { data: dbUser, error: dbError } = await supabase
      .from('users')
      .select('id, email, name, role, is_suspended')
      .eq('id', decoded.userId)
      .single();

    if (dbError || !dbUser) {
      console.error('Auth DB error:', dbError);
      res.status(403).json({ error: 'User not found' });
      return;
    }

    if (dbUser.is_suspended) {
      res.status(403).json({
        error: 'Your account has been suspended. Please contact support.',
      });
      return;
    }


    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name,
    };

    next();
  /*
  AI-Assisted Code (Security Best Practices)

  Prompt: What HTTP status codes should I return for different authentication 
  failure scenarios (expired token vs invalid token)?

  Additional Notes: AI suggested 401 for expired tokens since the client can 
  retry, and 403 for invalid tokens since that's a security issue.
  */
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

