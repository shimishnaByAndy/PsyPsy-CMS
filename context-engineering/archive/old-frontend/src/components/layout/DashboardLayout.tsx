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
    <div className="flex flex-col h-full bg-card border-r border-border">
      {/* Logo/Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-psypsy-primary rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">PsyPsy CMS</h1>
            <p className="text-xs text-muted-foreground">Healthcare Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavigationClick(item)}
            className={cn(
              "w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
              item.active
                ? "bg-psypsy-primary text-white"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <span className="flex-1 text-left">{item.label}</span>
            {item.badge && (
              <Badge variant="secondary" className="text-xs">
                {item.badge}
              </Badge>
            )}
          </button>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent transition-colors">
          <Avatar className="w-8 h-8">
            <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
            <AvatarFallback className="text-xs">
              {currentUser.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {currentUser.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {currentUser.role}
            </p>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </div>
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