import mongoose from 'mongoose'

export const connectDatabase = async (): Promise<void> => {
  const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017'
  const dbName = process.env.DB_NAME || 'nexorasim'
  
  try {
    await mongoose.connect(`${mongoUrl}/${dbName}`)
    console.log('MongoDB connected successfully')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    // Continue without MongoDB - use in-memory storage as fallback
  }
}

export const isConnected = (): boolean => {
  return mongoose.connection.readyState === 1
}
