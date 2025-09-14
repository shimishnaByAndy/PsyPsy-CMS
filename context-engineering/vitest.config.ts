// vitest.config.ts - Frontend Testing Configuration
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src-tauri/',
        'tests/',
        'dist/',
        'coverage/',
      ],
      thresholds: {
        global: {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85
        },
        // Stricter thresholds for critical modules
        'src/services/': {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95
        },
        'src/hooks/': {
          branches: 90,
          functions: 95,
          lines: 95,
          statements: 95
        },
        'src/components/forms/': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        }
      }
    },
    // Test timeout for healthcare-specific operations
    testTimeout: 10000,
    // Retry flaky tests in CI
    retry: process.env.CI ? 2 : 0,
    // Run tests in isolation
    isolate: true,
    // Watch mode configuration
    watch: {
      ignore: ['**/coverage/**', '**/dist/**', '**/src-tauri/**']
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/contexts': path.resolve(__dirname, './src/contexts'),
    }
  },
  define: {
    // Mock Tauri APIs for testing
    __TAURI__: {},
    __TAURI_METADATA__: {},
  }
});