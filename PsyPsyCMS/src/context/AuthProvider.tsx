import React, { createContext, useContext, useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase/firebase-config'
import { User } from '@/types/index'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  checkStoredSession: () => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: async () => {},
  checkStoredSession: async () => {},
  logout: () => {},
})

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true) // Start as loading to check stored session

  // Check for Firebase auth state changes
  useEffect(() => {
    if (!auth) {
      console.warn('Firebase Auth not initialized')
      setIsLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      console.log('🔐 Auth state changed:', firebaseUser ? 'User logged in' : 'User logged out')

      if (firebaseUser) {
        try {
          console.log('🔐 Attempting to get user profile from Firestore...')

          // Get user profile from Firestore
          const userDoc = await getDoc(doc(db!, 'users', firebaseUser.uid))

          if (userDoc.exists()) {
            console.log('✅ User profile found in Firestore')
            const userData = userDoc.data() as Partial<User>
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              username: userData.username || firebaseUser.email!.split('@')[0],
              role: userData.role || 'professional',
              isActive: userData.isActive !== false,
              createdAt: userData.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              profile: userData.profile || {
                firstName: userData.profile?.firstName || 'User',
                lastName: userData.profile?.lastName || '',
                fullName: userData.profile?.fullName || firebaseUser.displayName || 'User',
                language: 'en'
              },
              preferences: userData.preferences || {
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
            console.log('📝 Creating new user profile in Firestore...')
            // Create new user profile in Firestore
            const newUser: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              username: firebaseUser.email!.split('@')[0],
              role: 'professional',
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              profile: {
                firstName: firebaseUser.displayName?.split(' ')[0] || 'User',
                lastName: firebaseUser.displayName?.split(' ')[1] || '',
                fullName: firebaseUser.displayName || 'User',
                language: 'en'
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
            }

            await setDoc(doc(db!, 'users', firebaseUser.uid), newUser)
            setUser(newUser)
            console.log('✅ Created new user profile in Firestore emulator')
          }
        } catch (error) {
          console.error('❌ Failed to get/create user profile:', error)
          console.error('Error details:', error)

          // Fallback: Create basic user from Firebase Auth data
          console.log('🔄 Falling back to basic user profile...')
          const fallbackUser: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email!,
            username: firebaseUser.email!.split('@')[0],
            role: 'professional',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            profile: {
              firstName: firebaseUser.displayName?.split(' ')[0] || 'User',
              lastName: firebaseUser.displayName?.split(' ')[1] || '',
              fullName: firebaseUser.displayName || firebaseUser.email!.split('@')[0],
              language: 'en'
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
          }
          setUser(fallbackUser)
        }
      } else {
        setUser(null)
      }

      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Handle store_session after user object is created (for rememberMe functionality)
  useEffect(() => {
    const handlePendingStoreSession = async () => {
      const pendingRememberMe = sessionStorage.getItem('pendingRememberMe')
      const pendingUserId = sessionStorage.getItem('pendingUserId')

      if (user && pendingRememberMe === 'true' && pendingUserId === user.id) {
        try {
          console.log('🔐 Storing session for remember me functionality...')

          // Convert frontend User to Rust User format expected by store_session
          const rustUser = {
            base: {
              object_id: user.id,
              email: user.email,
              user_type: user.role === 'admin' ? 'Admin' :
                         user.role === 'professional' ? 'Professional' : 'Client',
              created_at: user.createdAt,
              updated_at: user.updatedAt,
            },
            profile: {
              first_name: user.profile.firstName,
              last_name: user.profile.lastName,
              full_name: user.profile.fullName,
              updated_at: user.updatedAt,
            },
            preferences: user.preferences
          }

          await invoke('store_session', {
            user: rustUser,
            rememberMe: true
          })

          console.log('✅ Session stored successfully for remember me')

          // Clear pending flags
          sessionStorage.removeItem('pendingRememberMe')
          sessionStorage.removeItem('pendingUserId')
        } catch (error) {
          console.error('Failed to store session preference:', error)
          // Clear pending flags even on error to prevent retry loops
          sessionStorage.removeItem('pendingRememberMe')
          sessionStorage.removeItem('pendingUserId')
        }
      }
    }

    if (user) {
      handlePendingStoreSession()
    }
  }, [user])

  const checkStoredSession = async () => {
    try {
      const storedSession = await invoke<{ user: User; sessionToken: string } | null>('get_stored_session')
      if (storedSession) {
        setUser(storedSession.user)
      }
    } catch (error) {
      console.error('Failed to check stored session:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    if (!auth) {
      throw new Error('Firebase Auth not initialized')
    }

    setIsLoading(true)

    try {
      console.log('🔐 Attempting Firebase Auth login with emulator...')

      // Sign in with Firebase Auth (connected to emulator)
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      console.log('✅ Firebase Auth login successful:', userCredential.user.email)

      // Store rememberMe preference for when user object is created
      if (rememberMe) {
        // Store the rememberMe flag temporarily until user object is available
        sessionStorage.setItem('pendingRememberMe', 'true')
        sessionStorage.setItem('pendingUserId', userCredential.user.uid)
      } else {
        // Clear any existing remember me settings
        sessionStorage.removeItem('pendingRememberMe')
        sessionStorage.removeItem('pendingUserId')
      }

      // The onAuthStateChanged listener will handle setting the user state
      // and creating/fetching the user profile from Firestore
      // store_session will be called after user object is created

      console.log('✅ Login completed successfully')
    } catch (error: any) {
      setIsLoading(false)
      console.error('❌ Firebase Auth login failed:', error)

      // Provide user-friendly error messages
      if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email address.')
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Incorrect password. Please try again.')
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address format.')
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many failed attempts. Please try again later.')
      } else {
        throw new Error('Login failed. Please check your credentials and try again.')
      }
    }
  }

  const logout = async () => {
    if (!auth) {
      console.warn('Firebase Auth not initialized')
      setUser(null)
      return
    }

    try {
      console.log('🔐 Signing out from Firebase Auth...')

      // Sign out from Firebase Auth
      await signOut(auth)

      // Clear stored session preference
      await invoke('clear_stored_session')

      console.log('✅ Logout completed successfully')
    } catch (error) {
      console.error('❌ Failed to logout:', error)
    }
    // Note: setUser(null) will be handled by onAuthStateChanged listener
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      checkStoredSession
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)