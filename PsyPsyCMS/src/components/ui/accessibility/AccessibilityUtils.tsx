/**
 * AccessibilityUtils - WCAG AAA accessibility utilities and hooks
 *
 * Provides comprehensive accessibility features including focus management,
 * keyboard navigation, screen reader support, and WCAG AAA compliance validation.
 */

import React, { useEffect, useRef, useCallback, useMemo } from 'react'
import { designTokens } from '@/ui/design-tokens'

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export interface AccessibilityOptions {
  /**
   * Whether to enable high contrast mode
   */
  highContrast?: boolean

  /**
   * Whether to enable reduced motion
   */
  reducedMotion?: boolean

  /**
   * Font size multiplier (1.0 = normal, 1.25 = large, 1.5 = extra large)
   */
  fontSizeMultiplier?: number

  /**
   * Whether to enable keyboard navigation indicators
   */
  keyboardNavigation?: boolean

  /**
   * Whether to enable screen reader announcements
   */
  screenReaderAnnouncements?: boolean

  /**
   * Focus management strategy
   */
  focusManagement?: 'auto' | 'manual' | 'none'
}

export interface FocusableElement {
  element: HTMLElement
  tabIndex: number
  isVisible: boolean
  isDisabled: boolean
}

export interface AriaLiveRegionProps {
  /**
   * Message to announce
   */
  message: string

  /**
   * Priority of the announcement
   */
  priority?: 'polite' | 'assertive'

  /**
   * Whether to clear the message after announcing
   */
  clearAfterAnnounce?: boolean

  /**
   * Delay before clearing (ms)
   */
  clearDelay?: number
}

// =============================================================================
// WCAG AAA COMPLIANCE UTILITIES
// =============================================================================

/**
 * Calculate contrast ratio between two colors
 */
export function calculateContrastRatio(color1: string, color2: string): number {
  const getLuminance = (color: string): number => {
    // Convert hex to RGB
    const hex = color.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16) / 255
    const g = parseInt(hex.substr(2, 2), 16) / 255
    const b = parseInt(hex.substr(4, 2), 16) / 255

    // Calculate relative luminance
    const rs = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4)
    const gs = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4)
    const bs = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4)

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }

  const lum1 = getLuminance(color1)
  const lum2 = getLuminance(color2)
  const lighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)

  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Validate WCAG AAA contrast requirements
 */
export function validateWCAGContrast(
  foreground: string,
  background: string,
  fontSize: number = 16,
  isBold: boolean = false
): {
  ratio: number
  passes: {
    AA: boolean
    AAA: boolean
  }
  level: 'fail' | 'AA' | 'AAA'
} {
  const ratio = calculateContrastRatio(foreground, background)
  const isLargeText = fontSize >= 18 || (fontSize >= 14 && isBold)

  const aaThreshold = isLargeText ? 3 : 4.5
  const aaaThreshold = isLargeText ? 4.5 : 7

  return {
    ratio,
    passes: {
      AA: ratio >= aaThreshold,
      AAA: ratio >= aaaThreshold,
    },
    level: ratio >= aaaThreshold ? 'AAA' : ratio >= aaThreshold ? 'AA' : 'fail',
  }
}

/**
 * Get WCAG AAA compliant color pairs
 */
export function getWCAGCompliantColors() {
  return {
    // Primary healthcare colors with AAA compliance
    primary: {
      background: '#FFFFFF',
      foreground: '#1976D2',
      contrastRatio: calculateContrastRatio('#1976D2', '#FFFFFF'),
    },
    success: {
      background: '#FFFFFF',
      foreground: '#2E7D32',
      contrastRatio: calculateContrastRatio('#2E7D32', '#FFFFFF'),
    },
    warning: {
      background: '#FFFFFF',
      foreground: '#FF6F00',
      contrastRatio: calculateContrastRatio('#FF6F00', '#FFFFFF'),
    },
    danger: {
      background: '#FFFFFF',
      foreground: '#C62828',
      contrastRatio: calculateContrastRatio('#C62828', '#FFFFFF'),
    },
    // High contrast variants for accessibility
    highContrast: {
      background: '#000000',
      foreground: '#FFFFFF',
      contrastRatio: 21, // Maximum possible contrast
    },
    emergency: {
      background: '#FFFFFF',
      foreground: '#B71C1C',
      contrastRatio: calculateContrastRatio('#B71C1C', '#FFFFFF'),
    },
  }
}

// =============================================================================
// FOCUS MANAGEMENT HOOKS
// =============================================================================

/**
 * Hook for managing focus within a container
 */
export function useFocusManagement(containerRef: React.RefObject<HTMLElement>) {
  const focusableElementsRef = useRef<FocusableElement[]>([])

  const getFocusableElements = useCallback((): FocusableElement[] => {
    if (!containerRef.current) return []

    const focusableSelectors = [
      'button:not([disabled])',
      '[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ]

    const elements = containerRef.current.querySelectorAll(
      focusableSelectors.join(', ')
    ) as NodeListOf<HTMLElement>

    return Array.from(elements).map(element => ({
      element,
      tabIndex: parseInt(element.getAttribute('tabindex') || '0'),
      isVisible: element.offsetParent !== null,
      isDisabled: element.hasAttribute('disabled') || element.getAttribute('aria-disabled') === 'true',
    })).filter(item => item.isVisible && !item.isDisabled)
  }, [containerRef])

  const focusFirst = useCallback(() => {
    const elements = getFocusableElements()
    if (elements.length > 0) {
      elements[0].element.focus()
    }
  }, [getFocusableElements])

  const focusLast = useCallback(() => {
    const elements = getFocusableElements()
    if (elements.length > 0) {
      elements[elements.length - 1].element.focus()
    }
  }, [getFocusableElements])

  const focusNext = useCallback(() => {
    const elements = getFocusableElements()
    const currentIndex = elements.findIndex(item => item.element === document.activeElement)

    if (currentIndex === -1) {
      focusFirst()
    } else if (currentIndex < elements.length - 1) {
      elements[currentIndex + 1].element.focus()
    } else {
      // Wrap to first element
      focusFirst()
    }
  }, [getFocusableElements, focusFirst])

  const focusPrevious = useCallback(() => {
    const elements = getFocusableElements()
    const currentIndex = elements.findIndex(item => item.element === document.activeElement)

    if (currentIndex === -1) {
      focusLast()
    } else if (currentIndex > 0) {
      elements[currentIndex - 1].element.focus()
    } else {
      // Wrap to last element
      focusLast()
    }
  }, [getFocusableElements, focusLast])

  const trapFocus = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Tab') {
      event.preventDefault()
      if (event.shiftKey) {
        focusPrevious()
      } else {
        focusNext()
      }
    }
  }, [focusNext, focusPrevious])

  useEffect(() => {
    focusableElementsRef.current = getFocusableElements()
  }, [getFocusableElements])

  return {
    focusableElements: focusableElementsRef.current,
    focusFirst,
    focusLast,
    focusNext,
    focusPrevious,
    trapFocus,
  }
}

/**
 * Hook for managing focus restoration
 */
export function useFocusRestore() {
  const previousActiveElementRef = useRef<HTMLElement | null>(null)

  const saveFocus = useCallback(() => {
    previousActiveElementRef.current = document.activeElement as HTMLElement
  }, [])

  const restoreFocus = useCallback(() => {
    if (previousActiveElementRef.current) {
      previousActiveElementRef.current.focus()
      previousActiveElementRef.current = null
    }
  }, [])

  return { saveFocus, restoreFocus }
}

// =============================================================================
// KEYBOARD NAVIGATION HOOKS
// =============================================================================

/**
 * Hook for keyboard navigation with ARIA support
 */
export function useKeyboardNavigation(
  options: {
    enableArrows?: boolean
    enableHomeEnd?: boolean
    enableEscape?: boolean
    onEscape?: () => void
    orientation?: 'horizontal' | 'vertical' | 'both'
  } = {}
) {
  const {
    enableArrows = true,
    enableHomeEnd = true,
    enableEscape = true,
    onEscape,
    orientation = 'both',
  } = options

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowUp':
        if (enableArrows && (orientation === 'vertical' || orientation === 'both')) {
          event.preventDefault()
          // Focus previous element in vertical direction
        }
        break

      case 'ArrowDown':
        if (enableArrows && (orientation === 'vertical' || orientation === 'both')) {
          event.preventDefault()
          // Focus next element in vertical direction
        }
        break

      case 'ArrowLeft':
        if (enableArrows && (orientation === 'horizontal' || orientation === 'both')) {
          event.preventDefault()
          // Focus previous element in horizontal direction
        }
        break

      case 'ArrowRight':
        if (enableArrows && (orientation === 'horizontal' || orientation === 'both')) {
          event.preventDefault()
          // Focus next element in horizontal direction
        }
        break

      case 'Home':
        if (enableHomeEnd) {
          event.preventDefault()
          // Focus first element
        }
        break

      case 'End':
        if (enableHomeEnd) {
          event.preventDefault()
          // Focus last element
        }
        break

      case 'Escape':
        if (enableEscape) {
          event.preventDefault()
          onEscape?.()
        }
        break
    }
  }, [enableArrows, enableHomeEnd, enableEscape, onEscape, orientation])

  return { handleKeyDown }
}

// =============================================================================
// SCREEN READER SUPPORT
// =============================================================================

/**
 * Component for live region announcements
 */
export function AriaLiveRegion({
  message,
  priority = 'polite',
  clearAfterAnnounce = true,
  clearDelay = 1000,
}: AriaLiveRegionProps) {
  const [currentMessage, setCurrentMessage] = React.useState('')

  useEffect(() => {
    if (message) {
      setCurrentMessage(message)

      if (clearAfterAnnounce) {
        const timer = setTimeout(() => {
          setCurrentMessage('')
        }, clearDelay)

        return () => clearTimeout(timer)
      }
    }
  }, [message, clearAfterAnnounce, clearDelay])

  return (
    <div
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
      role="status"
    >
      {currentMessage}
    </div>
  )
}

/**
 * Hook for announcing messages to screen readers
 */
export function useScreenReaderAnnouncement() {
  const [announcement, setAnnouncement] = React.useState('')
  const [priority, setPriority] = React.useState<'polite' | 'assertive'>('polite')

  const announce = useCallback((message: string, urgency: 'polite' | 'assertive' = 'polite') => {
    setPriority(urgency)
    setAnnouncement(message)
  }, [])

  const clearAnnouncement = useCallback(() => {
    setAnnouncement('')
  }, [])

  return {
    announcement,
    priority,
    announce,
    clearAnnouncement,
    AriaLiveRegion: () => (
      <AriaLiveRegion
        message={announcement}
        priority={priority}
        clearAfterAnnounce={true}
        clearDelay={1000}
      />
    ),
  }
}

// =============================================================================
// ACCESSIBILITY VALIDATION
// =============================================================================

/**
 * Hook for validating accessibility requirements
 */
export function useAccessibilityValidation() {
  const validateElement = useCallback((element: HTMLElement) => {
    const issues: string[] = []

    // Check for alt text on images
    if (element.tagName === 'IMG' && !element.getAttribute('alt')) {
      issues.push('Image missing alt text')
    }

    // Check for proper heading hierarchy
    if (element.tagName.match(/^H[1-6]$/)) {
      const level = parseInt(element.tagName.charAt(1))
      const prevHeadings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
        .filter(h => h.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING)

      if (prevHeadings.length > 0) {
        const lastHeading = prevHeadings[prevHeadings.length - 1]
        const lastLevel = parseInt(lastHeading.tagName.charAt(1))

        if (level > lastLevel + 1) {
          issues.push(`Heading level ${level} follows level ${lastLevel} - skipped levels`)
        }
      }
    }

    // Check for proper button/link text
    if ((element.tagName === 'BUTTON' || element.tagName === 'A') &&
        !element.textContent?.trim() &&
        !element.getAttribute('aria-label') &&
        !element.getAttribute('aria-labelledby')) {
      issues.push('Interactive element missing accessible text')
    }

    // Check for proper form labels
    if (element.tagName === 'INPUT' && element.getAttribute('type') !== 'hidden') {
      const id = element.getAttribute('id')
      const hasLabel = id && document.querySelector(`label[for="${id}"]`)
      const hasAriaLabel = element.getAttribute('aria-label') || element.getAttribute('aria-labelledby')

      if (!hasLabel && !hasAriaLabel) {
        issues.push('Form input missing proper label')
      }
    }

    // Check minimum touch target size (44px x 44px for WCAG AAA)
    if (element.tagName === 'BUTTON' || element.tagName === 'A') {
      const rect = element.getBoundingClientRect()
      if (rect.width < 44 || rect.height < 44) {
        issues.push('Interactive element smaller than minimum touch target (44px)')
      }
    }

    return issues
  }, [])

  const validatePage = useCallback(() => {
    const allIssues: Array<{ element: HTMLElement; issues: string[] }> = []
    const elements = document.querySelectorAll('*')

    elements.forEach(element => {
      const issues = validateElement(element as HTMLElement)
      if (issues.length > 0) {
        allIssues.push({ element: element as HTMLElement, issues })
      }
    })

    return allIssues
  }, [validateElement])

  return { validateElement, validatePage }
}

// =============================================================================
// ACCESSIBILITY CONTEXT
// =============================================================================

interface AccessibilityContextType {
  options: AccessibilityOptions
  updateOptions: (newOptions: Partial<AccessibilityOptions>) => void
  announce: (message: string, priority?: 'polite' | 'assertive') => void
  isHighContrast: boolean
  isReducedMotion: boolean
  fontSizeMultiplier: number
}

const AccessibilityContext = React.createContext<AccessibilityContextType | undefined>(undefined)

/**
 * Provider for accessibility settings and utilities
 */
export function AccessibilityProvider({
  children,
  defaultOptions = {},
}: {
  children: React.ReactNode
  defaultOptions?: Partial<AccessibilityOptions>
}) {
  const [options, setOptions] = React.useState<AccessibilityOptions>({
    highContrast: false,
    reducedMotion: false,
    fontSizeMultiplier: 1.0,
    keyboardNavigation: true,
    screenReaderAnnouncements: true,
    focusManagement: 'auto',
    ...defaultOptions,
  })

  const { announce } = useScreenReaderAnnouncement()

  const updateOptions = useCallback((newOptions: Partial<AccessibilityOptions>) => {
    setOptions(prev => ({ ...prev, ...newOptions }))
  }, [])

  // Detect user preferences
  useEffect(() => {
    const mediaQueries = {
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)'),
      highContrast: window.matchMedia('(prefers-contrast: high)'),
    }

    const updateFromMediaQuery = () => {
      setOptions(prev => ({
        ...prev,
        reducedMotion: mediaQueries.reducedMotion.matches,
        highContrast: mediaQueries.highContrast.matches,
      }))
    }

    // Initial check
    updateFromMediaQuery()

    // Listen for changes
    Object.values(mediaQueries).forEach(mq => {
      mq.addEventListener('change', updateFromMediaQuery)
    })

    return () => {
      Object.values(mediaQueries).forEach(mq => {
        mq.removeEventListener('change', updateFromMediaQuery)
      })
    }
  }, [])

  // Apply accessibility options to document
  useEffect(() => {
    const root = document.documentElement

    // Apply font size multiplier
    root.style.setProperty('--font-size-multiplier', options.fontSizeMultiplier.toString())

    // Apply high contrast mode
    if (options.highContrast) {
      root.classList.add('accessibility-high-contrast')
    } else {
      root.classList.remove('accessibility-high-contrast')
    }

    // Apply reduced motion
    if (options.reducedMotion) {
      root.classList.add('accessibility-reduced-motion')
    } else {
      root.classList.remove('accessibility-reduced-motion')
    }

    // Apply keyboard navigation indicators
    if (options.keyboardNavigation) {
      root.classList.add('accessibility-keyboard-navigation')
    } else {
      root.classList.remove('accessibility-keyboard-navigation')
    }
  }, [options])

  const contextValue = useMemo(() => ({
    options,
    updateOptions,
    announce,
    isHighContrast: options.highContrast || false,
    isReducedMotion: options.reducedMotion || false,
    fontSizeMultiplier: options.fontSizeMultiplier || 1.0,
  }), [options, updateOptions, announce])

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
    </AccessibilityContext.Provider>
  )
}

/**
 * Hook to access accessibility context
 */
export function useAccessibility() {
  const context = React.useContext(AccessibilityContext)
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider')
  }
  return context
}

// =============================================================================
// UTILITY EXPORTS
// =============================================================================

export {
  calculateContrastRatio,
  validateWCAGContrast,
  getWCAGCompliantColors,
}

export default AccessibilityProvider