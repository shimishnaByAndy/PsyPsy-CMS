import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  Menu, 
  X, 
  Home, 
  Users, 
  Calendar, 
  UserCog, 
  FileText, 
  Settings, 
  Bell, 
  Search,
  Moon,
  Sun,
  LogOut,
  ChevronDown,
  Activity
} from 'lucide-react'

interface NavigationItem {
  id: string
  label: string
  icon: React.ComponentType<any>
  href?: string
  active?: boolean
  badge?: string | number
  children?: NavigationItem[]
}

interface DashboardLayoutProps {
  children: React.ReactNode
  currentUser?: {
    name: string
    email: string
    avatar?: string
    role: string
  }
  navigationItems?: NavigationItem[]
  notifications?: number
  onNavigate?: (item: NavigationItem) => void
  onLogout?: () => void
  onToggleTheme?: () => void
  isDarkMode?: boolean
  className?: string
}

const defaultNavigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    href: '/dashboard',
    active: true
  },
  {
    id: 'clients',
    label: 'Clients',
    icon: Users,
    href: '/clients',
    badge: 12
  },
  {
    id: 'appointments',
    label: 'Appointments',
    icon: Calendar,
    href: '/appointments',
    badge: 5
  },
  {
    id: 'professionals',
    label: 'Professionals',
    icon: UserCog,
    href: '/professionals'
  },
  {
    id: 'notes',
    label: 'Notes & Files',
    icon: FileText,
    href: '/notes'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    href: '/settings'
  }
]

export function DashboardLayout({
  children,
  currentUser = {
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@psypsy.com',
    avatar: '',
    role: 'Administrator'
  },
  navigationItems = defaultNavigationItems,
  notifications = 0,
  onNavigate,
  onLogout,
  onToggleTheme,
  isDarkMode = false,
  className
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleNavigationClick = (item: NavigationItem) => {
    onNavigate?.(item)
    setSidebarOpen(false) // Close sidebar on mobile after navigation
  }

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-gradient-to-b from-purple-900 via-purple-800 to-purple-900 text-white">
      {/* Logo/Header */}
      <div className="p-6 pb-8">
        <div className="text-center">
          <h1 className="text-4xl font-thin italic text-white mb-1 tracking-wide">
            PsyPsy
          </h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavigationClick(item)}
            className={cn(
              "w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
              item.active
                ? "bg-white/25 text-white backdrop-blur-sm shadow-md"
                : "text-purple-50 hover:text-white hover:bg-white/15"
            )}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <span className="flex-1 text-left">{item.label}</span>
            {item.badge && (
              <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Theme Toggle */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-center space-x-4 py-2">
          <button
            onClick={onToggleTheme}
            className={cn(
              "flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm transition-colors",
              !isDarkMode ? "bg-white/25 text-white" : "text-purple-100 hover:text-white hover:bg-white/15"
            )}
          >
            <Sun className="w-4 h-4" />
            <span>Light</span>
          </button>
          <button
            onClick={onToggleTheme}
            className={cn(
              "flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm transition-colors",
              isDarkMode ? "bg-white/25 text-white" : "text-purple-100 hover:text-white hover:bg-white/15"
            )}
          >
            <Moon className="w-4 h-4" />
            <span>Dark</span>
          </button>
        </div>
      </div>

      {/* Firebase Login */}
      <div className="px-4 pb-6">
        <button className="w-full flex items-center justify-center space-x-2 py-2 text-sm text-purple-200 hover:text-white transition-colors">
          <span>Firebase Login</span>
        </button>
      </div>
    </div>
  )

  const TopBar = () => (
    <header className="bg-background border-b border-border px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>

        {/* Search */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search patients, appointments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-80 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-psypsy-primary focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleTheme}
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative"
        >
          <Bell className="w-5 h-5" />
          {notifications > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 w-5 h-5 text-xs flex items-center justify-center p-0"
            >
              {notifications > 9 ? '9+' : notifications}
            </Badge>
          )}
        </Button>

        {/* User menu - simplified for mobile */}
        <div className="hidden sm:flex items-center space-x-2">
          <Avatar className="w-8 h-8">
            <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
            <AvatarFallback className="text-xs">
              {currentUser.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block">
            <p className="text-sm font-medium">{currentUser.name}</p>
            <p className="text-xs text-muted-foreground">{currentUser.role}</p>
          </div>
        </div>

        {/* Logout */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onLogout}
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </header>
  )

  return (
    <div className={cn("h-screen flex bg-background", className)}>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-64 z-50">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        
        <main className="flex-1 overflow-auto bg-muted/10">
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout