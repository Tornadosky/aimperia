import { Router, type Router as ExpressRouter } from 'express';
import asyncHandler from 'express-async-handler';
import { validateRequest } from 'zod-express-middleware';
import { supabase, db } from '../db/supabase.js';
import { authenticateToken } from '../middleware/auth.js';
import {
  signupSchema,
  loginSchema,
  type SignupRequest,
  type LoginRequest,
} from '../schemas/auth.js';
import { env } from '../env.js';
import { verifySupabaseJwt } from '../utils/jwt.js';

const router: ExpressRouter = Router();

// Cookie options configuration - reused for all cookie operations
const createCookieOptions = (expiresInMs: number) => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: expiresInMs,
});

// Cookie options for clearing cookies (without maxAge)
const clearCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
};

// POST /signup - Create new user with profile
router.post(
  '/signup',
  validateRequest({
    body: signupSchema,
  }),
  asyncHandler(async (req, res) => {
    const { email, password, role, firstName, lastName } =
      req.body as SignupRequest;

    try {
      // Create user with admin privileges to bypass email validation
      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            role,
            first_name: firstName,
            last_name: lastName,
          },
        });

      if (authError) {
        console.error('Supabase auth error:', authError);
        res.status(400).json({
          error: 'Failed to create user account',
          code: 'AUTH_CREATE_FAILED',
          details: authError.message,
        });
        return;
      }

      if (!authData.user) {
        res.status(500).json({
          error: 'User creation failed',
          code: 'USER_NOT_CREATED',
        });
        return;
      }

      // Manually insert the user profile (no trigger needed)
      const { data: profile, error: profileError } = await supabase
        .from('app_user')
        .insert({
          id: authData.user.id,
          email: email,
          role: role,
          first_name: firstName,
          last_name: lastName,
        })
        .select()
        .single();

      if (profileError) {
        console.error('Profile insert error:', profileError);
        // Optional: Clean up by deleting the auth user if profile fails
        // await supabase.auth.admin.deleteUser(authData.user.id);
        res.status(500).json({
          error: 'Failed to create user profile',
          code: 'PROFILE_CREATE_FAILED',
          details: profileError.message,
        });
        return;
      }

      // Create session for the user
      const { data: sessionData, error: sessionError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      // Clear the session from the client to prevent interference with future requests
      await supabase.auth.signOut();

      if (sessionError || !sessionData.session) {
        res.status(500).json({
          error: 'Failed to create session',
          code: 'SESSION_FAILED',
        });
        return;
      }

      // Calculate expiration time in milliseconds for cookie
      const expiresInMs = sessionData.session.expires_at! * 1000 - Date.now();

      // Return user data with session token and set JWT cookie
      const response = {
        user: {
          id: authData.user.id,
          email: authData.user.email!,
          role: profile.role,
          firstName: profile.first_name,
          lastName: profile.last_name,
          displayName: profile.display_name,
        },
        token: sessionData.session.access_token,
        expiresAt: new Date(
          sessionData.session.expires_at! * 1000
        ).toISOString(),
      };

      // Set JWT cookie and return response
      res
        .cookie(
          'jwt',
          sessionData.session.access_token,
          createCookieOptions(expiresInMs)
        )
        .status(201)
        .json(response);
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({
        error: 'Internal server error during signup',
        code: 'SIGNUP_ERROR',
      });
    }
  })
);

// POST /login - Authenticate user and return JWT
router.post(
  '/login',
  validateRequest({
    body: loginSchema,
  }),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body as LoginRequest;

    try {
      // Authenticate with Supabase
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (authError) {
        console.error('Login error:', authError);
        res.status(401).json({
          error: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS',
        });
        return;
      }

      if (!authData.user || !authData.session) {
        res.status(401).json({
          error: 'Authentication failed',
          code: 'AUTH_FAILED',
        });
        return;
      }

      // Fetch user profile
      const user = await db.users.findById(authData.user.id);

      if (!user) {
        res.status(404).json({
          error: 'User profile not found',
          code: 'PROFILE_NOT_FOUND',
        });
        return;
      }

      // Calculate expiration time in milliseconds for cookie
      const expiresInMs = authData.session.expires_at! * 1000 - Date.now();

      // Return user data with token
      const response = {
        user: {
          id: authData.user.id,
          email: authData.user.email!,
          role: user.role,
          firstName: user.first_name,
          lastName: user.last_name,
          displayName: user.display_name,
        },
        token: authData.session.access_token,
        expiresAt: new Date(authData.session.expires_at! * 1000).toISOString(),
      };

      // Set JWT cookie and return response
      res
        .cookie(
          'jwt',
          authData.session.access_token,
          createCookieOptions(expiresInMs)
        )
        .json(response);
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        error: 'Internal server error during login',
        code: 'LOGIN_ERROR',
      });
    }
  })
);

// GET /me - Get current user profile
router.get(
  '/me',
  authenticateToken,
  asyncHandler(async (req, res) => {
    try {
      const userId = req.user!.sub;

      // Fetch user profile from database
      const user = await db.users.findById(userId);

      if (!user) {
        res.status(404).json({
          error: 'User profile not found',
          code: 'PROFILE_NOT_FOUND',
        });
        return;
      }

      // Return user profile (with email from JWT since it's not in profiles table)
      const response: any = {
        user: {
          id: userId,
          email: req.user!.email,
          role: user.role,
          firstName: user.first_name,
          lastName: user.last_name,
          displayName: user.display_name,
        },
      };

      // Add role_pending flag if user has pending role
      if (user.role === 'pending') {
        response.role_pending = true;
      }

      res.json(response);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        error: 'Failed to fetch user profile',
        code: 'PROFILE_FETCH_ERROR',
      });
    }
  })
);

// POST /logout - Invalidate current session
router.post(
  '/logout',
  authenticateToken,
  asyncHandler(async (_req, res) => {
    try {
      // Note: With service role, we can't easily invalidate specific user sessions
      // This would typically be handled client-side by discarding the token
      // For a more robust solution, consider implementing a token blacklist

      // Clear JWT cookie and return response
      res.clearCookie('jwt', clearCookieOptions).json({
        message: 'Logged out successfully',
        code: 'LOGOUT_SUCCESS',
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        error: 'Failed to logout',
        code: 'LOGOUT_ERROR',
      });
    }
  })
);

// POST /cookie - Exchange JWT token for cookie
router.post(
  '/cookie',
  asyncHandler(async (req, res) => {
    const { token, expires_in } = req.body as {
      token?: string;
      expires_in?: string;
    };
    if (!token) {
      res.status(400).json({ error: 'token required' });
      return;
    }

    // verify token
    let payload: any;
    try {
      payload = verifySupabaseJwt(token);
    } catch {
      res.status(401).json({ error: 'invalid token' });
      return;
    }

    // load auth user to read metadata
    const { data: userRes, error: uerr } = await supabase.auth.getUser(token);
    if (uerr || !userRes?.user) {
      res.status(401).json({ error: 'unable to load user' });
      return;
    }
    const u = userRes.user;
    const md: any = u.user_metadata ?? {};
    const idData: any = u.identities?.[0]?.identity_data ?? {};
    const first =
      md.first_name ||
      md.given_name ||
      idData.given_name ||
      (md.full_name || '').split(' ')[0] ||
      '';
    const last =
      md.last_name ||
      md.family_name ||
      idData.family_name ||
      (md.full_name || '').split(' ').slice(1).join(' ') ||
      '';

    // ensure profile row
    let profile = await db.users.findById(u.id);
    if (!profile) {
      profile = await db.users.create({
        id: u.id,
        email: u.email ?? payload.email ?? '',
        role: 'pending',
        first_name: first,
        last_name: last,
      });
    }

    // set cookie
    const expMs = (payload.exp ?? 0) * 1000 - Date.now();
    const fallback = expires_in ? parseInt(expires_in, 10) * 1000 : 3600_000;
    const maxAge = expMs > 0 ? expMs : fallback;

    res
      .cookie('jwt', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: env.NODE_ENV === 'production',
        maxAge,
      })
      .json({ ok: true, role_pending: profile.role === 'pending' });
  })
);

// GET /callback - OAuth callback handler (sets cookie and redirects)
router.get('/callback', (_req, res) => {
  res.send(`<!doctype html><meta charset="utf-8"><title>Auth</title>
<script>
(function () {
  const params = new URLSearchParams(location.hash.slice(1));
  const token = params.get('access_token');
  const expiresIn = params.get('expires_in');
  if (!token) { document.body.textContent = 'Missing access token'; return; }
  fetch('/api/auth/cookie', {
    method:'POST', headers:{'Content-Type':'application/json'},
    credentials:'include', body: JSON.stringify({ token, expires_in: expiresIn })
  })
  .then(r=>r.json()).then(d=>{
    if(d.ok){ location.replace('/') } else { document.body.textContent='Cookie set failed'; }
  }).catch(e=>document.body.textContent='Error: '+e.message);
})();
</script>`);
});
export default router;