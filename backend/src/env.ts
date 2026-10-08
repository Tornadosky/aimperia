import { config } from 'dotenv';
import { z } from 'zod';

// Load environment variables
config();

// Define the schema for environment variables with validation
const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.string().transform(Number).default('4000'),

  // Supabase configuration - required
  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
  SUPABASE_JWT_SECRET: z.string().min(1, 'SUPABASE_JWT_SECRET is required'),

  // Agora Video SDK - required
  AGORA_APP_ID: z.string().min(1, 'AGORA_APP_ID is required'),
  AGORA_APP_CERTIFICATE: z.string().min(1, 'AGORA_APP_CERTIFICATE is required'),

  // Agora Cloud Recording - required for recording functionality
  AGORA_CUSTOMER_ID: z.string().min(1, 'AGORA_CUSTOMER_ID is required'),
  AGORA_CUSTOMER_SECRET: z.string().min(1, 'AGORA_CUSTOMER_SECRET is required'),
  AGORA_STORAGE_VENDOR: z.string().transform(Number).default('1'), // 1 = AWS, 2 = GCP, 3 = Azure
  AGORA_STORAGE_REGION: z
    .string()
    .transform(Number)
    .pipe(z.number().int().min(0)), // Numeric region code (0-5 for AWS regions)
  AGORA_STORAGE_BUCKET: z.string().min(1, 'AGORA_STORAGE_BUCKET is required'),
  AGORA_STORAGE_ACCESS_KEY: z
    .string()
    .min(1, 'AGORA_STORAGE_ACCESS_KEY is required'),
  AGORA_STORAGE_SECRET_KEY: z
    .string()
    .min(1, 'AGORA_STORAGE_SECRET_KEY is required'),

  // OpenAI configuration - required for audio transcription
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY is required'),
});

// Validate and parse environment variables
const parseEnv = (): z.infer<typeof envSchema> => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(
        err => `${err.path.join('.')}: ${err.message}`
      );
      throw new Error(
        `Missing or invalid environment variables:\n${missingVars.join('\n')}`
      );
    }
    throw error;
  }
};

// Export the validated environment configuration
export const env = parseEnv();

// Type export for use in other modules
export type Env = typeof env;
