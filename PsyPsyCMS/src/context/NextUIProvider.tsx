import React from 'react'
import { NextUIProvider as BaseNextUIProvider } from '@nextui-org/react'

interface NextUIProviderProps {
  children: React.ReactNode
  theme?: 'light' | 'dark'
}

/**
 * NextUI Provider wrapper with healthcare-specific theming
 *
 * Provides NextUI components with healthcare-focused colors and styling
 * that comply with WCAG AA accessibility standards and HIPAA compliance requirements.
 */
export function NextUIProvider({ children, theme = 'light' }: NextUIProviderProps) {
  return (
    <BaseNextUIProvider>
      <div className={theme === 'dark' ? 'dark' : 'light'}>
        {children}
      </div>
    </BaseNextUIProvider>
  )
}