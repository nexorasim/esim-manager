import mongoose, { Document, Schema } from 'mongoose'

export interface IProfileTemplate extends Document {
  name: string
  description?: string
  provider: string
  profileClass: 'operational' | 'test' | 'provisioning'
  defaultNotes?: string
  metadata?: Record<string, any>
  isActive: boolean
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const profileTemplateSchema = new Schema<IProfileTemplate>({
  name: { type: String, required: true },
  description: { type: String },
  provider: { type: String, default: 'NexoraSIM' },
  profileClass: { type: String, enum: ['operational', 'test', 'provisioning'], default: 'operational' },
  defaultNotes: { type: String },
  metadata: { type: Schema.Types.Mixed },
  isActive: { type: Boolean, default: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true })

profileTemplateSchema.index({ isActive: 1 })
profileTemplateSchema.index({ createdBy: 1 })

export const ProfileTemplate = mongoose.model<IProfileTemplate>('ProfileTemplate', profileTemplateSchema)
