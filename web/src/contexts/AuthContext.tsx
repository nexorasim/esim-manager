import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authService, User } from '../services/api'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = authService.getStoredUser()
    if (storedUser) {
      setUser(storedUser)
      // Verify token is still valid
      authService.getCurrentUser()
        .then(setUser)
        .catch(() => {
          setUser(null)
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        })
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password)
    setUser(response.user)
  }

  const register = async (email: string, password: string, name: string) => {
    const response = await authService.register({ email, password, name })
    setUser(response.user)
  }

  const logout = async () => {
    await authService.logout()
    setUser(null)
  }

  const refreshUser = async () => {
    const currentUser = await authService.getCurrentUser()
    setUser(currentUser)
  }

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
