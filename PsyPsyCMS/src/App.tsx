import React, { Suspense, useEffect, useState, useRef } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Home, Users, Calendar, UserCog, FileText, Settings, Globe, Mic, Bell } from 'lucide-react'

// Import global styles and i18n
import './globals.css'
import './localization/i18n'

// Import components
import DashboardLayout from '@/components/layout/DashboardLayout'
import { ThemeProvider } from '@/context/ThemeProvider'
import { AuthProvider, useAuth } from '@/context/AuthProvider'
import { queryClient, initializePersistence } from '@/services/queryClient'

// Import pages (these would be created next)
import DashboardPage from '@/pages/DashboardPage'
import { AdminDashboard } from '@/components/AdminDashboard'
import ClientsPage from '@/pages/ClientsPage'
import ProfessionalsPage from '@/pages/ProfessionalsPage'
import AppointmentsPage from '@/pages/AppointmentsPage'
import NotesPage from '@/pages/NotesPage'
import MeetingNotesPage from '@/pages/MeetingNotesPage'
import NotificationsPage from '@/pages/NotificationsPage'
import SocialMediaPage from '@/pages/SocialMediaPage'
import SettingsPage from '@/pages/SettingsPage'
import LoginPage from '@/pages/LoginPage'
import LoadingPage from '@/pages/LoadingPage'
import TestEmulatorConnection from '@/components/TestEmulatorConnection'
import { TestHealthcareDesignSystem } from '@/components/TestHealthcareDesignSystem'

// Import error boundary and dev console
import { ErrorBoundary } from '@/components/ErrorBoundary'
import DevConsole, { DevConsoleRef } from '@/components/DevConsole'
import { useDevKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'

/**
 * Protected Route component
 */
interface ProtectedRouteProps {
  children: React.ReactNode
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  
  if (isLoading) {
    return <LoadingPage />
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

/**
 * Main App Routes component
 */
function AppRoutes() {
  const { user, logout } = useAuth()
  useTranslation()
  const [isDarkMode, setIsDarkMode] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('psypsy-theme')
    if (savedTheme === 'dark') {
      setIsDarkMode(true)
      document.documentElement.classList.add('dark')
    } else if (savedTheme === 'light') {
      setIsDarkMode(false)
      document.documentElement.classList.remove('dark')
    } else {
      // Use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setIsDarkMode(prefersDark)
      document.documentElement.classList.toggle('dark', prefersDark)
    }
  }, [])

  const handleToggleTheme = () => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)
    
    if (newTheme) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('psypsy-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('psypsy-theme', 'light')
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleNavigation = (item: any) => {
    if (item.href) {
      navigate(item.href)
    }
  }

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      href: '/dashboard',
      active: location.pathname === '/dashboard',
    },
    {
      id: 'admin',
      label: 'Admin CMS',
      icon: Settings,
      href: '/admin',
      active: location.pathname === '/admin',
      badge: 'NEW',
    },
    {
      id: 'clients',
      label: 'Clients',
      icon: Users,
      href: '/clients',
      active: location.pathname === '/clients',
      badge: 12,
    },
    {
      id: 'appointments',
      label: 'Appointments',
      icon: Calendar,
      href: '/appointments',
      active: location.pathname === '/appointments',
      badge: 3,
    },
    {
      id: 'professionals',
      label: 'Professionals',
      icon: UserCog,
      href: '/professionals',
      active: location.pathname === '/professionals',
    },
    {
      id: 'notes',
      label: 'Notes & Files',
      icon: FileText,
      href: '/notes',
      active: location.pathname === '/notes',
    },
    {
      id: 'meeting-notes',
      label: 'Meeting Notes',
      icon: Mic,
      href: '/meeting-notes',
      active: location.pathname === '/meeting-notes',
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      href: '/notifications',
      active: location.pathname === '/notifications',
    },
    {
      id: 'social-media',
      label: 'Social Media',
      icon: Globe,
      href: '/social-media',
      active: location.pathname === '/social-media',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      href: '/settings',
      active: location.pathname === '/settings',
    },
  ]

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Development routes */}
      {process.env.NODE_ENV === 'development' && (
        <>
          <Route path="/test-emulators" element={<TestEmulatorConnection />} />
          <Route path="/test-healthcare-design" element={<TestHealthcareDesignSystem />} />
        </>
      )}

      {/* Protected routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardLayout
            currentUser={{
              name: user?.profile?.fullName || 'Unknown User',
              email: user?.email || '',
              avatar: user?.profile?.avatar,
              role: user?.role || 'user'
            }}
            navigationItems={navigationItems}
            onNavigate={handleNavigation}
            onLogout={handleLogout}
            onToggleTheme={handleToggleTheme}
            isDarkMode={isDarkMode}
          >
            <DashboardPage />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/clients" element={
        <ProtectedRoute>
          <DashboardLayout
            currentUser={{
              name: user?.profile?.fullName || 'Unknown User',
              email: user?.email || '',
              avatar: user?.profile?.avatar,
              role: user?.role || 'user'
            }}
            navigationItems={navigationItems}
            onNavigate={handleNavigation}
            onLogout={handleLogout}
            onToggleTheme={handleToggleTheme}
            isDarkMode={isDarkMode}
          >
            <ClientsPage />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/appointments" element={
        <ProtectedRoute>
          <DashboardLayout
            currentUser={{
              name: user?.profile?.fullName || 'Unknown User',
              email: user?.email || '',
              avatar: user?.profile?.avatar,
              role: user?.role || 'user'
            }}
            navigationItems={navigationItems}
            onNavigate={handleNavigation}
            onLogout={handleLogout}
            onToggleTheme={handleToggleTheme}
            isDarkMode={isDarkMode}
          >
            <AppointmentsPage />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/professionals" element={
        <ProtectedRoute>
          <DashboardLayout
            currentUser={{
              name: user?.profile?.fullName || 'Unknown User',
              email: user?.email || '',
              avatar: user?.profile?.avatar,
              role: user?.role || 'user'
            }}
            navigationItems={navigationItems}
            onNavigate={handleNavigation}
            onLogout={handleLogout}
            onToggleTheme={handleToggleTheme}
            isDarkMode={isDarkMode}
          >
            <ProfessionalsPage />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/notes" element={
        <ProtectedRoute>
          <DashboardLayout
            currentUser={{
              name: user?.profile?.fullName || 'Unknown User',
              email: user?.email || '',
              avatar: user?.profile?.avatar,
              role: user?.role || 'user'
            }}
            navigationItems={navigationItems}
            onNavigate={handleNavigation}
            onLogout={handleLogout}
            onToggleTheme={handleToggleTheme}
            isDarkMode={isDarkMode}
          >
            <NotesPage />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/meeting-notes" element={
        <ProtectedRoute>
          <DashboardLayout
            currentUser={{
              name: user?.profile?.fullName || 'Unknown User',
              email: user?.email || '',
              avatar: user?.profile?.avatar,
              role: user?.role || 'user'
            }}
            navigationItems={navigationItems}
            onNavigate={handleNavigation}
            onLogout={handleLogout}
            onToggleTheme={handleToggleTheme}
            isDarkMode={isDarkMode}
          >
            <MeetingNotesPage />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/notifications" element={
        <ProtectedRoute>
          <DashboardLayout
            currentUser={{
              name: user?.profile?.fullName || 'Unknown User',
              email: user?.email || '',
              avatar: user?.profile?.avatar,
              role: user?.role || 'user'
            }}
            navigationItems={navigationItems}
            onNavigate={handleNavigation}
            onLogout={handleLogout}
            onToggleTheme={handleToggleTheme}
            isDarkMode={isDarkMode}
          >
            <NotificationsPage />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/social-media" element={
        <ProtectedRoute>
          <DashboardLayout
            currentUser={{
              name: user?.profile?.fullName || 'Unknown User',
              email: user?.email || '',
              avatar: user?.profile?.avatar,
              role: user?.role || 'user'
            }}
            navigationItems={navigationItems}
            onNavigate={handleNavigation}
            onLogout={handleLogout}
            onToggleTheme={handleToggleTheme}
            isDarkMode={isDarkMode}
          >
            <SocialMediaPage />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/settings" element={
        <ProtectedRoute>
          <DashboardLayout
            currentUser={{
              name: user?.profile?.fullName || 'Unknown User',
              email: user?.email || '',
              avatar: user?.profile?.avatar,
              role: user?.role || 'user'
            }}
            navigationItems={navigationItems}
            onNavigate={handleNavigation}
            onLogout={handleLogout}
            onToggleTheme={handleToggleTheme}
            isDarkMode={isDarkMode}
          >
            <SettingsPage />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

/**
 * Loading fallback component
 */
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-8 h-8 border-4 border-psypsy-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-muted-foreground">Loading PsyPsy CMS...</p>
      </div>
    </div>
  )
}

/**
 * Main App component
 */
function App() {
  const devConsoleRef = useRef<DevConsoleRef>(null)

  useEffect(() => {
    // Initialize offline persistence for TanStack Query
    initializePersistence()

    // Initialize Tauri-specific features if needed
    if (window.__TAURI__) {
      // Tauri-specific initialization
      console.log('Running in Tauri environment')
    }
  }, [])

  // Development keyboard shortcuts (only in development)
  useDevKeyboardShortcuts({
    toggleDevConsole: () => {
      devConsoleRef.current?.toggle()
    },
    clearConsole: () => {
      devConsoleRef.current?.clear()
    },
    reloadPage: () => {
      window.location.reload()
    }
  })

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <Router
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true
              }}
            >
              <Suspense fallback={<LoadingFallback />}>
                <AppRoutes />
              </Suspense>
              
              {/* Global toast notifications */}
              <Toaster 
                position="top-right"
                theme="system"
                richColors
                closeButton
                toastOptions={{
                  duration: 4000,
                  className: 'healthcare-toast',
                }}
              />
              
              {/* React Query DevTools (only in development) */}
              {process.env.NODE_ENV === 'development' && (
                <ReactQueryDevtools
                  initialIsOpen={false}
                  position="bottom"
                />
              )}

              {/* Development Console for MCP debugging (only in development) */}
              {process.env.NODE_ENV === 'development' && (
                <DevConsole
                  ref={devConsoleRef}
                  defaultOpen={false}
                  position="bottom-left"
                />
              )}
            </Router>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App