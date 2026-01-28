import { Request, Response, NextFunction } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { UserRole } from '../models/User'
import { env } from '../config/env'

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
    role: UserRole
  }
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }

  try {
    const decoded = jwt.verify(token, env.jwt.secret, {
      algorithms: ['HS256'],
      audience: env.jwt.audience,
      issuer: env.jwt.issuer,
    }) as JwtPayload

    if (!decoded || typeof decoded !== 'object' || !decoded.sub) {
      // Backward compatibility: some tokens may use `id`
      const id = (decoded as any).id
      if (!id) {
        return res.status(401).json({ error: 'Invalid token payload' })
      }
      req.user = {
        id,
        email: (decoded as any).email,
        role: ((decoded as any).role || 'viewer') as UserRole,
      }
    } else {
      req.user = {
        id: decoded.sub as string,
        email: (decoded as any).email,
        role: ((decoded as any).role || 'viewer') as UserRole,
      }
    }

    next()
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

// Role-based access control middleware
export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions'
      })
    }

    next()
  }
}

// Permission helpers
export const isAdmin = requireRole('admin')
export const isOperator = requireRole('admin', 'operator')
export const isViewer = requireRole('admin', 'operator', 'viewer')
