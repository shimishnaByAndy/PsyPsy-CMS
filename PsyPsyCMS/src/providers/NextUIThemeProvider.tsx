/**
 * NextUI Theme Provider for PsyPsy CMS
 *
 * Provides healthcare-optimized themes with context-aware theme switching
 * based on user role, locale, and emergency status.
 */

import React, { createContext, useContext, useState, useEffect } from 'react'
import { NextUIProvider } from '@nextui-org/react'
import { ThemeProvider as NextThemeProvider } from 'next-themes'
import { themeUtils, type HealthcareTheme, type ThemeContext } from '@/ui/nextui-theme'

// =============================================================================
// THEME CONTEXT
// =============================================================================

interface HealthcareThemeContextType {
  currentTheme: HealthcareTheme
  setTheme: (theme: HealthcareTheme) => void
  toggleDarkMode: () => void
  setEmergencyMode: (isEmergency: boolean) => void
  setUserContext: (context: Partial<ThemeContext>) => void
  isDarkMode: boolean
  isEmergencyMode: boolean
  userContext: ThemeContext
}

const HealthcareThemeContext = createContext<HealthcareThemeContextType | undefined>(undefined)

// =============================================================================
// THEME PROVIDER COMPONENT
// =============================================================================

interface NextUIThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: HealthcareTheme
  defaultUserContext?: Partial<ThemeContext>
}

export function NextUIThemeProvider({
  children,
  defaultTheme = 'healthcare-light',
  defaultUserContext = {},
}: NextUIThemeProviderProps) {
  // Initialize user context with defaults
  const [userContext, setUserContextState] = useState<ThemeContext>({
    isDark: false,
    isEmergency: false,
    userRole: 'patient',
    locale: 'en',
    ...defaultUserContext,
  })

  // Theme state management
  const [currentTheme, setCurrentTheme] = useState<HealthcareTheme>(defaultTheme)
  const [isDarkMode, setIsDarkMode] = useState(userContext.isDark || false)
  const [isEmergencyMode, setIsEmergencyMode] = useState(userContext.isEmergency || false)

  // Update theme when context changes
  useEffect(() => {
    const newTheme = themeUtils.getThemeForContext({
      ...userContext,
      isDark: isDarkMode,
      isEmergency: isEmergencyMode,
    })
    setCurrentTheme(newTheme)
  }, [userContext, isDarkMode, isEmergencyMode])

  // Theme control functions
  const setTheme = (theme: HealthcareTheme) => {
    setCurrentTheme(theme)

    // Update context state based on theme
    if (theme === 'healthcare-dark') {
      setIsDarkMode(true)
    } else if (theme === 'emergency') {
      setIsEmergencyMode(true)
    } else {
      setIsDarkMode(false)
      setIsEmergencyMode(false)
    }
  }

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode
    setIsDarkMode(newDarkMode)

    // Don't override emergency mode
    if (!isEmergencyMode) {
      const newTheme = themeUtils.getThemeForContext({
        ...userContext,
        isDark: newDarkMode,
        isEmergency: false,
      })
      setCurrentTheme(newTheme)
    }
  }

  const setEmergencyMode = (isEmergency: boolean) => {
    setIsEmergencyMode(isEmergency)

    if (isEmergency) {
      setCurrentTheme('emergency')
    } else {
      // Return to appropriate theme based on context
      const newTheme = themeUtils.getThemeForContext({
        ...userContext,
        isDark: isDarkMode,
        isEmergency: false,
      })
      setCurrentTheme(newTheme)
    }
  }

  const setUserContext = (context: Partial<ThemeContext>) => {
    const newContext = { ...userContext, ...context }
    setUserContextState(newContext)

    // Update dark mode if specified in context
    if (context.isDark !== undefined) {
      setIsDarkMode(context.isDark)
    }

    // Update emergency mode if specified in context
    if (context.isEmergency !== undefined) {
      setIsEmergencyMode(context.isEmergency)
    }
  }

  // Context value
  const contextValue: HealthcareThemeContextType = {
    currentTheme,
    setTheme,
    toggleDarkMode,
    setEmergencyMode,
    setUserContext,
    isDarkMode,
    isEmergencyMode,
    userContext,
  }

  return (
    <HealthcareThemeContext.Provider value={contextValue}>
      <NextThemeProvider
        attribute="class"
        defaultTheme={currentTheme}
        value={{
          'healthcare-light': 'healthcare-light',
          'healthcare-dark': 'healthcare-dark',
          'quebec-professional': 'quebec-professional',
          'emergency': 'emergency',
        }}
        enableSystem={false}
        disableTransitionOnChange={false}
      >
        <NextUIProvider>
          <div
            className={`min-h-screen ${currentTheme}`}
            data-theme={currentTheme}
            data-emergency={isEmergencyMode}
            data-role={userContext.userRole}
            data-locale={userContext.locale}
          >
            {children}
          </div>
        </NextUIProvider>
      </NextThemeProvider>
    </HealthcareThemeContext.Provider>
  )
}

// =============================================================================
// THEME HOOK
// =============================================================================

/**
 * Hook to access the healthcare theme context
 */
export function useHealthcareTheme() {
  const context = useContext(HealthcareThemeContext)

  if (context === undefined) {
    throw new Error('useHealthcareTheme must be used within a NextUIThemeProvider')
  }

  return context
}

// =============================================================================
// THEME UTILITIES
// =============================================================================

/**
 * Hook for emergency mode management
 */
export function useEmergencyMode() {
  const { isEmergencyMode, setEmergencyMode } = useHealthcareTheme()

  return {
    isEmergencyMode,
    activateEmergencyMode: () => setEmergencyMode(true),
    deactivateEmergencyMode: () => setEmergencyMode(false),
    toggleEmergencyMode: () => setEmergencyMode(!isEmergencyMode),
  }
}

/**
 * Hook for accessibility and healthcare-specific theme features
 */
export function useHealthcareAccessibility() {
  const { userContext, setUserContext, isDarkMode, toggleDarkMode } = useHealthcareTheme()

  return {
    isDarkMode,
    toggleDarkMode,
    highContrast: userContext.locale === 'fr', // Quebec professional theme has higher contrast
    setUserRole: (role: 'patient' | 'professional' | 'admin') =>
      setUserContext({ userRole: role }),
    setLocale: (locale: 'en' | 'fr') =>
      setUserContext({ locale }),
    enableQuebecMode: () =>
      setUserContext({ locale: 'fr', userRole: 'professional' }),
  }
}

/**
 * Component to inject theme-specific CSS custom properties
 */
export function ThemeCSS() {
  const { currentTheme } = useHealthcareTheme()

  // Generate CSS custom properties based on current theme
  const themeCSS = React.useMemo(() => {
    const semanticColors = themeUtils.getSemanticColors(currentTheme)

    return {
      '--healthcare-primary': semanticColors.primary,
      '--healthcare-success': semanticColors.success,
      '--healthcare-warning': semanticColors.warning,
      '--healthcare-danger': semanticColors.danger,
      '--healthcare-background': semanticColors.background,
      '--healthcare-foreground': semanticColors.foreground,
    }
  }, [currentTheme])

  return (
    <style>
      {`:root { ${Object.entries(themeCSS).map(([key, value]) => `${key}: ${value}`).join('; ')} }`}
    </style>
  )
}

// =============================================================================
// THEME SELECTOR COMPONENT
// =============================================================================

/**
 * Theme selector component for development and user preferences
 */
export function ThemeSelector() {
  const {
    currentTheme,
    setTheme,
    toggleDarkMode,
    isDarkMode,
    isEmergencyMode,
    setEmergencyMode,
    userContext,
    setUserContext
  } = useHealthcareTheme()

  const themes: { value: HealthcareTheme; label: string; description: string }[] = [
    {
      value: 'healthcare-light',
      label: 'Healthcare Light',
      description: 'Standard healthcare interface with WCAG AAA compliance'
    },
    {
      value: 'healthcare-dark',
      label: 'Healthcare Dark',
      description: 'Dark mode for reduced eye strain'
    },
    {
      value: 'quebec-professional',
      label: 'Quebec Professional',
      description: 'Quebec-specific professional theme with bilingual support'
    },
    {
      value: 'emergency',
      label: 'Emergency Mode',
      description: 'High contrast theme for critical situations'
    },
  ]

  return (
    <div className="p-4 border rounded-lg space-y-4">
      <h3 className="text-lg font-semibold">Theme Settings</h3>

      {/* Theme Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Theme:</label>
        <select
          value={currentTheme}
          onChange={(e) => setTheme(e.target.value as HealthcareTheme)}
          className="w-full p-2 border rounded"
        >
          {themes.map((theme) => (
            <option key={theme.value} value={theme.value}>
              {theme.label}
            </option>
          ))}
        </select>
      </div>

      {/* Quick Toggles */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={toggleDarkMode}
          className={`px-3 py-1 rounded text-sm ${
            isDarkMode ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </button>

        <button
          onClick={() => setEmergencyMode(!isEmergencyMode)}
          className={`px-3 py-1 rounded text-sm ${
            isEmergencyMode ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          {isEmergencyMode ? 'Exit Emergency' : 'Emergency Mode'}
        </button>
      </div>

      {/* User Context */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-gray-600">Role:</label>
          <select
            value={userContext.userRole}
            onChange={(e) => setUserContext({ userRole: e.target.value as any })}
            className="w-full p-1 border rounded text-sm"
          >
            <option value="patient">Patient</option>
            <option value="professional">Professional</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-600">Locale:</label>
          <select
            value={userContext.locale}
            onChange={(e) => setUserContext({ locale: e.target.value as any })}
            className="w-full p-1 border rounded text-sm"
          >
            <option value="en">English</option>
            <option value="fr">Français</option>
          </select>
        </div>
      </div>

      {/* Current Theme Info */}
      <div className="text-xs text-gray-600 border-t pt-2">
        <p><strong>Current:</strong> {currentTheme}</p>
        <p><strong>Context:</strong> {userContext.userRole} | {userContext.locale} | {isDarkMode ? 'Dark' : 'Light'} | {isEmergencyMode ? 'Emergency' : 'Normal'}</p>
      </div>
    </div>
  )
}

/**
 * Default export for convenience
 */
export default NextUIThemeProvider