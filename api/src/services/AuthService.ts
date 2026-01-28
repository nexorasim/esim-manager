import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcryptjs'
import { User, IUser, UserRole } from '../models/User'
import { isConnected } from '../config/database'

export interface CreateUserData {
  email: string
  password: string
  name: string
  role?: UserRole
}

// In-memory fallback storage
const memoryUsers: Map<string, IUser> = new Map()
const memoryEmailIndex: Map<string, string> = new Map()

export class AuthService {
  async createUser(userData: CreateUserData): Promise<IUser> {
    if (isConnected()) {
      const user = new User({
        email: userData.email.toLowerCase(),
        password: userData.password,
        name: userData.name,
        role: userData.role || 'viewer',
        isActive: true
      })
      await user.save()
      return user
    }

    // Fallback to in-memory storage
    const id = uuidv4()
    const user: any = {
      _id: id,
      id: id,
      email: userData.email.toLowerCase(),
      password: userData.password,
      name: userData.name,
      role: userData.role || 'viewer',
      isActive: true,
      failedLoginAttempts: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    memoryUsers.set(id, user)
    memoryEmailIndex.set(user.email, id)
    return user
  }

  async getUserById(id: string): Promise<IUser | null> {
    if (isConnected()) {
      return User.findById(id).lean() as unknown as IUser | null
    }
    return memoryUsers.get(id) || null
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    if (isConnected()) {
      return User.findOne({ email: email.toLowerCase() }).lean() as unknown as IUser | null
    }
    const userId = memoryEmailIndex.get(email.toLowerCase())
    return userId ? memoryUsers.get(userId) || null : null
  }

  async updateUser(id: string, updates: Partial<IUser>): Promise<IUser | null> {
    if (isConnected()) {
      return User.findByIdAndUpdate(id, { ...updates, updatedAt: new Date() }, { new: true }).lean() as unknown as IUser | null
    }
    const user = memoryUsers.get(id)
    if (!user) return null
    const updatedUser = { ...user, ...updates, updatedAt: new Date() }
    memoryUsers.set(id, updatedUser as IUser)
    return updatedUser as IUser
  }

  async getAllUsers(filters?: { role?: UserRole; isActive?: boolean }): Promise<IUser[]> {
    if (isConnected()) {
      const query: any = {}
      if (filters?.role) query.role = filters.role
      if (filters?.isActive !== undefined) query.isActive = filters.isActive
      return User.find(query).select('-password').lean() as unknown as IUser[]
    }
    return Array.from(memoryUsers.values()).filter(u => {
      if (filters?.role && u.role !== filters.role) return false
      if (filters?.isActive !== undefined && u.isActive !== filters.isActive) return false
      return true
    })
  }

  async deleteUser(id: string): Promise<boolean> {
    if (isConnected()) {
      const result = await User.findByIdAndDelete(id)
      return !!result
    }
    const user = memoryUsers.get(id)
    if (!user) return false
    memoryUsers.delete(id)
    memoryEmailIndex.delete(user.email)
    return true
  }

  async recordFailedLogin(id: string): Promise<void> {
    const user = await this.getUserById(id)
    if (user) {
      const attempts = (user.failedLoginAttempts || 0) + 1
      const updates: Partial<IUser> = { failedLoginAttempts: attempts }
      if (attempts >= 5) {
        updates.lockedUntil = new Date(Date.now() + 15 * 60 * 1000) // Lock for 15 minutes
      }
      await this.updateUser(id, updates)
    }
  }

  async recordSuccessfulLogin(id: string): Promise<void> {
    await this.updateUser(id, {
      failedLoginAttempts: 0,
      lockedUntil: undefined,
      lastLogin: new Date()
    })
  }

  isAccountLocked(user: IUser): boolean {
    if (!user.lockedUntil) return false
    return new Date(user.lockedUntil) > new Date()
  }
}
