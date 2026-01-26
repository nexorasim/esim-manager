import { v4 as uuidv4 } from 'uuid'

export interface User {
  id: string
  email: string
  password: string
  name: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateUserData {
  email: string
  password: string
  name: string
}

export class AuthService {
  private users: Map<string, User> = new Map()
  private emailIndex: Map<string, string> = new Map()

  async createUser(userData: CreateUserData): Promise<User> {
    const user: User = {
      id: uuidv4(),
      email: userData.email.toLowerCase(),
      password: userData.password,
      name: userData.name,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.users.set(user.id, user)
    this.emailIndex.set(user.email, user.id)

    return user
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.get(id) || null
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const userId = this.emailIndex.get(email.toLowerCase())
    return userId ? this.users.get(userId) || null : null
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const user = this.users.get(id)
    if (!user) {
      return null
    }

    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date()
    }

    this.users.set(id, updatedUser)
    return updatedUser
  }

  async deleteUser(id: string): Promise<boolean> {
    const user = this.users.get(id)
    if (!user) {
      return false
    }

    this.users.delete(id)
    this.emailIndex.delete(user.email)
    return true
  }
}