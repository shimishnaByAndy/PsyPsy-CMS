import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // Tauri expects a fixed port for dev server
  server: {
    port: 5177,
    strictPort: true,
    host: '0.0.0.0',
  },

  // Path resolution for clean imports
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@/components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@/utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
      '@/hooks': fileURLToPath(new URL('./src/hooks', import.meta.url)),
      '@/services': fileURLToPath(new URL('./src/services', import.meta.url)),
      '@/types': fileURLToPath(new URL('./src/types', import.meta.url)),
      '@/context': fileURLToPath(new URL('./src/context', import.meta.url)),
      '@/localization': fileURLToPath(new URL('./src/localization', import.meta.url)),
      '@/assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
    },
  },

  // Build optimization for Tauri
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          // Healthcare core features
          'medical-core': [
            './src/features/patients',
            './src/features/appointments',
            './src/features/medical-notes'
          ],

          // Compliance and audit features
          'compliance': [
            './src/features/audit',
            './src/features/compliance',
            './src/compliance/quebec-law25'
          ],

          // NextUI components (tree-shaken)
          'nextui-core': [
            '@nextui-org/button',
            '@nextui-org/card',
            '@nextui-org/input',
            '@nextui-org/select',
            '@nextui-org/table'
          ],

          'nextui-extended': [
            '@nextui-org/modal',
            '@nextui-org/dropdown',
            '@nextui-org/navbar',
            '@nextui-org/avatar',
            '@nextui-org/chip',
            '@nextui-org/badge'
          ],

          // Charts and visualization
          'charts': ['recharts', 'react-chartjs-2'],

          // TanStack libraries
          'tanstack': ['@tanstack/react-query', '@tanstack/react-table'],

          // Radix UI components (legacy)
          'radix-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-select',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-accordion'
          ],

          // Date and internationalization
          'i18n': ['react-i18next', 'i18next', 'date-fns'],

          // Firebase and database
          'firebase': ['firebase', 'firebase-admin'],

          // Utilities and misc
          'utils': ['zod', 'clsx', 'tailwind-merge', 'lucide-react']
        }
      }
    }
  },

  // Clear console in dev mode
  clearScreen: false,

  // Environment variables prefix for Tauri
  envPrefix: ['VITE_', 'TAURI_'],

  // Exclude external directories from scanning
  optimizeDeps: {
    exclude: ['postiz-socialMedia'],
    include: [
      // Pre-bundle NextUI core components for faster dev startup
      '@nextui-org/button',
      '@nextui-org/card',
      '@nextui-org/input',
      '@nextui-org/select',
      '@nextui-org/table',
      '@nextui-org/modal',
      '@nextui-org/theme',
      // Other frequently used dependencies
      'react-hook-form',
      '@tanstack/react-query',
      'lucide-react',
      'date-fns'
    ]
  },

  // Only include src directory and node_modules
  root: '.',
  include: ['src/**/*'],
})