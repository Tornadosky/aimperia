// FILE: src/schemas/contact.ts
import { z } from 'zod';

// Validation schema for creating contact requests in the "Ask-a-Question" feature
export const createContactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(3, 'Phone is required').max(25),
  message: z.string().max(2000).optional(),
});

// TypeScript type inferred from the Zod schema
export type CreateContactRequest = z.infer<typeof createContactSchema>;