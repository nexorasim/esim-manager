import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import { Smartphone, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      await login(email, password)
      toast.success('Welcome back!')
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Login error:', error)
      toast.error(error.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Login | NexoraSIM</title>
        <meta name="description" content="Login to NexoraSIM eSIM Management Suite" />
      </Head>

      <div className="min-h-screen bg-background flex">
        {/* Left side - branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-card to-background p-12 flex-col justify-between border-r border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.4)]">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <span className="font-heading font-bold text-2xl text-foreground">NexoraSIM</span>
          </div>
          
          <div className="space-y-6">
            <h1 className="font-heading text-4xl font-bold text-foreground leading-tight">
              Enterprise eSIM<br />Management Suite
            </h1>
            <p className="text-lg text-muted-foreground max-w-md">
              Unified platform for GSMA SGP.22 compliant profile management across 
              Desktop, Web, and API interfaces.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="px-4 py-2 bg-muted/50 rounded-full text-sm text-muted-foreground">
                Multi-device Support
              </div>
              <div className="px-4 py-2 bg-muted/50 rounded-full text-sm text-muted-foreground">
                Role-based Access
              </div>
              <div className="px-4 py-2 bg-muted/50 rounded-full text-sm text-muted-foreground">
                Audit Logging
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            2024 NexoraSIM. Enterprise eSIM Management Solutions.
          </p>
        </div>

        {/* Right side - login form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <span className="font-heading font-bold text-2xl text-foreground">NexoraSIM</span>
            </div>

            <div className="mb-8">
              <h2 className="font-heading text-2xl font-bold text-foreground">Welcome back</h2>
              <p className="text-muted-foreground mt-2">Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" data-testid="login-form">
              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="you@company.com"
                  disabled={loading}
                  data-testid="login-email-input"
                />
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pr-10"
                    placeholder="Enter your password"
                    disabled={loading}
                    data-testid="login-password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
                data-testid="login-submit-button"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-muted-foreground">
              Do not have an account?{' '}
              <Link href="/register" className="text-primary hover:underline" data-testid="register-link">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
