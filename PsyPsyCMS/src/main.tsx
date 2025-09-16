import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './globals.css'

// Import WebSocket service and console interceptor for MCP debugging
import { consoleInterceptor, webSocketService } from '@/services/websocket'

// Ensure we're running in a browser environment
if (typeof window !== 'undefined') {
  // Initialize console interception for MCP debugging (development only)
  if (process.env.NODE_ENV === 'development') {
    consoleInterceptor.install()

    // Global error handlers for MCP debugging
    window.addEventListener('error', (event) => {
      webSocketService.sendError(
        'javascript',
        event.message,
        event.error?.stack,
        undefined,
        'high'
      )
    })

    window.addEventListener('unhandledrejection', (event) => {
      webSocketService.sendError(
        'javascript',
        event.reason?.message || 'Unhandled promise rejection',
        event.reason?.stack,
        undefined,
        'high'
      )
    })

    console.log('[DevConsole] MCP debugger console interception initialized')
  }

  // Initialize the React application
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )

  // Add accessibility improvements
  if (process.env.NODE_ENV === 'development') {
    // Accessibility violations warnings in development
    import('@axe-core/react').then(axe => {
      axe.default(React, ReactDOM, 1000)
    })
  }

  // Performance monitoring (development only)
  if (process.env.NODE_ENV === 'development') {
    // Log performance metrics
    window.addEventListener('load', () => {
      if ('performance' in window) {
        setTimeout(() => {
          const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
          console.log('Performance Metrics:', {
            loadTime: perfData.loadEventEnd - perfData.fetchStart,
            domContentLoaded: perfData.domContentLoadedEventEnd - perfData.fetchStart,
            firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
          })
        }, 0)
      }
    })
  }

  // PWA-like features for Tauri
  if (window.__TAURI__) {
    // Disable context menu in Tauri (optional)
    document.addEventListener('contextmenu', event => {
      if (process.env.NODE_ENV === 'production') {
        event.preventDefault()
      }
    })

    // Disable text selection on non-input elements (optional)
    document.addEventListener('selectstart', event => {
      const target = event.target as HTMLElement
      if (!target.matches('input, textarea, [contenteditable="true"]')) {
        if (process.env.NODE_ENV === 'production') {
          event.preventDefault()
        }
      }
    })

    // Handle app focus/blur for better UX
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // App is hidden
        console.log('App hidden')
      } else {
        // App is visible
        console.log('App visible')
      }
    })
  }

  // Healthcare-specific accessibility enhancements
  document.documentElement.lang = 'en' // Default to English

  // High contrast mode detection
  const supportsHighContrast = window.matchMedia('(prefers-contrast: high)')
  if (supportsHighContrast.matches) {
    document.documentElement.classList.add('high-contrast')
  }

  // Reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  if (prefersReducedMotion.matches) {
    document.documentElement.classList.add('reduce-motion')
  }

  // Listen for preference changes
  supportsHighContrast.addEventListener('change', (e) => {
    document.documentElement.classList.toggle('high-contrast', e.matches)
  })

  prefersReducedMotion.addEventListener('change', (e) => {
    document.documentElement.classList.toggle('reduce-motion', e.matches)
  })
}