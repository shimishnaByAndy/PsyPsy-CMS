import React, { createContext, useContext, useState } from 'react'
import { User } from '@/types/index'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: async () => {},
  logout: () => {},
})

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const login = async (email: string, password: string) => {
    setIsLoading(true)

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Demo credentials validation
      if (email === 'demo@psypsy.com' && password === 'demo123') {
        setUser({
          id: '1',
          email: 'demo@psypsy.com',
          username: 'demo',
          role: 'professional',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          profile: {
            firstName: 'Dr. Demo',
            lastName: 'User',
            fullName: 'Dr. Demo User',
            language: 'en',
          },
          preferences: {
            theme: 'light',
            language: 'en',
            notifications: {
              email: true,
              push: true,
              sms: false,
              appointmentReminders: true,
              systemUpdates: true
            },
            accessibility: {
              highContrast: false,
              fontSize: 'medium',
              reduceMotion: false,
              screenReader: false
            }
          }
        })
      } else {
        throw new Error('Invalid credentials')
      }
    } catch (error) {
      setIsLoading(false)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)