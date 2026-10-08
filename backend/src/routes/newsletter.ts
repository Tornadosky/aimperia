// FILE: src/routes/newsletter.ts
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { validateRequest } from 'zod-express-middleware';
import { db } from '../db/supabase.js';
import {
  newsletterSubscribeSchema,
  newsletterUnsubscribeSchema,
} from '../schemas/newsletter.js';

const router = Router();

/**
 * POST /api/newsletter/subscribe – Subscribe to newsletter
 * Public endpoint, no authentication required
 * 
 * Body: { email }
 * Returns: { ok: true }
 */
router.post(
  '/subscribe',
  validateRequest({ body: newsletterSubscribeSchema }),
  asyncHandler(async (req, res) => {
    // Subscribe user to newsletter (upsert handles existing emails)
    await db.newsletter.upsert(req.body.email);
    
    console.log(`📧 Newsletter subscription: ${req.body.email}`);
    
    res.status(200).json({ ok: true });
  }),
);

/**
 * POST /api/newsletter/unsubscribe – Unsubscribe from newsletter
 * Public endpoint, no authentication required
 * 
 * Body: { email }
 * Returns: { ok: true }
 */
router.post(
  '/unsubscribe',
  validateRequest({ body: newsletterUnsubscribeSchema }),
  asyncHandler(async (req, res) => {
    // Unsubscribe user from newsletter
    await db.newsletter.unsubscribe(req.body.email);
    
    console.log(`🚫 Newsletter unsubscription: ${req.body.email}`);
    
    res.status(200).json({ ok: true });
  }),
);

export default router;