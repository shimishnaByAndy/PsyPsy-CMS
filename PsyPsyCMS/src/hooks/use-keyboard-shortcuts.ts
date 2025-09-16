/**
 * Custom hook for managing keyboard shortcuts throughout the application
 * Provides consistent keyboard shortcut handling with proper cleanup
 */

import { useEffect, useCallback, useRef } from 'react'

export interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
  callback: (event: KeyboardEvent) => void
  description?: string
  preventDefault?: boolean
  stopPropagation?: boolean
}

export interface UseKeyboardShortcutsOptions {
  enabled?: boolean
  target?: Document | HTMLElement | null
}

/**
 * Hook for handling keyboard shortcuts
 */
export const useKeyboardShortcuts = (
  shortcuts: KeyboardShortcut[],
  options: UseKeyboardShortcutsOptions = {}
) => {
  const { enabled = true, target = document } = options
  const shortcutsRef = useRef<KeyboardShortcut[]>([])

  // Update shortcuts ref when shortcuts change
  useEffect(() => {
    shortcutsRef.current = shortcuts
  }, [shortcuts])

  const handleKeyDown = useCallback((event: Event) => {
    const keyboardEvent = event as KeyboardEvent
    if (!enabled) return

    const activeShortcuts = shortcutsRef.current

    for (const shortcut of activeShortcuts) {
      const {
        key,
        ctrl = false,
        shift = false,
        alt = false,
        meta = false,
        callback,
        preventDefault = true,
        stopPropagation = true
      } = shortcut

      // Check if the key matches
      const keyMatches = keyboardEvent.key.toLowerCase() === key.toLowerCase() ||
                        keyboardEvent.code.toLowerCase() === key.toLowerCase()

      // Check modifier keys
      const ctrlMatches = ctrl === (keyboardEvent.ctrlKey || keyboardEvent.metaKey)
      const shiftMatches = shift === keyboardEvent.shiftKey
      const altMatches = alt === keyboardEvent.altKey
      const metaMatches = meta === keyboardEvent.metaKey

      if (keyMatches && ctrlMatches && shiftMatches && altMatches && metaMatches) {
        if (preventDefault) {
          event.preventDefault()
        }
        if (stopPropagation) {
          event.stopPropagation()
        }

        callback(keyboardEvent)
        break // Only trigger the first matching shortcut
      }
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled || !target) return

    const element = target as Document | HTMLElement

    element.addEventListener('keydown', handleKeyDown)

    return () => {
      element.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown, enabled, target])
}

/**
 * Hook for a single keyboard shortcut
 */
export const useKeyboardShortcut = (
  key: string,
  callback: (event: KeyboardEvent) => void,
  options: {
    ctrl?: boolean
    shift?: boolean
    alt?: boolean
    meta?: boolean
    enabled?: boolean
    preventDefault?: boolean
    stopPropagation?: boolean
    target?: Document | HTMLElement | null
  } = {}
) => {
  const {
    ctrl = false,
    shift = false,
    alt = false,
    meta = false,
    enabled = true,
    preventDefault = true,
    stopPropagation = true,
    target = document
  } = options

  const shortcuts: KeyboardShortcut[] = [
    {
      key,
      ctrl,
      shift,
      alt,
      meta,
      callback,
      preventDefault,
      stopPropagation
    }
  ]

  useKeyboardShortcuts(shortcuts, { enabled, target })
}

/**
 * Development keyboard shortcuts
 */
export const useDevKeyboardShortcuts = (callbacks: {
  toggleDevConsole?: () => void
  toggleReactQueryDevtools?: () => void
  clearConsole?: () => void
  reloadPage?: () => void
}) => {
  const {
    toggleDevConsole,
    toggleReactQueryDevtools,
    clearConsole,
    reloadPage
  } = callbacks

  const shortcuts: KeyboardShortcut[] = []

  // Ctrl+Shift+D - Toggle Dev Console
  if (toggleDevConsole) {
    shortcuts.push({
      key: 'D',
      ctrl: true,
      shift: true,
      callback: toggleDevConsole,
      description: 'Toggle Development Console'
    })
  }

  // Ctrl+Shift+Q - Toggle React Query DevTools
  if (toggleReactQueryDevtools) {
    shortcuts.push({
      key: 'Q',
      ctrl: true,
      shift: true,
      callback: toggleReactQueryDevtools,
      description: 'Toggle React Query DevTools'
    })
  }

  // Ctrl+Shift+C - Clear Console
  if (clearConsole) {
    shortcuts.push({
      key: 'C',
      ctrl: true,
      shift: true,
      callback: clearConsole,
      description: 'Clear Development Console'
    })
  }

  // Ctrl+Shift+R - Reload Page (in dev)
  if (reloadPage && process.env.NODE_ENV === 'development') {
    shortcuts.push({
      key: 'R',
      ctrl: true,
      shift: true,
      callback: reloadPage,
      description: 'Reload Page'
    })
  }

  useKeyboardShortcuts(shortcuts, {
    enabled: process.env.NODE_ENV === 'development'
  })
}

/**
 * Healthcare-specific keyboard shortcuts
 */
export const useHealthcareKeyboardShortcuts = (callbacks: {
  quickSearchClients?: () => void
  newAppointment?: () => void
  emergencyMode?: () => void
}) => {
  const {
    quickSearchClients,
    newAppointment,
    emergencyMode
  } = callbacks

  const shortcuts: KeyboardShortcut[] = []

  // Ctrl+K - Quick search clients
  if (quickSearchClients) {
    shortcuts.push({
      key: 'K',
      ctrl: true,
      callback: quickSearchClients,
      description: 'Quick Search Clients'
    })
  }

  // Ctrl+N - New appointment
  if (newAppointment) {
    shortcuts.push({
      key: 'N',
      ctrl: true,
      callback: newAppointment,
      description: 'New Appointment'
    })
  }

  // Ctrl+Alt+E - Emergency mode
  if (emergencyMode) {
    shortcuts.push({
      key: 'E',
      ctrl: true,
      alt: true,
      callback: emergencyMode,
      description: 'Emergency Mode'
    })
  }

  useKeyboardShortcuts(shortcuts)
}

/**
 * Utility function to format keyboard shortcut for display
 */
export const formatKeyboardShortcut = (shortcut: Partial<KeyboardShortcut>): string => {
  const parts: string[] = []

  if (shortcut.ctrl || shortcut.meta) {
    parts.push(navigator.platform.includes('Mac') ? '⌘' : 'Ctrl')
  }
  if (shortcut.shift) {
    parts.push('Shift')
  }
  if (shortcut.alt) {
    parts.push('Alt')
  }
  if (shortcut.key) {
    parts.push(shortcut.key.toUpperCase())
  }

  return parts.join(navigator.platform.includes('Mac') ? '' : '+')
}

export default useKeyboardShortcuts