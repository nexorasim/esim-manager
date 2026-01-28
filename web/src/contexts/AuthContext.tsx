import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth'
import { auth } from '../lib/firebase-config'
import { FirebaseService } from '../lib/firebase-service'
import { FirestoreUser, UserRole } from '../lib/firestore-types'

interface User {
  id: string
  email: string
  name: string
  role: UserRole
}

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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          const userData = await FirebaseService.getUser(firebaseUser.uid)
          if (userData) {
            setUser({
              id: userData.id,
              email: userData.email,
              name: userData.name,
              role: userData.role
            })
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
          setUser(null)
        }
      } else {
        setUser(null)
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const register = async (email: string, password: string, name: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    
    await FirebaseService.createUser({
      id: userCredential.user.uid,
      email: userCredential.user.email!,
      name,
      role: 'viewer',
      isActive: true,
      failedLoginAttempts: 0
    })
    
    await FirebaseService.createAuditLog({
      action: 'user.register',
      severity: 'info',
      userId: userCredential.user.uid,
      userEmail: userCredential.user.email!,
      success: true
    })
  }

  const logout = async () => {
    if (user) {
      await FirebaseService.createAuditLog({
        action: 'user.logout',
        severity: 'info',
        userId: user.id,
        userEmail: user.email,
        success: true
      })
    }
    await signOut(auth)
  }

  const refreshUser = async () => {
    if (auth.currentUser) {
      const userData = await FirebaseService.getUser(auth.currentUser.uid)
      if (userData) {
        setUser({
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.role
        })
      }
    }
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

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
