import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'
import { connectDatabase } from './config/database'
import { profileRoutes } from './routes/profiles'
import { authRoutes } from './routes/auth'
import { deviceRoutes } from './routes/devices'
import { auditRoutes } from './routes/audit'
import { userRoutes } from './routes/users'
import { templateRoutes } from './routes/templates'
import { errorHandler } from './middleware/errorHandler'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
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
  
  if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
      console.log(`NexoraSIM API running on port ${PORT}`)
    })
  }
}

startServer()

export { app }
