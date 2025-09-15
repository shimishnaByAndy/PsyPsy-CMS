import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Tauri expects a fixed port for dev server
  server: {
    port: 5177,
    host: '0.0.0.0',
  },

  // Path resolution for clean imports
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/context': path.resolve(__dirname, './src/context'),
      '@/localization': path.resolve(__dirname, './src/localization'),
      '@/assets': path.resolve(__dirname, './src/assets'),
    },
  },

  // Build optimization for Tauri
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          query: ['@tanstack/react-query'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        },
      },
    },
  },

  // Clear console in dev mode
  clearScreen: false,
  
  // Environment variables prefix for Tauri
  envPrefix: ['VITE_', 'TAURI_'],
})