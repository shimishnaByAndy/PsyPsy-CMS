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
  },

  // Clear console in dev mode
  clearScreen: false,

  // Environment variables prefix for Tauri
  envPrefix: ['VITE_', 'TAURI_'],

  // Exclude external directories from scanning
  optimizeDeps: {
    exclude: ['postiz-socialMedia']
  },

  // Only include src directory and node_modules
  root: '.',
  include: ['src/**/*'],
})