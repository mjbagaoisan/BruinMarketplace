import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { supabase } from '../services/db.js';
import { generateToken } from '../utils/jwt.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const ALLOWED_DOMAINS = ['@ucla.edu', '@g.ucla.edu'];

function isAllowedEmail(email: string): boolean {
  const lower = email.toLowerCase();
  return ALLOWED_DOMAINS.some((domain) => lower.endsWith(domain));
}

router.get('/google', (req: Request, res: Response) => {
  try {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return res.status(500).json({ error: 'Google OAuth is not configured' });
    }

    // generate a random state for CSRF protection with 32 bytes of random data
    const state = crypto.randomBytes(32).toString('hex');

    res.cookie('oauth_state', state, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 10 * 60 * 1000,
      path: '/',
    });

    const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/google/callback`;
    const client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, redirectUri);

    const url = client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'openid',
        'email',
        'profile',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
      state,
      prompt: 'select_account',
    });

    res.redirect(url);
  } catch (error) {
    console.error('Google auth init error:', error);
    res.status(500).json({ error: 'Failed to start Google sign in' });
  }
});

// handles the callback from Google OAuth
// exchanges the authorization code for an access token and user info
// then creates or updates the user in the database
// and then generates a JWT token and returns it to the client
router.get('/google/callback', async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;
    const storedState = req.cookies?.oauth_state;
    const frontendUrl = process.env.FRONTEND_URL;

    if (!code || typeof code !== 'string') {
      return res.redirect(`${frontendUrl}/login?error=missing_code`);
    }

    if (!state || state !== storedState) {
      res.clearCookie('oauth_state');
      return res.redirect(`${frontendUrl}/login?error=invalid_state`);
    }

    res.clearCookie('oauth_state');

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return res.redirect(`${frontendUrl}/login?error=not_configured`);
    }

    const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/google/callback`;
    const client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, redirectUri);

    const { tokens } = await client.getToken({ code, redirect_uri: redirectUri });

    if (!tokens.id_token) {
      return res.redirect(`${frontendUrl}/login?error=no_id_token`);
    }

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.sub || !payload.email) {
      return res.redirect(`${frontendUrl}/login?error=invalid_profile`);
    }

    const { sub, email, name, picture } = payload;

    if (!isAllowedEmail(email)) {
      return res.redirect(`${frontendUrl}/login?error=invalid_domain`);
    }

    // check if user exists in database
    const { data: existing, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', sub)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching user:', fetchError);
      return res.redirect(`${frontendUrl}/login?error=database_error`);
    }

    let user = existing;
    if (user) {
      const { data: updated, error: updateError } = await supabase
        .from('users')
        .update({
          name: name || user.name,
          profile_image_url: picture || user.profile_image_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating user:', updateError);
        return res.redirect(`${frontendUrl}/login?error=database_error`);
      }

      user = updated;
    } else {
      // insert new user into database if user does not exist
      const { data: inserted, error: insertError } = await supabase
        .from('users')
        .insert({
          id: sub,
          email,
          name: name,
          profile_image_url: picture || null,
          role: 'user',
          is_verified: true,
          hide_class_year: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating user:', insertError);
        return res.redirect(`${frontendUrl}/login?error=database_error`);
      }

      user = inserted;
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    // set auth_token cookie
    res.cookie('auth_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    });

    res.redirect(`${frontendUrl}/callback?success=true`);
  } catch (error) {
    console.error('Google callback error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/login?error=auth_failed`);
  }
});

// uses authenticateToken to load the user's information from the database
// and returns a minimal profile object back to the client
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, profile_image_url, role, is_verified')
      .eq('id', req.user.userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.profile_image_url,
        role: user.role,
        isVerified: user.is_verified,
      },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// clears the auth_token cookie
router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('auth_token', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });

  res.status(200).json({ success: true });
});

export default router;