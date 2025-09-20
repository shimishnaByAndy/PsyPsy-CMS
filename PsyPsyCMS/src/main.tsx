import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './globals.css'

// Import DevTools console capture for cms-debugger integration
import devToolsCapture from '@/utils/devtools-console-capture'

// Ensure we're running in a browser environment and initialize DevTools BEFORE React loads
if (typeof window !== 'undefined') {
  // DevTools console capture - runs in development mode automatically
  // This MUST be initialized before React to catch early errors
  if (import.meta.env.DEV) {
    // Initialize immediately to catch all errors including React initialization
    devToolsCapture.initialize()
    console.log('[DevTools] PsyPsy CMS console capture initialized for cms-debugger')
  }

  // Initialize the React application
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )

  // Add accessibility improvements
  if (import.meta.env.DEV) {
    // Accessibility violations warnings in development
    import('@axe-core/react').then(axe => {
      axe.default(React, ReactDOM, 1000)
    })
  }

  // Performance monitoring (development only)
  if (import.meta.env.DEV) {
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
      if (import.meta.env.PROD) {
        event.preventDefault()
      }
    })

    // Disable text selection on non-input elements (optional)
    document.addEventListener('selectstart', event => {
      const target = event.target as HTMLElement
      if (!target.matches('input, textarea, [contenteditable="true"]')) {
        if (import.meta.env.PROD) {
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