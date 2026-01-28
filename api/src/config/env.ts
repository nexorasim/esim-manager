import 'dotenv/config'

import { z } from 'zod'

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().transform((v) => (v ? parseInt(v, 10) : 3001)).optional(),

  // Security
  JWT_SECRET: z.string().min(24, 'JWT_SECRET must be at least 24 characters'),
  JWT_ISSUER: z.string().default('nexorasim'),
  JWT_AUDIENCE: z.string().default('nexorasim-app'),

  // CORS
  FRONTEND_URL: z.string().url().optional(),
  CORS_ORIGINS: z.string().optional(), // comma-separated

  // Database
  MONGO_URL: z
    .string()
    .min(1, 'MONGO_URL is required')
    .refine((v) => v.startsWith('mongodb://') || v.startsWith('mongodb+srv://'), {
      message: 'MONGO_URL must start with mongodb:// or mongodb+srv://'
    }),
  DB_NAME: z.string().default('nexorasim'),
})

const parseEnv = () => {
  const result = EnvSchema.safeParse(process.env)
  if (!result.success) {
    const issues = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ')
    // Fail fast in production; in dev, throw with clearer message
    throw new Error(`Invalid environment configuration: ${issues}`)
  }

  const raw = result.data

  // Compute allowed origins
  const origins: string[] = []
  if (raw.FRONTEND_URL) origins.push(raw.FRONTEND_URL)
  if (raw.CORS_ORIGINS) {
    raw.CORS_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean).forEach((o) => origins.push(o))
  }

  return {
    nodeEnv: raw.NODE_ENV,
    port: (raw.PORT as unknown as number) || 3001,
    jwt: {
      secret: raw.JWT_SECRET,
      issuer: raw.JWT_ISSUER,
      audience: raw.JWT_AUDIENCE,
      expiresIn: '7d',
    },
    cors: {
      origins,
    },
    db: {
      url: raw.MONGO_URL,
      name: raw.DB_NAME,
    },
    isProduction: raw.NODE_ENV === 'production',
    isDevelopment: raw.NODE_ENV === 'development',
    isTest: raw.NODE_ENV === 'test',
  }
}

export const env = parseEnv()
