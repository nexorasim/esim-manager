import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { connectDatabase } from './config/database'
import { profileRoutes } from './routes/profiles'
import { authRoutes } from './routes/auth'
import { deviceRoutes } from './routes/devices'
import { auditRoutes } from './routes/audit'
import { userRoutes } from './routes/users'
import { templateRoutes } from './routes/templates'
import { errorHandler } from './middleware/errorHandler'
import { env } from './config/env'

const app = express()
const PORT = env.port

// Rate limiting (global); consider stricter on /auth
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
})

// Security headers
app.disable('x-powered-by')
app.use(helmet({
  contentSecurityPolicy: env.isDevelopment ? false : undefined,
  crossOriginOpenerPolicy: { policy: 'same-origin' },
}))

// CORS
const allowedOrigins = env.cors.origins.length ? env.cors.origins : ['http://localhost:3000']
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    return callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
}))

// Body parsing
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))

// Apply rate limit to API
app.use('/api', limiter)

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/profiles', profileRoutes)
app.use('/api/devices', deviceRoutes)
app.use('/api/audit', auditRoutes)
app.use('/api/users', userRoutes)
app.use('/api/templates', templateRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'NexoraSIM API'
  })
})

// Dashboard stats endpoint
app.get('/api/stats', async (req, res) => {
  res.json({
    profiles: { total: 0, active: 0, inactive: 0, pending: 0 },
    devices: { total: 0, online: 0, offline: 0 },
    users: { total: 0 }
  })
})

// Error handling
app.use(errorHandler)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Connect to database and start server
const startServer = async () => {
  await connectDatabase()
  
  if (!env.isProduction) {
    app.listen(PORT, () => {
      console.log(`NexoraSIM API running on port ${PORT}`)
    })
  }
}

startServer()

export { app }
