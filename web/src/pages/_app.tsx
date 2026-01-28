import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from '../contexts/AuthContext'
import Layout from '../components/Layout'
import { useEffect } from 'react'

const publicPaths = ['/login', '/register', '/']

function AppContent({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const isPublicPath = publicPaths.includes(router.pathname)

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isPublicPath) {
      router.push('/login')
    }
    if (!isLoading && isAuthenticated && (router.pathname === '/login' || router.pathname === '/register')) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, isLoading, isPublicPath, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (isPublicPath || !isAuthenticated) {
    return <Component {...pageProps} />
  }

  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  )
}

export default function App(props: AppProps) {
  return (
    <AuthProvider>
      <AppContent {...props} />
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#111827',
            color: '#f9fafb',
            border: '1px solid #374151',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#fff' }
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' }
          }
        }}
      />
    </AuthProvider>
  )
}
