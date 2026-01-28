import { useRouter } from 'next/router'
import Link from 'next/link'
import { useState } from 'react'
import { 
  LayoutDashboard, 
  Smartphone, 
  MonitorSmartphone,
  FileText,
  Shield,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface LayoutProps {
  children: React.ReactNode
}

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'operator', 'viewer'] },
  { name: 'Profiles', href: '/profiles', icon: Smartphone, roles: ['admin', 'operator', 'viewer'] },
  { name: 'Devices', href: '/devices', icon: MonitorSmartphone, roles: ['admin', 'operator', 'viewer'] },
  { name: 'Templates', href: '/templates', icon: FileText, roles: ['admin', 'operator'] },
  { name: 'Audit Logs', href: '/audit', icon: Shield, roles: ['admin'] },
  { name: 'Users', href: '/users', icon: Users, roles: ['admin'] },
]

export default function Layout({ children }: LayoutProps) {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const filteredNavigation = navigationItems.filter(
    item => user && item.roles.includes(user.role)
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center h-16 px-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-bold text-lg text-foreground">NexoraSIM</span>
          </div>
          <button 
            className="ml-auto lg:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1" data-testid="sidebar-navigation">
          {filteredNavigation.map((item) => {
            const isActive = router.pathname === item.href || router.pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
                data-testid={`nav-${item.name.toLowerCase().replace(' ', '-')}`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <Link href="/settings" className="sidebar-link" data-testid="nav-settings">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </Link>
          <button 
            onClick={handleLogout} 
            className="sidebar-link w-full text-destructive hover:text-destructive"
            data-testid="logout-button"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top header */}
        <header className="sticky top-0 z-30 h-16 bg-card/95 backdrop-blur border-b border-border">
          <div className="flex items-center justify-between h-full px-4 lg:px-8">
            <button 
              className="lg:hidden text-muted-foreground hover:text-foreground"
              onClick={() => setSidebarOpen(true)}
              data-testid="mobile-menu-button"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex-1" />

            {/* User menu */}
            <div className="relative">
              <button 
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors"
                data-testid="user-menu-button"
              >
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-foreground">{user?.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>

              {userMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg py-1"
                  onMouseLeave={() => setUserMenuOpen(false)}
                >
                  <Link 
                    href="/settings" 
                    className="block px-4 py-2 text-sm text-foreground hover:bg-muted/50"
                    data-testid="user-menu-settings"
                  >
                    Settings
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-muted/50"
                    data-testid="user-menu-logout"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
