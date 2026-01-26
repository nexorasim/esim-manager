import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { AuthService } from '../services/AuthService'
import { validateLogin, validateRegister } from '../middleware/validation'

const router = Router()
const authService = new AuthService()

// Register
router.post('/register', validateRegister, async (req, res, next) => {
  try {
    const { email, password, name } = req.body
    
    const existingUser = await authService.getUserByEmail(email)
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' })
    }
    
    const hashedPassword = await bcrypt.hash(password, 12)
    const user = await authService.createUser({
      email,
      password: hashedPassword,
      name
    })
    
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    )
    
    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    })
  } catch (error) {
    next(error)
  }
})

// Login
router.post('/login', validateLogin, async (req, res, next) => {
  try {
    const { email, password } = req.body
    
    const user = await authService.getUserByEmail(email)
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    )
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    })
  } catch (error) {
    next(error)
  }
})

// Refresh token
router.post('/refresh', async (req, res, next) => {
  try {
    const { token } = req.body
    
    if (!token) {
      return res.status(401).json({ error: 'Token required' })
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
    const user = await authService.getUserById(decoded.id)
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' })
    }
    
    const newToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    )
    
    res.json({ token: newToken })
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' })
  }
})

export { router as authRoutes }