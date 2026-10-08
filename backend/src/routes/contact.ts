// FILE: src/routes/contact.ts
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { validateRequest } from 'zod-express-middleware';
import { db } from '../db/supabase.js';
import { createContactSchema } from '../schemas/contact.js';

const router = Router();

/**
 * POST /api/contact – Submit a contact/question request
 * Public endpoint, no authentication required
 * 
 * Body: { name, email, phone, message? }
 * Returns: { ok: true, id: string }
 */
router.post(
  '/',
  validateRequest({ body: createContactSchema }),
  asyncHandler(async (req, res) => {
    // Transform undefined message to null for database compatibility
    const contactData = {
      ...req.body,
      message: req.body.message ?? null,
    };
    
    // Create the contact request record in the database
    const record = await db.contact.create(contactData);
    
    console.log(`📧 Contact request created: ${record.id} from ${record.email}`);
    
    // Return success response with the created record ID
    res.status(201).json({ ok: true, id: record.id });
  }),
);

export default router;