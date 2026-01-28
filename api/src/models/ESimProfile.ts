import mongoose, { Document, Schema } from 'mongoose'

export type ProfileStatus = 'active' | 'inactive' | 'pending' | 'deleted'
export type ProfileClass = 'operational' | 'test' | 'provisioning'

export interface IESimProfile extends Document {
  iccid: string
  name: string
  provider: string
  status: ProfileStatus
  profileClass: ProfileClass
  userId: mongoose.Types.ObjectId
  deviceId?: mongoose.Types.ObjectId
  activatedDate?: Date
  deactivatedDate?: Date
  customNotes?: string
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

const esimProfileSchema = new Schema<IESimProfile>({
  iccid: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  provider: { type: String, default: 'NexoraSIM' },
  status: { type: String, enum: ['active', 'inactive', 'pending', 'deleted'], default: 'pending' },
  profileClass: { type: String, enum: ['operational', 'test', 'provisioning'], default: 'operational' },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  deviceId: { type: Schema.Types.ObjectId, ref: 'Device' },
  activatedDate: { type: Date },
  deactivatedDate: { type: Date },
  customNotes: { type: String },
  metadata: { type: Schema.Types.Mixed }
}, { timestamps: true })

esimProfileSchema.index({ userId: 1 })
esimProfileSchema.index({ status: 1 })
esimProfileSchema.index({ iccid: 1 })

export const ESimProfile = mongoose.model<IESimProfile>('ESimProfile', esimProfileSchema)
