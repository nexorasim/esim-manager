import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import { Smartphone, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function Register() {
  const router = useRouter()
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name || !email || !password) {
      toast.error('Please fill in all fields')
      return
    }
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      await register(email, password, name)
      toast.success('Account created successfully!')
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Registration error:', error)
      toast.error(error.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Register | NexoraSIM</title>
        <meta name="description" content="Create your NexoraSIM account" />
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
              Join the Future of<br />eSIM Management
            </h1>
            <p className="text-lg text-muted-foreground max-w-md">
              Get started with enterprise-grade eSIM profile management.
              Provision, activate, and manage profiles across all your devices.
            </p>
          </div>

          <p className="text-sm text-muted-foreground">
            2024 NexoraSIM. Enterprise eSIM Management Solutions.
          </p>
        </div>

        {/* Right side - register form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <span className="font-heading font-bold text-2xl text-foreground">NexoraSIM</span>
            </div>

            <div className="mb-8">
              <h2 className="font-heading text-2xl font-bold text-foreground">Create Account</h2>
              <p className="text-muted-foreground mt-2">Get started with NexoraSIM</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" data-testid="register-form">
              <div>
                <label className="label">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  placeholder="John Doe"
                  disabled={loading}
                  data-testid="register-name-input"
                />
              </div>

              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="you@company.com"
                  disabled={loading}
                  data-testid="register-email-input"
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
                    placeholder="Min 6 characters"
                    disabled={loading}
                    data-testid="register-password-input"
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

              <div>
                <label className="label">Confirm Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field"
                  placeholder="Confirm your password"
                  disabled={loading}
                  data-testid="register-confirm-password-input"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
                data-testid="register-submit-button"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline" data-testid="login-link">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
