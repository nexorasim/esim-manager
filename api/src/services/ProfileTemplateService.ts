import { v4 as uuidv4 } from 'uuid'
import { ProfileTemplate, IProfileTemplate } from '../models/ProfileTemplate'
import { isConnected } from '../config/database'

const memoryTemplates: Map<string, IProfileTemplate> = new Map()

export class ProfileTemplateService {
  async getTemplates(): Promise<IProfileTemplate[]> {
    if (isConnected()) {
      return ProfileTemplate.find({ isActive: true })
        .sort({ createdAt: -1 })
        .lean() as unknown as IProfileTemplate[]
    }
    return Array.from(memoryTemplates.values()).filter(t => t.isActive)
  }

  async getTemplate(id: string): Promise<IProfileTemplate | null> {
    if (isConnected()) {
      return ProfileTemplate.findById(id).lean() as unknown as IProfileTemplate | null
    }
    return memoryTemplates.get(id) || null
  }

  async createTemplate(data: {
    name: string
    description?: string
    provider?: string
    profileClass?: 'operational' | 'test' | 'provisioning'
    defaultNotes?: string
    metadata?: Record<string, any>
    createdBy: string
  }): Promise<IProfileTemplate> {
    if (isConnected()) {
      const template = new ProfileTemplate({
        ...data,
        isActive: true
      })
      await template.save()
      return template
    }

    const template: any = {
      _id: uuidv4(),
      ...data,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    memoryTemplates.set(template._id, template)
    return template
  }

  async updateTemplate(id: string, updates: Partial<IProfileTemplate>): Promise<IProfileTemplate | null> {
    if (isConnected()) {
      return ProfileTemplate.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: new Date() },
        { new: true }
      ).lean() as unknown as IProfileTemplate | null
    }

    const template = memoryTemplates.get(id)
    if (!template) return null
    Object.assign(template, updates, { updatedAt: new Date() })
    return template
  }

  async deleteTemplate(id: string): Promise<boolean> {
    if (isConnected()) {
      const result = await ProfileTemplate.findByIdAndUpdate(id, { isActive: false })
      return !!result
    }
    const template = memoryTemplates.get(id)
    if (!template) return false
    template.isActive = false
    return true
  }
}
