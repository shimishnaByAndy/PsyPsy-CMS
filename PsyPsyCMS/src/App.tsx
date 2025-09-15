import React, { Suspense, useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useTranslation } from 'react-i18next'

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
import ClientsPage from '@/pages/ClientsPage'
import ProfessionalsPage from '@/pages/ProfessionalsPage'
import AppointmentsPage from '@/pages/AppointmentsPage'
import NotesPage from '@/pages/NotesPage'
import SettingsPage from '@/pages/SettingsPage'
import LoginPage from '@/pages/LoginPage'
import LoadingPage from '@/pages/LoadingPage'

// Import error boundary
import { ErrorBoundary } from '@/components/ErrorBoundary'

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
  const { i18n } = useTranslation()
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
      icon: 'Home',
      href: '/dashboard',
      active: location.pathname === '/dashboard',
    },
    {
      id: 'clients',
      label: 'Clients',
      icon: 'Users',
      href: '/clients',
      active: location.pathname === '/clients',
      badge: 12,
    },
    {
      id: 'appointments',
      label: 'Appointments',
      icon: 'Calendar',
      href: '/appointments',
      active: location.pathname === '/appointments',
      badge: 3,
    },
    {
      id: 'professionals',
      label: 'Professionals',
      icon: 'UserCog',
      href: '/professionals',
      active: location.pathname === '/professionals',
    },
    {
      id: 'notes',
      label: 'Notes & Files',
      icon: 'FileText',
      href: '/notes',
      active: location.pathname === '/notes',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'Settings',
      href: '/settings',
      active: location.pathname === '/settings',
    },
  ]

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      
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
  useEffect(() => {
    // Initialize offline persistence for TanStack Query
    initializePersistence()
    
    // Initialize Tauri-specific features if needed
    if (window.__TAURI__) {
      // Tauri-specific initialization
      console.log('Running in Tauri environment')
    }
  }, [])

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
                  position="bottom-right"
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