/**
 * Environment Configuration for Firebase Functions
 * Supports easy switching between dev (emulator) and prod
 */

export interface EnvironmentConfig {
  name: 'development' | 'production'
  firebase: {
    useEmulator: boolean
    functionsUrl: string
    region: string
    projectId: string
  }
  api: {
    baseUrl: string
    timeout: number
    retries: number
  }
  compliance: {
    auditRequired: boolean
    dataResidency: string
    standards: string[]
  }
}

// Development environment (Firebase Emulators)
const developmentConfig: EnvironmentConfig = {
  name: 'development',
  firebase: {
    useEmulator: true,
    functionsUrl: 'http://127.0.0.1:8780/psypsy-dev-local/us-east4',
    region: 'us-east4',
    projectId: 'psypsy-dev-local'
  },
  api: {
    baseUrl: 'http://127.0.0.1:8780/psypsy-dev-local/us-east4',
    timeout: 30000, // 30 seconds for emulator
    retries: 2
  },
  compliance: {
    auditRequired: true,
    dataResidency: 'Quebec, Canada (emulated)',
    standards: ['PIPEDA', 'Law25', 'HIPAA']
  }
}

// Production environment (Live Firebase)
const productionConfig: EnvironmentConfig = {
  name: 'production',
  firebase: {
    useEmulator: false,
    functionsUrl: `https://us-east4-${import.meta.env.VITE_FIREBASE_PROJECT_ID}.cloudfunctions.net`,
    region: 'us-east4',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || ''
  },
  api: {
    baseUrl: `https://us-east4-${import.meta.env.VITE_FIREBASE_PROJECT_ID}.cloudfunctions.net`,
    timeout: 60000, // 60 seconds for production
    retries: 3
  },
  compliance: {
    auditRequired: true,
    dataResidency: 'Quebec, Canada',
    standards: ['PIPEDA', 'Law25', 'HIPAA']
  }
}

// Environment detection and configuration
function getEnvironmentConfig(): EnvironmentConfig {
  // Check for explicit emulator override
  if (import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
    console.log('🔧 Using Firebase Emulators (explicit override)')
    return developmentConfig
  }

  // Check if we're in development mode
  if (import.meta.env.DEV) {
    console.log('🛠️ Development mode detected')
    return developmentConfig
  }

  // Production mode
  console.log('🏭 Production mode detected')
  return productionConfig
}

// Export current environment configuration
export const environment = getEnvironmentConfig()

// Firebase Functions endpoint builder
export const buildFunctionUrl = (functionName: string): string => {
  const baseUrl = environment.api.baseUrl
  return `${baseUrl}/${functionName}`
}

// Audit logging helper
export const logEnvironmentAudit = (action: string, details?: any) => {
  console.log('[AUDIT - Environment]', {
    action,
    environment: environment.name,
    timestamp: new Date().toISOString(),
    dataResidency: environment.compliance.dataResidency,
    standards: environment.compliance.standards,
    details: environment.compliance.auditRequired ? details : '[REDACTED]'
  })
}

// Validation helper
export const validateEnvironmentConfig = (): boolean => {
  if (environment.name === 'production') {
    if (!environment.firebase.projectId || environment.firebase.projectId === '') {
      console.error('❌ Missing VITE_FIREBASE_PROJECT_ID in production')
      return false
    }
  }

  console.log('✅ Environment configuration validated')
  return true
}

// Export for debugging
export const debugEnvironment = () => {
  console.log('🔍 Environment Debug Info:', {
    config: environment,
    env_vars: {
      DEV: import.meta.env.DEV,
      VITE_USE_FIREBASE_EMULATOR: import.meta.env.VITE_USE_FIREBASE_EMULATOR,
      VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID
    }
  })
}