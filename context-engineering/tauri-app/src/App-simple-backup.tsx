import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'

// Import global styles
import './globals.css'

// Import components
import { ThemeProvider } from '@/context/ThemeProvider'
import { AuthProvider, useAuth } from '@/context/AuthProvider'
import { ErrorBoundary } from '@/components/ErrorBoundary'

// Import pages
import DashboardPage from '@/pages/DashboardPage'
import ClientsPage from '@/pages/ClientsPage'
import ProfessionalsPage from '@/pages/ProfessionalsPage'
import AppointmentsPage from '@/pages/AppointmentsPage'
import NotesPage from '@/pages/NotesPage'
import SettingsPage from '@/pages/SettingsPage'
import LoginPage from '@/pages/LoginPage'
import LoadingPage from '@/pages/LoadingPage'

/**
 * Simple Layout component for now
 */
function SimpleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">PsyPsy CMS</h1>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/" className="text-gray-700 hover:text-gray-900">Dashboard</a>
              <a href="/clients" className="text-gray-700 hover:text-gray-900">Clients</a>
              <a href="/professionals" className="text-gray-700 hover:text-gray-900">Professionals</a>
              <a href="/appointments" className="text-gray-700 hover:text-gray-900">Appointments</a>
              <a href="/settings" className="text-gray-700 hover:text-gray-900">Settings</a>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}

/**
 * Protected Route component
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingPage />
  }

  // For now, allow access without authentication
  // if (!user) {
  //   return <Navigate to="/login" replace />
  // }

  return <>{children}</>
}

/**
 * Main App component
 */
function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <SimpleLayout>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/clients"
                  element={
                    <ProtectedRoute>
                      <ClientsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/professionals"
                  element={
                    <ProtectedRoute>
                      <ProfessionalsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/appointments"
                  element={
                    <ProtectedRoute>
                      <AppointmentsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/notes"
                  element={
                    <ProtectedRoute>
                      <NotesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </SimpleLayout>
          </Router>
          <Toaster position="top-right" />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App