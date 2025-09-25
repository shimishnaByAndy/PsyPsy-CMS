/**
 * Test Setup Configuration for PsyPsy CMS
 *
 * This file configures the test environment for healthcare compliance testing
 * including Firebase emulator integration and mock configurations.
 */

import { vi } from 'vitest'

// Mock Firebase configuration for testing
const mockFirebaseConfig = {
  apiKey: "test-api-key",
  authDomain: "psypsy-cms-test.firebaseapp.com",
  projectId: "psypsy-cms-test",
  storageBucket: "psypsy-cms-test.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:test"
}

// Mock Firebase emulator endpoints
const mockEmulatorConfig = {
  firestore: {
    host: "127.0.0.1",
    port: 9881
  },
  auth: {
    host: "127.0.0.1",
    port: 9880
  },
  database: {
    host: "127.0.0.1",
    port: 9882
  },
  functions: {
    host: "127.0.0.1",
    port: 8780
  }
}

// Global test configuration
globalThis.__FIREBASE_CONFIG__ = mockFirebaseConfig
globalThis.__EMULATOR_CONFIG__ = mockEmulatorConfig

// Setup DOM environment for testing
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:5177',
    origin: 'http://localhost:5177',
    protocol: 'http:',
    hostname: 'localhost',
    port: '5177'
  }
})

// Mock console methods for cleaner test output
const originalConsole = { ...console }

beforeEach(() => {
  // Preserve important console methods while mocking noisy ones
  console.log = vi.fn()
  console.info = vi.fn()
  console.warn = originalConsole.warn
  console.error = originalConsole.error
})

afterEach(() => {
  // Restore console methods
  Object.assign(console, originalConsole)
  vi.clearAllMocks()
})

// Mock environment variables
process.env.NODE_ENV = 'test'
process.env.FIREBASE_PROJECT_ID = 'psypsy-cms-test'
process.env.FIREBASE_EMULATOR_HOST = 'localhost'

// Export test utilities
export const testConfig = {
  firebase: mockFirebaseConfig,
  emulators: mockEmulatorConfig,
  environment: 'test'
}

export const createMockResponse = (data: any, success: boolean = true) => ({
  data,
  success,
  timestamp: new Date().toISOString()
})

export const createMockError = (message: string, code?: string) => ({
  success: false,
  error: {
    message,
    code: code || 'MOCK_ERROR'
  }
})

console.log('✅ Test setup configured for PsyPsy CMS compliance testing')