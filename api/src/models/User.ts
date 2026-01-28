import mongoose, { Document, Schema } from 'mongoose'

export type UserRole = 'admin' | 'operator' | 'viewer'

export interface IUser extends Document {
  email: string
  password: string
  name: string
  role: UserRole
  isActive: boolean
  lastLogin?: Date
  failedLoginAttempts: number
  lockedUntil?: Date
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['admin', 'operator', 'viewer'], default: 'viewer' },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  failedLoginAttempts: { type: Number, default: 0 },
  lockedUntil: { type: Date }
}, { timestamps: true })

userSchema.index({ email: 1 })
userSchema.index({ role: 1 })

export const User = mongoose.model<IUser>('User', userSchema)
