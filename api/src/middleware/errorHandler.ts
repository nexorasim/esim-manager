import { Request, Response, NextFunction } from 'express'
import { env } from '../config/env'

export interface AppError extends Error {
  statusCode?: number
  isOperational?: boolean
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = error.statusCode && error.statusCode >= 400 && error.statusCode < 600 ? error.statusCode : 500
  const message = statusCode === 500 && env.isProduction ? 'Internal Server Error' : (error.message || 'Internal Server Error')

  const correlationId = req.headers['x-correlation-id'] || req.id || undefined

  // Log minimal info in production; include stack in development
  if (env.isDevelopment) {
    console.error(`Error ${statusCode}: ${error.message}`)
    if (error.stack) console.error(error.stack)
  } else {
    console.error(`Error ${statusCode}: ${error.message}`)
  }

  res.status(statusCode).json({
    error: message,
    code: statusCode,
    correlationId,
    ...(env.isDevelopment && error.stack ? { stack: error.stack } : {})
  })
}