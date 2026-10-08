// FILE: src/schemas/newsletter.ts
import { z } from 'zod';

// Validation schema for newsletter subscription
export const newsletterSubscribeSchema = z.object({
  email: z.string().email('Invalid email'),
});

export type NewsletterSubscribeRequest = z.infer<typeof newsletterSubscribeSchema>;

// Validation schema for newsletter unsubscription
export const newsletterUnsubscribeSchema = z.object({
  email: z.string().email('Invalid email'),
});

export type NewsletterUnsubscribeRequest = z.infer<typeof newsletterUnsubscribeSchema>;