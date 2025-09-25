import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './globals.css'
import { NextUIProvider } from '@/context/NextUIProvider'

// Import DevTools console capture for cms-debugger integration (fallback only)
import devToolsCapture from '@/utils/devtools-console-capture'

// Enhanced initialization with proper timing coordination
async function initializeApplication() {
  // Wait for Tauri-injected CMS Debugger script to be ready (if available)
  if ((window as any).__CMS_DEBUGGER_INJECTED__) {
    console.log('[DevTools] Using Tauri-injected CMS Debugger script (optimal timing)')

    // Wait for CMS Debugger to be fully ready
    let attempts = 0
    while (!(window as any).__CMS_DEBUGGER_READY__ && attempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 10))
      attempts++
    }

    if ((window as any).__CMS_DEBUGGER_READY__) {
      console.log('[DevTools] CMS Debugger ready - proceeding with React initialization')
    } else {
      console.warn('[DevTools] CMS Debugger script timeout - initializing fallback')
    }
  } else if (import.meta.env.DEV) {
    // Fallback to frontend DevTools capture if Tauri injection not available
    console.log('[DevTools] Tauri injection not detected - using frontend DevTools capture')
    devToolsCapture.initialize()
    console.log('[DevTools] PsyPsy CMS console capture initialized for cms-debugger')
  }

  // Initialize the React application after debugger is ready
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <NextUIProvider theme="light">
        <App />
      </NextUIProvider>
    </React.StrictMode>,
  )
}

// Ensure we're running in a browser environment and initialize properly
if (typeof window !== 'undefined') {
  // Start the coordinated initialization process
  initializeApplication().catch(error => {
    console.error('[DevTools] Application initialization failed:', error)
    // Fallback: Initialize React anyway to prevent app breakage
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <NextUIProvider theme="light">
          <App />
        </NextUIProvider>
      </React.StrictMode>,
    )
  })

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