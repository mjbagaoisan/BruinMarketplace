import { Router, Request, Response } from 'express';
import { supabase } from '../services/db.js';

const router = Router();

/**
 * POST /api/auth/session
 * Get current user session from token
 */
router.post('/session', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Fetch user details from database
    const { data: dbUser, error: dbError } = await supabase
      .from('users')
      .select('id, email, name, profile_image_url, role, is_verified')
      .eq('id', user.id)
      .single();

    if (dbError || !dbUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        image: dbUser.profile_image_url,
        role: dbUser.role,
        isVerified: dbUser.is_verified,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

/**
 * POST /api/auth/verify-email
 * Verify if email is allowed (UCLA domain)
 */
router.post('/verify-email', (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const allowedDomains = ['@ucla.edu', '@g.ucla.edu'];
    const emailLower = email.toLowerCase();
    const isAllowed = allowedDomains.some(domain => emailLower.endsWith(domain));

    res.json({ allowed: isAllowed });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

export default router;
