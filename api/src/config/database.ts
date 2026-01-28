import mongoose from 'mongoose'
import { env } from './env'

export const connectDatabase = async (): Promise<void> => {
  const mongoUrl = `${env.db.url.replace(/\/$/, '')}/${env.db.name}`

  try {
    await mongoose.connect(mongoUrl, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: env.isDevelopment,
    } as any)
    console.log('MongoDB connected successfully')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    if (env.isProduction) {
      throw error
    }
    // In development/test, allow app to continue for local testing.
  }
}

export const isConnected = (): boolean => {
  return mongoose.connection.readyState === 1
}
